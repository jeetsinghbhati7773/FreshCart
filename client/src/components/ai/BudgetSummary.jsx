import React from "react";
import { Wallet, TrendingUp, CheckCircle, AlertTriangle, Lightbulb } from "lucide-react";

const BudgetSummary = ({ total, budget, status, difference, suggestions = [] }) => {
  if (!total && !budget) return null;

  const numTotal = Number(total) || 0;
  const numBudget = Number(budget) || 0;
  const percentUsed = numBudget > 0 ? Math.min(100, Math.round((numTotal / numBudget) * 100)) : 100;
  const isOverrun = status === "exceeded" || (numBudget > 0 && numTotal > numBudget);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-sm mb-4">
      <div className="flex items-center justify-between pb-3 border-b border-gray-150 mb-3.5">
        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
          <Wallet className="w-4 h-4 text-emerald-600" />
          <span>Budget & Financial Summary</span>
        </h3>
        {status !== "not_calculated" && (
          <span
            className={`text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
              isOverrun
                ? "bg-rose-50 text-rose-700 border border-rose-200"
                : "bg-emerald-50 text-emerald-700 border border-emerald-200"
            }`}
          >
            {isOverrun ? (
              <>
                <AlertTriangle className="w-3 h-3" />
                Exceeds Budget
              </>
            ) : (
              <>
                <CheckCircle className="w-3 h-3" />
                Within Budget
              </>
            )}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        {/* Estimated Total */}
        <div className="bg-gray-50 rounded-xl p-3 border border-gray-150">
          <span className="text-xs text-gray-500 font-medium">Estimated Order Cost</span>
          <div className="text-lg font-extrabold text-gray-900 mt-0.5">
            ₹{numTotal.toFixed(2)}
          </div>
          <span className="text-[10px] text-gray-400">Sum of matched products</span>
        </div>

        {/* Target Budget */}
        <div className="bg-gray-50 rounded-xl p-3 border border-gray-150">
          <span className="text-xs text-gray-500 font-medium">Target Budget</span>
          <div className="text-lg font-extrabold text-gray-900 mt-0.5">
            {numBudget > 0 ? `₹${numBudget.toFixed(2)}` : "Not Set"}
          </div>
          <span className="text-[10px] text-gray-400">Customer allocated</span>
        </div>

        {/* Difference */}
        <div
          className={`rounded-xl p-3 border ${
            isOverrun
              ? "bg-rose-50/60 border-rose-200"
              : "bg-emerald-50/60 border-emerald-200"
          }`}
        >
          <span
            className={`text-xs font-medium ${
              isOverrun ? "text-rose-700" : "text-emerald-700"
            }`}
          >
            {isOverrun ? "Budget Overrun" : "Remaining Buffer"}
          </span>
          <div
            className={`text-lg font-extrabold mt-0.5 ${
              isOverrun ? "text-rose-800" : "text-emerald-800"
            }`}
          >
            {numBudget > 0 ? `₹${Math.abs(difference || (numBudget - numTotal)).toFixed(2)}` : "—"}
          </div>
          <span
            className={`text-[10px] ${
              isOverrun ? "text-rose-600" : "text-emerald-600"
            }`}
          >
            {isOverrun ? "Exceeds planned limit" : "Available to spend"}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      {numBudget > 0 && (
        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Budget Utilization</span>
            <span className="font-semibold text-gray-800">{percentUsed}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-2.5 rounded-full transition-all duration-300 ${
                isOverrun ? "bg-rose-500" : "bg-emerald-500"
              }`}
              style={{ width: `${Math.min(100, (numTotal / numBudget) * 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="mt-3 bg-amber-50/70 border border-amber-200/80 rounded-xl p-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 mb-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
            <span>Optimization Insights</span>
          </div>
          <ul className="text-xs text-amber-900 space-y-1">
            {suggestions.map((sug, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="text-amber-500">•</span>
                <span>{sug}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default BudgetSummary;

