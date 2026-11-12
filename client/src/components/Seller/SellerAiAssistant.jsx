import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  Bot,
  CheckCircle2,
  XCircle,
  Send,
  Plus,
  Sparkles,
  Package,
  TrendingUp,
  AlertTriangle,
  Loader2,
  MessageSquare,
} from "lucide-react";
import { sellerAiService } from "../../services/sellerAiService";

const QUICK_PROMPTS = [
  "Show orders that need attention",
  "Which products are out of stock?",
  "Show low-stock items and restock recommendations",
  "What is today's sales, weekly and monthly revenue?",
  "Show top 5 selling products and category revenue",
];

const SellerAiAssistant = () => {
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingConv, setLoadingConv] = useState(true);
  const [actionBusyId, setActionBusyId] = useState(null);
  const [actionStatuses, setActionStatuses] = useState({});
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  const loadConversations = async () => {
    try {
      setLoadingConv(true);
      const data = await sellerAiService.getConversations();
      const list = data.conversations || [];
      setConversations(list);
      if (list.length > 0 && !activeConversationId) {
        await selectConversation(list[0].id);
      }
    } catch (err) {
      console.error("Failed to load seller AI conversations:", err);
    } finally {
      setLoadingConv(false);
    }
  };

  const selectConversation = async (id) => {
    try {
      setActiveConversationId(id);
      const data = await sellerAiService.getConversation(id);
      setMessages(data.conversation?.messages || []);
    } catch (err) {
      toast.error("Failed to load conversation");
    }
  };

  const handleNewChat = () => {
    setActiveConversationId(null);
    setMessages([]);
    setInput("");
  };

  const handleSend = async (customText) => {
    const text = (customText ?? input).trim();
    if (!text || sending) return;

    if (!customText) setInput("");
    const tempUserMsg = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: text,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);
    setSending(true);

    try {
      const res = await sellerAiService.sendMessage({
        conversationId: activeConversationId,
        message: text,
      });
      if (!activeConversationId && res.conversationId) {
        setActiveConversationId(res.conversationId);
        loadConversations();
      }
      if (res.message) {
        setMessages((prev) => [...prev, res.message]);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reach Seller AI Assistant");
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          content:
            err.response?.data?.message ||
            "Sorry, I could not process that request right now. Please check that the AI service is running.",
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleActionDecision = async (actionId, decision) => {
    if (actionBusyId) return;
    setActionBusyId(actionId);
    try {
      const res =
        decision === "confirm"
          ? await sellerAiService.confirmAction(actionId)
          : await sellerAiService.cancelAction(actionId);

      setActionStatuses((prev) => ({
        ...prev,
        [actionId]: decision === "confirm" ? "CONFIRMED" : "CANCELLED",
      }));

      if (res.message) {
        setMessages((prev) => [...prev, res.message]);
      }
      toast.success(
        decision === "confirm" ? "Action executed successfully!" : "Action cancelled."
      );
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed");
    } finally {
      setActionBusyId(null);
    }
  };

  const renderStructuredSummary = (structured) => {
    if (!structured || !structured.data) return null;

    if (structured.kind === "analytics") {
      const d = structured.data;
      return (
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5">
            <div className="text-emerald-700 font-medium">Today's Sales</div>
            <div className="text-base font-bold text-emerald-900">₹{d.todaySales ?? 0}</div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5">
            <div className="text-blue-700 font-medium">Weekly Revenue</div>
            <div className="text-base font-bold text-blue-900">₹{d.weeklyRevenue ?? 0}</div>
          </div>
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-2.5">
            <div className="text-indigo-700 font-medium">Monthly Revenue</div>
            <div className="text-base font-bold text-indigo-900">₹{d.monthlyRevenue ?? 0}</div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5">
            <div className="text-amber-700 font-medium">Avg Order Value</div>
            <div className="text-base font-bold text-amber-900">₹{d.averageOrderValue ?? 0}</div>
          </div>
        </div>
      );
    }

    if (structured.kind === "inventory" && structured.data.summary) {
      const s = structured.data.summary;
      return (
        <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
          <div className="bg-red-50 border border-red-200 rounded-lg p-2">
            <div className="text-red-700 font-medium">Out of Stock</div>
            <div className="text-base font-bold text-red-900">{s.outOfStockCount}</div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-2">
            <div className="text-amber-700 font-medium">Low Stock</div>
            <div className="text-base font-bold text-amber-900">{s.lowStockCount}</div>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2">
            <div className="text-emerald-700 font-medium">Healthy</div>
            <div className="text-base font-bold text-emerald-900">{s.healthyCount}</div>
          </div>
        </div>
      );
    }

    if (structured.kind === "orders" && structured.data.summary) {
      const s = structured.data.summary;
      return (
        <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-2">
            <div className="text-slate-600 font-medium">Total Orders</div>
            <div className="text-base font-bold text-slate-900">{s.totalOrders}</div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-2">
            <div className="text-amber-700 font-medium">Awaiting Action</div>
            <div className="text-base font-bold text-amber-900">{s.awaitingActionCount}</div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-2">
            <div className="text-red-700 font-medium">Delayed (&gt;24h)</div>
            <div className="text-base font-bold text-red-900">{s.delayedCount}</div>
          </div>
        </div>
      );
    }

    return null;
  };

  const renderPendingActionCard = (pa) => {
    if (!pa || !pa.actionId) return null;
    const liveStatus = actionStatuses[pa.actionId] || pa.status || "PENDING";
    const isPending = liveStatus === "PENDING";

    return (
      <div className="mt-3 border border-amber-300 bg-amber-50/90 rounded-xl p-3.5 text-sm">
        <div className="flex items-center gap-2 font-semibold text-amber-900 mb-1.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Confirmation Required</span>
        </div>
        <p className="text-amber-900/90 text-xs sm:text-sm mb-2.5">{pa.summary}</p>

        {pa.actionType === "UPDATE_ORDER_STATUS" && (
          <div className="text-xs bg-white/80 rounded-lg p-2 border border-amber-200 mb-3 flex flex-wrap gap-3">
            <span>
              Order: <strong>{pa.shortId}</strong>
            </span>
            <span>
              Current: <strong>{pa.currentStatus}</strong>
            </span>
            <span>
              Proposed: <strong className="text-emerald-700">{pa.proposedStatus}</strong>
            </span>
          </div>
        )}

        {pa.actionType === "UPDATE_PRODUCT_STOCK" && (
          <div className="text-xs bg-white/80 rounded-lg p-2 border border-amber-200 mb-3 flex flex-wrap gap-3">
            <span>
              Product: <strong>{pa.productName}</strong>
            </span>
            <span>
              Current Stock: <strong>{pa.currentStock}</strong>
            </span>
            <span>
              Proposed Stock: <strong className="text-emerald-700">{pa.proposedStock}</strong>
            </span>
          </div>
        )}

        {isPending ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleActionDecision(pa.actionId, "confirm")}
              disabled={actionBusyId === pa.actionId}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium disabled:opacity-50 cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {actionBusyId === pa.actionId ? "Processing..." : "Confirm Action"}
            </button>
            <button
              onClick={() => handleActionDecision(pa.actionId, "cancel")}
              disabled={actionBusyId === pa.actionId}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-gray-100 border border-gray-300 text-gray-700 text-xs font-medium disabled:opacity-50 cursor-pointer"
            >
              <XCircle className="w-3.5 h-3.5" />
              Cancel
            </button>
          </div>
        ) : (
          <div className="text-xs font-semibold text-gray-700">
            Status: {liveStatus}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      {/* Left Conversation History */}
      <div className="hidden md:flex w-64 flex-col border-r border-gray-200 bg-gray-50/70">
        <div className="p-3 border-b border-gray-200">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            New Seller Chat
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {loadingConv ? (
            <p className="text-xs text-gray-400 p-3">Loading history...</p>
          ) : conversations.length === 0 ? (
            <p className="text-xs text-gray-400 p-3">No previous chats yet.</p>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => selectConversation(conv.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center gap-2 transition cursor-pointer ${
                  activeConversationId === conv.id
                    ? "bg-emerald-100 text-emerald-900 font-semibold"
                    : "hover:bg-gray-200/70 text-gray-700"
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{conv.title}</span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-200 bg-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-gray-900 flex items-center gap-1.5">
                ShopPilot Seller AI Agent
                <Sparkles className="w-4 h-4 text-emerald-600" />
              </h2>
              <p className="text-xs text-gray-500">
                Live PostgreSQL order, inventory &amp; revenue intelligence with confirmed actions
              </p>
            </div>
          </div>
          <button
            onClick={handleNewChat}
            className="md:hidden px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-medium"
          >
            + New
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/40">
          {messages.length === 0 ? (
            <div className="max-w-2xl mx-auto mt-6 text-center space-y-5">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">
                  Manage Your Store with Natural Language
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Ask about orders, out-of-stock products, revenue analytics, restocking, or request confirmed stock &amp; order updates.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {QUICK_PROMPTS.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSend(q)}
                    className="px-3 py-1.5 rounded-full bg-white border border-gray-200 hover:border-emerald-400 hover:bg-emerald-50 text-xs text-gray-700 transition cursor-pointer"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap shadow-xs ${
                    m.role === "user"
                      ? "bg-emerald-600 text-white"
                      : "bg-white border border-gray-200 text-gray-800"
                  }`}
                >
                  <div>{m.content}</div>
                  {m.role === "assistant" &&
                    renderStructuredSummary(m.metadata?.structured_data)}
                  {m.role === "assistant" &&
                    renderPendingActionCard(m.metadata?.pending_action)}
                  {m.role === "assistant" &&
                    Array.isArray(m.metadata?.tools_used) &&
                    m.metadata.tools_used.length > 0 && (
                      <div className="mt-2 pt-1.5 border-t border-gray-100 text-[10px] text-gray-400 flex items-center gap-1">
                        <Package className="w-3 h-3" />
                        Tools: {Array.from(new Set(m.metadata.tools_used)).join(", ")}
                      </div>
                    )}
                </div>
              </div>
            ))
          )}

          {sending && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-500 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                Analyzing store data...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 border-t border-gray-200 bg-white flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='Ask e.g. "Which products are out of stock?" or "Increase Amul Milk stock by 20"'
            className="flex-1 px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default SellerAiAssistant;

