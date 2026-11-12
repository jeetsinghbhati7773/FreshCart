import aiConversationService from "../services/aiConversationService.js";
import UserPreferenceService from "../services/userPreferenceService.js";
import prisma from "../config/prisma.js";

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8005";
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY || "shoppilot_internal_secret_key_step2_2026";

/**
 * Controller for managing user conversations and persistent AI message history.
 */
class AIConversationController {
  /**
   * POST /api/ai/conversations
   */
  async createConversation(req, res) {
    try {
      const { title } = req.body;
      const conversation = await aiConversationService.createConversation(req.user.id, title);
      return res.status(201).json({
        success: true,
        conversation,
      });
    } catch (err) {
      console.error("Create conversation error:", err);
      return res.status(500).json({
        success: false,
        message: err.message || "Failed to create conversation",
      });
    }
  }

  /**
   * GET /api/ai/conversations
   */
  async getConversations(req, res) {
    try {
      const { status, search, page, limit } = req.query;
      const result = await aiConversationService.getConversations(req.user.id, {
        status,
        search,
        page,
        limit,
      });
      return res.json({
        success: true,
        ...result,
      });
    } catch (err) {
      console.error("Get conversations error:", err);
      return res.status(500).json({
        success: false,
        message: err.message || "Failed to list conversations",
      });
    }
  }

  /**
   * GET /api/ai/conversations/:id
   */
  async getConversation(req, res) {
    try {
      const conversation = await aiConversationService.getConversation(req.user.id, req.params.id);
      return res.json({
        success: true,
        conversation,
      });
    } catch (err) {
      const status = err.statusCode || 500;
      return res.status(status).json({
        success: false,
        message: err.message || "Failed to retrieve conversation",
      });
    }
  }

  /**
   * PATCH /api/ai/conversations/:id
   */
  async updateConversation(req, res) {
    try {
      const { title, status } = req.body;
      const conversation = await aiConversationService.updateConversation(
        req.user.id,
        req.params.id,
        { title, status }
      );
      return res.json({
        success: true,
        conversation,
      });
    } catch (err) {
      const status = err.statusCode || 500;
      return res.status(status).json({
        success: false,
        message: err.message || "Failed to update conversation",
      });
    }
  }

  /**
   * DELETE /api/ai/conversations/:id
   */
  async deleteConversation(req, res) {
    try {
      await aiConversationService.deleteConversation(req.user.id, req.params.id);
      return res.json({
        success: true,
        message: "Conversation deleted successfully",
      });
    } catch (err) {
      const status = err.statusCode || 500;
      return res.status(status).json({
        success: false,
        message: err.message || "Failed to delete conversation",
      });
    }
  }

  /**
   * GET /api/ai/conversations/:id/messages
   */
  async getMessages(req, res) {
    try {
      const { limit, beforeId } = req.query;
      const result = await aiConversationService.getMessages(req.params.id, req.user.id, {
        limit,
        beforeId,
      });
      return res.json({
        success: true,
        ...result,
      });
    } catch (err) {
      const status = err.statusCode || 500;
      return res.status(status).json({
        success: false,
        message: err.message || "Failed to retrieve messages",
      });
    }
  }

