import { useEffect, useState } from "react";
import axios from "../utils/axiosInstance";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleTrack, setVisibleTrack] = useState({});

  const statuses = [
    "Order Received",
    "Packing",
    "Out for Delivery",
    "Delivered",
  ];

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get(
          `https://hitman-grocery-backend.onrender.com/api/orders/my`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setOrders(res.data.orders || []);
      } catch (err) {
        console.error("Failed to fetch orders:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) return <p className="text-gray-600 p-4">Loading...</p>;

  const renderTracker = (status, orderId) => {
    const currentIndex = statuses.indexOf(status);

    return (
      <div className="mt-4 animate-fadeIn">
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm lg:text-base font-medium">
          {statuses.map((step, idx) => (
            <div key={step} className="flex items-center gap-2">
              <div className="relative">
                <div
                  className={`w-3 h-3 rounded-full transition-all duration-500 ${
                    currentIndex >= idx ? "bg-green-600" : "bg-gray-300"
                  }`}
                >
                  {currentIndex >= idx && (
                    <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                  )}
                </div>
                {currentIndex === idx && (
                  <div className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-green-400 opacity-30 animate-ping"></div>
                )}
              </div>
              <span
                className={`transition-colors duration-300 ${
                  currentIndex >= idx ? "text-green-600" : "text-gray-400"
                }`}
              >
                {step}
              </span>
              {idx !== statuses.length - 1 && (
                <div className="relative w-6 h-0.5 sm:w-8 bg-gray-300 overflow-hidden">
                  <div
                    className={`absolute top-0 left-0 h-full transition-all duration-1000 ease-out ${
                      currentIndex > idx ? "w-full bg-green-600" : "w-0"
                    }`}
                  ></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen mt-20 bg-white px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-primary-dull mb-6">
        My Orders
      </h1>

      {/* Desktop View */}
      <div className="hidden md:block border border-gray-200 rounded-lg overflow-hidden">
        <div className="grid grid-cols-12 gap-3 bg-gray-50 text-sm text-gray-500 font-semibold border-b border-gray-200 py-3 px-6">
          <div className="col-span-1 flex items-center justify-center">
            Order ID
          </div>
          <div className="col-span-4 flex items-center justify-center">
            Product(s)
          </div>
          <div className="col-span-2 flex items-center justify-center">
            Shipping Address
          </div>
          <div className="col-span-2 flex items-center justify-center">
            Amount
          </div>
          <div className="col-span-2 flex items-center justify-center">
            Payment Info
          </div>
          <div className="col-span-1 flex items-center justify-center">
            Track Order
          </div>
        </div>

        {orders.length > 0 ? (
          orders.map((order) => (
            <div
              key={order._id}
              className="border-b border-gray-200 last:border-b-0"
            >
              <div className="grid grid-cols-12 gap-3 p-6 hover:bg-gray-50 transition-colors duration-150">
                <div className="col-span-1 flex items-center justify-center text-sm text-gray-700 font-mono">
                  #{order._id.slice(-6).toUpperCase()}
                </div>

                <div className="col-span-4 flex flex-col justify-center items-center space-y-2">
                  {order.products.map((item, idx) => (
                    <div
                      key={idx}
                      className="text-gray-900 font-medium text-center"
                    >
                      {item.product.name}
                      {item.quantity > 1 && (
                        <span className="ml-2 text-primary font-semibold">
                          x{item.quantity}
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                <div className="col-span-2 flex flex-col justify-center items-center">
                  <p className="font-semibold text-gray-800 mb-1 text-center">
                    {order.user.name}
                  </p>
                  <p className="text-gray-600 text-sm leading-5 text-center">
                    {order.shippingAddress}
                  </p>
                </div>

                <div className="col-span-2 flex items-center justify-center">
                  <p className="font-semibold text-gray-800">
                    ₹{order.totalAmount || "N/A"}
                  </p>
                </div>

                <div className="col-span-2 flex flex-col justify-center items-center text-sm space-y-1">
                  <p className="text-gray-700 text-center">
                    <span className="font-medium">Method:</span>{" "}
                    {order.paymentMethod}
                  </p>
                  <p className="text-gray-700 text-center">
                    <span className="font-medium">Date:</span>{" "}
                    {new Date(order.createdAt).toLocaleDateString("en-GB")}
                  </p>
                  <p
                    className={`text-center ${
                      order.paymentMethod === "Online"
                        ? "text-primary font-medium"
                        : "text-red-500 font-medium"
                    }`}
                  >
                    {order.paymentMethod === "Online" ? " Paid" : " Pending"}
                  </p>
                </div>

                <div className="col-span-1 flex items-center justify-center">
                  <button
                    onClick={() =>
                      setVisibleTrack((prev) => ({
                        ...prev,
                        [order._id]: !prev[order._id],
                      }))
                    }
                    className="px-3 py-1 text-sm bg-primary text-white rounded-md hover:bg-primary-dark transition-colors duration-200"
                  >
                    Track
                  </button>
                </div>
              </div>

              {/* Track progress row (under full width) */}
              {visibleTrack[order._id] && (
                <div className="flex align-center justify-center px-6 pb-6">
                  {renderTracker(order.status, order._id)}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-gray-500">
            You haven't placed any orders yet.
          </div>
        )}
      </div>

      {/* Mobile View */}
      <div className="md:hidden space-y-4">
        {orders.length > 0 ? (
          orders.map((order) => (
            <div
              key={order._id}
              className="border border-gray-200 rounded-lg p-4 shadow-sm"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="text-sm text-gray-700 font-mono">
                  #{order._id.slice(-6).toUpperCase()}
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-800">
                    ₹{order.totalAmount || "N/A"}
                  </p>
                  <p
                    className={
                      order.paymentMethod === "Online"
                        ? "text-primary font-medium"
                        : "text-red-500 font-medium"
                    }
                  >
                    {order.paymentMethod === "Online" ? " Paid" : " Pending"}
                  </p>
                </div>
              </div>

              <div className="mb-3">
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  Products
                </h3>
                <div className="space-y-1">
                  {order.products.map((item, idx) => (
                    <p key={idx} className="text-gray-900">
                      • {item.product.name}
                      {item.quantity > 1 && (
                        <span className="ml-2 text-primary font-semibold">
                          x{item.quantity}
                        </span>
                      )}
                    </p>
                  ))}
                </div>
              </div>

              <div className="mb-3">
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  Shipping
                </h3>
                <p className="font-semibold text-gray-800 text-sm">
                  {order.user.name}
                </p>
                <p className="text-gray-600 text-sm">{order.shippingAddress}</p>
              </div>

              <div className="pt-2 border-t border-gray-100">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Payment:</span>
                  <span className="text-gray-700">{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Date:</span>
                  <span className="text-gray-700">
                    {new Date(order.createdAt).toLocaleDateString("en-GB")}
                  </span>
                </div>
              </div>

              <button
                onClick={() =>
                  setVisibleTrack((prev) => ({
                    ...prev,
                    [order._id]: !prev[order._id],
                  }))
                }
                className="w-full mt-3 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors duration-200"
              >
                {visibleTrack[order._id] ? "Hide Tracking" : "Track Order"}
              </button>

              {visibleTrack[order._id] &&
                renderTracker(order.status, order._id)}
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-gray-500">
            You haven't placed any orders yet.
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default MyOrders;
