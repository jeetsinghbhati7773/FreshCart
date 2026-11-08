import React from "react";
import { X, Check, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";

export default function AlternativeModal({
  isOpen,
  onClose,
  currentItem,
  alternatives = [],
  onSelectAlternative,
  isSwapping = false,
}) {
  if (!isOpen || !currentItem) return null;

  const getBadgeStyle = (classification) => {
    switch (classification) {
      case "exact":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "budget_friendly":
        return "bg-green-100 text-green-800 border-green-200";
      case "premium":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatClassification = (classification) => {
    switch (classification) {
      case "exact":
        return "Exact Match";
      case "budget_friendly":
        return "Budget Saver";
      case "premium":
        return "Premium Grade";
      default:
        return "Similar Alternative";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/80">
          <div>
            <h3 className="font-semibold text-gray-900 text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Alternative Options for {currentItem.product_name}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Requirement: {currentItem.required_quantity} {currentItem.required_unit} • Current Subtotal: ₹{currentItem.subtotal}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Alternatives list */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {alternatives.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">
              No direct alternatives found for this item in stock.
            </div>
          ) : (
            alternatives.map((alt) => {
              const priceDiff = parseFloat(alt.price_difference);
              return (
                <div
                  key={alt.product_id}
                  className="border border-gray-200 hover:border-emerald-500/80 rounded-xl p-3.5 transition-all bg-white hover:shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="flex items-start gap-3 flex-1">
                    {alt.image_url ? (
                      <img
                        src={alt.image_url}
                        alt={alt.product_name}
                        className="w-14 h-14 object-cover rounded-lg border border-gray-100 shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs shrink-0">
                        {alt.category}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 mb-1">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getBadgeStyle(
                            alt.classification
                          )}`}
                        >
                          {formatClassification(alt.classification)}
                        </span>
                        {alt.in_stock && (
                          <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-0.5">
                            <ShieldCheck className="w-3 h-3" /> In Stock ({alt.stock_quantity})
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors truncate">
                        {alt.product_name}
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {alt.reason} • {alt.package_count} pack(s) needed
                      </p>
                    </div>
                  </div>

                  {/* Pricing and Action */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-gray-100 gap-1 shrink-0">
                    <div className="text-right">
                      <div className="text-sm font-bold text-gray-900">
                        ₹{alt.subtotal}
                      </div>
                      <div
                        className={`text-[11px] font-medium ${
                          priceDiff < 0
                            ? "text-emerald-600"
                            : priceDiff > 0
                            ? "text-amber-600"
                            : "text-gray-500"
                        }`}
                      >
                        {priceDiff < 0
                          ? `Saves ₹${Math.abs(priceDiff).toFixed(2)}`
                          : priceDiff > 0
                          ? `+₹${priceDiff.toFixed(2)}`
                          : "Same price"}
                      </div>
                    </div>
                    <button
                      onClick={() => onSelectAlternative(alt)}
                      disabled={isSwapping}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition-all shadow-sm disabled:opacity-50"
                    >
                      {isSwapping ? "Swapping..." : "Select & Swap"}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-100 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-800 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

