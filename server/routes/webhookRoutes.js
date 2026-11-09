import express from "express";
import { PayPalWebhookService } from "../services/paypal/paypalWebhookService.js";

const router = express.Router();

/**
 * POST /api/webhooks/paypal
 * Receives asynchronous PayPal notification events
 */
router.post("/paypal", async (req, res) => {
  try {
    const isValid = await PayPalWebhookService.verifySignature(req.headers, req.body);

    if (!isValid) {
      console.warn("⚠️ Invalid PayPal webhook signature rejected.");
      return res.status(400).json({ success: false, message: "Invalid webhook signature." });
    }

    const result = await PayPalWebhookService.processWebhookEvent(req.body);
    return res.status(200).json({ received: true, ...result });
  } catch (error) {
    console.error("PayPal Webhook processing error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

