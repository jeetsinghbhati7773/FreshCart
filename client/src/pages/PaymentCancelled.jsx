import React from "react";
import { Link, useSearchParams } from "react-router-dom";
import { XCircle, ShoppingCart, RefreshCw, ArrowLeft } from "lucide-react";

export default function PaymentCancelled() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm text-center space-y-6">
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-amber-600">
          <XCircle className="w-10 h-10" />
        </div>

        <div>
          <span className="text-xs uppercase tracking-wider font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            Payment Cancelled
          </span>
          <h1 className="text-2xl font-bold text-gray-900 mt-3">
            Transaction Not Completed
          </h1>
          <p className="text-gray-600 text-sm mt-2 max-w-md mx-auto">
            You cancelled the PayPal payment or closed the checkout window. No funds have been charged, and any temporary inventory holds have been safely released back into stock.
          </p>
          {orderId && (
            <p className="text-xs font-mono text-gray-400 mt-2">
              Reference: #{orderId.slice(0, 12)}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link
            to="/cart"
            className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Return to Cart & Retry</span>
          </Link>
          <Link
            to="/products"
            className="w-full sm:w-auto px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Browse Products</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

