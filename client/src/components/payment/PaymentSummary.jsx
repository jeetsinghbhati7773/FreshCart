import React from "react";
import { ShieldCheck, Info, Clock } from "lucide-react";

/**
 * PaymentSummary Component
 * Displays transparent dual-currency breakdown (INR & USD)
 * and inventory reservation safety notice.
 */
export default function PaymentSummary({
  inrTotal,
  usdTotal,
  exchangeRate = 0.0116,
  itemsCount = 0,
  targetCurrency = "USD",
}) {
  const convertedAmount =
    usdTotal !== undefined
      ? Number(usdTotal).toFixed(2)
      : (Number(inrTotal) * exchangeRate).toFixed(2);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900 text-base flex items-center gap-2">
          <span>Checkout Price Summary</span>
          {itemsCount > 0 && (
            <span className="text-xs bg-emerald-100 text-emerald-800 font-medium px-2 py-0.5 rounded-full">
              {itemsCount} {itemsCount === 1 ? "item" : "items"}
            </span>
          )}
        </h3>
        <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
          <ShieldCheck className="w-4 h-4" />
          <span>PayPal Verified</span>
        </div>
      </div>

      <div className="space-y-2.5 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>FreshCart Item Total (INR)</span>
          <span className="font-medium text-gray-900">
            ₹{Number(inrTotal || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        <div className="flex justify-between text-gray-600">
          <span>Delivery / Shipping</span>
          <span className="font-medium text-emerald-600">FREE</span>
        </div>

        <div className="flex justify-between items-baseline pt-2 border-t border-dashed border-gray-200">
          <span className="font-semibold text-gray-900">Total in INR</span>
          <span className="font-bold text-lg text-emerald-700">
            ₹{Number(inrTotal || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        {/* Dual Currency Converted Amount for PayPal */}
        <div className="bg-sky-50 rounded-xl p-3 border border-sky-100 space-y-1.5 mt-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-sky-900 uppercase tracking-wider flex items-center gap-1">
              <span>PayPal {targetCurrency} Equivalent</span>
            </span>
            <span className="font-extrabold text-sky-900 text-base">
              ${convertedAmount} {targetCurrency}
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-sky-700 pt-1">
            <span className="flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-sky-500" />
              <span>Conversion Rate: 1 INR ≈ ${exchangeRate} USD</span>
            </span>
            <span className="text-[10px] bg-sky-200/60 px-1.5 py-0.5 rounded font-mono">
              Auto-Converted
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200/60">
          <Clock className="w-4 h-4 shrink-0 text-amber-600" />
          <span>
            Inventory reserved for <strong>15 minutes</strong> upon checkout initiation.
          </span>
        </div>
      </div>
    </div>
  );
}

