import React, { useState } from "react";
import {
  Layers,
  Sparkles,
  Check,
  AlertTriangle,
  RotateCcw,
  Package,
  ShieldCheck,
  HelpCircle,
} from "lucide-react";
import AlternativeModal from "./AlternativeModal";

export default function OptimizedCart({
  cart,
  onSwapItem,
  isSwapping = false,
}) {
  const [selectedItemForAlt, setSelectedItemForAlt] = useState(null);

  if (!cart || !cart.items || cart.items.length === 0) return null;

  const handleOpenAlternatives = (item) => {
    setSelectedItemForAlt(item);
  };

  const handleSelectAlternative = async (alt) => {
    if (!selectedItemForAlt || !onSwapItem) return;
    await onSwapItem(selectedItemForAlt.product_id, alt.product_id);
    setSelectedItemForAlt(null);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-emerald-600" />
          <h3 className="font-bold text-gray-900 text-sm sm:text-base">
            Proposed Shopping Cart ({cart.items.length} items)
          </h3>
        </div>
        <span className="text-xs text-gray-500 font-medium hidden sm:inline">
          Click "Alternatives" to swap any product
        </span>
      </div>

      {/* Cart items list */}
      <div className="divide-y divide-gray-100">
        {cart.items.map((item) => {
          const excessQty = parseFloat(item.excess_quantity || 0);
          const excessPct = parseFloat(item.excess_percentage || 0);
          const hasExcess = excessQty > 0;
          const altCount = item.available_alternatives?.length || 0;

          return (
            <div
              key={item.product_id}
              className="p-4 hover:bg-gray-50/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              {/* Product Info */}
              <div className="flex items-start gap-3 flex-1 min-w-0">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.product_name}
                    className="w-16 h-16 object-cover rounded-xl border border-gray-100 shrink-0 shadow-sm"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-emerald-50 text-emerald-600 font-bold text-xs flex items-center justify-center shrink-0 border border-emerald-100">
                    {item.category}
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5 mb-1">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                      {item.category}
                    </span>

                    {item.is_substitution && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-0.5">
                        <RotateCcw className="w-2.5 h-2.5" /> Substitution
                      </span>
                    )}

                    {item.is_in_stock ? (
                      <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-0.5">
                        <ShieldCheck className="w-3 h-3" /> In Stock ({item.available_stock})
                      </span>
                    ) : (
                      <span className="text-[10px] text-red-600 font-medium flex items-center gap-0.5">
                        <AlertTriangle className="w-3 h-3" /> Low Stock
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-gray-900 truncate">
                    {item.product_name}
                  </h4>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-gray-500">
                    <span>
                      Req: <strong className="text-gray-700">{item.required_quantity} {item.required_unit}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Package: <strong className="text-gray-700">{item.package_count} × {item.package_size || item.required_unit}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Unit: <strong className="text-gray-700">₹{item.unit_price}</strong>
                      {parseFloat(item.mrp_price) > parseFloat(item.unit_price) && (
                        <span className="line-through text-gray-400 ml-1 text-[11px]">
                          ₹{item.mrp_price}
                        </span>
                      )}
                    </span>
                  </div>

                  {/* Excess Quantity and Reason pill */}
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {hasExcess && (
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded-md font-medium ${
                          excessPct > 40
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        +{excessQty} {item.required_unit} extra (+{excessPct}%)
                      </span>
                    )}
                    <span className="text-[11px] text-gray-400 italic">
                      {item.selection_reason}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions & Price */}
              <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-gray-100">
                {/* Alternatives button */}
                {altCount > 0 && (
                  <button
                    onClick={() => handleOpenAlternatives(item)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 active:scale-95 transition-all border border-emerald-200"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    Alternatives ({altCount})
                  </button>
                )}

                {/* Subtotal */}
                <div className="text-right min-w-[80px]">
                  <div className="text-base font-extrabold text-gray-900">
                    ₹{item.subtotal}
                  </div>
                  <div className="text-[10px] text-gray-400">
                    Subtotal
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Alternative Swap Modal */}
      <AlternativeModal
        isOpen={Boolean(selectedItemForAlt)}
        onClose={() => setSelectedItemForAlt(null)}
        currentItem={selectedItemForAlt}
        alternatives={selectedItemForAlt?.available_alternatives || []}
        onSelectAlternative={handleSelectAlternative}
        isSwapping={isSwapping}
      />
    </div>
  );
}
