"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { MedicineCard, MedicineData } from "@/components/meds/MedicineCard";
import { PrescriptionImageUploader } from "@/components/meds/PrescriptionImageUploader";
import { MedicalDisclaimerModal } from "@/components/layout/MedicalDisclaimer";
import { VoiceButton } from "@/components/ui/VoiceButton";
import {
  Pill,
  Sparkles,
  AlertCircle,
  CheckCircle,
  Search,
  Info,
  ShieldAlert,
  ShieldCheck,
  History,
} from "lucide-react";

export default function MedsPage() {
  const router = useRouter();
  const { user, profile, isLoading: isUserLoading } = useUser();

  const [inputMeds, setInputMeds] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [medData, setMedData] = useState<{
    medications: MedicineData[];
    general_advice?: string;
  } | null>(null);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/login");
    }
  }, [user, isUserLoading, router]);

  const presets = [
    {
      title: "Diabetes Regimen",
      value: "Metformin 500mg, Glibenclamide 5mg, Aspirin 75mg",
    },
    {
      title: "Antibiotic Course (Allergy Check)",
      value: "Augmentin 625mg, Panadol 500mg",
      highlight: true,
    },
    {
      title: "Blood Pressure Routine",
      value: "Amlodipine 5mg, Losartan 50mg, Hydrochlorothiazide 25mg",
    },
  ];

  const handlePreset = (val: string) => {
    setInputMeds(val);
    void handleAnalyze(val);
  };

  const handleAnalyze = async (medsToTest?: string) => {
    const text = medsToTest || inputMeds;
    if (!text.trim()) {
      setError("Please enter at least one medication name.");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/meds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          medications: text,
        }),
      });

      const data = await res.json();
      if (res.ok && data.data) {
        setMedData(data.data);
      } else {
        setError(data.error || "Failed to analyze medications.");
      }
    } catch {
      setError("Network error while connecting to the medication analyzer.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isUserLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[50dvh] text-slate-400 text-sm">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
          <span>Loading prescription scanner...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 sm:space-y-8 py-2">
      <MedicalDisclaimerModal featureKey="meds" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/90 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Pill className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Medicine Demystifier
            </h1>
            <p className="text-xs text-teal-700 font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              <span>Real-time Allergy Cross-Referencing &amp; 24-Hour Dosing Schedule</span>
            </p>
          </div>
        </div>

        <Link href="/history" className="self-start sm:self-center">
          <Button variant="outline" size="sm" className="gap-1.5 min-h-[40px] text-xs font-semibold">
            <History className="w-3.5 h-3.5 text-teal-600" />
            <span>Past Med Checks</span>
          </Button>
        </Link>
      </div>

      {/* Responsive Grid Layout: Scanner Form + Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Column (5 Cols on Desktop) */}
        <div className="lg:col-span-5 space-y-5">
          <Card className="rounded-3xl border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/70 p-4 sm:p-6 border-b border-slate-100">
              <div className="space-y-1">
                <CardTitle className="text-base font-bold text-slate-800">
                  Enter Prescribed Medications
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Enter medication names and strengths, scan a printed prescription, or select a sample regimen.
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-6 space-y-5">
              {/* Quick Sample Presets */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                  Sample Regimens
                </span>
                <div className="flex flex-col gap-2">
                  {presets.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handlePreset(preset.value)}
                      className="flex items-center justify-between gap-2 p-3 min-h-[44px] rounded-xl text-xs font-semibold border border-slate-200 bg-white hover:bg-teal-50 hover:border-teal-300 hover:text-teal-800 transition-all shadow-2xs text-left group active:scale-98"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Sparkles className="w-3.5 h-3.5 text-teal-600 group-hover:scale-110 shrink-0" />
                        <span className="truncate">{preset.title}</span>
                      </div>
                      {preset.highlight && (
                        <span className="text-[10px] bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-full border border-red-200 shrink-0">
                          Allergy Check
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Printed Prescription Photo OCR Uploader */}
              <PrescriptionImageUploader
                onExtractedText={(text) => {
                  setInputMeds(text);
                }}
              />

              {/* Textarea Input with Voice Dictation */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-600">
                    Type or dictate medicine names
                  </span>
                  <VoiceButton
                    onTranscript={(spoken) => {
                      setInputMeds((prev) => (prev ? `${prev}, ${spoken}` : spoken));
                    }}
                  />
                </div>
                <textarea
                  rows={4}
                  value={inputMeds}
                  onChange={(e) => setInputMeds(e.target.value)}
                  placeholder="e.g., Augmentin 625mg, Panadol 500mg, Metformin 500mg..."
                  className="w-full rounded-2xl border border-slate-200 p-3.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-colors leading-relaxed"
                />
              </div>

              <Button
                onClick={() => handleAnalyze()}
                isLoading={isLoading}
                size="lg"
                className="w-full min-h-[48px] font-bold gap-2 shadow-sm"
              >
                <Search className="w-4 h-4" />
                <span>{isLoading ? "Analyzing Prescriptions..." : "Analyze Prescriptions"}</span>
              </Button>

              {error && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{error}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Patient Allergy Guardrail Context Notice */}
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/60 border border-amber-200/90 text-xs text-amber-900 space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-950">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Active Allergy Safety Guardrail</span>
            </div>
            <p className="leading-relaxed text-amber-800">
              Every scan cross-references your recorded allergies (
              <strong>{profile?.allergies?.join(", ") || "None reported"}</strong>) to help prevent contraindicated medication use.
            </p>
          </div>
        </div>

        {/* Right Column (7 Cols on Desktop) */}
        <div className="lg:col-span-7 space-y-6">
          {medData ? (
            <section className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-teal-600" />
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                    Dosing Schedule &amp; Safety Analysis
                  </h2>
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  {medData.medications.length} Medication(s)
                </span>
              </div>

              <div className="space-y-5">
                {medData.medications.map((med, idx) => (
                  <MedicineCard key={idx} med={med} />
                ))}
              </div>

              {medData.general_advice && (
                <div className="p-5 rounded-2xl bg-teal-50/70 border border-teal-200 text-teal-900 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <Info className="w-4 h-4 text-teal-700 shrink-0" />
                    <span>Clinical Pharmacist Guidance</span>
                  </div>
                  <p className="text-xs sm:text-sm text-teal-950 leading-relaxed">
                    {medData.general_advice}
                  </p>
                </div>
              )}
            </section>
          ) : (
            <div className="h-full min-h-[320px] sm:min-h-[400px] border-2 border-dashed border-slate-200 rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center text-center space-y-4 text-slate-400">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                <Pill className="w-8 h-8" />
              </div>
              <div className="space-y-1 max-w-sm">
                <h3 className="text-base font-bold text-slate-700">
                  No Prescription Analyzed Yet
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Enter medications, upload a prescription photo, or select a sample regimen to view a 24-hour visual schedule, meal instructions, and allergy conflict alerts.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
