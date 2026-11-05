import React from "react";
import { Users, Calendar, Wallet, CheckCircle2, AlertCircle, Tag, Utensils } from "lucide-react";

const IntentSummary = ({ intent }) => {
  if (!intent) return null;

  const {
    family_size,
    duration_days,
    budget,
    currency = "INR",
    dietary_preferences = [],
    categories = [],
    requires_clarification,
    missing_fields = [],
  } = intent;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-sm mb-4">
      <div className="flex items-center justify-between pb-3 border-b border-gray-150 mb-3.5">
        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
          <span>Identified Shopping Parameters</span>
          {requires_clarification ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              <AlertCircle className="w-3 h-3" />
              Information Needed
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <CheckCircle2 className="w-3 h-3" />
              Fully Specified
            </span>
          )}
        </h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        {/* Family Size */}
        <div className="bg-gray-50 rounded-xl p-2.5 border border-gray-150">
          <div className="flex items-center gap-1.5 text-gray-500 font-medium mb-1">
            <Users className="w-3.5 h-3.5 text-emerald-600" />
            <span>Family Size</span>
          </div>
          <div className="font-bold text-gray-900 text-sm">
            {family_size ? `${family_size} Members` : <span className="text-amber-600 font-normal">Pending</span>}
          </div>
        </div>

        {/* Duration */}
        <div className="bg-gray-50 rounded-xl p-2.5 border border-gray-150">
          <div className="flex items-center gap-1.5 text-gray-500 font-medium mb-1">
            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
            <span>Duration</span>
          </div>
          <div className="font-bold text-gray-900 text-sm">
            {duration_days ? `${duration_days} Days` : <span className="text-amber-600 font-normal">Pending</span>}
          </div>
        </div>

        {/* Budget */}
        <div className="bg-gray-50 rounded-xl p-2.5 border border-gray-150">
          <div className="flex items-center gap-1.5 text-gray-500 font-medium mb-1">
            <Wallet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Budget</span>
          </div>
          <div className="font-bold text-gray-900 text-sm">
            {budget ? `₹${Number(budget).toLocaleString()}` : <span className="text-amber-600 font-normal">Pending</span>}
          </div>
        </div>

        {/* Dietary */}
        <div className="bg-gray-50 rounded-xl p-2.5 border border-gray-150">
          <div className="flex items-center gap-1.5 text-gray-500 font-medium mb-1">
            <Utensils className="w-3.5 h-3.5 text-emerald-600" />
            <span>Dietary</span>
          </div>
          <div className="font-bold text-gray-900 capitalize truncate">
            {dietary_preferences.length > 0 ? dietary_preferences.join(", ") : "Standard / None"}
          </div>
        </div>
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <div className="mt-3 flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-semibold text-gray-400 flex items-center gap-1 mr-1">
            <Tag className="w-3 h-3" />
            Categories:
          </span>
          {categories.map((c, i) => (
            <span
              key={i}
              className="text-[11px] font-medium bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-100"
            >
              {c}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default IntentSummary;

