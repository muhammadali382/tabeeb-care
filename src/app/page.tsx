"use client";

import React from "react";
import Link from "next/link";
import { useUser } from "@/context/UserContext";
import {
  Pill,
  MessageSquareHeart,
  FileText,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Activity,
  PhoneCall,
  FlaskConical,
  BookOpen,
  Lock,
} from "lucide-react";

export default function HomePage() {
  const { user } = useUser();

  const modules = [
    {
      title: "Medicine Demystifier & OCR",
      desc: "Type, dictate, or photograph a printed prescription to generate a clear 24-hour dosing schedule (Morning, Afternoon, Evening, Night), meal instructions, and automated drug allergy alerts.",
      href: "/meds",
      icon: Pill,
      accent: "bg-teal-50 text-teal-700 border-teal-200",
      badge: "Allergy Sentinel",
    },
    {
      title: "Clinical Symptom Triage",
      desc: "Real-time AI symptom evaluation grounded in 15 WHO-inspired primary care protocols. Classifies urgency into Emergency, Urgent, Routine, or Home Care with transparent reasoning.",
      href: "/triage",
      icon: MessageSquareHeart,
      accent: "bg-sky-50 text-sky-700 border-sky-200",
      badge: "RAG Grounded",
    },
    {
      title: "Lab Scanner & SBAR Handover",
      desc: "Upload lab report photos (CBC, HbA1c, Lipids) for marker breakdowns, complete a 5-question guided intake, and export a structured SBAR summary for your doctor.",
      href: "/triage",
      icon: FlaskConical,
      accent: "bg-emerald-50 text-emerald-700 border-emerald-200",
      badge: "Doctor Ready",
    },
  ];

  const steps = [
    {
      num: "01",
      title: "Build Your Health Profile",
      desc: "Record chronic conditions, known drug allergies, and active prescriptions once in your encrypted patient profile.",
    },
    {
      num: "02",
      title: "Check Meds or Assess Symptoms",
      desc: "Scan prescriptions, upload lab reports, or describe symptoms via text or voice to receive protocol-grounded guidance.",
    },
    {
      num: "03",
      title: "Bring Your SBAR Summary",
      desc: "Review your consultation history anytime or export a concise 1-page SBAR clinical handover for your physician.",
    },
  ];

  return (
    <div className="space-y-14 sm:space-y-20 py-2 sm:py-6">
      {/* Hero Section */}
      <section className="text-center space-y-6 sm:space-y-8 max-w-5xl mx-auto pt-2 sm:pt-6 px-1">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200/90 text-teal-800 text-xs sm:text-sm font-semibold shadow-2xs">
          <Sparkles className="w-4 h-4 text-teal-600 shrink-0" />
          <span>UN SDG 3 • AI Health Literacy &amp; Clinical Navigation</span>
        </div>

        <div className="space-y-4">
          <h1
            className="font-extrabold text-slate-900 tracking-tight leading-[1.15]"
            style={{ fontSize: "clamp(1.875rem, 4.5vw, 3.75rem)" }}
          >
            Clear Prescriptions.{" "}
            <span className="text-teal-600">Safer Triage Decisions.</span>
          </h1>
          <p className="text-sm sm:text-lg lg:text-xl text-slate-600 font-normal leading-relaxed max-w-3xl mx-auto">
            TabeebCare helps patients understand complex prescriptions, check for dangerous drug allergies, evaluate symptom urgency using WHO-inspired protocols, and prepare structured SBAR doctor handovers.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col xs:flex-row flex-wrap items-stretch xs:items-center justify-center gap-3 pt-1">
          {user ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 min-h-[48px] rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm sm:text-base shadow-sm hover:shadow transition-all"
            >
              <span>Go to Patient Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 min-h-[48px] rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm sm:text-base shadow-sm hover:shadow transition-all active:scale-95"
              >
                <span>Create Free Account</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 min-h-[48px] rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold text-sm sm:text-base shadow-2xs transition-colors"
              >
                <span>Sign In</span>
              </Link>
            </>
          )}
        </div>

        {/* Value Trust Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 text-xs sm:text-sm font-medium text-slate-600 border-t border-slate-200/70 max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-2 p-1.5">
            <Lock className="w-4 h-4 text-teal-600 shrink-0" />
            <span>Encrypted Sessions &amp; Private Records</span>
          </div>
          <div className="flex items-center justify-center gap-2 p-1.5">
            <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
            <span>15 WHO-Inspired Triage Protocols</span>
          </div>
          <div className="flex items-center justify-center gap-2 p-1.5">
            <Activity className="w-4 h-4 text-teal-600 shrink-0" />
            <span>Real-Time Streaming &amp; Local OCR</span>
          </div>
        </div>
      </section>

      {/* Core Product Modules Grid */}
      <section className="space-y-6">
        <div className="text-center space-y-1.5 max-w-2xl mx-auto">
          <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Built for Real Patients &amp; Caregivers
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Every tool connects directly to your health profile for personalized safety cross-checking.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          {modules.map((mod, idx) => {
            const Icon = mod.icon;
            return (
              <Link
                key={idx}
                href={user ? mod.href : "/signup"}
                className="group flex flex-col justify-between p-5 sm:p-6 bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-teal-300 transition-all duration-200"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <div
                      className={`w-11 h-11 rounded-xl border flex items-center justify-center shadow-2xs shrink-0 ${mod.accent}`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200/80">
                      {mod.badge}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                      {mod.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {mod.desc}
                    </p>
                  </div>
                </div>
                <div className="pt-5 flex items-center gap-1.5 text-xs sm:text-sm font-bold text-teal-600 group-hover:gap-2.5 transition-all">
                  <span>{user ? "Open Module" : "Get Started"}</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-8 lg:p-10 shadow-xs space-y-6 sm:space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              How TabeebCare Works
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              From raw prescription or symptom to a clear, doctor-ready action plan in minutes.
            </p>
          </div>
          <Link
            href="/protocols"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-teal-700 hover:text-teal-800"
          >
            <BookOpen className="w-4 h-4" />
            <span>Explore Clinical Protocols</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step) => (
            <div key={step.num} className="space-y-2.5 p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80">
              <span className="inline-block text-xs font-extrabold text-teal-700 bg-teal-100/80 px-2.5 py-1 rounded-lg">
                STEP {step.num}
              </span>
              <h3 className="text-base font-bold text-slate-900">{step.title}</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Clinical Safety & Emergency Escalation Banner */}
      <section className="bg-gradient-to-br from-teal-50/80 via-white to-slate-50 border border-teal-200/80 rounded-3xl p-5 sm:p-8 lg:p-10 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-2.5 max-w-2xl">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-teal-800 bg-teal-100/70 px-3 py-1 rounded-full border border-teal-200">
            <FileText className="w-3.5 h-3.5 text-teal-700" />
            <span>Safety-First Clinical Architecture</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Built-In Guardrails for Emergencies &amp; Drug Conflicts
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Pre-inference safety checks immediately escalate cardiac, stroke, respiratory, or emotional crisis signals with direct one-tap links to Rescue 1122, nearest emergency hospitals, and the Umang Crisis Helpline (0317-4288665).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0 w-full lg:w-auto">
          <a
            href="tel:1122"
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 min-h-[44px] rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-colors"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Emergency: Call 1122</span>
          </a>
          <Link
            href={user ? "/triage" : "/signup"}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 min-h-[44px] rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-colors"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{user ? "Start Assessment" : "Create Account"}</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
