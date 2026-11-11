/**
 * Currency Conversion Service for PayPal Integration
 * 
 * FreshCart operates primarily in Indian Rupees (INR).
 * For PayPal Sandbox transactions where INR domestic processing may have
 * regional restrictions, this service transparently calculates the equivalent
 * amount in the configured PayPal currency (default: USD) using a configurable
 * exchange rate while retaining the authoritative INR price in local records.
 */

const DEFAULT_TARGET_CURRENCY = process.env.PAYPAL_CURRENCY || "USD";
const DEFAULT_INR_TO_USD_RATE = parseFloat(process.env.EXCHANGE_RATE_INR_TO_USD || "0.0116"); // ~₹86.20 / USD

export class CurrencyService {
  /**
   * Convert an amount in INR to the target PayPal transaction currency
   * @param {number} inrAmount - Amount in Indian Rupees
   * @param {string} [targetCurrency] - Target ISO currency code (default: USD)
   * @returns {{
   *   originalAmount: number,
   *   originalCurrency: string,
   *   convertedAmount: number,
   *   targetCurrency: string,
   *   exchangeRate: number,
   *   formattedPayPalAmount: string
   * }}
   */
  static convertInrToPayPalCurrency(inrAmount, targetCurrency = DEFAULT_TARGET_CURRENCY) {
    const numericInr = Number(inrAmount);
    if (isNaN(numericInr) || numericInr < 0) {
      throw new Error(`Invalid INR amount provided for conversion: ${inrAmount}`);
    }

    let normTarget = (targetCurrency || "USD").toUpperCase();

    // PayPal REST API does NOT support INR/IND as a transaction currency.
    // Ensure only valid supported currencies are passed to PayPal, defaulting to USD.
    const supportedCurrencies = ["USD", "EUR", "GBP", "CAD", "AUD", "JPY"];
    if (!supportedCurrencies.includes(normTarget)) {
      normTarget = "USD";
    }

    const rate = DEFAULT_INR_TO_USD_RATE;
    const rawConverted = numericInr * rate;
    const convertedAmount = Math.max(0.01, Math.round(rawConverted * 100) / 100);

    return {
      originalAmount: numericInr,
      originalCurrency: "INR",
      convertedAmount,
      targetCurrency: normTarget,
      exchangeRate: rate,
      formattedPayPalAmount: convertedAmount.toFixed(2),
    };
  }

  /**
   * Format currency for display
   * @param {number} amount
   * @param {string} currency
   * @returns {string}
   */
  static formatDisplay(amount, currency = "INR") {
    if (currency.toUpperCase() === "INR") {
      return `₹${Number(amount).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `$${Number(amount).toFixed(2)} ${currency}`;
  }
}

export default CurrencyService;

