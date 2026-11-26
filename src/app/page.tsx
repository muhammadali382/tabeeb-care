"use client";

import React from "react";
import Link from "next/link";
import { useUser } from "@/context/UserContext";
import {
  Pill,
  MessageSquareHeart,
  FileText,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  HeartPulse,
  Activity,
  AlertTriangle,
  Clock,
  Users,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";

export default function HomePage() {
  const { user, lang, t } = useUser();
  const isUrdu = lang === "ur";

  const coreModules = [
    {
      title: t("module_meds_title"),
      desc: t("module_meds_desc"),
      icon: Pill,
      href: "/meds",
      badge: isUrdu ? "24 گھنٹے شیڈول" : "24-Hr Routine",
      features: [
        isUrdu ? "الرجی کا فوری خطرہ چیک" : "Automatic Allergy Conflict Alert",
        isUrdu ? "کھانے کے ساتھ اردو ہدایات" : "Urdu + English Food Instructions",
        isUrdu ? "صبح، دوپہر، شام، رات کے اوقات" : "Morning/Noon/Night Visual Timing",
      ],
      color: "teal",
    },
    {
      title: t("module_triage_title"),
      desc: t("module_triage_desc"),
      icon: MessageSquareHeart,
      href: "/triage",
      badge: isUrdu ? "ڈبلیو ایچ او پروٹوکول" : "WHO Triage RAG",
      features: [
        isUrdu ? "4 سطحی خطرے کا فوری تعین" : "4-Level Urgency Classification",
        isUrdu ? "1122 ایمرجنسی براہ راست رابطہ" : "Direct 1122 Emergency Escalation",
        isUrdu ? "اردو اور انگریزی قدرتی گفتگو" : "Bilingual Conversational Intake",
      ],
      color: "emerald",
    },
    {
      title: t("module_sbar_title"),
      desc: t("module_sbar_desc"),
      icon: FileText,
      href: "/triage",
      badge: isUrdu ? "1-کلک پرنٹ خلاصہ" : "1-Click PDF Ready",
      features: [
        isUrdu ? "مریض کی صورتحال اور پس منظر" : "Situation & Background Profiling",
        isUrdu ? "ڈاکٹر کے معائنے کے لیے رہنما کارڈ" : "Physician-Ready Clinical Summary",
        isUrdu ? "پرنٹ ایبل فارمیٹ" : "Instant Print & Export",
      ],
      color: "sky",
    },
  ];

  return (
    <div className="space-y-16 sm:space-y-24 py-4 sm:py-6">
      {/* Hero Section */}
      <section className="text-center space-y-6 sm:space-y-8 max-w-6xl mx-auto pt-4 sm:pt-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200/90 text-teal-800 text-xs sm:text-sm font-semibold shadow-2xs">
          <Sparkles className="w-4 h-4 text-teal-600 shrink-0" />
          <span>{t("hero_badge")}</span>
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
            {t("hero_title")}
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-slate-600 font-normal leading-relaxed max-w-3xl mx-auto">
            {t("hero_subtitle")}
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
          {user ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm sm:text-base shadow-sm hover:shadow transition-all"
            >
              <span>{t("hero_cta_dashboard")}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm sm:text-base shadow-sm hover:shadow transition-all active:scale-95"
              >
                <span>{t("hero_cta_signup")}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold text-sm sm:text-base shadow-2xs transition-colors"
              >
                <span>{t("nav_signin")}</span>
              </Link>
            </>
          )}
        </div>

        {/* Value Trust Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 text-xs sm:text-sm font-medium text-slate-600 border-t border-slate-200/70 max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-2 p-2">
            <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
            <span>{t("hero_trust_offline")}</span>
          </div>
          <div className="flex items-center justify-center gap-2 p-2">
            <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
            <span>{t("hero_trust_who")}</span>
          </div>
          <div className="flex items-center justify-center gap-2 p-2">
            <Activity className="w-4 h-4 text-teal-600 shrink-0" />
            <span>{t("hero_trust_fast")}</span>
          </div>
        </div>
      </section>

      {/* 3 Core Interactive Modules Grid */}
      <section className="space-y-6">
        <div className="text-center space-y-1.5 max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {t("modules_title")}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            {t("modules_subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {coreModules.map((mod, idx) => {
            const Icon = mod.icon;
            return (
              <Card
                key={idx}
                className="hover:border-teal-300 hover:shadow-lg transition-all flex flex-col justify-between group rounded-2xl"
              >
                <CardContent className="p-6 sm:p-7 space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold text-teal-800 bg-teal-50/90 border border-teal-200/80 px-2.5 py-1 rounded-full">
                      {mod.badge}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                      {mod.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {mod.desc}
                    </p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    {mod.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-center gap-2 text-xs text-slate-600">
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4">
                    <Link
                      href={mod.href}
                      className="inline-flex items-center gap-2 text-xs font-bold text-teal-700 group-hover:text-teal-800 group-hover:gap-2.5 transition-all"
                    >
                      <span>{t("btn_open")}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* How TabeebCare Works: 3-Step Journey */}
      <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xs space-y-8">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="text-xs font-extrabold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200/60">
            {isUrdu ? "مریض کا آسان سفر" : "Simple 3-Step Journey"}
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            {isUrdu ? "طبیب کیئر کیسے کام کرتا ہے؟" : "How TabeebCare Bridges Healthcare"}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-teal-600 text-white font-extrabold text-sm shadow-2xs">
              1
            </span>
            <h4 className="text-base font-bold text-slate-900">
              {isUrdu ? "نسخہ یا علامات درج کریں" : "Input Symptoms or Prescription"}
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              {isUrdu
                ? "مریض اردو، انگریزی یا رومن اردو میں اپنی علامات بتائے یا ہاتھ سے لکھا نسخہ درج کرے۔"
                : "Type handwritten medicine names or converse naturally in Urdu, English, or Roman Urdu."}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-teal-600 text-white font-extrabold text-sm shadow-2xs">
              2
            </span>
            <h4 className="text-base font-bold text-slate-900">
              {isUrdu ? "ڈبلیو ایچ او پروٹوکول پر AI جائزہ" : "WHO Protocol Clinical Evaluation"}
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              {isUrdu
                ? "سسٹم مریض کی الرجی اور بیماریوں کو مدنظر رکھ کر خطرے اور پرہیز کا درست تجزیہ کرتا ہے۔"
                : "RAG retrieves matched clinical protocols, cross-checks allergies, and classifies triage urgency in under 1 second."}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-teal-600 text-white font-extrabold text-sm shadow-2xs">
              3
            </span>
            <h4 className="text-base font-bold text-slate-900">
              {isUrdu ? "ڈاکٹر کے لیے ہینڈ اوور کارڈ" : "1-Click Doctor Handover"}
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              {isUrdu
                ? "ڈاکٹر کے معائنے سے پہلے مکمل کلینیکل سمری تیار کریں تاکہ وقت کی بچت اور علاج مؤثر ہو۔"
                : "Export or print an SBAR clinical card so consulting doctors immediately understand your situation and history."}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
