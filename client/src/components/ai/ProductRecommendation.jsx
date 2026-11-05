import React from "react";
import { Package, AlertTriangle, CheckCircle, Store, Tag } from "lucide-react";

const ProductRecommendation = ({ products }) => {
  if (!products || products.length === 0) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-sm mb-4">
      <div className="flex items-center justify-between pb-3 border-b border-gray-150 mb-3.5">
        <div>
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <Store className="w-4 h-4 text-emerald-600" />
            <span>Matched FreshCart Catalog Products</span>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
              {products.length} matched
            </span>
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Verified live pricing, real product IDs, and real database inventory
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {products.map((prod, idx) => (
          <div
            key={idx}
            className="flex items-start gap-3 p-3 rounded-xl border border-gray-200 bg-gray-50/60 hover:bg-white hover:border-emerald-300 transition-all duration-200 group"
          >
            {/* Product Image */}
            <div className="w-16 h-16 rounded-lg bg-white border border-gray-200 overflow-hidden flex-shrink-0 flex items-center justify-center p-1">
              {prod.image_url ? (
                <img
                  src={prod.image_url}
                  alt={prod.product_name}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
                />
              ) : (
                <Package className="w-6 h-6 text-gray-400" />
              )}
            </div>

            {/* Product Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  {prod.category}
                </span>
                {prod.brand && (
                  <span className="text-[10px] font-medium text-gray-500">
                    {prod.brand}
                  </span>
                )}
                {prod.package_size && (
                  <span className="text-[10px] font-medium text-gray-400">
                    • {prod.package_size}
                  </span>
                )}
              </div>

              <h4 className="text-xs sm:text-sm font-semibold text-gray-900 line-clamp-1 leading-snug">
                {prod.product_name}
              </h4>

              {/* Requirement mapping & package multiplier */}
              <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-600">
                <span className="font-medium text-gray-700">
                  {prod.package_count} pack{prod.package_count > 1 ? "s" : ""}
                </span>
                <span>×</span>
                <span className="font-semibold text-emerald-700">
                  ₹{Number(prod.offer_price).toFixed(2)}
                </span>
                {prod.mrp_price > prod.offer_price && (
                  <span className="text-gray-400 line-through text-[10px]">
                    ₹{Number(prod.mrp_price).toFixed(2)}
                  </span>
                )}
              </div>

              {/* Stock Status & Subtotal */}
              <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-gray-200/80">
                <div className="flex items-center gap-1 text-[10px]">
                  {prod.in_stock && prod.stock_sufficient ? (
                    <span className="text-emerald-700 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      In Stock ({prod.available_stock} avail)
                    </span>
                  ) : (
                    <span className="text-amber-700 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {prod.shortage_note || "Low stock"}
                    </span>
                  )}
                </div>

                <div className="text-xs font-bold text-gray-900">
                  ₹{Number(prod.item_subtotal).toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductRecommendation;

