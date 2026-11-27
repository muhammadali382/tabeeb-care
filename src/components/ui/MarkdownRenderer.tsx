"use client";

import React from "react";
import clsx from "clsx";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  if (!content) return null;

  const lines = content.split("\n");

  const renderFormattedText = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        const inner = part.slice(2, -2);
        const isEmergencyHighlight =
          inner.includes("1122") ||
          inner.toLowerCase().includes("emergency") ||
          inner.toLowerCase().includes("warning");

        return (
          <strong
            key={index}
            className={clsx(
              "font-bold",
              isEmergencyHighlight
                ? "text-red-700 bg-red-50 px-1 py-0.5 rounded border border-red-200/60"
                : "text-slate-900"
            )}
          >
            {inner}
          </strong>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div
      className={clsx(
        "space-y-2 text-sm leading-relaxed break-words font-sans",
        className
      )}
    >
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        if (!trimmed) {
          return <div key={idx} className="h-1.5" />;
        }

        // Headings: ###
        if (trimmed.startsWith("### ")) {
          return (
            <h4
              key={idx}
              className="text-sm font-bold text-slate-900 pt-2 pb-1 border-b border-slate-100 flex items-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-teal-600 inline-block" />
              {renderFormattedText(trimmed.replace(/^###\s+/, ""))}
            </h4>
          );
        }

        // Headings: ## or #
        if (trimmed.startsWith("## ") || trimmed.startsWith("# ")) {
          return (
            <h3
              key={idx}
              className="text-base font-extrabold text-slate-900 pt-3 pb-1 border-b border-slate-200"
            >
              {renderFormattedText(trimmed.replace(/^#+\s+/, ""))}
            </h3>
          );
        }

        // Numbered lists: 1. , 2. , etc.
        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (numMatch) {
          const num = numMatch[1];
          const text = numMatch[2];
          return (
            <div key={idx} className="flex items-start gap-2.5 py-0.5">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-teal-100 text-teal-800 text-xs font-bold shrink-0 mt-0.5">
                {num}
              </span>
              <div className="flex-1 text-slate-700">{renderFormattedText(text)}</div>
            </div>
          );
        }

        // Bullet lists: - or *
        if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          const text = trimmed.replace(/^[-*]\s+/, "");
          return (
            <div key={idx} className="flex items-start gap-2.5 py-0.5 pl-1">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-600 shrink-0 mt-2" />
              <div className="flex-1 text-slate-700">{renderFormattedText(text)}</div>
            </div>
          );
        }

        // Normal paragraph
        return (
          <p key={idx} className="text-slate-700 leading-relaxed">
            {renderFormattedText(trimmed)}
          </p>
        );
      })}
    </div>
  );
}
