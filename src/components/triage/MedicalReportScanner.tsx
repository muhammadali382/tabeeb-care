"use client";

import React, { useState, useRef } from "react";
import {
  FileImage,
  Upload,
  X,
  Sparkles,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  ArrowUpCircle,
  ArrowDownCircle,
  ShieldAlert,
  Paperclip,
  ScanText,
  FileText,
} from "lucide-react";
import { Button } from "../ui/Button";
import { AudioReadoutButton } from "../ui/AudioReadoutButton";
import { extractTextFromImage } from "@/lib/ocr/client_ocr";

export interface LabMarker {
  name: string;
  value: string;
  reference_range: string;
  status: "high" | "low" | "normal";
  explanation_en: string;
}

export interface LabReportAnalysis {
  report_title: string;
  overall_status: "urgent" | "attention_needed" | "normal";
  summary_en: string;
  markers: LabMarker[];
  profile_alerts?: string[];
  next_steps_en: string;
}

interface MedicalReportScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onAttachToReport?: (summaryText: string, analysis: LabReportAnalysis) => void;
}

export function MedicalReportScanner({
  isOpen,
  onClose,
  onAttachToReport,
}: MedicalReportScannerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [ocrProgress, setOcrProgress] = useState<number>(0);
  const [ocrStatus, setOcrStatus] = useState<string>("");
  const [isScanning, setIsScanning] = useState(false);
  const [extractedText, setExtractedText] = useState("");
  const [ocrConfidence, setOcrConfidence] = useState<number | null>(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<LabReportAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attached, setAttached] = useState(false);

  if (!isOpen) return null;

  const runOcr = async (source: File | string, displayUrl: string) => {
    setError(null);
    setAnalysis(null);
    setAttached(false);
    setPreviewUrl(displayUrl);
    setIsScanning(true);
    setOcrProgress(5);
    setOcrStatus("Starting local OCR engine...");

    try {
      const result = await extractTextFromImage(source, (pct, status) => {
        setOcrProgress(pct);
        setOcrStatus(status);
      });
      setExtractedText(result.text);
      setOcrConfidence(result.confidence);
      if (!result.text) {
        setError(
          "No clear text could be extracted. Please upload a sharper image or edit the text box below."
        );
      }
    } catch (err) {
      console.error("OCR failed:", err);
      setError("Failed to run OCR on this file. Please try another PNG/JPG photo.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    void runOcr(file, objectUrl);
  };

  const handleLoadSample = () => {
    void runOcr("/demo-lab-report.png", "/demo-lab-report.png");
  };

  const handleAnalyze = async () => {
    if (!extractedText.trim()) {
      setError("Please upload an image or enter report text first.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    try {
      const res = await fetch("/api/report-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          reportText: extractedText.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.analysis) {
        throw new Error(data.error || "Failed to analyze lab report");
      }

      setAnalysis(data.analysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to analyze medical report");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAttach = () => {
    if (!analysis || !onAttachToReport) return;
    const markerSummary = (analysis.markers || [])
      .map((m) => `${m.name}: ${m.value} [${m.status.toUpperCase()}, Ref: ${m.reference_range}]`)
      .join("; ");
    const fullSummary = `${analysis.report_title}: ${markerSummary}. ${analysis.summary_en}`;
    onAttachToReport(fullSummary, analysis);
    setAttached(true);
  };

  const statusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s === "high") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-700 border border-red-200 shrink-0">
          <ArrowUpCircle className="w-3 h-3" />
          HIGH
        </span>
      );
    }
    if (s === "low") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300 shrink-0">
          <ArrowDownCircle className="w-3 h-3" />
          LOW
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
        <CheckCircle2 className="w-3 h-3" />
        NORMAL
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90dvh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <FileImage className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                Upload &amp; Analyze Medical / Lab Report (OCR)
              </h3>
              <p className="text-xs text-slate-500 truncate">
                Upload a printed lab report photo (CBC, HbA1c, Glucose, Lipids) for instant OCR + AI breakdown
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

        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-teal-500 bg-slate-50/70 hover:bg-teal-50/40 rounded-2xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-colors space-y-2"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-11 h-11 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
                <Upload className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs sm:text-sm font-bold text-slate-800">
                  Upload Lab Report Image or PDF
                </p>
                <p className="text-[11px] text-slate-500">
                  PNG, JPG, WEBP, PDF • Fast Local Server OCR
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleLoadSample();
                }}
                disabled={isScanning}
                className="mt-2 inline-flex items-center gap-1.5 px-3 py-2 min-h-[36px] rounded-lg bg-white border border-teal-300 text-teal-700 hover:bg-teal-50 text-xs font-bold shadow-2xs transition-colors"
              >
                <FileText className="w-3.5 h-3.5 text-teal-600" />
                <span>Try Sample Lab Report</span>
              </button>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 flex flex-col items-center justify-center min-h-[160px] overflow-hidden">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Uploaded medical report preview"
                  className="max-h-48 w-auto rounded-lg border border-slate-200 object-contain shadow-xs"
                />
              ) : (
                <div className="text-center text-xs text-slate-400 space-y-1">
                  <ScanText className="w-7 h-7 mx-auto opacity-50" />
                  <p>Uploaded image preview will appear here</p>
                </div>
              )}
            </div>
          </div>

          {isScanning && (
            <div className="p-4 rounded-xl bg-teal-50/70 border border-teal-200 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-teal-900">
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
                  {ocrStatus || "Running OCR..."}
                </span>
                <span>{ocrProgress}%</span>
              </div>
              <div className="w-full h-2 bg-teal-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-teal-600 rounded-full transition-all duration-200"
                  style={{ width: `${ocrProgress}%` }}
                />
              </div>
            </div>
          )}

          {(extractedText || !isScanning) && (
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="text-xs font-bold text-slate-700">
                  Extracted Report Text (Editable before AI Analysis)
                </label>
                {ocrConfidence !== null && (
                  <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                    OCR Confidence: {ocrConfidence}%
                  </span>
                )}
              </div>
              <textarea
                rows={4}
                value={extractedText}
                onChange={(e) => setExtractedText(e.target.value)}
                placeholder="Extracted lab report values will appear here after OCR (or paste report text directly)..."
                className="w-full rounded-xl border border-slate-200 p-3 text-xs font-mono text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              />

              <div className="flex justify-end">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || isScanning || !extractedText.trim()}
                  className="gap-1.5 shadow-sm min-h-[40px]"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Analyzing Report...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Analyze Report with AI</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {analysis && (
            <div className="space-y-4 pt-2 border-t border-slate-200 animate-in fade-in duration-300">
              <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="text-sm sm:text-base font-extrabold text-teal-950">
                    {analysis.report_title}
                  </h4>
                  <AudioReadoutButton
                    text={`${analysis.summary_en}. ${analysis.next_steps_en}`}
                  />
                </div>
                <p className="text-xs sm:text-sm text-teal-900 leading-relaxed">
                  {analysis.summary_en}
                </p>
              </div>

              {analysis.profile_alerts && analysis.profile_alerts.length > 0 && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 space-y-1.5 text-xs text-amber-950">
                  <div className="flex items-center gap-1.5 font-bold">
                    <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Patient Profile Clinical Connections</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-amber-900">
                    {analysis.profile_alerts.map((alert, i) => (
                      <li key={i}>{alert}</li>
                    ))}
                  </ul>
                </div>
              )}

              {analysis.markers && analysis.markers.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {analysis.markers.map((marker, idx) => (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-xl border space-y-1.5 ${
                        marker.status === "high"
                          ? "bg-red-50/40 border-red-200"
                          : marker.status === "low"
                          ? "bg-amber-50/40 border-amber-200"
                          : "bg-white border-slate-200"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <strong className="text-xs sm:text-sm font-bold text-slate-900 block break-words">
                            {marker.name}
                          </strong>
                          <span className="text-sm font-extrabold text-teal-800">
                            {marker.value}
                          </span>
                          <span className="text-[11px] text-slate-500 ml-1.5">
                            (Ref: {marker.reference_range})
                          </span>
                        </div>
                        {statusBadge(marker.status)}
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed">
                        {marker.explanation_en}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
                <strong className="text-slate-900 block">
                  Recommended Next Steps to Discuss:
                </strong>
                <p className="leading-relaxed">{analysis.next_steps_en}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <span className="text-[11px] text-slate-400">
            Educational lab explanation • Not a final medical diagnosis
          </span>

          <div className="flex flex-wrap items-center gap-2">
            {analysis && onAttachToReport && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleAttach}
                className="gap-1.5 shadow-sm min-h-[40px]"
              >
                {attached ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Attached to Doctor Report</span>
                  </>
                ) : (
                  <>
                    <Paperclip className="w-4 h-4" />
                    <span>Attach to SBAR Report</span>
                  </>
                )}
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={onClose} className="min-h-[40px]">
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
