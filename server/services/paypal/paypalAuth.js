import { getPayPalBaseUrl } from "./paypalClient.js";

let cachedToken = null;
let tokenExpiresAt = 0;

/**
 * Retrieve a valid OAuth 2.0 access token for PayPal REST APIs
 * Automatically caches the token until expiry
 * @returns {Promise<string>}
 */
export async function getPayPalAccessToken() {
  const now = Date.now();
  // Return cached token if valid with 60-second safety margin
  if (cachedToken && tokenExpiresAt > now + 60 * 1000) {
    return cachedToken;
  }

  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Missing PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET in environment.");
  }

  // Support local development / offline testing when placeholder credentials are used
  if (
    clientId.startsWith("test_") ||
    clientId.startsWith("mock_") ||
    process.env.PAYPAL_MOCK === "true"
  ) {
    cachedToken = `mock_sandbox_access_token_${Date.now()}`;
    tokenExpiresAt = Date.now() + 3600 * 1000;
    return cachedToken;
  }

  const baseUrl = getPayPalBaseUrl();
  const authHeader = `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`;

  const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: authHeader,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to authenticate with PayPal: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  cachedToken = data.access_token;
  tokenExpiresAt = Date.now() + (data.expires_in || 3600) * 1000;

  return cachedToken;
}

/**
 * Reset token cache (useful in tests or when token is revoked)
 */
export function clearTokenCache() {
  cachedToken = null;
  tokenExpiresAt = 0;
}
