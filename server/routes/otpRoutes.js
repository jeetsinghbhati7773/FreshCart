import express from "express";
import crypto from "crypto";
import Otp from "../models/Otp.js";
import { sendEmail } from "../utils/sendEmail.js";

const router = express.Router();

// Send OTP
router.post("/send", async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash OTP for security
    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    // Delete any existing OTP for this email
    await Otp.deleteMany({ email });

    // Save new OTP to database
    const otpDocument = new Otp({
      email: email.toLowerCase(),
      otp: hashedOtp,
    });

    await otpDocument.save();

    // Send email
    await sendEmail(email, "Hitman Grocery OTP", `Your OTP is ${otp}`);

    res.status(200).json({
      success: true,
      message: "OTP sent successfully to your email",
      email: email,
    });
  } catch (error) {
    console.error("❌ Error sending OTP:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send OTP. Please try again.",
      error: error.message,
    });
  }
});

// Verify OTP
router.post("/verify", async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Validate input
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    // Hash the provided OTP
    const hashedOtp = crypto
      .createHash("sha256")
      .update(otp.toString())
      .digest("hex");

    // Find OTP in database
    const otpDocument = await Otp.findOne({
      email: email.toLowerCase(),
      otp: hashedOtp,
    });

    if (!otpDocument) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    // Delete the OTP after successful verification
    await Otp.deleteOne({ _id: otpDocument._id });

    res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      email: email,
    });
  } catch (error) {
    console.error("❌ Error verifying OTP:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify OTP. Please try again.",
      error: error.message,
    });
  }
});

export default router;
