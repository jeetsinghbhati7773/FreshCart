import { useEffect, useState } from "react";
import { sellerAxios } from "../../utils/axiosInstance";
import toast from "react-hot-toast";

const SellerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const statuses = [
    "Order Received",
    "Packing",
    "Out for Delivery",
    "Delivered",
  ];

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await sellerAxios.get(
          "https://hitman-grocery-backend.onrender.com/api/orders/all"
        );

        setOrders(res.data.orders || []);
      } catch (err) {
        console.error("Failed to fetch seller orders:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await sellerAxios.put(`/seller/update-order-status/${orderId}`, {
        status: newStatus,
      });
      toast.success("Status updated!");
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err) {
      toast.error("Update failed");
      console.error(
        "Error updating order status:",
        err.response?.data || err.message
      );
    }
  };

  if (loading) return <p className="text-gray-600 p-4">Loading...</p>;

  return (
    <div className="min-h-screen px-3 sm:px-6 lg:px-8 py-6 bg-white">
      <h1 className="text-xl sm:text-2xl font-bold text-primary-dull mb-6">
        All Orders
      </h1>

      {orders.length === 0 ? (
        <div className="text-gray-500 text-center mt-20">No orders yet.</div>
      ) : (
        <>
          {/* ✅ Table View for md+ */}
          <div className="hidden md:block overflow-x-auto border border-gray-200 rounded-lg">
            <table className="w-full text-sm text-left divide-y divide-gray-200">
              <thead className="bg-gray-50 text-gray-700 font-semibold">
                <tr>
                  <th className="px-4 py-3 w-32">Order ID</th>
                  <th className="px-4 py-3 w-48">User</th>
                  <th className="px-4 py-3 w-[16%]">Products</th>
                  <th className="px-4 py-3 w-32">Amount</th>
                  <th className="px-4 py-3 w-28">Date</th>
                  <th className="px-4 py-3 w-28">Payment</th>
                  <th className="px-4 py-3 w-44">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-800">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-2 font-mono text-gray-600">
                      #{order._id.slice(-6).toUpperCase()}
                    </td>
                    <td className="px-4 py-2">
                      <p className="font-medium">{order.user?.name}</p>
                      <p className="text-xs text-gray-500">
                        {order.user?.email}
                      </p>
                    </td>
                    <td className="px-4 py-2 whitespace-pre-wrap">
                      {order.products.map((item, i) => (
                        <div key={i}>
                          {item.product?.name}{" "}
                          <span className="text-green-600 font-semibold">
                            x{item.quantity}
                          </span>
                        </div>
                      ))}
                    </td>
                    <td className="px-4 py-2 font-semibold">
                      ₹{order.totalAmount}
                    </td>
                    <td className="px-4 py-2 text-sm">
                      {new Date(order.createdAt).toLocaleDateString("en-GB")}
                    </td>
                    <td className="px-4 py-2">{order.paymentMethod}</td>
                    <td className="px-4 py-2">
                      <select
                        value={order.status}
                        onChange={(e) =>
                          handleStatusChange(order._id, e.target.value)
                        }
                        className="w-full border rounded px-2 py-1 text-sm"
                      >
                        {statuses.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ✅ Mobile View */}
          <div className="md:hidden space-y-5 mt-6">
            {orders.map((order) => (
              <div
                key={order._id}
                className="border border-gray-200 rounded-lg p-4 shadow-sm"
              >
                <div className="flex justify-between text-sm font-mono text-gray-600 mb-1">
                  <span>#{order._id.slice(-6).toUpperCase()}</span>
                  <span>
                    {new Date(order.createdAt).toLocaleDateString("en-GB")}
                  </span>
                </div>

                <div className="text-gray-800 mb-2">
                  <p className="font-semibold">{order.user?.name}</p>
                  <p className="text-xs text-gray-500">{order.user?.email}</p>
                </div>

                <div className="mb-2">
                  <p className="text-sm font-medium text-gray-500">Products</p>
                  {order.products.map((item, i) => (
                    <p key={i} className="text-sm">
                      {item.product?.name}{" "}
                      <span className="text-green-600 font-semibold">
                        x{item.quantity}
                      </span>
                    </p>
                  ))}
                </div>

                <div className="flex justify-between mt-3 text-sm">
                  <p className="font-semibold text-gray-800">
                    ₹{order.totalAmount}
                  </p>
                  <p className="text-gray-600">{order.paymentMethod}</p>
                </div>

                <div className="mt-3">
                  <select
                    value={order.status}
                    onChange={(e) =>
                      handleStatusChange(order._id, e.target.value)
                    }
                    className="w-full border rounded px-3 py-2 text-sm"
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default SellerOrders;
