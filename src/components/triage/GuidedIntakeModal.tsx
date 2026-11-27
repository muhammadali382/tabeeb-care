"use client";

import React, { useState } from "react";
import {
  ClipboardList,
  X,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  FileText,
  Loader2,
  RotateCcw,
} from "lucide-react";
import { Button } from "../ui/Button";
import { VoiceButton } from "../ui/VoiceButton";

export interface IntakeAnswerItem {
  question: string;
  answer: string;
}

interface GuidedIntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitAnswers: (answers: IntakeAnswerItem[]) => Promise<void>;
  isGenerating?: boolean;
  hasAttachedLabReport?: boolean;
}

const INTAKE_QUESTIONS = [
  {
    id: "complaint",
    questionEn: "What is your main symptom or health concern right now?",
    placeholderEn: "e.g., Persistent high fever with body aches and headache",
    quickChipsEn: [
      "High fever & chills",
      "Chest tightness / pain",
      "Severe headache & dizziness",
      "Stomach pain & vomiting",
    ],
  },
  {
    id: "duration",
    questionEn: "When did these symptoms start, and did they begin suddenly or gradually?",
    placeholderEn: "e.g., Started gradually 2 days ago and worsened last night",
    quickChipsEn: [
      "Started today (suddenly)",
      "2–3 days ago (gradual)",
      "About 1 week ago",
      "Recurring for weeks",
    ],
  },
  {
    id: "severity",
    questionEn: "How severe is it (1 to 10), and what makes it better or worse?",
    placeholderEn: "e.g., 7/10, gets worse at night and improves slightly with rest",
    quickChipsEn: [
      "Mild (3/10) — manageable",
      "Moderate (6/10) — worse on exertion",
      "Severe (8/10) — disturbing sleep",
      "Gets worse after eating",
    ],
  },
  {
    id: "associated",
    questionEn: "Are you experiencing any associated symptoms or warning signs?",
    placeholderEn: "e.g., Nausea, weakness, no shortness of breath or skin rash",
    quickChipsEn: [
      "Chills, sweating & fatigue",
      "Nausea / loss of appetite",
      "Shortness of breath / dizziness",
      "No other warning signs",
    ],
  },
  {
    id: "meds_taken",
    questionEn: "Have you taken any medicines for this yet, or anything else the doctor should know?",
    placeholderEn: "e.g., Took acetaminophen 500mg twice; blood sugar was 186 mg/dL this morning",
    quickChipsEn: [
      "Took acetaminophen 500mg",
      "No medicines taken yet",
      "Blood pressure was high today",
      "Attached lab report values",
    ],
  },
];

