import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const DEFAULT_SMTP_TIMEOUT_MS = 10000;
const DEFAULT_SOCKET_TIMEOUT_MS = 15000;

/**
 * Resolve the sender address from environment configuration.
 */
function resolveSender(fromName = "ShopPilot") {
  const email = (process.env.EMAIL_FROM || process.env.SMTP_USER || process.env.EMAIL || "").trim();
  return { email, name: fromName };
}

/**
 * POST an email payload to an HTTPS API provider over port 443 and return parsed metadata.
 */
async function postJsonEmail(url, headers, body, providerName) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(DEFAULT_SMTP_TIMEOUT_MS),
  });
  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    throw new Error(`${providerName} HTTP ${response.status}: ${errText || response.statusText}`);
  }
  const data = await response.json().catch(() => ({}));
  return { data, response };
}

/**
 * Send email via Brevo HTTPS API (works over port 443 on Render Free tier).
 */
async function sendViaBrevo({ fromEmail, fromName, to, subject, text, html }) {
  if (!fromEmail) {
    throw new Error("EMAIL or EMAIL_FROM must be set when using BREVO_API_KEY");
  }
  const { data } = await postJsonEmail(
    "https://api.brevo.com/v3/smtp/email",
    { "api-key": process.env.BREVO_API_KEY, Accept: "application/json" },
    {
      sender: { email: fromEmail, name: fromName },
      to: [{ email: to }],
      subject,
      ...(html ? { htmlContent: html } : {}),
      ...(text ? { textContent: text } : {}),
    },
    "Brevo"
  );
  return { success: true, messageId: data.messageId || "brevo-sent", provider: "brevo" };
}

/**
 * Send email via Resend HTTPS API (works over port 443 on Render Free tier).
 */
async function sendViaResend({ fromEmail, fromName, to, subject, text, html }) {
  const from = fromEmail ? `${fromName} <${fromEmail}>` : `${fromName} <onboarding@resend.dev>`;
  const { data } = await postJsonEmail(
    "https://api.resend.com/emails",
    { Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
    {
      from,
      to: [to],
      subject,
      ...(html ? { html } : {}),
      ...(text ? { text } : {}),
    },
    "Resend"
  );
  return { success: true, messageId: data.id || "resend-sent", provider: "resend" };
}

/**
 * Send email via SendGrid HTTPS API (works over port 443 on Render Free tier).
 */
async function sendViaSendGrid({ fromEmail, fromName, to, subject, text, html }) {
  if (!fromEmail) {
    throw new Error("EMAIL or EMAIL_FROM must be set when using SENDGRID_API_KEY");
  }
  const content = [];
  if (text) content.push({ type: "text/plain", value: text });
  if (html) content.push({ type: "text/html", value: html });

  const { response } = await postJsonEmail(
    "https://api.sendgrid.com/v3/mail/send",
    { Authorization: `Bearer ${process.env.SENDGRID_API_KEY}` },
    {
      personalizations: [{ to: [{ email: to }] }],
      from: { email: fromEmail, name: fromName },
      subject,
      content,
    },
    "SendGrid"
  );
  return { success: true, messageId: response.headers.get("x-message-id") || "sendgrid-sent", provider: "sendgrid" };
}

/**
 * Build a Nodemailer SMTP transporter supporting custom SMTP relays (e.g. port 2525) or Gmail locally.
 */
function createSmtpTransporter() {
  const user = process.env.SMTP_USER || process.env.EMAIL;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;

  if (!user || !pass) {
    throw new Error("Email credentials are not configured (set BREVO_API_KEY, RESEND_API_KEY, or EMAIL/EMAIL_PASS).");
  }

  const baseConfig = process.env.SMTP_HOST
    ? {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === "true" || Number(process.env.SMTP_PORT) === 465,
      }
    : { service: "gmail" };

  return nodemailer.createTransport({
    ...baseConfig,
    auth: { user, pass },
    connectionTimeout: DEFAULT_SMTP_TIMEOUT_MS,
    greetingTimeout: DEFAULT_SMTP_TIMEOUT_MS,
    socketTimeout: DEFAULT_SOCKET_TIMEOUT_MS,
  });
}

/**
 * Send email via SMTP with bounded connection timeouts and Render-specific diagnostics.
 */
async function sendViaSmtp({ fromEmail, fromName, to, subject, text, html }) {
  const transporter = createSmtpTransporter();
  try {
    const info = await transporter.sendMail({
      from: fromName && fromEmail ? `"${fromName}" <${fromEmail}>` : fromEmail,
      to,
      subject,
      ...(text ? { text } : {}),
      ...(html ? { html } : {}),
    });
    return { success: true, messageId: info.messageId, provider: "smtp" };
  } catch (error) {
    if (error.code === "ETIMEDOUT" && process.env.RENDER) {
      throw new Error(
        "SMTP connection timed out: Render Free tier blocks outbound SMTP ports (25, 465, 587). Configure BREVO_API_KEY, RESEND_API_KEY, SENDGRID_API_KEY, or an SMTP relay on port 2525."
      );
    }
    throw error;
  }
}

/**
 * Shared email dispatcher choosing HTTPS API providers first (port 443) and falling back to SMTP.
 */
export const deliverEmail = async ({ to, subject, text, html, fromName = "ShopPilot" }) => {
  const { email: fromEmail } = resolveSender(fromName);
  const payload = { fromEmail, fromName, to, subject, text, html };

  if (process.env.BREVO_API_KEY) return sendViaBrevo(payload);
  if (process.env.RESEND_API_KEY) return sendViaResend(payload);
  if (process.env.SENDGRID_API_KEY) return sendViaSendGrid(payload);
  return sendViaSmtp(payload);
};

export const sendEmail = async (to, subject, text) => {
  try {
    const html = `
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
    This is an automated message from <strong>ShopPilot</strong>.<br/>
    Please don’t reply directly to this email.
  </p>
</div>
      `;

    return await deliverEmail({ to, subject, text, html, fromName: "ShopPilot" });
  } catch (error) {
    console.error("❌ Email sending failed:", error);
    throw new Error("Failed to send email: " + error.message);
  }
};
