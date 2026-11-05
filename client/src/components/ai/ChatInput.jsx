import React, { useState } from "react";
import { Send, Sparkles, Loader2 } from "lucide-react";

const SUGGESTIONS = [
  "Groceries for family of 4 for 7 days within ₹3,000",
  "I have ₹1,500 for vegetables, dairy and grains",
  "Vegetarian weekly grocery plan for 2 people",
  "Healthy breakfast and dinner essentials for 3 days",
];

const ChatInput = ({ onSend, loading }) => {
  const [text, setText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim() || loading) return;
    onSend(text.trim());
    setText("");
  };

  const handleSuggestionClick = (suggestion) => {
    if (loading) return;
    onSend(suggestion);
  };

  return (
    <div className="w-full bg-white border-t border-gray-200 p-3 sm:p-4 rounded-b-2xl">
      {/* Suggestion Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2.5 mb-2 scrollbar-thin">
        <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 uppercase tracking-wider flex-shrink-0">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Try:</span>
        </div>
        {SUGGESTIONS.map((s, idx) => (
          <button
            key={idx}
            type="button"
            disabled={loading}
            onClick={() => handleSuggestionClick(s)}
            className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors duration-150 disabled:opacity-50"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="e.g. I need groceries for 4 people for a week within ₹3,000..."
          disabled={loading}
          className="flex-1 bg-gray-50 border border-gray-200 focus:border-emerald-500 focus:bg-white rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none transition-all duration-200"
        />
        <button
          type="submit"
          disabled={!text.trim() || loading}
          className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white rounded-xl px-4 py-3 font-medium transition-colors duration-200 flex items-center justify-center shadow-sm"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </form>
    </div>
  );
};

export default ChatInput;

