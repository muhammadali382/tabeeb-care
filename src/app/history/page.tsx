"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { TriageBadge } from "@/components/triage/TriageBadge";
import { MedicineData } from "@/components/meds/MedicineCard";
import {
  History,
  MessageSquareHeart,
  Pill,
  Search,
  Download,
  ChevronDown,
  ChevronUp,
  Calendar,
  ArrowRight,
} from "lucide-react";

interface TriageSessionRecord {
  id: number;
  messages: Array<{ role: string; content: string }>;
  triage_level: string | null;
  summary: string;
  created_at: string | null;
}

interface MedCheckRecord {
  id: number;
  medications_input: string;
  schedule_result: {
    medications?: MedicineData[];
    general_advice?: string;
  } | null;
  created_at: string | null;
}

type TabFilter = "all" | "triage" | "meds";
type SeverityFilter = "all" | "emergency" | "urgent" | "routine" | "home";

export default function HistoryPage() {
  const router = useRouter();
  const { user, isLoading: isUserLoading } = useUser();

  const [triageSessions, setTriageSessions] = useState<TriageSessionRecord[]>([]);
  const [medChecks, setMedChecks] = useState<MedCheckRecord[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<TabFilter>("all");
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedKeys, setExpandedKeys] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/login");
    }
  }, [user, isUserLoading, router]);

  useEffect(() => {
    if (!user) return;
    let active = true;

    async function loadHistory() {
      setIsLoadingData(true);
      setError(null);
      try {
        const [triageRes, medsRes] = await Promise.all([
          fetch("/api/triage", { credentials: "include" }),
          fetch("/api/meds", { credentials: "include" }),
        ]);

        if (!triageRes.ok || !medsRes.ok) {
          throw new Error("Unable to load your saved records right now.");
        }

        const triageData = await triageRes.json();
        const medsData = await medsRes.json();

        if (!active) return;
        setTriageSessions(Array.isArray(triageData.sessions) ? triageData.sessions : []);
        setMedChecks(Array.isArray(medsData.checks) ? medsData.checks : []);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Failed to load history.");
      } finally {
        if (active) setIsLoadingData(false);
      }
    }

    loadHistory();
    return () => {
      active = false;
    };
  }, [user]);

  const toggleExpand = (key: string) => {
    setExpandedKeys((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Recent";
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return dateStr;
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const downloadTextFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportTriageSession = (session: TriageSessionRecord) => {
    const lines = [
      "TABEEBCARE — SYMPTOM TRIAGE TRANSCRIPT",
      `Session ID: #${session.id}`,
      `Date: ${formatDate(session.created_at)}`,
      `Triage Level: ${(session.triage_level || "unspecified").toUpperCase()}`,
      "",
      "--- CONVERSATION ---",
      ...session.messages.map(
        (m) => `[${m.role.toUpperCase()}]\n${m.content}\n`
      ),
      "---",
      "Disclaimer: Educational health literacy & triage guidance only. Not a medical diagnosis.",
    ];
    downloadTextFile(`tabeebcare-triage-${session.id}.txt`, lines.join("\n"));
  };

  const exportMedCheck = (check: MedCheckRecord) => {
    const meds = check.schedule_result?.medications || [];
    const lines = [
      "TABEEBCARE — MEDICATION SCHEDULE REPORT",
      `Check ID: #${check.id}`,
      `Date: ${formatDate(check.created_at)}`,
      `Input: ${check.medications_input}`,
      "",
      "--- MEDICATIONS ---",
      ...meds.map((m) => {
        const formatSlot = (active?: boolean) => (active ? "Yes" : "—");
        return [
          `• ${m.name} (${m.purpose || "General"})`,
          `  Morning: ${formatSlot(m.schedule?.morning)} | Afternoon: ${formatSlot(m.schedule?.afternoon)} | Evening: ${formatSlot(m.schedule?.evening)} | Night: ${formatSlot(m.schedule?.night)}`,
          `  Food Rule: ${m.food_instruction || "None specified"}`,
          m.allergy_conflict && m.allergy_message ? `  ALLERGY WARNING: ${m.allergy_message}` : "",
          m.warnings && m.warnings.length > 0 ? `  Warnings: ${m.warnings.join("; ")}` : "",
          "",
        ]
          .filter(Boolean)
          .join("\n");
      }),
      check.schedule_result?.general_advice
        ? `General Advice: ${check.schedule_result.general_advice}`
        : "",
    ];
    downloadTextFile(`tabeebcare-meds-${check.id}.txt`, lines.join("\n"));
  };

  const filteredTriage = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return triageSessions.filter((s) => {
      const lvl = (s.triage_level || "").toLowerCase();
      if (severityFilter !== "all" && lvl !== severityFilter) return false;
      if (!q) return true;
      const inSummary = s.summary?.toLowerCase().includes(q);
      const inMessages = s.messages?.some((m) => m.content.toLowerCase().includes(q));
      return inSummary || inMessages;
    });
  }, [triageSessions, severityFilter, searchQuery]);

  const filteredMeds = useMemo(() => {
    if (severityFilter !== "all") return [];
    const q = searchQuery.trim().toLowerCase();
    return medChecks.filter((c) => {
      if (!q) return true;
      if (c.medications_input.toLowerCase().includes(q)) return true;
      return c.schedule_result?.medications?.some((m) =>
        m.name.toLowerCase().includes(q)
      );
    });
  }, [medChecks, severityFilter, searchQuery]);

  if (isUserLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[50dvh] text-slate-400 text-sm">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
          <span>Loading your medical history...</span>
        </div>
      </div>
    );
  }

  const showTriage = activeTab === "all" || activeTab === "triage";
  const showMeds = activeTab === "all" || activeTab === "meds";
  const totalVisible =
    (showTriage ? filteredTriage.length : 0) + (showMeds ? filteredMeds.length : 0);

  return (
    <div className="space-y-6 py-2 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Consultation & Medication History
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Review past triage sessions, export transcripts, and revisit medication schedules.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/triage"
            className="inline-flex items-center gap-1.5 px-3.5 min-h-[40px] rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold transition-colors"
          >
            <MessageSquareHeart className="w-3.5 h-3.5" />
            <span>New Triage</span>
          </Link>
          <Link
            href="/meds"
            className="inline-flex items-center gap-1.5 px-3.5 min-h-[40px] rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
          >
            <Pill className="w-3.5 h-3.5 text-teal-600" />
            <span>Scan Meds</span>
          </Link>
        </div>
      </div>

      {/* Filters & Search */}
      <Card className="rounded-2xl border-slate-200 shadow-sm">
        <CardContent className="p-4 sm:p-5 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Tabs */}
            <div className="flex flex-wrap gap-1.5">
              {(
                [
                  { id: "all", label: `All (${triageSessions.length + medChecks.length})` },
                  { id: "triage", label: `Triage (${triageSessions.length})` },
                  { id: "meds", label: `Medications (${medChecks.length})` },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 py-2 min-h-[40px] rounded-lg text-xs font-semibold transition-colors ${
                    activeTab === tab.id
                      ? "bg-teal-600 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search symptoms or medicines..."
                className="w-full min-h-[40px] pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              />
            </div>
          </div>

          {/* Triage Severity Filter */}
          {showTriage && (
            <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mr-1">
                Triage Level:
              </span>
              {(["all", "emergency", "urgent", "routine", "home"] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setSeverityFilter(lvl)}
                  className={`px-2.5 py-1 min-h-[32px] rounded-full text-xs font-medium capitalize transition-colors ${
                    severityFilter === lvl
                      ? "bg-teal-100 text-teal-800 border border-teal-300"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {lvl === "home" ? "Home Care" : lvl}
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm"
        >
          {error}
        </div>
      )}

      {/* Content */}
      {isLoadingData ? (
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-28 rounded-2xl bg-white border border-slate-200 animate-pulse"
            />
          ))}
        </div>
      ) : totalVisible === 0 ? (
        <Card className="rounded-2xl border-slate-200">
          <CardContent className="p-8 sm:p-12 text-center space-y-3">
            <History className="w-10 h-10 text-slate-300 mx-auto" />
            <h2 className="text-base font-bold text-slate-800">No matching records found</h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              Start an AI Symptom Triage session or decode a prescription to build your personal health timeline.
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Link
                href="/triage"
                className="inline-flex items-center gap-1.5 px-4 min-h-[42px] rounded-lg bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700"
              >
                <span>Start Symptom Triage</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Triage Records */}
          {showTriage && filteredTriage.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <MessageSquareHeart className="w-4 h-4 text-teal-600" />
                <span>Symptom Triage Sessions ({filteredTriage.length})</span>
              </h2>
              <div className="space-y-3">
                {filteredTriage.map((session) => {
                  const key = `triage-${session.id}`;
                  const isExpanded = !!expandedKeys[key];
                  return (
                    <Card key={key} className="rounded-2xl border-slate-200 shadow-sm overflow-hidden">
                      <CardHeader className="p-4 sm:p-5 bg-white">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="space-y-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <TriageBadge level={session.triage_level || "routine"} />
                              <span className="text-xs text-slate-400 flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                {formatDate(session.created_at)}
                              </span>
                            </div>
                            <CardTitle className="text-sm sm:text-base font-bold text-slate-900 break-words">
                              {session.summary || "Symptom Triage Consultation"}
                            </CardTitle>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => exportTriageSession(session)}
                              className="min-h-[38px] gap-1.5 text-xs"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Export</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleExpand(key)}
                              className="min-h-[38px] gap-1 text-xs text-teal-700"
                            >
                              <span>{isExpanded ? "Hide" : "View"}</span>
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </CardHeader>

                      {isExpanded && (
                        <CardContent className="p-4 sm:p-5 bg-slate-50/70 border-t border-slate-100 space-y-3">
                          {session.messages.map((msg, idx) => (
                            <div
                              key={idx}
                              className={`p-3 rounded-xl text-xs sm:text-sm leading-relaxed border ${
                                msg.role === "user"
                                  ? "bg-teal-50/70 border-teal-200 text-slate-800"
                                  : "bg-white border-slate-200 text-slate-700"
                              }`}
                            >
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                                {msg.role === "user" ? "Patient" : "TabeebCare AI"}
                              </span>
                              <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                            </div>
                          ))}
                        </CardContent>
                      )}
                    </Card>
                  );
                })}
              </div>
            </section>
          )}

          {/* Medication Check Records */}
          {showMeds && filteredMeds.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <Pill className="w-4 h-4 text-teal-600" />
                <span>Medication Schedules ({filteredMeds.length})</span>
              </h2>
              <div className="space-y-3">
                {filteredMeds.map((check) => {
                  const key = `meds-${check.id}`;
                  const isExpanded = !!expandedKeys[key];
                  const meds = check.schedule_result?.medications || [];
                  return (
                    <Card key={key} className="rounded-2xl border-slate-200 shadow-sm overflow-hidden">
                      <CardHeader className="p-4 sm:p-5 bg-white">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="space-y-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                                {meds.length} {meds.length === 1 ? "Medication" : "Medications"}
                              </span>
                              <span className="text-xs text-slate-400 flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                {formatDate(check.created_at)}
                              </span>
                            </div>
                            <CardTitle className="text-sm sm:text-base font-bold text-slate-900 break-words">
                              {check.medications_input}
                            </CardTitle>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => exportMedCheck(check)}
                              className="min-h-[38px] gap-1.5 text-xs"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Export</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleExpand(key)}
                              className="min-h-[38px] gap-1 text-xs text-teal-700"
                            >
                              <span>{isExpanded ? "Hide" : "View"}</span>
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </CardHeader>

                      {isExpanded && (
                        <CardContent className="p-4 sm:p-5 bg-slate-50/70 border-t border-slate-100 space-y-3">
                          {meds.map((med, idx) => (
                            <div
                              key={idx}
                              className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-2 text-xs sm:text-sm"
                            >
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <strong className="text-slate-900">{med.name}</strong>
                                {med.purpose && (
                                  <span className="text-xs text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full">
                                    {med.purpose}
                                  </span>
                                )}
                              </div>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                                <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                                  <span className="text-slate-400 block">Morning</span>
                                  <strong className="text-slate-800">{med.schedule?.morning ? "Take" : "—"}</strong>
                                </div>
                                <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                                  <span className="text-slate-400 block">Afternoon</span>
                                  <strong className="text-slate-800">{med.schedule?.afternoon ? "Take" : "—"}</strong>
                                </div>
                                <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                                  <span className="text-slate-400 block">Evening</span>
                                  <strong className="text-slate-800">{med.schedule?.evening ? "Take" : "—"}</strong>
                                </div>
                                <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                                  <span className="text-slate-400 block">Night</span>
                                  <strong className="text-slate-800">{med.schedule?.night ? "Take" : "—"}</strong>
                                </div>
                              </div>
                              {med.food_instruction && (
                                <p className="text-xs text-slate-600">
                                  <strong>Food Guidance:</strong> {med.food_instruction}
                                </p>
                              )}
                              {med.allergy_conflict && med.allergy_message && (
                                <p className="text-xs text-red-700 font-semibold bg-red-50 p-2 rounded-lg border border-red-200">
                                  Allergy Alert: {med.allergy_message}
                                </p>
                              )}
                            </div>
                          ))}
                          {check.schedule_result?.general_advice && (
                            <div className="p-3 rounded-xl bg-teal-50/70 border border-teal-200 text-xs text-teal-900">
                              <strong>Pharmacist Note:</strong> {check.schedule_result.general_advice}
                            </div>
                          )}
                        </CardContent>
                      )}
                    </Card>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
