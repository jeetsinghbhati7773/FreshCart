import React from "react";
import { Check, Info, ShieldCheck, Sparkles } from "lucide-react";

const GroceryPlan = ({ items }) => {
  if (!items || items.length === 0) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-sm mb-4">
      <div className="flex items-center justify-between pb-3 border-b border-gray-150 mb-3.5">
        <div>
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <span>Proposed Grocery List</span>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
              {items.length} items
            </span>
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Household-scaled quantities validated with deterministic bounds
          </p>
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {items.map((item, idx) => (
          <div key={idx} className="py-2.5 flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <div
                className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 ${
                  item.priority === "essential"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                <Check className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900">
                    {item.name}
                  </span>
                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded ${
                      item.priority === "essential"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}
                  >
                    {item.priority}
                  </span>
                  <span className="text-[11px] text-gray-400 font-medium">
                    ({item.category})
                  </span>
                </div>
                {item.reason && (
                  <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                    <Info className="w-3 h-3 text-gray-400 flex-shrink-0" />
                    <span>{item.reason}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="text-right flex-shrink-0">
              <span className="text-sm font-bold text-gray-900 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-lg">
                {item.estimated_quantity} {item.unit}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GroceryPlan;

