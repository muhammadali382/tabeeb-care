"use client";

import React from "react";
import { PhoneCall, AlertOctagon, HeartHandshake, MapPin } from "lucide-react";

interface EmergencyBannerProps {
  level?: "emergency" | "urgent" | "routine" | "home" | string | null;
  isMentalHealth?: boolean;
}

export function EmergencyBanner({
  level = "emergency",
  isMentalHealth = false,
}: EmergencyBannerProps) {
  const normalizedLevel = (level || "").toLowerCase();
  if (normalizedLevel !== "emergency" && normalizedLevel !== "urgent") {
    return null;
  }

  const isUrgentOnly = normalizedLevel === "urgent";

  return (
    <div
      className={
        isUrgentOnly
          ? "w-full bg-amber-50 border-2 border-amber-500 rounded-2xl p-4 sm:p-5 shadow-sm text-amber-950 animate-in slide-in-from-top-2 duration-300"
          : "w-full bg-red-50 border-2 border-red-500 rounded-2xl p-4 sm:p-5 shadow-sm text-red-900 animate-in slide-in-from-top-2 duration-300"
      }
    >
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div
            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5 ${
              isUrgentOnly ? "bg-amber-600" : "bg-red-600"
            }`}
          >
            <AlertOctagon className="w-6 h-6 animate-pulse" />
          </div>
          <div className="space-y-1">
            <h4
              className={`text-sm sm:text-base font-extrabold flex flex-wrap items-center gap-2 ${
                isUrgentOnly ? "text-amber-950" : "text-red-900"
              }`}
            >
              <span>
                {isUrgentOnly
                  ? "Urgent Medical Care Required"
                  : "Medical Emergency Detected — Call 1122 Immediately"}
              </span>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                  isUrgentOnly
                    ? "text-amber-800 bg-amber-100 border-amber-300"
                    : "text-red-700 bg-red-100/90 border-red-200"
                }`}
              >
                Prompt Evaluation
              </span>
            </h4>
            <p
              className={`text-xs sm:text-sm leading-relaxed max-w-3xl ${
                isUrgentOnly ? "text-amber-900" : "text-red-800"
              }`}
            >
              {isUrgentOnly
                ? "These symptoms require prompt clinical attention. Please visit an urgent care clinic or emergency facility without unnecessary delay."
                : "Your symptoms indicate a potentially life-threatening condition. Do not wait—seek immediate emergency medical services."}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto shrink-0 pt-1 md:pt-0">
          <a
            href="tel:1122"
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 min-h-[44px] rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs sm:text-sm shadow-md active:bg-red-800 transition-all"
          >
            <PhoneCall className="w-4 h-4 animate-bounce" />
            <span>Call 1122</span>
          </a>

          <a
            href="https://www.google.com/maps/search/emergency+hospital+near+me"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 min-h-[44px] rounded-xl bg-white border border-red-300 text-red-700 hover:bg-red-100/60 font-bold text-xs shadow-xs transition-colors"
          >
            <MapPin className="w-3.5 h-3.5 text-red-600 shrink-0" />
            <span>Nearest Emergency Hospital</span>
          </a>

          {isMentalHealth && (
            <>
              <a
                href="tel:03174288665"
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 min-h-[44px] rounded-xl bg-white border border-red-300 text-red-900 hover:bg-rose-50 font-bold text-xs shadow-xs transition-colors"
              >
                <HeartHandshake className="w-3.5 h-3.5 text-red-600 shrink-0" />
                <span>Umang Helpline: 0317-4288665</span>
              </a>
              <a
                href="https://www.google.com/maps/search/psychiatrist+near+me"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 min-h-[44px] rounded-xl bg-white border border-red-300 text-red-700 hover:bg-red-50 font-semibold text-xs shadow-xs transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 text-red-600 shrink-0" />
                <span>Find Psychiatrist</span>
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
