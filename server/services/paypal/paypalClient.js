/**
 * Base PayPal HTTP Client
 * Communicates with PayPal REST APIs (v1 & v2)
 */

export const getPayPalBaseUrl = () => {
  const env = (process.env.PAYPAL_ENVIRONMENT || "sandbox").toLowerCase();
  if (env === "live" || env === "production") {
    return process.env.PAYPAL_BASE_URL || "https://api-m.paypal.com";
  }
  return process.env.PAYPAL_BASE_URL || "https://api-m.sandbox.paypal.com";
};

/**
 * Execute an authenticated HTTP request to PayPal
 * @param {string} endpoint - Path, e.g. "/v2/checkout/orders"
 * @param {object} options - fetch options (method, headers, body)
 * @param {string} accessToken - OAuth access token
 * @returns {Promise<any>}
 */
export async function paypalFetch(endpoint, options = {}, accessToken) {
  const baseUrl = getPayPalBaseUrl();
  const url = `${baseUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const responseText = await response.text();
  let responseData;
  try {
    responseData = responseText ? JSON.parse(responseText) : {};
  } catch (err) {
    responseData = { raw: responseText };
  }

  if (!response.ok) {
    const error = new Error(
      `PayPal API Error [${response.status}] ${responseData.message || responseData.error_description || response.statusText}`
    );
    error.status = response.status;
    error.details = responseData;
    throw error;
  }

  return responseData;
}

