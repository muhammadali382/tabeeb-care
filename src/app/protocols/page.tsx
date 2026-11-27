"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { CLINICAL_PROTOCOLS, ClinicalProtocol } from "@/lib/rag/clinical_protocols";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { TriageBadge } from "@/components/triage/TriageBadge";
import {
  BookOpen,
  Search,
  PhoneCall,
  ShieldCheck,
  ArrowRight,
  Tag,
} from "lucide-react";

type SeverityFilter = "all" | ClinicalProtocol["severity"];

export default function ProtocolsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>("all");

  const counts = useMemo(() => {
    return {
      all: CLINICAL_PROTOCOLS.length,
      emergency: CLINICAL_PROTOCOLS.filter((p) => p.severity === "emergency").length,
      urgent: CLINICAL_PROTOCOLS.filter((p) => p.severity === "urgent").length,
      routine: CLINICAL_PROTOCOLS.filter((p) => p.severity === "routine").length,
      home: CLINICAL_PROTOCOLS.filter((p) => p.severity === "home").length,
    };
  }, []);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return CLINICAL_PROTOCOLS.filter((p) => {
      if (severityFilter !== "all" && p.severity !== severityFilter) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.protocol.toLowerCase().includes(q) ||
        p.keywords.some((k) => k.toLowerCase().includes(q))
      );
    });
  }, [searchQuery, severityFilter]);

  return (
    <div className="space-y-6 py-2 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Clinical Triage Protocols
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Transparent WHO-inspired reference protocols powering TabeebCare&apos;s RAG safety layer.
            </p>
          </div>
        </div>

        <Link
          href="/triage"
          className="inline-flex items-center justify-center gap-1.5 px-4 min-h-[42px] rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold transition-colors shrink-0"
        >
          <span>Open Symptom Triage</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Emergency Notice */}
      <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-2.5 text-xs sm:text-sm text-red-900">
          <PhoneCall className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <span>
            <strong>Emergency Rule:</strong> If you or someone nearby has chest pain, difficulty breathing, severe bleeding, or thoughts of self-harm, call <strong>Rescue 1122</strong> or <strong>Umang Helpline (0317-4288665)</strong> immediately.
          </span>
        </div>
        <a
          href="tel:1122"
          className="inline-flex items-center justify-center px-4 min-h-[40px] rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold shrink-0 transition-colors"
        >
          Call 1122
        </a>
      </div>

      {/* Filter & Search Bar */}
      <Card className="rounded-2xl border-slate-200 shadow-sm">
        <CardContent className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5">
            {(
              [
                { id: "all", label: `All (${counts.all})` },
                { id: "emergency", label: `Emergency (${counts.emergency})` },
                { id: "urgent", label: `Urgent (${counts.urgent})` },
                { id: "routine", label: `Routine (${counts.routine})` },
                { id: "home", label: `Home Care (${counts.home})` },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSeverityFilter(item.id)}
                className={`px-3 py-2 min-h-[38px] rounded-lg text-xs font-semibold transition-colors ${
                  severityFilter === item.id
                    ? "bg-teal-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search protocols or keywords..."
              className="w-full min-h-[40px] pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
            />
          </div>
        </CardContent>
      </Card>

      {/* Protocol Grid */}
      {filtered.length === 0 ? (
        <Card className="rounded-2xl border-slate-200">
          <CardContent className="p-10 text-center space-y-2">
            <ShieldCheck className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">No protocols match your filter.</p>
            <p className="text-xs text-slate-500">Try clearing your search query or selecting All.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((item) => (
            <Card key={item.id} className="rounded-2xl border-slate-200 shadow-sm flex flex-col">
              <CardHeader className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/60">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <CardTitle className="text-base font-bold text-slate-900">
                    {item.title}
                  </CardTitle>
                  <TriageBadge level={item.severity} />
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-5 space-y-4 flex-1 flex flex-col justify-between">
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {item.protocol}
                </p>

                <div className="pt-2 border-t border-slate-100 space-y-1.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    Trigger Keywords
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {item.keywords.slice(0, 8).map((kw, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-medium"
                      >
                        {kw}
                      </span>
                    ))}
                    {item.keywords.length > 8 && (
                      <span className="px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 text-[11px] font-medium">
                        +{item.keywords.length - 8} more
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
