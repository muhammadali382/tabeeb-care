"use client";

import React, { useState, useEffect } from "react";
import { ShieldAlert } from "lucide-react";

export function MedicalDisclaimerFooter() {
  return (
    <div className="border-t border-slate-200 bg-white mt-auto py-5 text-center">
      <div className="max-w-4xl mx-auto px-4 space-y-1.5">
        <p className="text-xs text-slate-500 leading-relaxed flex items-center justify-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span>
            TabeebCare is an educational health literacy and triage navigation tool. It does not replace professional medical advice, diagnosis, or treatment.
          </span>
        </p>
        <p className="text-[11px] text-slate-400">
          In an emergency, call 1122 immediately. Mental health crisis line: Umang (0317-4288665).
        </p>
      </div>
    </div>
  );
}

export function MedicalDisclaimerModal({ featureKey }: { featureKey: "meds" | "triage" }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const storageKey = `tabibcare_disclaimer_seen_${featureKey}`;
    const hasSeen = localStorage.getItem(storageKey);
    if (!hasSeen) {
      setIsOpen(true);
    }
  }, [featureKey]);

  const handleAcknowledge = () => {
    const storageKey = `tabibcare_disclaimer_seen_${featureKey}`;
    localStorage.setItem(storageKey, "true");
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="medical-disclaimer-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs"
    >
      <div className="bg-white rounded-2xl border border-slate-200 shadow-lg max-w-md w-full max-h-[90dvh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 id="medical-disclaimer-title" className="text-base font-bold text-slate-800">Medical Safety Disclaimer</h3>
              <p className="text-xs text-slate-500">Clinical Guidance &amp; Limitations</p>
            </div>
          </div>

          <div className="text-xs sm:text-sm text-slate-600 space-y-2.5 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <p>
              TabeebCare is an educational health literacy and triage navigation tool. It does not replace professional medical advice, diagnosis, or treatment.
            </p>
            <p className="text-xs text-slate-500">
              If you are experiencing chest pain, severe shortness of breath, unconsciousness, or a life-threatening emergency, call{" "}
              <strong className="text-red-600 font-semibold">1122</strong> or go to the nearest emergency room immediately.
            </p>
          </div>
        </div>

        <div className="p-4 sm:px-6 border-t border-slate-100 bg-white shrink-0">
          <button
            type="button"
            onClick={handleAcknowledge}
            className="w-full py-2.5 min-h-[44px] bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl text-sm shadow-xs transition-colors"
          >
            I Understand &amp; Continue
          </button>
        </div>
      </div>
    </div>
  );
}
