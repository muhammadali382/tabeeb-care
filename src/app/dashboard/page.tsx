"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Pill,
  MessageSquareHeart,
  UserCheck,
  ShieldAlert,
  ArrowRight,
  HeartPulse,
  Activity,
  AlertTriangle,
  FileText,
  PhoneCall,
  Clock,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { user, profile, isLoading, lang, t } = useUser();
  const isUrdu = lang === "ur";

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-slate-400 text-sm">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin" />
          <span>{isUrdu ? "ڈیش بورڈ لوڈ ہو رہا ہے..." : "Loading patient dashboard..."}</span>
        </div>
      </div>
    );
  }

  const conditions = profile?.conditions || [];
  const allergies = profile?.allergies || [];
  const medications = profile?.current_medications || [];

  return (
    <div className="space-y-8 py-2">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-teal-50 via-teal-50/50 to-emerald-50/70 border border-teal-200 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {t("dash_greeting")}, {user.name} 👋
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl">
            {t("dash_subtitle")}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link href="/triage">
            <Button variant="primary" size="lg" className="gap-2 shadow-sm font-bold">
              <MessageSquareHeart className="w-4 h-4" />
              <span>{t("dash_triage_btn")}</span>
            </Button>
          </Link>
          <Link href="/meds">
            <Button variant="outline" size="lg" className="gap-2 font-bold">
              <Pill className="w-4 h-4 text-teal-600" />
              <span>{t("nav_meds")}</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Patient Health Vitals Summary Card */}
      <Card className="rounded-2xl border-slate-200 shadow-xs overflow-hidden">
        <CardHeader className="bg-slate-50/70 p-5 sm:p-6 flex flex-row items-center justify-between border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-base sm:text-lg font-bold text-slate-900">
                {t("dash_vitals_title")}
              </CardTitle>
              <p className="text-xs text-slate-500">
                {isUrdu ? "طبیب کیئر کلاؤڈ میں محفوظ شدہ کوائف" : "Synced securely with TabeebCare Cloud DB"}
              </p>
            </div>
          </div>
          <Link href="/profile">
            <Button variant="outline" size="sm" className="text-xs gap-1">
              <span>{t("dash_edit_profile")}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </CardHeader>

        <CardContent className="p-5 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Demographics */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                {t("dash_age")} / {t("dash_gender")}
              </span>
              <strong className="text-base text-slate-900 block">
                {profile?.age ? `${profile.age} ${isUrdu ? "سال" : "yrs"}` : "N/A"} • {profile?.gender || "Male"}
              </strong>
              <span className="text-[11px] text-slate-500">
                {isUrdu ? "مریض کی بنیادی معلومات" : "Primary Demographics"}
              </span>
            </div>

            {/* Chronic Conditions */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                {t("dash_conditions")}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {conditions.length > 0 ? (
                  conditions.map((c, i) => (
                    <Badge key={i} variant="primary" size="sm">
                      {c}
                    </Badge>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 italic">{t("dash_none_reported")}</span>
                )}
              </div>
            </div>

            {/* Allergies */}
            <div className="p-4 rounded-xl bg-red-50/40 border border-red-200 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-red-600 block">
                {t("dash_allergies")}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {allergies.length > 0 ? (
                  allergies.map((a, i) => (
                    <Badge key={i} variant="emergency" size="sm">
                      {a}
                    </Badge>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 italic">{t("dash_none_reported")}</span>
                )}
              </div>
            </div>

            {/* Current Medications */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                {t("dash_meds")}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {medications.length > 0 ? (
                  medications.map((m, i) => (
                    <Badge key={i} variant="info" size="sm">
                      {m}
                    </Badge>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 italic">{t("dash_none_reported")}</span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3 Quick Action Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Module 1 */}
        <Link href="/meds" className="group">
          <Card className="h-full border-slate-200 group-hover:border-teal-300 group-hover:shadow-md transition-all rounded-2xl flex flex-col justify-between">
            <CardContent className="p-6 space-y-4">
              <div className="w-11 h-11 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Pill className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                  {t("meds_title")}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {isUrdu
                    ? "نسخہ ڈیکوڈر، 24 گھنٹے شیڈول اور الرجی خطرے کی نشاندہی"
                    : "Prescription schedule, food precautions, and automated allergy checks."}
                </p>
              </div>
              <div className="pt-2 flex items-center text-xs font-bold text-teal-600 group-hover:gap-2 transition-all">
                <span>{t("btn_open")}</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Module 2 */}
        <Link href="/triage" className="group">
          <Card className="h-full border-slate-200 group-hover:border-amber-300 group-hover:shadow-md transition-all rounded-2xl flex flex-col justify-between">
            <CardContent className="p-6 space-y-4">
              <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <MessageSquareHeart className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                  {t("triage_title")}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {isUrdu
                    ? "ڈبلیو ایچ او کلینیکل پروٹوکول پر مبنی علامات کا فوری جائزہ"
                    : "WHO-grounded clinical intake chat with instant urgency evaluation."}
                </p>
              </div>
              <div className="pt-2 flex items-center text-xs font-bold text-amber-700 group-hover:gap-2 transition-all">
                <span>{t("btn_open")}</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Module 3 */}
        <Link href="/profile" className="group">
          <Card className="h-full border-slate-200 group-hover:border-sky-300 group-hover:shadow-md transition-all rounded-2xl flex flex-col justify-between">
            <CardContent className="p-6 space-y-4">
              <div className="w-11 h-11 rounded-xl bg-sky-50 border border-sky-200 text-sky-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <UserCheck className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 group-hover:text-sky-700 transition-colors">
                  {t("profile_title")}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {isUrdu
                    ? "اپنی دائمی بیماریوں، دواؤں اور الرجیوں کی فہرست سنبھالیں"
                    : "Manage chronic health conditions, drug allergies, and current medications."}
                </p>
              </div>
              <div className="pt-2 flex items-center text-xs font-bold text-sky-700 group-hover:gap-2 transition-all">
                <span>{t("btn_open")}</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
