"use client";

import React, { useState, useEffect } from "react";
import { Volume2, VolumeX } from "lucide-react";
import clsx from "clsx";

interface AudioReadoutButtonProps {
  text: string;
  className?: string;
}

export function AudioReadoutButton({ text, className }: AudioReadoutButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      setIsSupported(true);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const cleanTextForSpeech = (raw: string): string => {
    return raw
      .replace(/^TRIAGE_LEVEL:\s*\w+\s*/i, "")
      .replace(/###\s*/g, "")
      .replace(/##\s*/g, "")
      .replace(/#\s*/g, "")
      .replace(/\*\*/g, "")
      .replace(/\*/g, "")
      .replace(/[-_]/g, " ")
      .trim();
  };

  const handleTogglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isSupported) return;

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    const cleaned = cleanTextForSpeech(text);
    if (!cleaned) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(cleaned);
    const voices = window.speechSynthesis.getVoices();
    const enVoice = voices.find(
      (v) => v.lang.startsWith("en-") || v.lang === "en"
    );
    if (enVoice) {
      utterance.voice = enVoice;
    }
    utterance.lang = "en-US";
    utterance.rate = 0.95;

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
  };

  if (!isSupported || !text.trim()) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={handleTogglePlay}
      title={isPlaying ? "Stop Audio Readout" : "Listen to Audio Readout"}
      aria-label={isPlaying ? "Stop Audio Readout" : "Listen to advice"}
      className={clsx(
        "inline-flex items-center gap-1.5 px-2.5 py-1.5 min-h-[36px] rounded-lg text-xs font-semibold transition-colors shadow-2xs",
        isPlaying
          ? "bg-teal-600 text-white animate-pulse"
          : "bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200/80",
        className
      )}
    >
      {isPlaying ? (
        <>
          <VolumeX className="w-3.5 h-3.5 shrink-0" />
          <span>Stop Audio</span>
        </>
      ) : (
        <>
          <Volume2 className="w-3.5 h-3.5 shrink-0 text-teal-600" />
          <span>Listen</span>
        </>
      )}
    </button>
  );
}
