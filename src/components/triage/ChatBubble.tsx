"use client";

import React from "react";
import { User as UserIcon, Bot, HelpCircle } from "lucide-react";
import { TriageBadge, TriageLevel } from "./TriageBadge";
import { MarkdownRenderer } from "../ui/MarkdownRenderer";
import { AudioReadoutButton } from "../ui/AudioReadoutButton";
import clsx from "clsx";

interface ChatBubbleProps {
  role: "user" | "assistant" | "system";
  content: string;
  onOpenExplain?: () => void;
}

export function ChatBubble({
  role,
  content,
  onOpenExplain,
}: ChatBubbleProps) {
  const isUser = role === "user";

  let triageLevel: TriageLevel | null = null;
  let cleanContent = content || "";

  const match = cleanContent.match(/^TRIAGE_LEVEL:\s*(\w+)/i);
  if (match) {
    const rawLevel = match[1].toLowerCase();
    if (["emergency", "urgent", "routine", "home"].includes(rawLevel)) {
      triageLevel = rawLevel as TriageLevel;
      cleanContent = cleanContent.replace(/^TRIAGE_LEVEL:\s*\w+\s*/i, "").trim();
    }
  }

  if (!cleanContent.trim() && !triageLevel && !isUser) {
    return (
      <div className="flex gap-2.5 sm:gap-3 items-center py-1.5 animate-in fade-in duration-200">
        <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-xs">
          <Bot className="w-4 h-4" />
        </div>
        <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs text-slate-600 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
          <span>TabeebCare AI is preparing assessment...</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={clsx(
        "flex gap-3 w-full transition-all",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={clsx(
          "flex gap-2.5 sm:gap-3 max-w-[95%] sm:max-w-[85%]",
          isUser ? "flex-row-reverse" : "flex-row"
        )}
      >
        <div
          className={clsx(
            "w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold shadow-xs mt-0.5",
            isUser
              ? "bg-teal-100 text-teal-800 border border-teal-200"
              : "bg-teal-600 text-white shadow-teal-700/20"
          )}
        >
          {isUser ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
        </div>

        <div className="flex flex-col space-y-1.5 flex-1 min-w-0">
          {triageLevel && !isUser && (
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <TriageBadge level={triageLevel} />
              {onOpenExplain && (
                <button
                  type="button"
                  onClick={onOpenExplain}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200/80 px-2.5 py-1 min-h-[32px] rounded-lg transition-colors shadow-2xs"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-teal-600" />
                  <span>Why this level?</span>
                </button>
              )}
            </div>
          )}

          <div
            className={clsx(
              "p-3.5 sm:p-4 rounded-2xl text-sm leading-relaxed shadow-xs transition-colors min-w-0",
              isUser
                ? "bg-teal-600 text-white rounded-tr-xs"
                : "bg-white text-slate-800 border border-slate-200 rounded-tl-xs"
            )}
          >
            {isUser ? (
              <p className="whitespace-pre-wrap break-words">{cleanContent}</p>
            ) : cleanContent.trim() ? (
              <>
                <MarkdownRenderer content={cleanContent} />
                <div className="pt-2.5 mt-2 border-t border-slate-100 flex items-center justify-between">
                  <AudioReadoutButton text={content} />
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 text-xs text-slate-400 py-1">
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping" />
                <span>TabeebCare AI is analyzing symptoms...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
