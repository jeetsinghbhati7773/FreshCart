import React, { useState, useEffect, useRef, useContext } from "react";
import {
  Sparkles,
  X,
  RotateCcw,
  Maximize2,
  Send,
  ShoppingBag,
  ShieldCheck,
  Package,
  Layers,
  ArrowRight,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { sendChatMessage, batchAddToCart } from "../../services/aiService";
import { AppContext } from "../../context/AppContext";

const getConversationId = () => {
  let cid = sessionStorage.getItem("shoppilot_ai_cid");
  if (!cid) {
    cid = "chat_" + Math.random().toString(36).substring(2, 9) + "_" + Date.now();
    sessionStorage.setItem("shoppilot_ai_cid", cid);
  }
  return cid;
};

export default function AiChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [conversationId, setConversationId] = useState(getConversationId);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);

  const { refreshBackendCart, user, setShowUserLogin } = useContext(AppContext);
  const navigate = useNavigate();
  const chatEndRef = useRef(null);

  const handleToggleWidget = () => {
    if (!user && !isOpen) {
      toast("Please log in to use ShopPilot AI Assistant", { icon: "🔒" });
      setShowUserLogin(true);
      return;
    }
    setIsOpen(!isOpen);
  };

  const [messages, setMessages] = useState([
    {
      isAi: true,
      text: "👋 Hi! I'm ShopPilot, your autonomous grocery shopping assistant. Tell me what you need, for how many people, how many days, and your budget!",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const [optimizedCart, setOptimizedCart] = useState(null);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading, isOpen]);

  const handleSendMessage = async (customText = null) => {
    const textToSend = customText || inputMessage;
    if (!textToSend || !textToSend.trim() || loading) return;

    setError(null);
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // Append user message
    setMessages((prev) => [
      ...prev,
      { isAi: false, text: textToSend.trim(), timestamp: now },
    ]);
    setInputMessage("");
    setLoading(true);

    try {
      const response = await sendChatMessage(textToSend.trim(), conversationId);

      if (response && response.success) {
        if (response.optimized_cart) {
          setOptimizedCart(response.optimized_cart);
        }

        const replyText =
          response.assistant_message ||
          response.clarification_question ||
          "I have analyzed the FreshCart catalog and prepared your plan.";

        setMessages((prev) => [
          ...prev,
          {
            isAi: true,
            text: replyText,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            cartData: response.optimized_cart || null,
          },
        ]);
      } else {
        throw new Error(response.message || "Failed to get AI response");
      }
    } catch (err) {
      console.error("Widget AI Error:", err);
      const errMsg =
        err.response?.data?.message ||
        err.message ||
        "Could not connect to AI service. Please try again.";
      setError(errMsg);
      setMessages((prev) => [
        ...prev,
        {
          isAi: true,
          text: `⚠️ ${errMsg}`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleReset = () => {
    const newCid = "chat_" + Math.random().toString(36).substring(2, 9) + "_" + Date.now();
    sessionStorage.setItem("shoppilot_ai_cid", newCid);
    setConversationId(newCid);
    setOptimizedCart(null);
    setError(null);
    setMessages([
      {
        isAi: true,
        text: "New session started! What groceries can I find for you?",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    toast.success("AI Session reset");
  };

  const handleAddCartItems = async (cart) => {
    if (!user) {
      setShowUserLogin(true);
      return;
    }
    if (!cart || !cart.items || cart.items.length === 0) return;
    setIsAddingToCart(true);
    try {
      const itemsToAdd = cart.items.map((it) => ({
        productId: it.product_id,
        quantity: it.package_count || 1,
      }));
      const res = await batchAddToCart(itemsToAdd, false);
      if (res && res.success) {
        setAddedSuccess(true);
        toast.success(`Added ${res.addedCount} items to your FreshCart cart!`);
        if (refreshBackendCart) {
          await refreshBackendCart();
        }
        setTimeout(() => setAddedSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Cart Add Error:", err);
      toast.error("Failed to add items to cart");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const quickPrompts = [
    "Groceries for family of 4 for 7 days within ₹3,000",
    "Vegetables and dairy for ₹1,500",
    "Breakfast staples for a couple for 5 days",
  ];

  return (
    <>
      {/* Floating Launcher Button at Bottom-Right */}
      <div className="fixed bottom-5 right-5 z-50 flex items-center">
        {/* Pulsing Hint Badge (shown when widget is closed) */}
        {!isOpen && (
          <div
            onClick={() => setIsOpen(true)}
            className="hidden sm:flex items-center gap-1.5 mr-3 px-3 py-1.5 rounded-full bg-white/95 text-emerald-800 text-xs font-bold shadow-lg border border-emerald-200 cursor-pointer hover:bg-emerald-50 transition-all animate-bounce"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>AI Shopping Concierge</span>
          </div>
        )}

        {/* Floating Circle Button */}
        <button
          onClick={handleToggleWidget}
          aria-label="ShopPilot AI Assistant"
          className="w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-600 via-teal-600 to-green-500 text-white shadow-xl hover:shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center relative group"
        >
          {isOpen ? (
            <X className="w-6 h-6 transition-transform rotate-0 group-hover:rotate-90 duration-200" />
          ) : (
            <>
              <Sparkles className="w-6 h-6 animate-pulse" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full border-2 border-white"></span>
            </>
          )}
        </button>
      </div>

      {/* Floating Chatbot Popup Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-[460px] md:w-[500px] h-[640px] max-h-[82vh] bg-white rounded-3xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden z-50 animate-fadeIn">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white flex items-center justify-between shrink-0 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-inner">
                <Sparkles className="w-5 h-5 text-yellow-300" />
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base leading-tight tracking-wide flex items-center gap-1.5">
                  ShopPilot <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-emerald-500/50">AI Agent</span>
                </h3>
                <p className="text-[11px] text-emerald-100 flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="w-3 h-3 text-emerald-300" />
                  Live PostgreSQL Catalog Prices
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleReset}
                title="Restart conversation"
                className="p-1.5 rounded-lg text-emerald-100 hover:text-white hover:bg-white/10 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate("/shopping-assistant");
                }}
                title="Open in full screen"
                className="p-1.5 rounded-lg text-emerald-100 hover:text-white hover:bg-white/10 transition-colors"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close chatbot"
                className="p-1.5 rounded-lg text-emerald-100 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-gradient-to-b from-gray-50/50 via-white to-gray-50/30">
            {messages.map((m, idx) => (
              <div key={idx} className="space-y-2">
                <div
                  className={`flex ${
                    m.isAi ? "justify-start" : "justify-end"
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed shadow-sm ${
                      m.isAi
                        ? "bg-white text-gray-800 border border-gray-100 rounded-tl-sm"
                        : "bg-emerald-600 text-white rounded-tr-sm"
                    }`}
                  >
                    <div className="whitespace-pre-line">{m.text}</div>
                    <div
                      className={`text-[10px] mt-1 text-right ${
                        m.isAi ? "text-gray-400" : "text-emerald-100"
                      }`}
                    >
                      {m.timestamp}
                    </div>
                  </div>
                </div>

                {/* Inline Proposed Cart Card inside Chat if available */}
                {m.cartData && m.cartData.items && m.cartData.items.length > 0 && (
                  <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-3.5 shadow-sm space-y-2.5">
                    <div className="flex items-center justify-between border-b border-emerald-200/60 pb-2">
                      <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-900">
                        <Package className="w-4 h-4 text-emerald-700" />
                        <span>Proposed Cart ({m.cartData.items.length} items)</span>
                      </div>
                      <div className="text-xs font-extrabold text-emerald-900">
                        Total: ₹{m.cartData.breakdown?.final_total}
                      </div>
                    </div>

                    {/* Preview of first 3 items */}
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {m.cartData.items.map((it) => (
                        <div
                          key={it.product_id}
                          className="bg-white rounded-lg p-2 text-xs flex items-center justify-between border border-emerald-100"
                        >
                          <div className="truncate flex-1 mr-2">
                            <span className="font-semibold text-gray-800 truncate block">
                              {it.product_name}
                            </span>
                            <span className="text-[11px] text-gray-500">
                              {it.package_count} pack(s) • ₹{it.unit_price} each
                            </span>
                          </div>
                          <span className="font-bold text-gray-900 shrink-0">
                            ₹{it.subtotal}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Add to Cart button */}
                    <button
                      onClick={() => handleAddCartItems(m.cartData)}
                      disabled={isAddingToCart || addedSuccess}
                      className={`w-full py-2 px-3 rounded-xl font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 ${
                        addedSuccess
                          ? "bg-green-600 text-white"
                          : "bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95"
                      } disabled:opacity-50`}
                    >
                      {addedSuccess ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          Added to FreshCart!
                        </>
                      ) : isAddingToCart ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Adding...
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-4 h-4" />
                          Add All {m.cartData.items.length} Items to Cart
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 px-3 py-2 rounded-2xl w-fit border border-emerald-100">
                <div className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce [animation-delay:0.4s]"></div>
                <span className="font-medium text-xs">Finding best groceries & prices...</span>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Quick Prompts (visible if conversation is short) */}
          {messages.length <= 3 && !loading && (
            <div className="px-3 py-2 border-t border-gray-100 bg-gray-50/60 overflow-x-auto whitespace-nowrap scrollbar-none flex gap-1.5">
              {quickPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(p)}
                  className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-white text-emerald-800 border border-emerald-200 hover:bg-emerald-50 shrink-0 transition-colors shadow-2xs"
                >
                  {p}
                </button>
              ))}
            </div>
          )}

          {/* Bottom Chat Input */}
          <div className="p-3 border-t border-gray-100 bg-white flex items-center gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              placeholder="e.g. 7 days groceries for 4 people under ₹3,000..."
              className="flex-1 px-3.5 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-200 focus:border-emerald-500 focus:bg-white rounded-xl outline-none transition-all placeholder:text-gray-400 disabled:opacity-60"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim() || loading}
              className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-40 transition-all shadow-sm active:scale-95 shrink-0"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

