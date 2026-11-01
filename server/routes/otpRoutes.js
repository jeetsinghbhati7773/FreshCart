import express from "express";
import crypto from "crypto";
import prisma from "../config/prisma.js";
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

    // Delete any existing OTPs for this email
    await prisma.otp.deleteMany({
      where: { email: email.toLowerCase() },
    });

    // Save new OTP to database
    await prisma.otp.create({
      data: {
        email: email.toLowerCase(),
        otp: hashedOtp,
      },
    });

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
    const otpDocument = await prisma.otp.findFirst({
      where: {
        email: email.toLowerCase(),
        otp: hashedOtp,
      },
    });

    if (!otpDocument) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    // Check expiration (5 minutes = 300,000 ms)
    const ageInMinutes = (Date.now() - new Date(otpDocument.createdAt).getTime()) / (1000 * 60);
    if (ageInMinutes > 5) {
      await prisma.otp.delete({ where: { id: otpDocument.id } });
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    // Delete the OTP after successful verification
    await prisma.otp.delete({ where: { id: otpDocument.id } });

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
