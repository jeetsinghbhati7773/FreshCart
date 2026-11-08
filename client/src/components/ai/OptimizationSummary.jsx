import React from "react";
import {
  ShoppingBag,
  Sparkles,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  Package,
  Layers,
  ArrowRight,
} from "lucide-react";

export default function OptimizationSummary({
  breakdown,
  metrics,
  recommendations = [],
  onAddToCart,
  isAddingToCart = false,
  addedSuccess = false,
}) {
  if (!breakdown) return null;

  const isWithinBudget = breakdown.budget_status === "within_budget" || breakdown.budget_status === "exact";
  const isOverBudget = breakdown.budget_status === "exceeded";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
      {/* Header gradient banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-4 text-white">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-white/20 backdrop-blur-sm">
                <Sparkles className="w-4 h-4 text-yellow-300" />
              </span>
              <h3 className="font-bold text-base tracking-wide">
                Smart Cart Optimization
              </h3>
            </div>
            <p className="text-xs text-emerald-100 mt-1">
              Optimized using FreshCart real-time catalog prices & stock availability
            </p>
          </div>

          {/* Savings Badge */}
          {parseFloat(breakdown.total_savings) > 0 && (
            <div className="bg-yellow-400/90 text-gray-900 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm">
              <TrendingDown className="w-4 h-4" />
              Total Savings: ₹{breakdown.total_savings}
            </div>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      {metrics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-gray-100 bg-gray-50/60 border-b border-gray-100 text-center">
          <div className="p-3">
            <div className="text-xs text-gray-500 font-medium">Requirements</div>
            <div className="text-base font-bold text-gray-900 mt-0.5">
              {metrics.fulfilled_requirements} / {metrics.total_requirements}
            </div>
          </div>
          <div className="p-3">
            <div className="text-xs text-gray-500 font-medium">Total Packages</div>
            <div className="text-base font-bold text-gray-900 mt-0.5 flex items-center justify-center gap-1">
              <Package className="w-4 h-4 text-emerald-600" />
              {metrics.total_packages} packs
            </div>
          </div>
          <div className="p-3">
            <div className="text-xs text-gray-500 font-medium">Avg. Excess Qty</div>
            <div className="text-base font-bold text-gray-900 mt-0.5">
              {metrics.average_excess_percentage}%
            </div>
          </div>
          <div className="p-3">
            <div className="text-xs text-gray-500 font-medium">Substitutions</div>
            <div className="text-base font-bold text-emerald-700 mt-0.5 flex items-center justify-center gap-1">
              <Layers className="w-4 h-4" />
              {metrics.substitutions_made} applied
            </div>
          </div>
        </div>
      )}

      {/* Price Breakdown & Budget Status */}
      <div className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
          {/* Left: Financial summary */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>Catalog MRP Total:</span>
              <span className="line-through text-gray-400">₹{breakdown.mrp_total}</span>
            </div>
            <div className="flex justify-between font-semibold text-gray-800">
              <span>Optimized Offer Subtotal:</span>
              <span>₹{breakdown.subtotal}</span>
            </div>

            {breakdown.budget && (
              <div className="pt-2 border-t border-gray-100 space-y-1.5">
                <div className="flex justify-between text-gray-600 text-xs">
                  <span>Customer Budget:</span>
                  <span className="font-semibold text-gray-900">₹{breakdown.budget}</span>
                </div>

                {isWithinBudget && (
                  <div className="flex items-center justify-between text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-100">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Within Budget
                    </span>
                    <span>₹{breakdown.remaining_budget} remaining</span>
                  </div>
                )}

                {isOverBudget && (
                  <div className="flex items-center justify-between text-xs font-semibold text-amber-800 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
                    <span className="flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      Budget Exceeded
                    </span>
                    <span>+₹{Math.abs(parseFloat(breakdown.budget_difference)).toFixed(2)} shortfall</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: Transfer to FreshCart 1-Click Action */}
          <div className="bg-emerald-50/50 rounded-xl p-4 border border-emerald-100 flex flex-col justify-between h-full">
            <div>
              <div className="text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-1">
                Authoritative Cart Total
              </div>
              <div className="text-2xl font-black text-gray-900">
                ₹{breakdown.final_total}
              </div>
              <p className="text-[11px] text-gray-500 mt-1">
                Ready for checkout in FreshCart with reserved quantities.
              </p>
            </div>

            <div className="mt-4">
              <button
                onClick={onAddToCart}
                disabled={isAddingToCart || addedSuccess}
                className={`w-full py-3 px-4 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 ${
                  addedSuccess
                    ? "bg-green-600 text-white cursor-default"
                    : "bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white hover:shadow-lg"
                } disabled:opacity-50`}
              >
                {addedSuccess ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-white" />
                    Transferred to FreshCart!
                  </>
                ) : isAddingToCart ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Transferring items...
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    Add All Items to FreshCart
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Recommendations list */}
        {recommendations.length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-100">
            <div className="text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Optimization Insights:
            </div>
            <ul className="space-y-1">
              {recommendations.map((rec, idx) => (
                <li key={idx} className="text-xs text-gray-600 flex items-start gap-1.5">
                  <span className="text-emerald-500 font-bold">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

