import express from "express";
import authSeller from "../middlewares/authSeller.js";
import prisma from "../config/prisma.js";
import { updateOrderStatusWithLifecycle } from "../services/orderLifecycleService.js";
import { updateProduct } from "../services/productService.js";

const router = express.Router();
router.use(authSeller);

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8005";
const INTERNAL_API_KEY =
  process.env.INTERNAL_API_KEY || "shoppilot_internal_secret_key_step2_2026";

/**
 * GET /api/seller/ai/health
 */
router.get("/health", async (req, res) => {
  try {
    const aiResponse = await fetch(`${AI_SERVICE_URL}/api/ai/health`, {
      headers: { "x-internal-api-key": INTERNAL_API_KEY },
    });
    const data = await aiResponse.json().catch(() => ({}));
    return res.status(aiResponse.status).json({ success: aiResponse.ok, ...data });
  } catch (error) {
    return res.status(503).json({
      success: false,
      status: "unreachable",
      error: error.message,
    });
  }
});

/**
 * GET /api/seller/ai/conversations
 */
router.get("/conversations", async (req, res) => {
  try {
    const sellerEmail = req.user.email;
    const conversations = await prisma.sellerAiConversation.findMany({
      where: { sellerEmail, status: "active" },
      orderBy: { lastMessageAt: "desc" },
      take: 30,
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });
    return res.json({ success: true, conversations });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/seller/ai/conversations
 */
router.post("/conversations", async (req, res) => {
  try {
    const sellerEmail = req.user.email;
    const { title } = req.body || {};
    const conversation = await prisma.sellerAiConversation.create({
      data: {
        sellerEmail,
        title: title?.trim() || "Seller Assistant",
      },
    });
    return res.status(201).json({ success: true, conversation });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/seller/ai/conversations/:id
 */
router.get("/conversations/:id", async (req, res) => {
  try {
    const sellerEmail = req.user.email;
    const conversation = await prisma.sellerAiConversation.findFirst({
      where: { id: req.params.id, sellerEmail },
      include: {
        messages: { orderBy: { createdAt: "asc" } },
        pendingActions: {
          where: { status: "PENDING" },
          orderBy: { createdAt: "desc" },
        },
      },
    });
    if (!conversation) {
      return res.status(404).json({ success: false, message: "Conversation not found" });
    }
    return res.json({ success: true, conversation });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/seller/ai/chat
 * Persists user turn, calls FastAPI Seller AI Agent, creates SellerPendingAction if proposed, persists assistant turn.
 */
router.post("/chat", async (req, res) => {
  try {
    const sellerEmail = req.user.email;
    const { message, conversationId } = req.body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "A non-empty message is required.",
      });
    }

    let conversation = null;
    if (conversationId) {
      conversation = await prisma.sellerAiConversation.findFirst({
        where: { id: conversationId, sellerEmail },
      });
    }
    if (!conversation) {
      const autoTitle = message.trim().slice(0, 48);
      conversation = await prisma.sellerAiConversation.create({
        data: { sellerEmail, title: autoTitle || "Seller Assistant" },
      });
    }

    // Save seller message
    await prisma.sellerAiMessage.create({
      data: {
        conversationId: conversation.id,
        role: "user",
        content: message.trim(),
        messageType: "text",
      },
    });

    // Fetch recent history for context
    const recentMessages = await prisma.sellerAiMessage.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: "asc" },
      take: 14,
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000);

    const aiResponse = await fetch(`${AI_SERVICE_URL}/api/ai/seller/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-internal-api-key": INTERNAL_API_KEY,
      },
      body: JSON.stringify({
        conversation_id: conversation.id,
        seller_email: sellerEmail,
        message: message.trim(),
        history: recentMessages.slice(0, -1).map((m) => ({
          role: m.role,
          content: m.content,
        })),
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!aiResponse.ok) {
      const detail = await aiResponse.text();
      return res.status(aiResponse.status).json({
        success: false,
        message: "Seller AI service error",
        detail,
      });
    }

    const aiData = await aiResponse.json();

    // If AI proposed a mutating action, store a SellerPendingAction requiring explicit confirmation
    let pendingAction = null;
    if (aiData.pending_action) {
      const pa = aiData.pending_action;
      pendingAction = await prisma.sellerPendingAction.create({
        data: {
          conversationId: conversation.id,
          sellerEmail,
          actionType: pa.actionType,
          targetId: pa.targetId,
          payload: pa,
          summary: pa.summary,
          status: "PENDING",
          expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
        },
      });
    }

    const metadata = {
      ...(aiData.metadata || {}),
      tools_used: aiData.tools_used || [],
      structured_data: aiData.structured_data || null,
      pending_action: pendingAction
        ? {
            actionId: pendingAction.id,
            status: pendingAction.status,
            ...aiData.pending_action,
          }
        : null,
    };

    const assistantMsg = await prisma.sellerAiMessage.create({
      data: {
        conversationId: conversation.id,
        role: "assistant",
        content: aiData.reply || "Done.",
        messageType: pendingAction ? "confirmation" : aiData.message_type || "text",
        metadata,
      },
    });

    await prisma.sellerAiConversation.update({
      where: { id: conversation.id },
      data: { lastMessageAt: new Date() },
    });

    return res.json({
      success: true,
      conversationId: conversation.id,
      message: assistantMsg,
      pendingAction: metadata.pending_action,
    });
  } catch (error) {
    if (error.name === "AbortError") {
      return res.status(504).json({
        success: false,
        message: "Seller AI request timed out. Please try again.",
      });
    }
    console.error("Seller AI chat error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/seller/ai/actions/:actionId/confirm
 * Executes a SellerPendingAction only after explicit seller confirmation.
 */
router.post("/actions/:actionId/confirm", async (req, res) => {
  try {
    const sellerEmail = req.user.email;
    const action = await prisma.sellerPendingAction.findFirst({
      where: { id: req.params.actionId, sellerEmail },
    });

    if (!action) {
      return res.status(404).json({ success: false, message: "Pending action not found." });
    }
    if (action.status !== "PENDING") {
      return res.status(400).json({
        success: false,
        message: `This action has already been ${action.status.toLowerCase()}.`,
      });
    }
    if (new Date(action.expiresAt) < new Date()) {
      await prisma.sellerPendingAction.update({
        where: { id: action.id },
        data: { status: "EXPIRED" },
      });
      return res.status(400).json({
        success: false,
        message: "This confirmation request has expired. Please ask the assistant again.",
      });
    }

    const payload = action.payload || {};
    let executionResult = null;
    let confirmationText = "";

    if (action.actionType === "UPDATE_ORDER_STATUS") {
      executionResult = await updateOrderStatusWithLifecycle(
        action.targetId,
        payload.proposedStatus
      );
      confirmationText = `Confirmed: Order ${executionResult.order.shortId} status updated from "${executionResult.previousStatus}" to "${executionResult.newStatus}".${executionResult.stockRestored ? " Product stock has been restored." : ""}`;
    } else if (action.actionType === "UPDATE_PRODUCT_STOCK") {
      const updatedProduct = await updateProduct(action.targetId, {
        stockQuantity: payload.proposedStock,
      });
      executionResult = { product: updatedProduct };
      confirmationText = `Confirmed: Stock for "${updatedProduct.name}" updated to ${updatedProduct.stockQuantity} units (${updatedProduct.inStock ? "In Stock" : "Out of Stock"}).`;
    } else {
      return res.status(400).json({
        success: false,
        message: `Unsupported action type: ${action.actionType}`,
      });
    }

    const updatedAction = await prisma.sellerPendingAction.update({
      where: { id: action.id },
      data: { status: "CONFIRMED", executedAt: new Date() },
    });

    const systemMessage = await prisma.sellerAiMessage.create({
      data: {
        conversationId: action.conversationId,
        role: "assistant",
        content: confirmationText,
        messageType: "text",
        metadata: {
          confirmedActionId: action.id,
          actionType: action.actionType,
          executionResult,
        },
      },
    });

    return res.json({
      success: true,
      action: updatedAction,
      result: executionResult,
      message: systemMessage,
    });
  } catch (error) {
    console.error("Confirm seller action error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * POST /api/seller/ai/actions/:actionId/cancel
 */
router.post("/actions/:actionId/cancel", async (req, res) => {
  try {
    const sellerEmail = req.user.email;
    const action = await prisma.sellerPendingAction.findFirst({
      where: { id: req.params.actionId, sellerEmail },
    });
    if (!action) {
      return res.status(404).json({ success: false, message: "Pending action not found." });
    }
    if (action.status !== "PENDING") {
      return res.status(400).json({
        success: false,
        message: `This action has already been ${action.status.toLowerCase()}.`,
      });
    }

    const updatedAction = await prisma.sellerPendingAction.update({
      where: { id: action.id },
      data: { status: "CANCELLED" },
    });

    const cancelMessage = await prisma.sellerAiMessage.create({
      data: {
        conversationId: action.conversationId,
        role: "assistant",
        content: `Cancelled: ${action.summary}. No changes were made.`,
        messageType: "text",
        metadata: { cancelledActionId: action.id },
      },
    });

    return res.json({
      success: true,
      action: updatedAction,
      message: cancelMessage,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;

