import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendSubscriptionEmail = async (to) => {
  const subject = "🎉 Thanks for Subscribing to Hitman Grocery!";
  const html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Hitman Grocery</title>
    <style>
      @media only screen and (max-width: 600px) {
        .email-container { padding: 15px !important; }
        .email-content { padding: 25px 15px !important; }
        .email-title { font-size: 20px !important; }
        .email-text { font-size: 14px !important; }
        .email-button { padding: 10px 20px !important; font-size: 14px !important; }
        .email-logo { width: 140px !important; }
      }
    </style>
  </head>
  <body style="margin: 0; padding: 0;">
    <div class="email-container" style="font-family: Arial, sans-serif; padding: 20px; text-align: center;">
      <div class="email-content" style="max-width: 500px; margin: auto; background: #fff; padding: 30px 20px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
        
        <!-- Logo -->
        <img src="https://res.cloudinary.com/dblgvmpxc/image/upload/v1752353442/hitman.grocery.logo_on12wc.png" alt="Hitman Grocery" class="email-logo" style="width: 160px; max-width: 80%; height: auto; margin-bottom: 20px; display: block; margin-left: auto; margin-right: auto;" />
        
        <!-- Main Message -->
        <h2 class="email-title" style="color: #1e293b; font-size: 22px; font-weight: 600; margin: 0 0 15px 0; line-height: 1.3;">
          Thank You for Subscribing! 🎉
        </h2>
        
        <p class="email-text" style="color: #64748b; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
          You'll now receive exclusive deals, new arrivals, and special offers directly in your inbox.
        </p>
        
        <!-- CTA Button -->
        <a href="https://hitman-grocery.vercel.app" class="email-button" style="display: inline-block; background: linear-gradient(135deg, #44ae7c 0%, #11e783ff 100%); color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 16px; margin-bottom: 30px; min-width: 140px; text-align: center;">
          Start Shopping
        </a>
        
        <!-- Footer -->
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;" />
        <p style="font-size: 12px; color: #94a3b8; margin: 0; line-height: 1.4;">
          This email was sent to ${to} by <strong>Hitman Grocery</strong><br>
          <a href="#" style="color: #44ae7c; text-decoration: none;">Unsubscribe</a> | Please do not reply to this email.
        </p>
        
      </div>
    </div>
  </body>
  </html>`;

  try {
    const info = await transporter.sendMail({
      from: `"Hitman Grocery" <${process.env.EMAIL}>`,
      to,
      subject,
      html,
    });
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error("❌ Subscription email failed:", err.message);
    throw new Error("Failed to send subscription email.");
  }
};
