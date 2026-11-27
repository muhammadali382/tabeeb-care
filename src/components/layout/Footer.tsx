"use client";

import React from "react";
import Link from "next/link";
import {
  HeartPulse,
  PhoneCall,
  ShieldAlert,
  HeartHandshake,
  Lock,
  FileCheck,
} from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-14 sm:mt-20 border-t border-slate-200 bg-white text-slate-600 no-print">
      <div className="w-full max-w-[1440px] 2xl:max-w-[1680px] mx-auto px-3 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          {/* Column 1: Brand & Purpose */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center text-white shrink-0">
                <HeartPulse className="w-4 h-4" />
              </div>
              <div>
                <span className="font-extrabold text-slate-900 text-base tracking-tight block">
                  TabeebCare
                </span>
                <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200/60 inline-block">
                  UN SDG 3 • Accessible Healthcare
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              An AI-powered health literacy, medication safety, and clinical symptom triage platform built to help patients navigate prescriptions and primary care with clarity.
            </p>
          </div>

          {/* Column 2: Product Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Platform
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/dashboard" className="hover:text-teal-700 transition-colors inline-block py-0.5">
                  Patient Dashboard
                </Link>
              </li>
              <li>
                <Link href="/triage" className="hover:text-teal-700 transition-colors inline-block py-0.5">
                  Symptom Triage &amp; SBAR
                </Link>
              </li>
              <li>
                <Link href="/meds" className="hover:text-teal-700 transition-colors inline-block py-0.5">
                  Medicine Demystifier &amp; OCR
                </Link>
              </li>
              <li>
                <Link href="/history" className="hover:text-teal-700 transition-colors inline-block py-0.5">
                  Consultation &amp; Med History
                </Link>
              </li>
              <li>
                <Link href="/protocols" className="hover:text-teal-700 transition-colors inline-block py-0.5">
                  Clinical Triage Protocols
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Emergency Hotlines */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-red-700 flex items-center gap-1.5">
              <PhoneCall className="w-3.5 h-3.5 text-red-600" />
              <span>Emergency Helplines</span>
            </h4>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-red-50/80 border border-red-200 text-red-900 space-y-1">
                <div className="flex items-center justify-between gap-2 font-bold text-xs">
                  <span>Rescue Emergency</span>
                  <a
                    href="tel:1122"
                    className="px-2.5 py-1 rounded bg-red-600 text-white font-mono text-[11px] hover:bg-red-700 transition-colors shrink-0"
                  >
                    Dial 1122
                  </a>
                </div>
                <p className="text-[11px] text-red-700 leading-tight">
                  Immediate emergency ambulance &amp; trauma response
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 space-y-1">
                <div className="flex items-center justify-between gap-2 font-bold text-xs">
                  <span className="flex items-center gap-1">
                    <HeartHandshake className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                    Umang Crisis Line
                  </span>
                  <a
                    href="tel:03174288665"
                    className="px-2 py-1 rounded bg-amber-600 text-white font-mono text-[11px] hover:bg-amber-700 transition-colors shrink-0"
                  >
                    0317-4288665
                  </a>
                </div>
                <p className="text-[11px] text-amber-800 leading-tight">
                  24/7 confidential mental health &amp; crisis support
                </p>
              </div>
            </div>
          </div>

          {/* Column 4: Legal & Medical Safety */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Trust &amp; Legal
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href="/privacy"
                  className="flex items-center gap-1.5 hover:text-teal-700 transition-colors py-0.5"
                >
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Privacy Policy</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="flex items-center gap-1.5 hover:text-teal-700 transition-colors py-0.5"
                >
                  <FileCheck className="w-3.5 h-3.5 text-slate-400" />
                  <span>Terms &amp; Conditions</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/profile"
                  className="flex items-center gap-1.5 hover:text-teal-700 transition-colors py-0.5"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
                  <span>Account &amp; Allergy Settings</span>
                </Link>
              </li>
            </ul>
            <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
              Educational triage navigation only. Always consult a qualified physician for medical decisions.
            </p>
          </div>
        </div>

        {/* Bottom Copyright & Disclaimer Strip */}
        <div className="mt-10 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <p className="text-center sm:text-left">
            &copy; {new Date().getFullYear()} TabeebCare. All rights reserved.
          </p>
          <p className="text-center sm:text-right text-[11px]">
            Built with Next.js, Groq Cloud &amp; Turso libSQL • UN SDG 3
          </p>
        </div>
      </div>
    </footer>
  );
}
