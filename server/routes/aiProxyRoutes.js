import express from "express";
import optionalAuth from "../middlewares/optionalAuth.js";

const router = express.Router();

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8005";
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY || "shoppilot_internal_secret_key_step2_2026";

router.get("/health", async (req, res) => {
  try {
    const aiResponse = await fetch(`${AI_SERVICE_URL}/api/ai/health`, {
      headers: { "x-internal-api-key": INTERNAL_API_KEY },
    });
    if (!aiResponse.ok) {
      return res.status(aiResponse.status).json({ success: false, status: "unhealthy" });
    }
    const data = await aiResponse.json();
    return res.json({ success: true, ...data });
  } catch (error) {
    return res.status(503).json({ success: false, status: "unreachable", error: error.message });
  }
});

/**
 * POST /api/ai/chat
 * Forwards authenticated customer shopping requests to FastAPI AI Microservice
 */
router.post("/chat", optionalAuth, async (req, res) => {
  try {
    const { message, conversation_id } = req.body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "A non-empty message string is required",
      });
    }

    const payload = {
      conversation_id: conversation_id || `sess_${req.user?.id || "guest"}_${Date.now()}`,
      user_id: req.user?.id || null,
      message: message.trim(),
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000);

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
      return res.status(aiResponse.status).json({
        success: false,
        message: "AI service error",
        detail: errText,
      });
    }

    const data = await aiResponse.json();
    return res.json({
      success: true,
      ...data,
    });
  } catch (error) {
    if (error.name === "AbortError") {
      return res.status(504).json({
        success: false,
        message: "AI Shopping Assistant response timed out. Please try again.",
      });
    }

    console.error("AI Proxy Error:", error.message);
    return res.status(503).json({
      success: false,
      message: `AI Shopping Assistant is currently offline. The Python AI microservice is not running on port 8005. Please start it using 'npm run ai' or 'python -m uvicorn app.main:app --app-dir ai-service --port 8005'.`,
      error: error.message,
    });
  }
});

/**
 * POST /api/ai/plan
 * Direct plan generation forwarding
 */
router.post("/plan", optionalAuth, async (req, res) => {
  try {
    const { intent, conversation_id } = req.body;

    if (!intent) {
      return res.status(400).json({
        success: false,
        message: "Shopping intent object is required",
      });
    }

    const payload = {
      conversation_id: conversation_id || `plan_${Date.now()}`,
      user_id: req.user?.id || null,
      intent,
    };

    const aiResponse = await fetch(`${AI_SERVICE_URL}/api/ai/plan`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-internal-api-key": INTERNAL_API_KEY,
      },
      body: JSON.stringify(payload),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      return res.status(aiResponse.status).json({
        success: false,
        message: "Plan generation failed",
        detail: errText,
      });
    }

    const data = await aiResponse.json();
    return res.json({
      success: true,
      ...data,
    });
  } catch (error) {
    return res.status(503).json({
      success: false,
      message: "AI Shopping Assistant is unavailable",
      error: error.message,
    });
  }
});

/**
 * POST /api/ai/optimize-cart
 * Proxies cart optimization request to FastAPI
 */
router.post("/optimize-cart", optionalAuth, async (req, res) => {
  try {
    const aiResponse = await fetch(`${AI_SERVICE_URL}/api/ai/optimize-cart`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-internal-api-key": INTERNAL_API_KEY,
      },
      body: JSON.stringify(req.body),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      return res.status(aiResponse.status).json({
        success: false,
        message: "Cart optimization failed",
        detail: errText,
      });
    }

    const data = await aiResponse.json();
    return res.json({ success: true, cart: data });
  } catch (error) {
    return res.status(503).json({
      success: false,
      message: "Cart optimization service is currently unavailable",
      error: error.message,
    });
  }
});

/**
 * POST /api/ai/reoptimize-cart
 * Proxies product swap / reoptimization request to FastAPI
 */
router.post("/reoptimize-cart", optionalAuth, async (req, res) => {
  try {
    const aiResponse = await fetch(`${AI_SERVICE_URL}/api/ai/reoptimize-cart`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-internal-api-key": INTERNAL_API_KEY,
      },
      body: JSON.stringify(req.body),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      return res.status(aiResponse.status).json({
        success: false,
        message: "Reoptimization swap failed",
        detail: errText,
      });
    }

    const data = await aiResponse.json();
    return res.json({ success: true, cart: data });
  } catch (error) {
    return res.status(503).json({
      success: false,
      message: "Cart optimization service is currently unavailable",
      error: error.message,
    });
  }
});

/**
 * POST /api/ai/find-alternatives
 * Proxies alternative lookup to FastAPI
 */
router.post("/find-alternatives", optionalAuth, async (req, res) => {
  try {
    const aiResponse = await fetch(`${AI_SERVICE_URL}/api/ai/find-alternatives`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-internal-api-key": INTERNAL_API_KEY,
      },
      body: JSON.stringify(req.body),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      return res.status(aiResponse.status).json({
        success: false,
        message: "Alternative search failed",
        detail: errText,
      });
    }

    const data = await aiResponse.json();
    return res.json(data);
  } catch (error) {
    return res.status(503).json({
      success: false,
      message: "Alternative search service unavailable",
      error: error.message,
    });
  }
});

export default router;

