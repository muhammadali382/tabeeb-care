import React from "react";
import { HeartPulse } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-[55dvh] flex flex-col items-center justify-center p-4">
      <div className="relative flex items-center justify-center mb-3">
        <div className="absolute w-14 h-14 rounded-2xl bg-teal-500/15 animate-ping duration-1000" />
        <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center shadow-xs relative z-10">
          <HeartPulse className="w-6 h-6 animate-pulse text-teal-600" />
        </div>
      </div>
      <div className="text-center space-y-1">
        <span className="text-xs font-bold text-slate-700 tracking-wide block">
          Loading TabeebCare...
        </span>
      </div>
    </div>
  );
}
