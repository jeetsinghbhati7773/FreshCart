import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Bot,
  Sparkles,
  RotateCcw,
  AlertCircle,
  ShoppingBag,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Plus,
  MessageSquare,
  Search,
  Archive,
  Trash2,
  Edit2,
  Check,
  X,
  Menu,
  Lock,
  ArrowRight,
  Clock,
} from "lucide-react";
import toast from "react-hot-toast";

import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import IntentSummary from "./IntentSummary";
import GroceryPlan from "./GroceryPlan";
import ProductRecommendation from "./ProductRecommendation";
import BudgetSummary from "./BudgetSummary";
import OptimizedCart from "./OptimizedCart";
import OptimizationSummary from "./OptimizationSummary";
import { swapCartItem, batchAddToCart } from "../../services/aiService";
import aiChatService from "../../services/aiChatService";
import { useAppContext } from "../../context/AppContext";

const DEFAULT_WELCOME = {
  isAi: true,
  text: "Hello! I am ShopPilot, your autonomous grocery shopping concierge. Tell me what groceries you need, for how many people, how many days, and your target budget (e.g. 'I need groceries for a family of 4 for 7 days within ₹3,000').",
  timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
};

const ShoppingAssistant = () => {
  const { user, setShowUserLogin, refreshBackendCart } = useAppContext();

  // Multi-Chat Sidebar State
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [activeConversation, setActiveConversation] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [conversationTab, setConversationTab] = useState("active"); // "active" | "archived"
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Rename & Delete Inline State
  const [renamingId, setRenamingId] = useState(null);
  const [renameTitle, setRenameTitle] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Chat & AI State
  const [messages, setMessages] = useState([DEFAULT_WELCOME]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Live Intelligence Dashboard State
  const [intent, setIntent] = useState(null);
  const [groceryPlan, setGroceryPlan] = useState([]);
  const [matchedProducts, setMatchedProducts] = useState([]);
  const [estimatedTotal, setEstimatedTotal] = useState(0);
  const [budgetStatus, setBudgetStatus] = useState("not_calculated");
  const [budgetDifference, setBudgetDifference] = useState(0);
  const [optimizedCart, setOptimizedCart] = useState(null);
  const [isSwapping, setIsSwapping] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [showDetailedSteps, setShowDetailedSteps] = useState(false);

  const chatBottomRef = useRef(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Load conversations (guest fallback supported when login is disabled)
  useEffect(() => {
    loadConversations();
  }, [user]);

  const loadConversations = async (targetActiveId = null) => {
    setLoadingConversations(true);
    try {
      const res = await aiChatService.fetchConversations({
        status: conversationTab,
        search: searchQuery,
      });

      const list = res.conversations || [];
      setConversations(list);

      // Select conversation: priority to targetActiveId, or stored in session, or first in list
      let selectedId = targetActiveId;
      if (!selectedId) {
        const stored = sessionStorage.getItem("shoppilot_active_conv_id");
        if (stored && list.some((c) => c.id === stored)) {
          selectedId = stored;
        } else if (list.length > 0) {
          selectedId = list[0].id;
        }
      }

      if (selectedId) {
        selectConversation(selectedId, list);
      } else if (list.length === 0) {
        // No conversations exist yet: create first one automatically
        await handleNewChat(false);
      }
    } catch (err) {
      console.error("Failed to load conversations:", err);
    } finally {
      setLoadingConversations(false);
    }
  };

  const selectConversation = async (convId, currentList = conversations) => {
    setActiveConversationId(convId);
    sessionStorage.setItem("shoppilot_active_conv_id", convId);

    const conv = currentList.find((c) => c.id === convId);
    if (conv) setActiveConversation(conv);

    setLoadingMessages(true);
    setError(null);

    try {
      const res = await aiChatService.fetchMessages(convId, { limit: 50 });
      const rawMessages = res.messages || [];

      if (rawMessages.length === 0) {
        setMessages([DEFAULT_WELCOME]);
        resetIntelligenceDashboard();
      } else {
        const formatted = rawMessages.map((m) => ({
          id: m.id,
          isAi: m.role === "assistant",
          text: m.content,
          metadata: m.metadata,
          timestamp: new Date(m.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        }));
        setMessages(formatted);

        // Restore latest dashboard state from last assistant message with metadata
        const lastMetaMsg = [...rawMessages]
          .reverse()
          .find((m) => m.role === "assistant" && m.metadata);

        if (lastMetaMsg && lastMetaMsg.metadata) {
          restoreIntelligenceFromMetadata(lastMetaMsg.metadata);
        } else {
          resetIntelligenceDashboard();
        }
      }
    } catch (err) {
      console.error("Failed to fetch messages for conversation:", err);
      toast.error("Could not load conversation history");
    } finally {
      setLoadingMessages(false);
    }
  };

  const restoreIntelligenceFromMetadata = (meta) => {
    if (meta.grocery_plan) setGroceryPlan(meta.grocery_plan);
    if (meta.matched_products) setMatchedProducts(meta.matched_products);
    if (meta.optimized_cart) setOptimizedCart(meta.optimized_cart);
  };

  const resetIntelligenceDashboard = () => {
    setIntent(null);
    setGroceryPlan([]);
    setMatchedProducts([]);
    setEstimatedTotal(0);
    setBudgetStatus("not_calculated");
    setBudgetDifference(0);
    setOptimizedCart(null);
  };

  const handleNewChat = async (notify = true) => {
    try {
      const newConv = await aiChatService.createConversation("New Grocery Plan");
      setConversations((prev) => [newConv, ...prev]);
      setActiveConversationId(newConv.id);
      setActiveConversation(newConv);
      sessionStorage.setItem("shoppilot_active_conv_id", newConv.id);
      setMessages([DEFAULT_WELCOME]);
      resetIntelligenceDashboard();
      if (notify) toast.success("Started new conversation");
      return newConv;
    } catch (err) {
      console.error("Create conversation failed:", err);
      toast.error("Could not create new chat");
    }
  };

  const handleSendMessage = async (userText) => {
    // Login disabled: allow guest conversations without login modal
    // if (!user) {
    //   setShowUserLogin(true);
    //   return;
    // }

    let convId = activeConversationId;
    if (!convId) {
      const created = await handleNewChat(false);
      if (!created) return;
      convId = created.id;
    }

    setError(null);
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // Optimistic user message
    setMessages((prev) => [
      ...prev,
      { isAi: false, text: userText, timestamp: now },
    ]);
    setLoading(true);

    try {
      const response = await aiChatService.sendMessage(convId, userText);

      if (response && response.success) {
        const assistantMsg = response.assistantMessage;
        const aiResp = response.aiResponse;

        if (aiResp) {
          if (aiResp.intent) setIntent(aiResp.intent);
          if (aiResp.grocery_plan) setGroceryPlan(aiResp.grocery_plan);
          if (aiResp.matched_products) setMatchedProducts(aiResp.matched_products);
          if (aiResp.estimated_total !== undefined) setEstimatedTotal(aiResp.estimated_total);
          if (aiResp.budget_status) setBudgetStatus(aiResp.budget_status);
          if (aiResp.budget_difference !== undefined) setBudgetDifference(aiResp.budget_difference);
          if (aiResp.optimized_cart) setOptimizedCart(aiResp.optimized_cart);
        }

        // Append assistant message from PostgreSQL
        setMessages((prev) => [
          ...prev,
          {
            id: assistantMsg.id,
            isAi: true,
            text: assistantMsg.content,
            metadata: assistantMsg.metadata,
            timestamp: new Date(assistantMsg.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ]);

        // Refresh conversation sidebar to update title / lastMessageAt
        loadConversations(convId);
      } else {
        throw new Error(response.message || "Failed to process message");
      }
    } catch (err) {
      console.error("Send message error:", err);
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

  const handleStartRename = (conv, e) => {
    e.stopPropagation();
    setRenamingId(conv.id);
    setRenameTitle(conv.title);
  };

  const handleSaveRename = async (convId, e) => {
    e.stopPropagation();
    if (!renameTitle.trim()) {
      setRenamingId(null);
      return;
    }
    try {
      const updated = await aiChatService.updateConversation(convId, { title: renameTitle.trim() });
      setConversations((prev) => prev.map((c) => (c.id === convId ? updated : c)));
      if (activeConversationId === convId) {
        setActiveConversation(updated);
      }
      setRenamingId(null);
      toast.success("Conversation renamed");
    } catch (err) {
      toast.error("Failed to rename conversation");
    }
  };

  const handleToggleArchive = async (conv, e) => {
    e.stopPropagation();
    const newStatus = conv.status === "active" ? "archived" : "active";
    try {
      await aiChatService.updateConversation(conv.id, { status: newStatus });
      toast.success(newStatus === "archived" ? "Conversation archived" : "Conversation unarchived");
      loadConversations(activeConversationId === conv.id ? null : activeConversationId);
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleDeleteConversation = async (convId, e) => {
    e.stopPropagation();
    try {
      await aiChatService.deleteConversation(convId);
      setDeleteConfirmId(null);
      toast.success("Conversation deleted");
      loadConversations();
    } catch {
      toast.error("Failed to delete conversation");
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

  const hasIntelligenceData = Boolean(
    optimizedCart || intent || groceryPlan.length > 0 || matchedProducts.length > 0
  );

  // Authentication Gate commented out while login is disabled
  // if (!user) {
  //   return ( ... Sign In to ShopPilot ... );
  // }

  return (
    <div className="pt-20 pb-12 min-h-screen">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200 mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 shadow-sm transition-colors"
            title="Toggle Sidebar"
          >
            <Menu className="w-4 h-4" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-sm">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                ShopPilot <span className="text-emerald-600 font-semibold text-sm sm:text-base">AI Concierge</span>
              </h1>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-gray-600 shadow-sm flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Autonomous Intelligence</span>
          </span>
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

      {/* Main Multi-Chat ChatGPT-Style Layout */}
      <div className="flex flex-col lg:flex-row gap-5 items-start">
        {/* Left Sidebar: Persistent Chat History */}
        {sidebarOpen && (
          <aside className="w-full lg:w-72 xl:w-80 flex-shrink-0 bg-white border border-gray-200 rounded-2xl shadow-sm p-3.5 flex flex-col h-[700px]">
            {/* New Chat Button */}
            <button
              onClick={() => handleNewChat(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all duration-150 mb-3"
            >
              <Plus className="w-4 h-4" />
              <span>New Grocery Plan</span>
            </button>

            {/* Search Input */}
            <div className="relative mb-3">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && loadConversations()}
                className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700 outline-none focus:border-emerald-500 transition-all"
              />
            </div>

            {/* Tabs: Active / Archived */}
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl mb-3 text-[11px] font-bold">
              <button
                onClick={() => {
                  setConversationTab("active");
                  aiChatService
                    .fetchConversations({ status: "active", search: searchQuery })
                    .then((res) => setConversations(res.conversations || []));
                }}
                className={`flex-1 py-1 rounded-lg transition-all ${conversationTab === "active" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                  }`}
              >
                Recent
              </button>
              <button
                onClick={() => {
                  setConversationTab("archived");
                  aiChatService
                    .fetchConversations({ status: "archived", search: searchQuery })
                    .then((res) => setConversations(res.conversations || []));
                }}
                className={`flex-1 py-1 rounded-lg transition-all ${conversationTab === "archived" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                  }`}
              >
                Archived
              </button>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto space-y-1 pr-1">
              {loadingConversations ? (
                <div className="py-12 text-center text-xs text-gray-400">Loading chats...</div>
              ) : conversations.length === 0 ? (
                <div className="py-12 text-center text-xs text-gray-400 px-4">
                  No {conversationTab} conversations found.
                </div>
              ) : (
                conversations.map((conv) => {
                  const isActive = conv.id === activeConversationId;
                  const isRenaming = renamingId === conv.id;

                  return (
                    <div
                      key={conv.id}
                      onClick={() => !isRenaming && selectConversation(conv.id)}
                      className={`group relative flex items-center justify-between p-2.5 rounded-xl text-xs cursor-pointer transition-all ${isActive
                          ? "bg-emerald-50/90 text-emerald-950 font-bold border border-emerald-200/80"
                          : "text-gray-700 hover:bg-gray-50 border border-transparent"
                        }`}
                    >
                      <div className="flex items-center gap-2 overflow-hidden flex-1 mr-2">
                        <MessageSquare
                          className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? "text-emerald-600" : "text-gray-400 group-hover:text-gray-600"
                            }`}
                        />
                        {isRenaming ? (
                          <input
                            type="text"
                            value={renameTitle}
                            autoFocus
                            onChange={(e) => setRenameTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSaveRename(conv.id, e);
                              if (e.key === "Escape") setRenamingId(null);
                            }}
                            className="bg-white border border-emerald-400 rounded px-1.5 py-0.5 text-xs text-gray-800 outline-none w-full"
                          />
                        ) : (
                          <div className="truncate">
                            <span className="truncate block">{conv.title}</span>
                            <span className="text-[10px] text-gray-400 font-normal block">
                              {new Date(conv.lastMessageAt || conv.updatedAt).toLocaleDateString([], {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Action Menu Buttons */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {isRenaming ? (
                          <>
                            <button
                              onClick={(e) => handleSaveRename(conv.id, e)}
                              className="p-1 hover:text-emerald-700"
                              title="Save Title"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setRenamingId(null);
                              }}
                              className="p-1 hover:text-gray-600"
                              title="Cancel"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : deleteConfirmId === conv.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => handleDeleteConversation(conv.id, e)}
                              className="px-1.5 py-0.5 bg-red-600 text-white rounded text-[9px] font-bold"
                            >
                              Del
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteConfirmId(null);
                              }}
                              className="px-1 py-0.5 text-gray-500 text-[9px]"
                            >
                              X
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={(e) => handleStartRename(conv, e)}
                              className="p-1 text-gray-400 hover:text-gray-700"
                              title="Rename"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={(e) => handleToggleArchive(conv, e)}
                              className="p-1 text-gray-400 hover:text-gray-700"
                              title={conv.status === "active" ? "Archive" : "Unarchive"}
                            >
                              <Archive className="w-3 h-3" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteConfirmId(conv.id);
                              }}
                              className="p-1 text-gray-400 hover:text-red-600"
                              title="Delete"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Sidebar Footer User Info */}
            <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-600 mt-2">
              <div className="truncate">
                <span className="font-bold text-gray-900 block truncate">{user.name}</span>
                <span className="text-[10px] text-gray-400 block truncate">{user.email}</span>
              </div>
            </div>
          </aside>
        )}

        {/* Right Section: Resumable Chat Stream + Live Intelligence Dashboard */}
        <div className="flex-1 w-full grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Chat Stream Area (5 cols on large) */}
          <div className="lg:col-span-5 bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col h-[700px] overflow-hidden">
            {/* Active Conversation Top Bar */}
            <div className="px-4 py-3 bg-gray-50/90 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2 overflow-hidden mr-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0"></span>
                <span className="text-xs font-bold text-gray-800 truncate">
                  {activeConversation ? activeConversation.title : "ShopPilot Assistant"}
                </span>
              </div>
              <span className="text-[10px] font-mono text-gray-400 flex-shrink-0">
                {activeConversationId ? `ID: ${activeConversationId.slice(0, 8)}` : "Live"}
              </span>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-gray-50/40 to-white">
              {loadingMessages ? (
                <div className="py-20 text-center text-xs text-gray-400">Loading messages...</div>
              ) : (
                messages.map((m, idx) => (
                  <ChatMessage
                    key={m.id || idx}
                    isAi={m.isAi}
                    message={m.text}
                    timestamp={m.timestamp}
                  />
                ))
              )}
              {loading && (
                <div className="flex items-center gap-2 my-3 text-xs text-emerald-700 bg-emerald-50/80 px-3 py-2 rounded-xl w-fit border border-emerald-100">
                  <div className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce"></div>
                  <div className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce [animation-delay:0.4s]"></div>
                  <span className="font-medium ml-1">Analyzing catalog and personalizing plan...</span>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Chat Input */}
            <ChatInput onSend={handleSendMessage} loading={loading} />
          </div>

          {/* Intelligence Dashboard (7 cols on large) */}
          <div className="lg:col-span-7">
            {hasIntelligenceData ? (
              <div>
                {/* Smart Cart Optimization */}
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

                    {/* Collapsible Requirements and Intent */}
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
              /* Empty Dashboard State */
              <div className="bg-white border border-gray-200 border-dashed rounded-2xl p-8 text-center flex flex-col items-center justify-center min-h-[450px]">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                  <ShoppingBag className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-gray-900">
                  Autonomous Plan Intelligence Ready
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 max-w-sm mt-1">
                  Send a grocery request to see matched FreshCart products, budget tracking, and smart cart optimization. Your plan persists automatically across sessions.
                </p>
                <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Resumable Conversations • User-Specific Memory</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShoppingAssistant;
