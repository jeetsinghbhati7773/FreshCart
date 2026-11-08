import React, { useState, useEffect, useRef, useContext } from "react";
import { Bot, Sparkles, RotateCcw, AlertCircle, ShoppingBag, ShieldCheck, ChevronDown, ChevronUp } from "lucide-react";
import toast from "react-hot-toast";

import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import IntentSummary from "./IntentSummary";
import GroceryPlan from "./GroceryPlan";
import ProductRecommendation from "./ProductRecommendation";
import BudgetSummary from "./BudgetSummary";
import OptimizedCart from "./OptimizedCart";
import OptimizationSummary from "./OptimizationSummary";
import { sendChatMessage, swapCartItem, batchAddToCart } from "../../services/aiService";
import { AppContext } from "../../context/AppContext";

const getConversationId = () => {
  let cid = sessionStorage.getItem("shoppilot_ai_cid");
  if (!cid) {
    cid = "chat_" + Math.random().toString(36).substring(2, 9) + "_" + Date.now();
    sessionStorage.setItem("shoppilot_ai_cid", cid);
  }
  return cid;
};

const ShoppingAssistant = () => {
  const { refreshBackendCart } = useContext(AppContext);
  const [conversationId, setConversationId] = useState(getConversationId);
  const [messages, setMessages] = useState([
    {
      isAi: true,
      text: "Hello! I am ShopPilot, your autonomous grocery shopping concierge. Tell me what groceries you need, for how many people, how many days, and your target budget (e.g. 'I need groceries for a family of 4 for 7 days within ₹3,000').",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // AI Generated Intelligence State
  const [intent, setIntent] = useState(null);
  const [groceryPlan, setGroceryPlan] = useState([]);
  const [matchedProducts, setMatchedProducts] = useState([]);
  const [estimatedTotal, setEstimatedTotal] = useState(0);
  const [budgetStatus, setBudgetStatus] = useState("not_calculated");
  const [budgetDifference, setBudgetDifference] = useState(0);

  // Step 3 Optimization State
  const [optimizedCart, setOptimizedCart] = useState(null);
  const [isSwapping, setIsSwapping] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [showDetailedSteps, setShowDetailedSteps] = useState(false);

  const chatBottomRef = useRef(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSendMessage = async (userText) => {
    setError(null);
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // Append customer message
    setMessages((prev) => [
      ...prev,
      { isAi: false, text: userText, timestamp: now },
    ]);
    setLoading(true);

    try {
      const response = await sendChatMessage(userText, conversationId);

      if (response && response.success) {
        // Update intelligence state
        if (response.intent) setIntent(response.intent);
        if (response.grocery_plan) setGroceryPlan(response.grocery_plan);
        if (response.matched_products) setMatchedProducts(response.matched_products);
        if (response.estimated_total !== undefined) setEstimatedTotal(response.estimated_total);
        if (response.budget_status) setBudgetStatus(response.budget_status);
        if (response.budget_difference !== undefined) setBudgetDifference(response.budget_difference);
        if (response.optimized_cart) setOptimizedCart(response.optimized_cart);

        // Assistant reply message
        const replyText =
          response.assistant_message ||
          response.clarification_question ||
          "I have processed your grocery requirements.";

        setMessages((prev) => [
          ...prev,
          {
            isAi: true,
            text: replyText,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      } else {
        throw new Error(response.message || "Failed to receive AI response");
      }
    } catch (err) {
      console.error("AI Chat Error:", err);
      const errMsg =
        err.response?.data?.message ||
        err.message ||
        "Could not connect to ShopPilot AI. Ensure the AI microservice is running.";
      setError(errMsg);
      toast.error(errMsg);
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

  const handleSwapItem = async (targetProductId, replacementProductId) => {
    if (!optimizedCart) return;
    setIsSwapping(true);
    try {
      const res = await swapCartItem(optimizedCart, targetProductId, replacementProductId);
      if (res && res.success && res.cart) {
        setOptimizedCart(res.cart);
        toast.success("Product substituted successfully!");
      }
    } catch (err) {
      console.error("Swap Error:", err);
      toast.error(err.response?.data?.message || err.message || "Failed to swap product");
    } finally {
      setIsSwapping(false);
    }
  };

  const handleAddToCart = async () => {
    if (!optimizedCart || !optimizedCart.items || optimizedCart.items.length === 0) return;
    setIsAddingToCart(true);
    try {
      const itemsToAdd = optimizedCart.items.map((it) => ({
        productId: it.product_id,
        quantity: it.package_count || 1,
      }));
      const res = await batchAddToCart(itemsToAdd, false);
      if (res && res.success) {
        setAddedSuccess(true);
        toast.success(`Transferred ${res.addedCount} items to your FreshCart cart!`);
        if (refreshBackendCart) {
          await refreshBackendCart();
        }
        setTimeout(() => setAddedSuccess(false), 4000);
      }
    } catch (err) {
      console.error("Batch Add Error:", err);
      toast.error(err.response?.data?.message || err.message || "Failed to add items to cart");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleResetConversation = () => {
    const newCid = "chat_" + Math.random().toString(36).substring(2, 9) + "_" + Date.now();
    sessionStorage.setItem("shoppilot_ai_cid", newCid);
    setConversationId(newCid);
    setMessages([
      {
        isAi: true,
        text: "New session started! What groceries can I plan for you today?",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    setIntent(null);
    setGroceryPlan([]);
    setMatchedProducts([]);
    setEstimatedTotal(0);
    setBudgetStatus("not_calculated");
    setBudgetDifference(0);
    setOptimizedCart(null);
    setAddedSuccess(false);
    setError(null);
    toast.success("Started fresh shopping session");
  };

  const hasIntelligenceData = Boolean(
    optimizedCart || intent || groceryPlan.length > 0 || matchedProducts.length > 0
  );

  return (
    <div className="pt-24 pb-12 min-h-screen">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              ShopPilot <span className="text-emerald-600 font-semibold text-lg">AI Shopping Concierge</span>
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Autonomous grocery discovery & smart cart optimization backed by real FreshCart catalog prices and inventory.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleResetConversation}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 shadow-sm transition-colors duration-150"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Session</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-start gap-2.5 text-rose-800 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600 mt-0.5" />
          <div>
            <span className="font-bold">Service Notice:</span> {error}
          </div>
        </div>
      )}

      {/* Main Grid: Chat Stream + Live Intelligence Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Chat Area (5 Cols on large, full on small) */}
        <div className="lg:col-span-5 bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col h-[650px] overflow-hidden">
          {/* Chat Header */}
          <div className="px-4 py-3 bg-gray-50/80 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-bold text-gray-800">Autonomous Assistant</span>
            </div>
            <span className="text-[11px] font-mono text-gray-400">
              ID: {conversationId.slice(0, 15)}...
            </span>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-gray-50/40 to-white">
            {messages.map((m, idx) => (
              <ChatMessage
                key={idx}
                isAi={m.isAi}
                message={m.text}
                timestamp={m.timestamp}
              />
            ))}
            {loading && (
              <div className="flex items-center gap-2 my-3 text-xs text-emerald-700 bg-emerald-50/80 px-3 py-2 rounded-xl w-fit border border-emerald-100">
                <div className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce [animation-delay:0.4s]"></div>
                <span className="font-medium ml-1">Analyzing catalog and calculating optimal plan...</span>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Chat Input */}
          <ChatInput onSend={handleSendMessage} loading={loading} />
        </div>

        {/* Intelligence Dashboard (7 Cols on large, full on small) */}
        <div className="lg:col-span-7">
          {hasIntelligenceData ? (
            <div>
              {/* Step 3: Smart Cart Optimization (Summary + Interactive Table) */}
              {optimizedCart ? (
                <>
                  <OptimizationSummary
                    breakdown={optimizedCart.breakdown}
                    metrics={optimizedCart.metrics}
                    recommendations={optimizedCart.recommendations}
                    onAddToCart={handleAddToCart}
                    isAddingToCart={isAddingToCart}
                    addedSuccess={addedSuccess}
                  />

                  <OptimizedCart
                    cart={optimizedCart}
                    onSwapItem={handleSwapItem}
                    isSwapping={isSwapping}
                  />

                  {/* Collapsible Requirements and Intent view */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm mb-4">
                    <button
                      onClick={() => setShowDetailedSteps(!showDetailedSteps)}
                      className="w-full flex items-center justify-between text-xs font-bold text-gray-700 hover:text-emerald-700 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-emerald-600" />
                        {showDetailedSteps ? "Hide" : "View"} Underlying Household Requirements & Intent
                      </span>
                      {showDetailedSteps ? (
                        <ChevronUp className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      )}
                    </button>

                    {showDetailedSteps && (
                      <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
                        {intent && <IntentSummary intent={intent} />}
                        {groceryPlan.length > 0 && <GroceryPlan items={groceryPlan} />}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                /* Step 2 Direct Plan Fallback */
                <>
                  {intent && <IntentSummary intent={intent} />}
                  {(estimatedTotal > 0 || intent?.budget) && (
                    <BudgetSummary
                      total={estimatedTotal}
                      budget={intent?.budget}
                      status={budgetStatus}
                      difference={budgetDifference}
                    />
                  )}
                  {groceryPlan.length > 0 && <GroceryPlan items={groceryPlan} />}
                  {matchedProducts.length > 0 && (
                    <ProductRecommendation products={matchedProducts} />
                  )}
                </>
              )}
            </div>
          ) : (
            /* Empty State */
            <div className="bg-white border border-gray-200 border-dashed rounded-2xl p-8 text-center flex flex-col items-center justify-center min-h-[400px]">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                <ShoppingBag className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-gray-900">
                Plan Intelligence Ready
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 max-w-sm mt-1">
                Send a shopping request in the chat area to see extracted parameters, household grocery requirements, and matched FreshCart catalog products.
              </p>
              <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                <ShieldCheck className="w-4 h-4" />
                <span>Zero Hallucinations • Live PostgreSQL Catalog Prices</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShoppingAssistant;