  /**
   * POST /api/ai/conversations/:id/messages
   * Central orchestrator for persistent chat:
   * 1. Verifies ownership and saves user message to PostgreSQL.
   * 2. Retrieves relevant long-term memories and conversation summary.
   * 3. Forwards context to FastAPI LangGraph assistant.
   * 4. Asynchronously extracts any newly stated user preferences.
   * 5. Saves assistant message in PostgreSQL with rich shopping metadata.
   */
  async sendMessage(req, res) {
    try {
      const conversationId = req.params.id;
      const userId = req.user.id;
      const { message, messageType = "text" } = req.body;

      if (!message || typeof message !== "string" || !message.trim()) {
        return res.status(400).json({
          success: false,
          message: "A non-empty message string is required",
        });
      }

      const trimmedContent = message.trim();

      // 1. Save user message to PostgreSQL
      const savedUserMessage = await aiConversationService.saveMessage(conversationId, userId, {
        role: "user",
        content: trimmedContent,
        messageType,
      });

      // 2. Fetch learned profile silently from database & conversation summary
      const [learnedProfile, summaryObj] = await Promise.all([
        UserPreferenceService.getLearnedProfile(userId),
        aiConversationService.getLatestSummary(conversationId, userId),
      ]);

      // 3. Forward to Python FastAPI AI microservice with learned preferences
      const payload = {
        conversation_id: conversationId,
        user_id: userId,
        message: trimmedContent,
        learned_profile: learnedProfile?.profile || null,
        preferred_brands: (learnedProfile?.preferredBrands || []).map((b) => b.brand),
        preferred_products: (learnedProfile?.preferredProducts || []).map((p) => p.product?.name || "").filter(Boolean),
        disliked_brands: learnedProfile?.dislikedBrands || [],
        disliked_product_ids: learnedProfile?.dislikedProductIds || [],
        conversation_summary: summaryObj ? summaryObj.summary : null,
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000);

      let aiData = null;
      let aiOffline = false;

      try {
        const aiResponse = await fetch(`${AI_SERVICE_URL}/api/ai/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-internal-api-key": INTERNAL_API_KEY,
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!aiResponse.ok) {
          const errText = await aiResponse.text();
          throw new Error(`AI microservice returned HTTP ${aiResponse.status}: ${errText}`);
        }

        aiData = await aiResponse.json();
      } catch (callErr) {
        clearTimeout(timeoutId);
        console.error("AI Microservice communication error:", callErr.message);
        aiOffline = true;
      }

      // If AI service is offline, provide graceful fallback while preserving conversation history
      let assistantContent = "";
      let metadata = {};
      let responseMessageType = "text";

      if (aiOffline || !aiData) {
        assistantContent =
          "⚠️ AI Shopping Assistant is currently unavailable. Ensure the AI microservice is running on port 8005 ('npm run ai'). Your message has been saved and can be resumed once the service is running.";
      } else {
        assistantContent =
          aiData.message ||
          (aiData.clarification_question ? aiData.clarification_question : "Your grocery plan is ready.");
        
        responseMessageType = aiData.grocery_plan ? "plan" : "text";

        metadata = {
          grocery_plan: aiData.grocery_plan || null,
          matched_products: aiData.matched_products || null,
          optimized_cart: aiData.optimized_cart || null,
          stage: aiData.stage || null,
        };
      }

      // 4. Save assistant response to PostgreSQL
      const savedAssistantMessage = await aiConversationService.saveMessage(
        conversationId,
        userId,
        {
          role: "assistant",
          content: assistantContent,
          messageType: responseMessageType,
          metadata,
        }
      );

      // 5. Asynchronously extract preferences silently in the background
      this.triggerAsyncPreferenceLearning(userId, conversationId, trimmedContent).catch((err) =>
        console.error("Async preference learning error:", err.message)
      );

      return res.json({
        success: true,
        userMessage: savedUserMessage,
        assistantMessage: savedAssistantMessage,
        aiResponse: aiData,
      });
    } catch (err) {
      console.error("SendMessage Error:", err);
      return res.status(500).json({
        success: false,
        message: err.message || "Failed to process chat message",
      });
    }
  }

  /**
   * Silently learn user preferences and negative constraints from conversation in the background.
   */
  async triggerAsyncPreferenceLearning(userId, conversationId, userText) {
    try {
      const lower = userText.toLowerCase();

      // 1. Household size learning
      const householdMatch = lower.match(
        /(?:family of|household of|groceries for|for|living with)\s+(\d+)\s*(?:people|persons|members|adults)?/i
      );
      if (householdMatch && parseInt(householdMatch[1], 10) > 0) {
        const count = parseInt(householdMatch[1], 10);
        await UserPreferenceService.recordHouseholdSize(userId, count);
      }

      // 2. Disliked Brands (Negative preference boycott)
      const dislikeBrandMatch = userText.match(
        /(?:don't suggest|avoid|stop suggesting|hate|don't like|do not like)\s+([A-Z][a-zA-Z0-9\s]{2,15})(?:\s+brand|\s+milk|\s+oil)?/i
      );
      if (dislikeBrandMatch) {
        const brand = dislikeBrandMatch[1].trim();
        await UserPreferenceService.recordBrandPreference(userId, brand, { isDisliked: true });
      }

      // 3. Preferred Brands (Positive preference)
      const brandMatch = userText.match(
        /(?:prefer|always buy|only buy|favourite brand is|love)\s+([A-Z][a-zA-Z0-9\s]{2,20})(?:\s+brand|\s+milk|\s+bread|\s+butter|\s+rice|\s+atta|\s+tea|\s+coffee|\s+oil|\s+ghee)?/i
      );
      if (brandMatch && !dislikeBrandMatch) {
        const brandName = brandMatch[1].trim();
        await UserPreferenceService.recordBrandPreference(userId, brandName, { isDisliked: false });
      }

      // 4. Disliked Products
      const dislikeProdMatch = lower.match(
        /(?:don't like|hate|avoid|allergic to|no)\s+(mushrooms|capsicum|onions|eggs|paneer|curd|coriander|meat|chicken)/i
      );
      if (dislikeProdMatch) {
        const prodTerm = dislikeProdMatch[1].toLowerCase();
        const matched = await prisma.product.findFirst({
          where: { name: { contains: prodTerm, mode: "insensitive" } },
          select: { id: true },
        });
        if (matched) {
          await UserPreferenceService.recordProductPreference(userId, matched.id, { isDisliked: true });
        }
      }

      // 5. Trigger order history analysis if never analyzed
      const profile = await prisma.userShoppingProfile.findUnique({
        where: { userId },
        select: { lastAnalyzedAt: true },
      });
      if (!profile || !profile.lastAnalyzedAt) {
        await UserPreferenceService.analyzeOrderHistory(userId);
      }
    } catch (err) {
      console.warn("Preference learning warning:", err.message);
    }
  }

  /**
   * POST /api/ai/conversations/:id/claim
   * Transfer ownership of a guest conversation to the newly logged-in user.
   */
  async claimConversation(req, res) {
    try {
      if (req.user.email === "guest@freshcart.local") {
        return res.status(401).json({ success: false, message: "Login required to claim conversation" });
      }

      const conversation = await prisma.chatConversation.findUnique({
        where: { id: req.params.id },
      });
      if (!conversation) {
        return res.status(404).json({ success: false, message: "Conversation not found" });
      }
      const guestUser = await prisma.user.findUnique({
        where: { email: "guest@freshcart.local" },
        select: { id: true },
      });

      if (conversation.userId === req.user.id) {
        if (guestUser) {
          await prisma.chatMessage.updateMany({
            where: { conversationId: conversation.id, userId: guestUser.id },
            data: { userId: req.user.id },
          });
        }
        return res.json({ success: true, conversation });
      }

      if (!guestUser || conversation.userId !== guestUser.id) {
        return res.status(403).json({ success: false, message: "Cannot claim another user's conversation" });
      }

      const updated = await prisma.$transaction(async (tx) => {
        await tx.chatMessage.updateMany({
          where: { conversationId: conversation.id, userId: guestUser.id },
          data: { userId: req.user.id },
        });
        await tx.conversationSummary.updateMany({
          where: { conversationId: conversation.id, userId: guestUser.id },
          data: { userId: req.user.id },
        });
        return tx.chatConversation.update({
          where: { id: conversation.id },
          data: { userId: req.user.id },
        });
      });

      return res.json({ success: true, conversation: updated });
    } catch (err) {
      console.error("Claim conversation error:", err);
      return res.status(500).json({
        success: false,
        message: err.message || "Failed to claim conversation",
      });
    }
  }
}

export default new AIConversationController();

