import React from "react";
import { Bot, User, Sparkles } from "lucide-react";

const ChatMessage = ({ message, isAi, timestamp }) => {
  return (
    <div
      className={`flex items-start gap-3 my-3.5 transition-all duration-200 ${
        isAi ? "flex-row" : "flex-row-reverse"
      }`}
    >
      {/* Avatar */}
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${
          isAi
            ? "bg-gradient-to-tr from-emerald-600 to-teal-500 text-white"
            : "bg-gradient-to-tr from-gray-700 to-gray-900 text-white"
        }`}
      >
        {isAi ? <Bot className="w-5 h-5" /> : <User className="w-4 h-4" />}
      </div>

      {/* Bubble */}
      <div
        className={`max-w-[82%] sm:max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${
          isAi
            ? "bg-white border border-gray-150 text-gray-800 rounded-tl-sm shadow-emerald-900/5"
            : "bg-emerald-600 text-white rounded-tr-sm"
        }`}
      >
        {isAi && (
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 mb-1">
            <Sparkles className="w-3 h-3" />
            <span>ShopPilot Intelligence</span>
          </div>
        )}
        <div className="text-sm whitespace-pre-wrap leading-relaxed">
          {message}
        </div>
        {timestamp && (
          <div
            className={`text-[10px] mt-1.5 ${
              isAi ? "text-gray-400" : "text-emerald-100"
            }`}
          >
            {timestamp}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;

