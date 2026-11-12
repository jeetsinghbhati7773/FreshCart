import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";
import axios from "axios";
import { API_URL } from "../config";
import toast from "react-hot-toast";
import PayPalButton from "../components/payment/PayPalButton";
import PaymentSummary from "../components/payment/PaymentSummary";

const Cart = () => {
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    clearCart,
    cartSummary,
    user,
    setShowUserLogin,
    navigate,
    selectedAddress,
    savedAddresses,
    setSelectedAddress,
    setShowAddressModal,
  } = useAppContext();

  const [showAddressDropdown, setShowAddressDropdown] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalPrice = cartSummary?.subtotal || cartItems.reduce(
    (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
    0
  );
  const gst = cartSummary?.gst !== undefined ? cartSummary.gst : Math.round(totalPrice * 0.05);
  const finalAmount = cartSummary?.totalAmount || totalPrice + gst;
  const savings = cartSummary?.savings || 0;

  const getAuthConfig = () => {
    const token = localStorage.getItem("token");
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      return toast.error("Please select or add a delivery address");
    }
    // Login disabled: allow guest checkout without prompting login modal
    // if (!user) {
    //   return setShowUserLogin(true);
    // }
    if (cartItems.length === 0) {
      return toast.error("Your cart is empty");
    }

    setIsSubmitting(true);

    if (paymentMethod === "COD") {
      try {
        await axios.post(
          `${API_URL}/orders`,
          {
            products: cartItems.map((item) => ({
              product: item._id || item.id,
              quantity: item.quantity,
            })),
            shippingAddress: selectedAddress,
            paymentMethod: "COD",
          },
          getAuthConfig()
        );

        await clearCart();
        toast.success("🎉 Order placed successfully with Cash on Delivery!", {
          duration: 5000,
        });

        setTimeout(() => navigate("/myorders"), 1500);
      } catch (err) {
        const errorMsg = err.response?.data?.message || "Order placement failed";
        toast.error(errorMsg);
        console.error("Order Error:", err);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      try {
        const loadRazorpayScript = () =>
          new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
          });

        const success = await loadRazorpayScript();
        if (!success) {
          toast.error("Razorpay SDK failed to load. Are you online?");
          setIsSubmitting(false);
          return;
        }

        const res = await axios.post(
          `${API_URL}/payment/razorpay`,
          { totalAmount: finalAmount },
          getAuthConfig()
        );

        const { order } = res.data;

        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: order.amount,
          currency: "INR",
          name: "ShopPilot",
          description: "Autonomous Grocery Order Payment",
          order_id: order.id,
          handler: async function (response) {
            try {
              await axios.post(
                `${API_URL}/orders`,
                {
                  products: cartItems.map((item) => ({
                    product: item._id || item.id,
                    quantity: item.quantity,
                  })),
                  shippingAddress: selectedAddress,
                  paymentMethod: "Online",
                },
                getAuthConfig()
              );

              await clearCart();
              toast.success("Payment verified & grocery order confirmed!", {
                duration: 5000,
              });

              setTimeout(() => navigate("/myorders"), 1500);
            } catch (err) {
              toast.error("Payment succeeded but order logging failed. Contact support.");
              console.error("Final Order Error:", err);
            }
          },
          prefill: {
            name: user?.name || "FreshCart Guest",
            email: user?.email || "guest@freshcart.local",
          },
          theme: {
            color: "#16a34a",
          },
        };

        const razor = new window.Razorpay(options);
        razor.open();
        setIsSubmitting(false);
      } catch (err) {
        toast.error("Failed to initiate online payment");
        console.error("Razorpay Init Error:", err);
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pt-24 pb-20 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
          <span>Shopping Cart</span>
          <span className="text-sm font-bold bg-green-100 text-green-800 px-3 py-1 rounded-full border border-green-200">
            {cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0)} Items
          </span>
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Review your grocery basket and proceed to instant delivery.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Column: Cart Items */}
        <div className="w-full lg:flex-1 bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
          {cartItems.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {cartItems.map((item, index) => {
                const pId = item._id || item.id;
                const itemTotal = (Number(item.price) || 0) * (Number(item.quantity) || 1);

                return (
                  <div
                    key={pId || index}
                    className="py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
                  >
                    {/* Product info */}
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <div
                        onClick={() => navigate(`/product/${pId}`)}
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gray-50 border border-gray-200 p-2 flex items-center justify-center flex-shrink-0 cursor-pointer hover:border-green-300 transition"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          {item.brand && (
                            <span className="text-[10px] font-bold uppercase text-gray-400">
                              {item.brand}
                            </span>
                          )}
                          {item.unit && (
                            <span className="text-[10px] font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                              {item.unit}
                            </span>
                          )}
                        </div>

                        <h3
                          onClick={() => navigate(`/product/${pId}`)}
                          className="text-base font-semibold text-gray-900 truncate hover:text-green-600 cursor-pointer mt-0.5"
                        >
                          {item.name}
                        </h3>

                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="text-base font-bold text-gray-900">
                            ₹{item.price}
                          </span>
                          {item.mrp && item.mrp > item.price && (
                            <span className="text-xs text-gray-400 line-through">
                              ₹{item.mrp}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quantity & Action Controls */}
                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                      <div className="flex items-center border border-gray-300 rounded-xl bg-gray-50 overflow-hidden shadow-sm">
                        <button
                          onClick={() => updateQuantity(pId, (item.quantity || 1) - 1)}
                          className="px-3 py-1 font-bold text-gray-700 hover:bg-gray-200 transition"
                        >
                          −
                        </button>
                        <span className="px-4 py-1 font-bold text-sm bg-white text-gray-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(pId, (item.quantity || 1) + 1)}
                          className="px-3 py-1 font-bold text-gray-700 hover:bg-gray-200 transition"
                        >
                          +
                        </button>
                      </div>

                      <div className="text-right min-w-[70px]">
                        <span className="text-base font-black text-gray-900 block">
                          ₹{itemTotal}
                        </span>
                      </div>

                      <button
                        onClick={() => removeFromCart(pId)}
                        className="text-gray-400 hover:text-red-500 transition p-2 cursor-pointer"
                        title="Remove item"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-16 text-center">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto text-3xl mb-4">
                🛒
              </div>
              <h3 className="text-xl font-bold text-gray-900">Your shopping cart is empty</h3>
              <p className="text-gray-500 text-sm mt-1 mb-6">
                Explore our catalog of 230+ authentic Indian groceries and add essentials.
              </p>
              <button
                onClick={() => navigate("/products")}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold text-sm rounded-full shadow-md transition"
              >
                Browse Grocery Catalog
              </button>
            </div>
          )}

          {cartItems.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-between">
              <button
                onClick={() => navigate("/products")}
                className="flex items-center gap-2 text-sm font-semibold text-green-700 hover:text-green-800 transition"
              >
                <span>←</span>
                <span>Continue Shopping</span>
              </button>

              <button
                onClick={clearCart}
                className="text-xs text-red-500 hover:text-red-700 font-medium underline"
              >
                Clear Entire Basket
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Order Summary & Checkout */}
        {cartItems.length > 0 && (
          <div className="w-full lg:w-96 bg-white rounded-3xl border border-gray-200 p-6 shadow-sm sticky top-28">
            <h2 className="text-xl font-extrabold text-gray-900 mb-4">
              Order Summary
            </h2>

            {/* Address Selection */}
            <div className="mb-6 p-4 rounded-2xl bg-gray-50 border border-gray-200">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold uppercase text-gray-500 tracking-wider">
                  Deliver To
                </span>
                <button
                  onClick={() => setShowAddressDropdown(!showAddressDropdown)}
                  className="text-xs font-bold text-green-700 hover:underline cursor-pointer"
                >
                  {selectedAddress ? "Change" : "+ Select"}
                </button>
              </div>

              <p className="text-sm font-medium text-gray-800 line-clamp-2">
                {selectedAddress || "No delivery address chosen yet"}
              </p>

              {showAddressDropdown && (
                <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
                  {savedAddresses.map((addr, i) => (
                    <div
                      key={i}
                      onClick={() => {
                        setSelectedAddress(addr);
                        setShowAddressDropdown(false);
                      }}
                      className="p-2 text-xs bg-white border border-gray-200 rounded-xl hover:border-green-500 cursor-pointer"
                    >
                      {addr}
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      setShowAddressModal(true);
                      setShowAddressDropdown(false);
                    }}
                    className="w-full py-1.5 text-xs text-green-700 font-semibold bg-green-50 rounded-xl border border-green-200 hover:bg-green-100"
                  >
                    + Add New Address
                  </button>
                </div>
              )}
            </div>

            {/* Payment Method Selector */}
            <div className="mb-6">
              <label className="text-xs font-bold uppercase text-gray-500 tracking-wider block mb-2">
                Payment Method
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("COD")}
                  className={`py-2.5 px-2 rounded-xl border text-xs font-bold transition flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer ${
                    paymentMethod === "COD"
                      ? "border-green-600 bg-green-50 text-green-800 ring-2 ring-green-100"
                      : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span>💵</span>
                  <span>COD</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("Online")}
                  className={`py-2.5 px-2 rounded-xl border text-xs font-bold transition flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer ${
                    paymentMethod === "Online"
                      ? "border-green-600 bg-green-50 text-green-800 ring-2 ring-green-100"
                      : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span>💳</span>
                  <span>Razorpay</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("PayPal")}
                  className={`py-2.5 px-2 rounded-xl border text-xs font-bold transition flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer ${
                    paymentMethod === "PayPal"
                      ? "border-sky-600 bg-sky-50 text-sky-900 ring-2 ring-sky-200"
                      : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span className="font-extrabold text-[#003087]">P</span>
                  <span>PayPal</span>
                </button>
              </div>
            </div>

            {/* Price Calculations or PayPal Flow */}
            {paymentMethod === "PayPal" ? (
              <div className="space-y-4">
                <PaymentSummary
                  inrTotal={finalAmount}
                  itemsCount={cartItems.length}
                />

                {/* Login gate commented out: direct PayPal Checkout */}
                <PayPalButton
                  shippingAddress={selectedAddress}
                  directItems={cartItems.map((item) => ({
                    productId: item._id || item.id,
                    quantity: item.quantity,
                  }))}
                  onSuccess={() => {
                    clearCart();
                    toast.success("🎉 Payment verified and order confirmed!");
                  }}
                  onError={(err) => {
                    toast.error(typeof err === "string" ? err : "PayPal transaction could not be completed.");
                  }}
                />
                {/* {!user && <button onClick={() => setShowUserLogin(true)}>Login to Pay with PayPal</button>} */}
              </div>
            ) : (
              <>
                <div className="space-y-2.5 text-sm border-t border-gray-100 pt-4">
                  <div className="flex justify-between text-gray-600">
                    <span>Items Subtotal</span>
                    <span className="font-semibold text-gray-900">₹{totalPrice}</span>
                  </div>

                  {savings > 0 && (
                    <div className="flex justify-between text-emerald-700 font-medium">
                      <span>Catalog Discount</span>
                      <span>-₹{savings}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-gray-600">
                    <span>Standard Delivery</span>
                    <span className="font-semibold text-green-600">FREE</span>
                  </div>

                  <div className="flex justify-between text-gray-600">
                    <span>Applicable GST (5%)</span>
                    <span className="font-semibold text-gray-900">₹{gst}</span>
                  </div>

                  <div className="border-t border-gray-200 pt-3 flex justify-between items-baseline">
                    <div>
                      <span className="text-base font-extrabold text-gray-900 block">Total Due</span>
                      <span className="text-[11px] text-gray-400">Guaranteed backend calculation</span>
                    </div>
                    <span className="text-2xl font-black text-gray-900">₹{finalAmount}</span>
                  </div>
                </div>

                {/* Place Order Button (login gate commented out for guest checkout) */}
                <button
                  disabled={isSubmitting}
                  onClick={handlePlaceOrder}
                  className="w-full mt-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-2xl shadow-lg shadow-green-600/30 hover:shadow-xl transition-all duration-200 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting
                    ? "Processing Order..."
                    : `Confirm & Place Order (₹${finalAmount})`}
                </button>
                {/* {!user && <button onClick={() => setShowUserLogin(true)}>Login to Checkout</button>} */}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
