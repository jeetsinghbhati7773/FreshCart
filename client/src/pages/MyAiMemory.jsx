import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Brain,
  Sparkles,
  ShoppingBag,
  RefreshCw,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  AlertCircle,
  Sliders,
  Users,
  Utensils,
  Tag,
  DollarSign,
  Package,
  History,
  Lock,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAppContext } from "../context/AppContext";
import aiChatService from "../services/aiChatService";

const CATEGORY_CONFIG = {
  household_context: {
    label: "Household Context",
    icon: Users,
    color: "bg-blue-50 text-blue-700 border-blue-200",
  },
  dietary_preference: {
    label: "Dietary Preferences",
    icon: Utensils,
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  brand_preference: {
    label: "Brand Preferences",
    icon: Tag,
    color: "bg-purple-50 text-purple-700 border-purple-200",
  },
  budget_preference: {
    label: "Budget Rules",
    icon: DollarSign,
    color: "bg-amber-50 text-amber-700 border-amber-200",
  },
  shopping_preference: {
    label: "Shopping Patterns",
    icon: Package,
    color: "bg-teal-50 text-teal-700 border-teal-200",
  },
};

const MyAiMemory = () => {
  const { user, setShowUserLogin } = useAppContext();
  const navigate = useNavigate();

  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [settings, setSettings] = useState({ autoExtract: true, includeInContext: true });
  const [syncingOrders, setSyncingOrders] = useState(false);

  // Modal State
  const [editingMemory, setEditingMemory] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    category: "household_context",
    memoryKey: "",
    memoryValue: "",
    description: "",
    importance: 0.9,
  });

  useEffect(() => {
    if (user) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [mems, stgs] = await Promise.all([
        aiChatService.fetchMemories(),
        aiChatService.fetchMemorySettings(),
      ]);
      setMemories(mems);
      if (stgs) setSettings(stgs);
    } catch (err) {
      console.error("Failed to load AI memories:", err);
      toast.error("Could not load your AI memories");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSetting = async (key) => {
    const updated = { ...settings, [key]: !settings[key] };
    setSettings(updated);
    try {
      await aiChatService.updateMemorySettings(updated);
      toast.success(
        key === "autoExtract"
          ? `Automatic preference extraction ${updated.autoExtract ? "enabled" : "disabled"}`
          : `Personalized context in planning ${updated.includeInContext ? "enabled" : "disabled"}`
      );
    } catch (err) {
      console.error("Update settings error:", err);
      toast.error("Failed to update setting");
    }
  };

  const handleSyncOrders = async () => {
    setSyncingOrders(true);
    try {
      const res = await aiChatService.syncOrderMemories();
      if (res && res.success) {
        toast.success(`Analyzed ${res.analyzedOrders || 0} paid orders and updated shopping habits!`);
        await loadData();
      } else {
        toast.error(res?.message || "No paid orders found to analyze");
      }
    } catch (err) {
      console.error("Order sync error:", err);
      toast.error(err.response?.data?.message || "Failed to analyze orders");
    } finally {
      setSyncingOrders(false);
    }
  };

  const handleDeleteMemory = async (id) => {
    try {
      await aiChatService.deleteMemory(id);
      setMemories((prev) => prev.filter((m) => m.id !== id));
      setDeleteConfirmId(null);
      toast.success("Memory removed");
    } catch (err) {
      console.error("Delete memory error:", err);
      toast.error("Failed to delete memory");
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm("Are you sure you want to delete ALL remembered preferences? This cannot be undone.")) {
      return;
    }
    try {
      await aiChatService.clearAllMemories();
      setMemories([]);
      toast.success("All memories cleared");
    } catch (err) {
      console.error("Clear all error:", err);
      toast.error("Failed to clear memories");
    }
  };

  const handleSaveEdit = async () => {
    if (!editingMemory) return;
    try {
      const updated = await aiChatService.updateMemory(editingMemory.id, {
        memoryValue: editingMemory.memoryValue,
        description: editingMemory.description,
        category: editingMemory.category,
      });
      setMemories((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
      setEditingMemory(null);
      toast.success("Memory updated successfully");
    } catch (err) {
      console.error("Edit memory error:", err);
      toast.error("Failed to update memory");
    }
  };

  const handleCreateMemory = async (e) => {
    e.preventDefault();
    if (!formData.memoryKey || !formData.memoryValue || !formData.description) {
      toast.error("Please fill in all fields");
      return;
    }
    try {
      const created = await aiChatService.upsertMemory(formData);
      setMemories((prev) => [created, ...prev.filter((m) => m.id !== created.id)]);
      setShowAddModal(false);
      setFormData({
        category: "household_context",
        memoryKey: "",
        memoryValue: "",
        description: "",
        importance: 0.9,
      });
      toast.success("New preference saved");
    } catch (err) {
      console.error("Create memory error:", err);
      toast.error("Failed to save memory");
    }
  };

  const filteredMemories = memories.filter((m) => {
    if (activeTab === "all") return true;
    return m.category === activeTab;
  });

  // Login Gate
  if (!user) {
    return (
      <div className="pt-28 pb-16 min-h-[75vh] flex items-center justify-center">
        <div className="max-w-md w-full bg-white border border-gray-200 rounded-3xl p-8 text-center shadow-lg">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">
            Sign In for AI Memory
          </h2>
          <p className="text-sm text-gray-500 mt-2 mb-6">
            ShopPilot remembers your household size, favorite brands, dietary restrictions, and budget limits across sessions. Log in to manage your personalized shopping intelligence.
          </p>
          <button
            onClick={() => setShowUserLogin(true)}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-md transition-all duration-200 hover:scale-[1.02]"
          >
            Log In to ShopPilot
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16 min-h-screen max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-200 mb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md">
              <Brain className="w-5 h-5" />
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
              My AI Shopping Memory
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-2xl">
            Inspect, correct, and curate everything ShopPilot has learned about your grocery preferences. These semantic memories tailor your automated meal plans and cart suggestions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleSyncOrders}
            disabled={syncingOrders}
            className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-2.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition-all shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncingOrders ? "animate-spin" : ""}`} />
            <span>{syncingOrders ? "Mining Orders..." : "Sync from Paid Orders"}</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Preference</span>
          </button>

          <Link
            to="/shopping-assistant"
            className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 transition-all shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Back to Assistant</span>
          </Link>
        </div>
      </div>

      {/* Control Settings Bar */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-sm mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-6 text-xs text-gray-700">
          <div className="flex items-center gap-3">
            <span className="font-bold text-gray-900">Auto-learn from chat:</span>
            <button
              onClick={() => handleToggleSetting("autoExtract")}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.autoExtract ? "bg-emerald-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.autoExtract ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-bold text-gray-900">Apply memories to plans:</span>
            <button
              onClick={() => handleToggleSetting("includeInContext")}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.includeInContext ? "bg-emerald-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.includeInContext ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>

        {memories.length > 0 && (
          <button
            onClick={handleClearAll}
            className="text-xs text-red-600 hover:text-red-700 font-semibold self-start md:self-auto flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All Memories</span>
          </button>
        )}
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none text-xs">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${
            activeTab === "all"
              ? "bg-gray-900 text-white shadow-sm"
              : "bg-gray-100 hover:bg-gray-200 text-gray-700"
          }`}
        >
          All Memories ({memories.length})
        </button>

        {Object.entries(CATEGORY_CONFIG).map(([catKey, cat]) => {
          const count = memories.filter((m) => m.category === catKey).length;
          const Icon = cat.icon;
          return (
            <button
              key={catKey}
              onClick={() => setActiveTab(catKey)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${
                activeTab === catKey
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>
                {cat.label} ({count})
              </span>
            </button>
          );
        })}
      </div>

      {/* Content Stream */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs text-gray-500 font-semibold">Loading your AI shopping memories...</p>
        </div>
      ) : filteredMemories.length === 0 ? (
        <div className="bg-white border border-gray-200 border-dashed rounded-3xl p-12 text-center max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <Brain className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-black text-gray-900">No memories found in this category</h3>
          <p className="text-xs text-gray-500 mt-2 mb-6">
            ShopPilot automatically records habits like household size, dietary restrictions, and preferred brands whenever you chat with the AI assistant or complete an order.
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-sm hover:bg-emerald-700"
            >
              Add First Memory
            </button>
            <button
              onClick={handleSyncOrders}
              className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-xs font-bold hover:bg-gray-50"
            >
              Scan Past Orders
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMemories.map((mem) => {
            const cat = CATEGORY_CONFIG[mem.category] || {
              label: mem.category,
              icon: Package,
              color: "bg-gray-100 text-gray-700 border-gray-200",
            };
            const Icon = cat.icon;
            const isOrderSource = mem.sourceType === "order_history";

            return (
              <div
                key={mem.id}
                className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Category Pill + Source */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${cat.color}`}
                    >
                      <Icon className="w-3 h-3" />
                      <span>{cat.label}</span>
                    </span>

                    <span className="text-[10px] uppercase font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
                      {isOrderSource ? "Order History" : mem.sourceType}
                    </span>
                  </div>

                  {/* Memory Key Title */}
                  <h4 className="text-sm font-black text-gray-900 capitalize tracking-tight mb-1">
                    {mem.memoryKey.replace(/_/g, " ")}
                  </h4>

                  {/* Description */}
                  <p className="text-xs text-gray-600 leading-relaxed mb-4">
                    {mem.description}
                  </p>

                  {/* Stored Value Preview */}
                  <div className="bg-gray-50 rounded-xl p-2.5 border border-gray-100 mb-4 text-xs font-mono text-gray-700 break-words">
                    <span className="text-[10px] text-gray-400 block font-sans uppercase font-bold mb-0.5">
                      Stored Value:
                    </span>
                    {typeof mem.memoryValue === "object"
                      ? JSON.stringify(mem.memoryValue, null, 2)
                      : String(mem.memoryValue)}
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                  <div className="flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5" />
                    <span>
                      {new Date(mem.updatedAt || mem.createdAt).toLocaleDateString([], {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingMemory(mem)}
                      className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                      title="Edit Memory"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {deleteConfirmId === mem.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDeleteMemory(mem.id)}
                          className="px-2 py-1 bg-red-600 text-white rounded text-[10px] font-bold hover:bg-red-700"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-1.5 py-1 text-gray-500 hover:text-gray-700 text-[10px]"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmId(mem.id)}
                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Memory"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Modal */}
      {editingMemory && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <h3 className="text-base font-black text-gray-900">
                Edit Preference: {editingMemory.memoryKey.replace(/_/g, " ")}
              </h3>
              <button
                onClick={() => setEditingMemory(null)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Human Description</label>
                <textarea
                  value={editingMemory.description}
                  onChange={(e) =>
                    setEditingMemory({ ...editingMemory, description: e.target.value })
                  }
                  rows={2}
                  className="w-full border border-gray-200 rounded-xl p-2.5 focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">
                  Value (e.g. text, number or JSON)
                </label>
                <input
                  type="text"
                  value={
                    typeof editingMemory.memoryValue === "object"
                      ? JSON.stringify(editingMemory.memoryValue)
                      : String(editingMemory.memoryValue)
                  }
                  onChange={(e) => {
                    let val = e.target.value;
                    try {
                      val = JSON.parse(e.target.value);
                    } catch {}
                    setEditingMemory({ ...editingMemory, memoryValue: val });
                  }}
                  className="w-full border border-gray-200 rounded-xl p-2.5 focus:border-emerald-500 outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-6 pt-3 border-t border-gray-100">
              <button
                onClick={() => setEditingMemory(null)}
                className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Memory Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <h3 className="text-base font-black text-gray-900">Add New Shopping Preference</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMemory} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl p-2.5 focus:border-emerald-500 outline-none bg-white font-medium"
                >
                  <option value="household_context">Household Context (Family Size, Members)</option>
                  <option value="dietary_preference">Dietary Preference (Vegetarian, Vegan, Allergies)</option>
                  <option value="brand_preference">Brand Preference (e.g. Amul, Aashirvaad)</option>
                  <option value="budget_preference">Budget Rules (Target Spend, Limit)</option>
                  <option value="shopping_preference">Shopping Patterns & Staples</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">
                  Key Identifier (e.g. household_size, preferred_brand_milk)
                </label>
                <input
                  type="text"
                  placeholder="e.g. household_size"
                  value={formData.memoryKey}
                  onChange={(e) => setFormData({ ...formData, memoryKey: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl p-2.5 focus:border-emerald-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">
                  Value (e.g. 4, "Amul", "Vegetarian")
                </label>
                <input
                  type="text"
                  placeholder='e.g. 4 or "Amul"'
                  value={formData.memoryValue}
                  onChange={(e) => setFormData({ ...formData, memoryValue: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl p-2.5 focus:border-emerald-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Human Description</label>
                <textarea
                  placeholder="e.g. User shops for a family of 4 people"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className="w-full border border-gray-200 rounded-xl p-2.5 focus:border-emerald-500 outline-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm"
                >
                  Save Preference
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAiMemory;
