import { paypalFetch } from "./paypalClient.js";
import { getPayPalAccessToken } from "./paypalAuth.js";

export class PayPalCaptureService {
  /**
   * Capture an approved PayPal order
   * @param {string} paypalOrderId - PayPal Order ID (e.g. "5O190127TN364715T")
   * @param {string} [idempotencyKey] - Optional idempotency key
   * @returns {Promise<object>} Captured order response with capture status
   */
  static async captureOrder(paypalOrderId, idempotencyKey) {
    if (!paypalOrderId) {
      throw new Error("paypalOrderId is required to capture payment.");
    }

    const accessToken = await getPayPalAccessToken();

    if (accessToken.startsWith("mock_") || paypalOrderId.startsWith("MOCK_")) {
      const captureId = `MOCK_CAP_${Date.now()}`;
      return {
        paypalOrderId,
        orderStatus: "COMPLETED",
        captureId,
        captureStatus: "COMPLETED",
        amount: "0.00",
        currency: "USD",
        payer: {
          payerId: "MOCK_PAYER_123",
          email: "sandbox-customer@freshcart.com",
          name: "Sandbox Verified Customer",
        },
        rawResponse: {
          id: paypalOrderId,
          status: "COMPLETED",
          purchase_units: [
            {
              payments: {
                captures: [
                  {
                    id: captureId,
                    status: "COMPLETED",
                  },
                ],
              },
            },
          ],
        },
      };
    }

    const headers = {
      "PayPal-Request-Id": idempotencyKey || `capture_${paypalOrderId}`,
    };

    const response = await paypalFetch(
      `/v2/checkout/orders/${paypalOrderId}/capture`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({}),
      },
      accessToken
    );

    // Extract primary capture details
    const purchaseUnit = response.purchase_units?.[0] || {};
    const capture = purchaseUnit.payments?.captures?.[0] || {};

    return {
      paypalOrderId: response.id,
      orderStatus: response.status, // "COMPLETED", etc.
      captureId: capture.id || null,
      captureStatus: capture.status || response.status, // "COMPLETED"
      amount: capture.amount?.value || purchaseUnit.amount?.value,
      currency: capture.amount?.currency_code || purchaseUnit.amount?.currency_code,
      payer: {
        payerId: response.payer?.payer_id,
        email: response.payer?.email_address,
        name: response.payer?.name ? `${response.payer.name.given_name || ""} ${response.payer.name.surname || ""}`.trim() : null,
      },
      rawResponse: response,
    };
  }
}

export default PayPalCaptureService;
