"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Pill,
  MessageSquareHeart,
  UserCheck,
  AlertTriangle,
  ArrowRight,
  Activity,
  HeartPulse,
  History,
  BookOpen,
  Clock,
} from "lucide-react";

interface TriageSessionItem {
  id: number;
  triage_level: string | null;
  summary: string;
  created_at: string | null;
}

interface MedCheckItem {
  id: number;
  medications_input: string;
  created_at: string | null;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, profile, isLoading } = useUser();

  const [triageSessions, setTriageSessions] = useState<TriageSessionItem[]>([]);
  const [medChecks, setMedChecks] = useState<MedCheckItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    const loadActivity = async () => {
      setHistoryLoading(true);
      try {
        const [triageRes, medsRes] = await Promise.all([
          fetch("/api/triage", { credentials: "include", cache: "no-store" }),
          fetch("/api/meds", { credentials: "include", cache: "no-store" }),
        ]);

        if (!cancelled && triageRes.ok) {
          const tData = await triageRes.json();
          setTriageSessions(Array.isArray(tData.sessions) ? tData.sessions : []);
        }
        if (!cancelled && medsRes.ok) {
          const mData = await medsRes.json();
          setMedChecks(Array.isArray(mData.checks) ? mData.checks : []);
        }
      } catch {
        // Non-blocking activity fetch
      } finally {
        if (!cancelled) setHistoryLoading(false);
      }
    };

    void loadActivity();
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[50dvh] text-slate-400 text-sm">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
          <span>Loading patient portal...</span>
        </div>
      </div>
    );
  }

  const conditions = profile?.conditions || [];
  const allergies = profile?.allergies || [];
  const medications = profile?.current_medications || [];

  const profileFieldsFilled = [
    profile?.age ? 1 : 0,
    profile?.gender ? 1 : 0,
    conditions.length > 0 ? 1 : 0,
    allergies.length > 0 ? 1 : 0,
    medications.length > 0 ? 1 : 0,
  ].reduce((a, b) => a + b, 0);
  const profileCompleteness = Math.round((profileFieldsFilled / 5) * 100);

  return (
    <div className="space-y-6 sm:space-y-8 py-2">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-teal-50 via-teal-50/50 to-emerald-50/70 border border-teal-200 rounded-3xl p-5 sm:p-8 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="space-y-2">
          <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome back, {user.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
            Your personalized clinical command center. Check medication safety, run protocol-grounded symptom triage, and review your consultation history.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Link href="/triage" className="flex-1 sm:flex-none">
            <Button variant="primary" size="lg" className="w-full sm:w-auto min-h-[46px] gap-2 shadow-sm font-bold">
              <MessageSquareHeart className="w-4 h-4" />
              <span>Start Symptom Triage</span>
            </Button>
          </Link>
          <Link href="/meds" className="flex-1 sm:flex-none">
            <Button variant="outline" size="lg" className="w-full sm:w-auto min-h-[46px] gap-2 font-bold bg-white">
              <Pill className="w-4 h-4 text-teal-600" />
              <span>Check Medications</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Live Overview Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Triage Consultations
          </span>
          <strong className="text-2xl font-extrabold text-slate-900 block">
            {historyLoading ? "—" : triageSessions.length}
          </strong>
          <Link href="/history" className="text-xs text-teal-700 font-semibold hover:underline inline-flex items-center gap-1">
            <span>View history</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Medication Scans
          </span>
          <strong className="text-2xl font-extrabold text-slate-900 block">
            {historyLoading ? "—" : medChecks.length}
          </strong>
          <Link href="/meds" className="text-xs text-teal-700 font-semibold hover:underline inline-flex items-center gap-1">
            <span>Analyze meds</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-red-500 block">
            Recorded Allergies
          </span>
          <strong className="text-2xl font-extrabold text-slate-900 block">
            {allergies.length}
          </strong>
          <span className="text-xs text-slate-500 block truncate">
            {allergies.length > 0 ? allergies.join(", ") : "None recorded"}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Profile Completeness
          </span>
          <strong className="text-2xl font-extrabold text-teal-700 block">
            {profileCompleteness}%
          </strong>
          <Link href="/profile" className="text-xs text-teal-700 font-semibold hover:underline inline-flex items-center gap-1">
            <span>Update profile</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Patient Health Vitals Summary Card */}
      <Card className="rounded-2xl border-slate-200 shadow-xs overflow-hidden">
        <CardHeader className="bg-slate-50/70 p-4 sm:p-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-base sm:text-lg font-bold text-slate-900">
                Active Health Profile
              </CardTitle>
              <p className="text-xs text-slate-500">
                Automatically referenced in every prescription scan and triage consultation
              </p>
            </div>
          </div>

          <Link href="/profile">
            <Button variant="ghost" size="sm" className="text-teal-700 font-semibold gap-1 min-h-[38px]">
              <span>Edit Profile</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </CardHeader>

        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Demographics */}
            <div className="space-y-3 border-b md:border-b-0 md:border-r border-slate-100 pb-4 md:pb-0 md:pr-6">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Demographics
              </span>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 shrink-0">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    {profile?.age ? `${profile.age} Years` : "Age not set"} •{" "}
                    {profile?.gender || "Gender not set"}
                  </p>
                  <p className="text-xs text-slate-500 break-all">{user.email}</p>
                </div>
              </div>
            </div>

            {/* Chronic Conditions */}
            <div className="space-y-3 border-b md:border-b-0 md:border-r border-slate-100 pb-4 md:pb-0 md:pr-6">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <HeartPulse className="w-3.5 h-3.5 text-teal-600" />
                Chronic Conditions
              </span>
              <div className="flex flex-wrap gap-2">
                {conditions.length > 0 ? (
                  conditions.map((cond, idx) => (
                    <Badge key={idx} variant="primary" size="md">
                      {cond}
                    </Badge>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 italic">None recorded</span>
                )}
              </div>
            </div>

            {/* Known Allergies */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-red-500 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                Known Drug / Food Allergies
              </span>
              <div className="flex flex-wrap gap-2">
                {allergies.length > 0 ? (
                  allergies.map((allergy, idx) => (
                    <Badge key={idx} variant="emergency" size="md">
                      {allergy}
                    </Badge>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 italic">No allergies recorded</span>
                )}
              </div>
            </div>
          </div>

          {medications.length > 0 && (
            <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
              <span className="font-semibold text-slate-500">Current Medications:</span>
              {medications.map((m, idx) => (
                <Badge key={idx} variant="slate" size="sm">
                  {m}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Consultations & Med Checks */}
        <Card className="lg:col-span-7 rounded-2xl border-slate-200 shadow-xs overflow-hidden">
          <CardHeader className="bg-slate-50/70 p-4 sm:p-5 border-b border-slate-200 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-teal-600" />
              <CardTitle className="text-base font-bold text-slate-900">
                Recent Clinical Activity
              </CardTitle>
            </div>
            <Link href="/history" className="text-xs font-semibold text-teal-700 hover:underline">
              View All
            </Link>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 space-y-3">
            {historyLoading ? (
              <p className="text-xs text-slate-400 py-4 text-center">Loading activity...</p>
            ) : triageSessions.length === 0 && medChecks.length === 0 ? (
              <div className="text-center py-6 space-y-2 text-xs text-slate-500">
                <p>No saved consultations or medication scans yet.</p>
                <p className="text-slate-400">
                  Start a symptom triage chat or scan a prescription to see your timeline here.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {triageSessions.slice(0, 3).map((s) => (
                  <Link
                    key={`triage-${s.id}`}
                    href="/history"
                    className="flex items-start justify-between gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-teal-50/40 hover:border-teal-200 transition-colors"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            s.triage_level === "emergency"
                              ? "emergency"
                              : s.triage_level === "urgent"
                              ? "warning"
                              : s.triage_level === "home"
                              ? "safe"
                              : "info"
                          }
                          size="sm"
                        >
                          {(s.triage_level || "triage").toUpperCase()}
                        </Badge>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {s.created_at ? new Date(s.created_at).toLocaleDateString() : "Recent"}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-slate-700 line-clamp-1">
                        {s.summary || "Symptom triage consultation"}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 shrink-0 mt-1" />
                  </Link>
                ))}

                {medChecks.slice(0, 2).map((m) => (
                  <Link
                    key={`med-${m.id}`}
                    href="/history"
                    className="flex items-start justify-between gap-3 p-3 rounded-xl border border-slate-200 bg-white hover:bg-teal-50/40 hover:border-teal-200 transition-colors"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge variant="primary" size="sm">
                          MED CHECK
                        </Badge>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {m.created_at ? new Date(m.created_at).toLocaleDateString() : "Recent"}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-slate-700 line-clamp-1">
                        {m.medications_input}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 shrink-0 mt-1" />
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Launch Cards */}
        <div className="lg:col-span-5 space-y-4">
          <Link
            href="/meds"
            className="group block p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-teal-300 transition-all space-y-2.5"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 text-teal-600 flex items-center justify-center">
                <Pill className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Prescription Scanner &amp; Meds</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Generate 24-hour schedules, check food interactions, and verify drug allergies via text, voice, or photo OCR.
            </p>
          </Link>

          <Link
            href="/protocols"
            className="group block p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-teal-300 transition-all space-y-2.5"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 text-sky-600 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Clinical Protocols Library</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Browse all 15 WHO-inspired clinical triage guidelines and emergency red-flag criteria.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
