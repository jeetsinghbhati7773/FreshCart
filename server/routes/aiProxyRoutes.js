import express from "express";
import optionalAuth from "../middlewares/optionalAuth.js";

const router = express.Router();

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8005";
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY || "shoppilot_internal_secret_key_step2_2026";

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
    const timeoutId = setTimeout(() => controller.abort(), 45000);

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
      message: "AI Shopping Assistant is currently unavailable. Ensure the AI microservice is running on port 8000.",
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

export default router;

