"use client";

import React, { useState } from "react";
import {
  FileText,
  Printer,
  X,
  HeartPulse,
  Download,
  Check,
  Copy,
  HelpCircle,
  FlaskConical,
  ListChecks,
} from "lucide-react";
import { Button } from "../ui/Button";

export interface StructuredDoctorReport {
  triage_level?: string;
  chief_complaint_en?: string;
  situation_en?: string;
  timeline_en?: string[];
  assessment_en?: string;
  lab_findings_summary_en?: string | null;
  recommendations_en?: string;
  questions_for_doctor_en?: string[];
}

interface SbarCardProps {
  isOpen: boolean;
  onClose: () => void;
  patientName?: string;
  patientAge?: number | null;
  patientGender?: string | null;
  conditions?: string[];
  allergies?: string[];
  medications?: string[];
  situation: string;
  assessment: string;
  triageLevel?: string;
  structuredReport?: StructuredDoctorReport | null;
  answeredQuestionsCount?: number;
}

export function SbarCard({
  isOpen,
  onClose,
  patientName = "Patient",
  patientAge,
  patientGender,
  conditions = [],
  allergies = [],
  medications = [],
  situation,
  assessment,
  triageLevel = "Clinical Evaluation",
  structuredReport = null,
  answeredQuestionsCount,
}: SbarCardProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const effectiveLevel = structuredReport?.triage_level || triageLevel || "Clinical Evaluation";

  const fallbackAssessment = assessment
    .replace(/^TRIAGE_LEVEL:\s*\w+\s*/i, "")
    .replace(/^---\s*/, "")
    .trim();

  const displaySituation =
    structuredReport?.situation_en ||
    situation ||
    "Patient reported symptoms during clinical triage intake.";

  const displayTimeline = structuredReport?.timeline_en || [];
  const displayLabFindings = structuredReport?.lab_findings_summary_en || null;

  const displayAssessment =
    structuredReport?.assessment_en ||
    fallbackAssessment ||
    "Clinical assessment generated through WHO-inspired triage protocols.";

  const displayRecommendation =
    structuredReport?.recommendations_en ||
    "Physical examination, vital signs verification (BP, Heart Rate, SpO2, Blood Glucose), and clinical diagnostic workup as indicated by physician.";

  const displayDoctorQuestions = structuredReport?.questions_for_doctor_en || [];

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const dateStr = new Date().toLocaleDateString("en-GB");
    const timeStr = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

    const timelineBlock =
      displayTimeline.length > 0
        ? `\n[INTAKE TIMELINE]\n${displayTimeline.map((t) => `- ${t}`).join("\n")}\n`
        : "";

    const labBlock = displayLabFindings
      ? `\n[ATTACHED LAB REPORT FINDINGS]\n${displayLabFindings}\n`
      : "";

    const questionsBlock =
      displayDoctorQuestions.length > 0
        ? `\n[QUESTIONS TO ASK YOUR DOCTOR]\n${displayDoctorQuestions
            .map((q, i) => `${i + 1}. ${q}`)
            .join("\n")}\n`
        : "";

    const reportText = `====================================================
TABEEBCARE — CLINICAL SBAR HANDOVER REPORT
====================================================
Date: ${dateStr} | Time: ${timeStr}
Protocol Reference: WHO-Inspired Clinical Triage

[PATIENT OVERVIEW]
- Name: ${patientName}
- Demographics: ${patientAge ? `${patientAge} yrs` : "N/A"} • ${patientGender || "N/A"}
- Triage Urgency: ${effectiveLevel.toUpperCase()}
- Known Allergies: ${allergies.length > 0 ? allergies.join(", ") : "None reported"}

[S — SITUATION]
${displaySituation}
${timelineBlock}
[B — BACKGROUND]
- Chronic Conditions: ${conditions.length > 0 ? conditions.join(", ") : "None recorded"}
- Current Medications: ${medications.length > 0 ? medications.join(", ") : "None reported"}
${labBlock}
[A — ASSESSMENT]
${displayAssessment}

[R — RECOMMENDATION]
${displayRecommendation}
${questionsBlock}
----------------------------------------------------
Educational Support Only • Not a Final Diagnosis
Prepared via TabeebCare Clinical Navigation Platform
====================================================`;

    const blob = new Blob([reportText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `TabeebCare_Doctor_Report_${patientName.replace(/\s+/g, "_")}_${dateStr.replace(/\//g, "-")}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    const textToCopy = `TabeebCare SBAR Doctor Report (${patientName} | ${effectiveLevel.toUpperCase()}):\nSituation: ${displaySituation}\nAssessment: ${displayAssessment}\nRecommendation: ${displayRecommendation}`;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90dvh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-3 no-print shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-slate-800 flex flex-wrap items-center gap-2">
                <span className="truncate">Comprehensive Doctor Report (SBAR Summary)</span>
                {answeredQuestionsCount && answeredQuestionsCount >= 3 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200">
                    {answeredQuestionsCount}-Question Synthesis
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-500 truncate">
                Structured clinical intake summary ready for your consulting physician
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors shrink-0"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Card Body */}
        <div className="p-4 sm:p-7 overflow-y-auto space-y-5 text-sm text-slate-700 print:p-0 flex-1">
          {/* Header Banner */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-slate-200 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center shrink-0">
                <HeartPulse className="w-4 h-4" />
              </div>
              <div>
                <span className="font-extrabold text-slate-900 tracking-tight text-base sm:text-lg block">
                  TabeebCare Clinical Handover
                </span>
                <span className="text-[11px] text-teal-700 font-semibold">
                  Clinical SBAR Summary • UN SDG 3
                </span>
              </div>
            </div>
            <div className="text-left sm:text-right text-xs text-slate-500 font-mono">
              <p>Date: {new Date().toLocaleDateString("en-GB")}</p>
              <p className="text-[11px] text-slate-400">Protocol: WHO-Inspired RAG</p>
            </div>
          </div>

          {/* Patient Overview Grid */}
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 block uppercase font-bold text-[10px]">
                Patient Name
              </span>
              <strong className="text-slate-900 text-sm block mt-0.5 break-words">{patientName}</strong>
            </div>
            <div>
              <span className="text-slate-400 block uppercase font-bold text-[10px]">
                Demographics
              </span>
              <strong className="text-slate-900 block mt-0.5">
                {patientAge ? `${patientAge} yrs` : "N/A"} • {patientGender || "N/A"}
              </strong>
            </div>
            <div>
              <span className="text-slate-400 block uppercase font-bold text-[10px]">
                Triage Urgency
              </span>
              <span className="font-extrabold text-teal-700 text-xs block mt-0.5">
                {effectiveLevel.toUpperCase()}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block uppercase font-bold text-[10px]">
                Known Allergies
              </span>
              <span className="font-bold text-red-600 block mt-0.5 break-words">
                {allergies.length > 0 ? allergies.join(", ") : "None reported"}
              </span>
            </div>
          </div>

          {/* SBAR Clinical Sections */}
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2">
              <h4 className="text-xs font-bold text-teal-800 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-teal-600 shrink-0" />
                S — Situation (Presenting Complaint)
              </h4>
              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed pl-3.5 border-l-2 border-teal-200">
                {displaySituation}
              </p>

              {displayTimeline.length > 0 && (
                <div className="pt-2 pl-3.5 border-l-2 border-teal-100 space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                    <ListChecks className="w-3.5 h-3.5 text-teal-600" />
                    Key Intake Findings:
                  </span>
                  <ul className="list-disc list-inside text-xs text-slate-700 space-y-0.5">
                    {displayTimeline.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2">
              <h4 className="text-xs font-bold text-teal-800 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-teal-600 shrink-0" />
                B — Background (Medical History &amp; Medications)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pl-3.5 border-l-2 border-teal-200">
                <div>
                  <strong className="text-slate-700 block mb-0.5">Chronic Conditions:</strong>
                  <span className="text-slate-600">
                    {conditions.length > 0 ? conditions.join(", ") : "None recorded"}
                  </span>
                </div>
                <div>
                  <strong className="text-slate-700 block mb-0.5">Current Medications:</strong>
                  <span className="text-slate-600">
                    {medications.length > 0 ? medications.join(", ") : "None reported"}
                  </span>
                </div>
              </div>
            </div>

            {displayLabFindings && (
              <div className="p-3.5 rounded-xl border border-sky-200 bg-sky-50/50 space-y-1.5">
                <h4 className="text-xs font-bold text-sky-900 uppercase tracking-wider flex items-center gap-1.5">
                  <FlaskConical className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                  Attached Lab Report Findings (OCR)
                </h4>
                <p className="text-xs sm:text-sm text-sky-950 leading-relaxed pl-3.5 border-l-2 border-sky-300">
                  {displayLabFindings}
                </p>
              </div>
            )}

            <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1">
              <h4 className="text-xs font-bold text-teal-800 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-teal-600 shrink-0" />
                A — Assessment (Clinical Symptoms &amp; Observations)
              </h4>
              <div className="text-xs sm:text-sm text-slate-800 leading-relaxed pl-3.5 border-l-2 border-teal-200 whitespace-pre-wrap max-h-48 overflow-y-auto">
                {displayAssessment}
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-teal-200 bg-teal-50/50 space-y-1">
              <h4 className="text-xs font-bold text-teal-900 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-teal-600 shrink-0" />
                R — Recommendation (Suggested Clinical Focus)
              </h4>
              <p className="text-xs sm:text-sm text-teal-950 leading-relaxed pl-3.5 border-l-2 border-teal-400">
                {displayRecommendation}
              </p>
            </div>

            {displayDoctorQuestions.length > 0 && (
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1.5">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  Questions to Ask Your Doctor (Visit Prep)
                </h4>
                <ol className="list-decimal list-inside text-xs text-slate-700 space-y-1">
                  {displayDoctorQuestions.map((q, idx) => (
                    <li key={idx}>{q}</li>
                  ))}
                </ol>
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
            <span>Prepared via TabeebCare Health Navigation</span>
            <span>Educational Support Only • Not a Final Diagnosis</span>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-2.5 no-print shrink-0">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[40px] rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 text-xs font-semibold shadow-2xs transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copy Summary</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[40px] rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 text-xs font-semibold shadow-2xs transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-teal-600" />
              <span>Download (.txt)</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose} className="min-h-[40px]">
              Close
            </Button>
            <Button variant="primary" size="sm" onClick={handlePrint} className="gap-1.5 shadow-sm min-h-[40px]">
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
