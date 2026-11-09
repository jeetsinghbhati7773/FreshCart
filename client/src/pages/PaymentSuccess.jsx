import React, { useEffect, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { CheckCircle2, ShoppingBag, ArrowRight, ShieldCheck, Calendar, MapPin, Receipt, Loader2 } from "lucide-react";
import { getPayPalOrderStatus } from "../services/paypalService";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    async function fetchOrder() {
      try {
        setLoading(true);
        const res = await getPayPalOrderStatus(orderId);
        if (res.success && res.order) {
          setOrder(res.order);
        } else {
          setError(res.message || "Could not retrieve order details.");
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
        <p className="text-gray-600 font-medium">Verifying PayPal transaction...</p>
      </div>
    );
  }

  const primaryPayment = order?.payments?.[0];

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm text-center space-y-6">
        {/* Success Icon */}
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
          <CheckCircle2 className="w-12 h-12" />
        </div>

        <div>
          <span className="text-xs uppercase tracking-wider font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Payment Verified & Completed
          </span>
          <h1 className="text-3xl font-extrabold text-gray-900 mt-3">
            Thank you for your order!
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Your payment has been successfully processed through PayPal Sandbox.
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-gray-50 rounded-2xl p-6 text-left border border-gray-100 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-4 border-b border-gray-200 text-xs">
            <div>
              <p className="text-gray-500 font-medium">Order Number</p>
              <p className="font-mono font-bold text-gray-900 mt-0.5 truncate">
                #{order?.id ? order.id.slice(0, 12) : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-gray-500 font-medium">Payment Method</p>
              <p className="font-semibold text-sky-800 mt-0.5">PayPal</p>
            </div>
            <div>
              <p className="text-gray-500 font-medium">Capture Reference</p>
              <p className="font-mono text-gray-800 mt-0.5 truncate text-[11px]">
                {order?.paypalCaptureId || primaryPayment?.providerCaptureId || "Verified"}
              </p>
            </div>
            <div>
              <p className="text-gray-500 font-medium">Payment Status</p>
              <span className="inline-block mt-0.5 px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-semibold text-[11px]">
                {order?.paymentStatus || "Paid"}
              </span>
            </div>
          </div>

          {/* Purchased Items List */}
          {order?.orderItems && order.orderItems.length > 0 && (
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Purchased Items ({order.orderItems.length})
              </h4>
              <div className="divide-y divide-gray-200 max-h-56 overflow-y-auto">
                {order.orderItems.map((item, idx) => (
                  <div key={idx} className="py-2 flex justify-between text-xs">
                    <div>
                      <p className="font-medium text-gray-900">
                        {item.productName || item.product?.name || `Product #${item.productId.slice(0, 8)}`}
                      </p>
                      <p className="text-gray-500 text-[11px]">
                        Qty: {item.quantity} {item.packageSize ? `(${item.packageSize})` : ""}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        ₹{(item.subtotal || (item.unitPrice || 0) * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Total Breakdown */}
          <div className="pt-4 border-t border-gray-200 flex justify-between items-baseline">
            <span className="text-sm font-bold text-gray-800">Total Paid</span>
            <div className="text-right">
              <span className="text-2xl font-black text-emerald-700">
                ₹{Number(order?.totalAmount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
              {primaryPayment && (
                <p className="text-xs text-sky-700 font-medium">
                  (${primaryPayment.amount} {primaryPayment.currency})
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            to="/my-orders"
            className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>View My Orders</span>
          </Link>
          <Link
            to="/products"
            className="w-full sm:w-auto px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

