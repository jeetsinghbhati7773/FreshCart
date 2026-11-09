import { paypalFetch } from "./paypalClient.js";
import { getPayPalAccessToken } from "./paypalAuth.js";

export class PayPalOrderService {
  /**
   * Create a PayPal v2 Checkout Order
   * @param {object} params
   * @param {string} params.localOrderId - FreshCart internal order ID
   * @param {Array<{name: string, unitPrice: number, quantity: number, packageSize?: string}>} params.items
   * @param {object} params.currencyMeta - Result from CurrencyService.convertInrToPayPalCurrency
   * @param {string} [params.shippingAddress]
   * @param {string} [params.returnUrl]
   * @param {string} [params.cancelUrl]
   * @returns {Promise<object>} Created PayPal order object
   */
  static async createOrder({
    localOrderId,
    items,
    currencyMeta,
    shippingAddress,
    returnUrl,
    cancelUrl,
  }) {
    const accessToken = await getPayPalAccessToken();

    const currencyCode = currencyMeta.targetCurrency;
    const totalValueStr = currencyMeta.formattedPayPalAmount;

    // Convert item prices proportionally to match PayPal target currency
    const exchangeRate = currencyMeta.exchangeRate || 1.0;

    let computedItemTotal = 0;
    const paypalItems = items.map((item, idx) => {
      const convertedItemUnitPrice = Math.max(
        0.01,
        Math.round(item.unitPrice * exchangeRate * 100) / 100
      );
      const itemSubtotal = convertedItemUnitPrice * item.quantity;
      computedItemTotal += itemSubtotal;

      return {
        name: (item.name || `Item ${idx + 1}`).substring(0, 127),
        unit_amount: {
          currency_code: currencyCode,
          value: convertedItemUnitPrice.toFixed(2),
        },
        quantity: String(item.quantity),
        description: item.packageSize ? `Pack: ${item.packageSize}`.substring(0, 127) : undefined,
        category: "PHYSICAL_GOODS",
      };
    });

    // Handle any round-off difference on the first item to ensure exact breakdown match
    const diff = Math.round((Number(totalValueStr) - computedItemTotal) * 100) / 100;
    if (diff !== 0 && paypalItems.length > 0) {
      const currentUnit = parseFloat(paypalItems[0].unit_amount.value);
      const adjustedUnit = Math.max(0.01, currentUnit + diff / parseInt(paypalItems[0].quantity, 10));
      paypalItems[0].unit_amount.value = adjustedUnit.toFixed(2);
      computedItemTotal = Number(totalValueStr);
    }

    const payload = {
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: localOrderId,
          custom_id: localOrderId,
          description: `FreshCart Order #${localOrderId.slice(0, 8)}`,
          amount: {
            currency_code: currencyCode,
            value: totalValueStr,
            breakdown: {
              item_total: {
                currency_code: currencyCode,
                value: totalValueStr,
              },
            },
          },
          items: paypalItems,
        },
      ],
      application_context: {
        brand_name: "FreshCart Grocery",
        landing_page: "NO_PREFERENCE",
        user_action: "PAY_NOW",
        return_url: returnUrl || `http://localhost:5173/payment-success?orderId=${localOrderId}`,
        cancel_url: cancelUrl || `http://localhost:5173/payment-cancelled?orderId=${localOrderId}`,
      },
    };

    const headers = {
      "PayPal-Request-Id": `create_${localOrderId}`,
    };

    if (accessToken.startsWith("mock_")) {
      return {
        id: `MOCK_PAYPAL_${localOrderId.slice(0, 8).toUpperCase()}`,
        status: "CREATED",
        intent: "CAPTURE",
        purchase_units: payload.purchase_units,
        create_time: new Date().toISOString(),
        links: [
          {
            href: payload.application_context.return_url,
            rel: "approve",
            method: "GET",
          },
        ],
      };
    }

    const paypalOrder = await paypalFetch(
      "/v2/checkout/orders",
      {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      },
      accessToken
    );

    return paypalOrder;
  }

  /**
   * Retrieve existing PayPal order details
   * @param {string} paypalOrderId
   * @returns {Promise<object>}
   */
  static async getOrder(paypalOrderId) {
    const accessToken = await getPayPalAccessToken();
    return paypalFetch(`/v2/checkout/orders/${paypalOrderId}`, { method: "GET" }, accessToken);
  }
}

export default PayPalOrderService;
