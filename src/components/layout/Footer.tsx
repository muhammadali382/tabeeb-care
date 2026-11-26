"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useUser } from "@/context/UserContext";
import {
  HeartPulse,
  PhoneCall,
  ShieldAlert,
  HeartHandshake,
  ExternalLink,
  Lock,
  FileCheck,
  X,
} from "lucide-react";

export function Footer() {
  const { lang, t } = useUser();
  const [activeModal, setActiveModal] = useState<"privacy" | "terms" | null>(null);

  return (
    <>
      <footer className="mt-20 border-t border-slate-200 bg-white text-slate-600">
        <div className="max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
            {/* Column 1: Brand & Purpose */}
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-600 flex items-center justify-center text-white shrink-0">
                  <HeartPulse className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-extrabold text-slate-900 text-base tracking-tight block">
                    TabeebCare (طبیب کیئر)
                  </span>
                  <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-1.5 py-0.2 rounded border border-teal-200/60 inline-block">
                    {t("footer_sdg3")}
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                {t("footer_desc")}
              </p>
            </div>

            {/* Column 2: Navigation Links */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                {t("footer_quick_links")}
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link href="/dashboard" className="hover:text-teal-700 transition-colors">
                    {t("nav_dashboard")}
                  </Link>
                </li>
                <li>
                  <Link href="/meds" className="hover:text-teal-700 transition-colors">
                    {t("nav_meds")}
                  </Link>
                </li>
                <li>
                  <Link href="/triage" className="hover:text-teal-700 transition-colors">
                    {t("nav_triage")}
                  </Link>
                </li>
                <li>
                  <Link href="/profile" className="hover:text-teal-700 transition-colors">
                    {t("nav_profile")}
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-teal-700 font-semibold text-teal-600 transition-colors">
                    {t("nav_signin")}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Emergency Hotlines */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-red-700 flex items-center gap-1.5">
                <PhoneCall className="w-3.5 h-3.5 text-red-600" />
                <span>{t("footer_emergency_title")}</span>
              </h4>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-xl bg-red-50/80 border border-red-200 text-red-900 space-y-1">
                  <div className="flex items-center justify-between font-bold text-xs">
                    <span>{t("footer_emergency_1122")}</span>
                    <a
                      href="tel:1122"
                      className="px-2 py-0.5 rounded bg-red-600 text-white font-mono text-[11px] hover:bg-red-700"
                    >
                      Dial 1122
                    </a>
                  </div>
                  <p className="text-[11px] text-red-700 leading-tight">
                    {lang === "ur" ? "پنجاب و خیبر پختونخوا ایمرجنسی ریسکیو سروس" : "National Emergency Ambulance & Rescue Services"}
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <HeartHandshake className="w-3.5 h-3.5 text-teal-600" />
                    <span>{t("footer_emergency_umang")}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    {lang === "ur" ? "پاکستان میں 24/7 ذہنی صحت اور جذباتی بحران ہیلپ لائن" : "24/7 Mental Health & Crisis Counseling"}
                  </p>
                </div>
              </div>
            </div>

            {/* Column 4: Medical Safety Notice */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                <span>{t("footer_disclaimer_title")}</span>
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed bg-amber-50/50 p-3 rounded-xl border border-amber-200/60">
                {t("footer_disclaimer_text")}
              </p>
              <div className="flex items-center gap-3 pt-1 text-xs">
                <button
                  onClick={() => setActiveModal("privacy")}
                  className="text-slate-500 hover:text-teal-700 transition-colors underline"
                >
                  {t("footer_privacy")}
                </button>
                <span className="text-slate-300">•</span>
                <button
                  onClick={() => setActiveModal("terms")}
                  className="text-slate-500 hover:text-teal-700 transition-colors underline"
                >
                  {t("footer_terms")}
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Bar: Copyright & SDG 3 Badge */}
          <div className="mt-10 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <p className="text-center sm:text-left">{t("footer_copyright")}</p>
            <div className="flex items-center gap-2 text-slate-500">
              <span className="w-2 h-2 rounded-full bg-teal-500" />
              <span>Minhaj University STCS Hackathon</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Privacy Policy Modal */}
      {activeModal === "privacy" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-xl p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-slate-900 text-base">Privacy Notice (پرائیویسی پالیسی)</h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <p>
                <strong>1. Secure Data Storage:</strong> TabeebCare protects account authentication with salted scrypt password hashing and signed HttpOnly session cookies, storing patient health profiles and consultation history in SQLite / Turso libSQL. No advertising trackers or third-party data brokers are used.
              </p>
              <p>
                <strong>2. AI Inference Processing:</strong> Prescription queries, voice audio, and symptom descriptions are sent to Groq Cloud API strictly to generate educational health guidance and are not sold or used for advertising.
              </p>
              <p>
                <strong>3. Full Patient Control:</strong> You can reset or update your recorded chronic conditions and allergies at any time from your Health Profile settings.
              </p>
            </div>
            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-xl text-xs transition-colors"
            >
              Close (بند کریں)
            </button>
          </div>
        </div>
      )}

      {/* Terms of Use Modal */}
      {activeModal === "terms" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-xl p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-slate-900 text-base">Terms of Service (شرائط و ضوابط)</h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <p>
                <strong>1. Educational Use Only:</strong> TabeebCare is created as an SDG 3 health literacy and outpatient communication tool. It is not an automated doctor, diagnostic medical device, or licensed pharmacy.
              </p>
              <p>
                <strong>2. Clinical Verification:</strong> Any dosage schedule, food precaution, or drug interaction flagged by TabeebCare must be confirmed with your licensed physician or dispensing pharmacist.
              </p>
              <p>
                <strong>3. Emergency Circumstances:</strong> If you experience severe chest pain, stroke symptoms, uncontrolled bleeding, or acute trauma, you agree to immediately call emergency medical services (1122 in Pakistan) rather than relying on automated software.
              </p>
            </div>
            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-xl text-xs transition-colors"
            >
              Close (بند کریں)
            </button>
          </div>
        </div>
      )}
    </>
  );
}
