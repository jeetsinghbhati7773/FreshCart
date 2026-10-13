import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Create transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEmail = async (to, subject, text) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL,
      to: to,
      subject: subject,
      text: text,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
  <div style="text-align: center;">
    <h2 style="color: #333; margin-bottom: 8px;">Verify Your Email</h2>
    <p style="color: #555; font-size: 15px; margin-bottom: 20px;">
      Use the OTP below to complete your registration or login.
    </p>
    <div style="background-color: #f0f4ff; padding: 18px; border-radius: 10px; display: inline-block;">
      <p style="font-size: 18px; color: #333; margin: 0;">Your OTP</p>
      <h1 style="font-size: 34px; color: #007bff; letter-spacing: 6px; margin: 10px 0;">${text
        .split(" ")
        .pop()}</h1>
      <p style="font-size: 14px; color: #888; margin: 0;">Valid for 5 minutes</p>
    </div>
    <p style="margin-top: 24px; font-size: 13px; color: #999;">
      Didn’t request this code? You can safely ignore this email.
    </p>
  </div>
  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
  <p style="font-size: 12px; text-align: center; color: #aaa;">
    This is an automated message from <strong>Hitman Grocery</strong>.<br/>
    Please don’t reply directly to this email.
  </p>
</div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    //console.log("✅ Email sent successfully:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Email sending failed:", error);
    throw new Error("Failed to send email: " + error.message);
  }
};
