"use client";

import React from "react";
import { PhoneCall, HeartHandshake, Heart } from "lucide-react";

export function CrisisGuardrailBanner() {
  return (
    <div className="w-full bg-gradient-to-r from-red-50 via-rose-50 to-pink-50 border-2 border-red-500 rounded-2xl p-4 sm:p-5 shadow-md text-red-950 animate-in slide-in-from-top-3 duration-300">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
            <Heart className="w-6 h-6 animate-pulse text-rose-100" />
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-extrabold text-red-950 text-sm sm:text-base tracking-tight">
                Crisis Safety Guardrail: You Are Not Alone
              </span>
              <span className="text-[11px] font-bold text-red-800 bg-red-100/90 border border-red-300 px-2 py-0.5 rounded-full">
                24/7 Immediate Support
              </span>
            </div>
            <p className="text-xs sm:text-sm text-red-900 leading-relaxed max-w-2xl">
              If you are experiencing severe emotional distress or thoughts of self-harm, please connect with a compassionate professional right now. Your life is deeply valuable and immediate support is available.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto shrink-0 pt-1 md:pt-0">
          <a
            href="tel:03174288665"
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 min-h-[44px] rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs sm:text-sm shadow-md transition-all active:scale-95"
          >
            <HeartHandshake className="w-4 h-4 text-white shrink-0" />
            <span>Umang Crisis Line: 0317-4288665</span>
          </a>

          <a
            href="tel:1122"
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-3 min-h-[44px] rounded-xl bg-white border border-red-300 text-red-800 hover:bg-red-100 font-bold text-xs shadow-xs transition-colors"
          >
            <PhoneCall className="w-3.5 h-3.5 text-red-600 shrink-0" />
            <span>Call 1122</span>
          </a>
        </div>
      </div>
    </div>
  );
}