export function GuidedIntakeModal({
  isOpen,
  onClose,
  onSubmitAnswers,
  isGenerating = false,
  hasAttachedLabReport = false,
}: GuidedIntakeModalProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>(["", "", "", "", ""]);
  const [localError, setLocalError] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentQ = INTAKE_QUESTIONS[step];
  const answeredCount = answers.filter((a) => a.trim().length > 0).length;
  const progressPct = Math.round(((step + 1) / INTAKE_QUESTIONS.length) * 100);

  const updateCurrentAnswer = (val: string) => {
    setLocalError(null);
    setAnswers((prev) => {
      const next = [...prev];
      next[step] = val;
      return next;
    });
  };

  const appendChip = (chipText: string) => {
    setLocalError(null);
    setAnswers((prev) => {
      const next = [...prev];
      const existing = next[step].trim();
      next[step] = existing ? `${existing}; ${chipText}` : chipText;
      return next;
    });
  };

  const handleNext = () => {
    if (!answers[step].trim()) {
      setLocalError("Please answer this question before continuing.");
      return;
    }
    setLocalError(null);
    if (step < INTAKE_QUESTIONS.length - 1) {
      setStep(step + 1);
    }
  };

  const handleGenerate = async () => {
    if (answeredCount < 3) {
      setLocalError("Please answer at least 3 questions to generate a comprehensive doctor report.");
      return;
    }
    setLocalError(null);
    const payload: IntakeAnswerItem[] = INTAKE_QUESTIONS.map((q, idx) => ({
      question: q.questionEn,
      answer: answers[idx].trim(),
    })).filter((item) => item.answer.length > 0);

    await onSubmitAnswers(payload);
  };

  const handleReset = () => {
    setStep(0);
    setAnswers(["", "", "", "", ""]);
    setLocalError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90dvh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                Guided Doctor Report Intake (5 Questions)
              </h3>
              <p className="text-xs text-slate-500 truncate">
                Answer 3–5 clinical questions to synthesize a structured SBAR summary
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

        {/* Progress Bar & Step Indicators */}
        <div className="px-4 sm:px-6 pt-4 pb-2 space-y-2.5 shrink-0">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
            <span>
              Question {step + 1} of {INTAKE_QUESTIONS.length}
            </span>
            <span className="text-teal-700 font-bold">
              {answeredCount}/{INTAKE_QUESTIONS.length} Answered
            </span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-teal-600 rounded-full transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="flex items-center gap-1.5 pt-1">
            {INTAKE_QUESTIONS.map((q, idx) => {
              const isDone = answers[idx].trim().length > 0;
              const isCurrent = idx === step;
              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setStep(idx)}
                  className={`flex-1 py-1.5 min-h-[34px] rounded-lg text-[11px] font-bold border transition-all flex items-center justify-center gap-1 ${
                    isCurrent
                      ? "bg-teal-600 text-white border-teal-600 shadow-2xs"
                      : isDone
                      ? "bg-teal-50 text-teal-800 border-teal-200"
                      : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {isDone && !isCurrent && <CheckCircle2 className="w-3 h-3 text-teal-600" />}
                  <span>Q{idx + 1}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Question Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {hasAttachedLabReport && (
            <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-200 text-xs text-sky-900 flex items-center gap-2 font-medium">
              <FileText className="w-4 h-4 text-sky-600 shrink-0" />
              <span>Lab report findings will be automatically included in your SBAR report.</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm sm:text-base font-bold text-slate-900 block leading-snug">
              {currentQ.questionEn}
            </label>
          </div>

          {/* Quick-Select Chips */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Quick Responses (Tap to Add)
            </span>
            <div className="flex flex-wrap gap-2">
              {currentQ.quickChipsEn.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => appendChip(chip)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-lg text-xs font-medium bg-slate-50 hover:bg-teal-50 text-slate-700 hover:text-teal-800 border border-slate-200 hover:border-teal-300 transition-colors"
                >
                  <Sparkles className="w-3 h-3 text-teal-600 shrink-0" />
                  <span>{chip}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Answer Input + Voice Dictation */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">Your Answer</span>
              <VoiceButton
                onTranscript={(spoken) => {
                  const existing = answers[step].trim();
                  updateCurrentAnswer(existing ? `${existing} ${spoken}` : spoken);
                }}
              />
            </div>
            <textarea
              rows={3}
              value={answers[step]}
              onChange={(e) => updateCurrentAnswer(e.target.value)}
              placeholder={currentQ.placeholderEn}
              className="w-full rounded-xl border border-slate-200 p-3.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
            />
          </div>

          {localError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700">
              {localError}
            </div>
          )}
        </div>

        {/* Footer Controls */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleReset}
              disabled={isGenerating}
              className="gap-1 text-xs min-h-[40px]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {step > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setStep(step - 1)}
                disabled={isGenerating}
                className="gap-1 min-h-[40px]"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </Button>
            )}

            {step < INTAKE_QUESTIONS.length - 1 && (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleNext}
                disabled={isGenerating}
                className="gap-1 min-h-[40px]"
              >
                <span>Next</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            )}

            {(step === INTAKE_QUESTIONS.length - 1 || answeredCount >= 3) && (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleGenerate}
                disabled={isGenerating || answeredCount < 3}
                className="gap-1.5 min-h-[40px] bg-teal-700 hover:bg-teal-800 shadow-sm"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Generating SBAR...</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    <span>Generate Doctor Report</span>
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
