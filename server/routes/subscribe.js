import express from "express";
import { sendSubscriptionEmail } from "../utils/subscribeEmail.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: "Email is required" });

  try {
    await sendSubscriptionEmail(email);
    res.status(200).json({ message: "Subscribed successfully!" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to subscribe", error: err.message });
  }
});

export default router;
