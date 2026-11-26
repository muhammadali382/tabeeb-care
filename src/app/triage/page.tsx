"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { ChatBubble } from "@/components/triage/ChatBubble";
import { EmergencyBanner } from "@/components/triage/EmergencyBanner";
import { CrisisGuardrailBanner } from "@/components/triage/CrisisGuardrailBanner";
import { SbarCard, StructuredDoctorReport } from "@/components/triage/SbarCard";
import { GuidedIntakeModal, IntakeAnswerItem } from "@/components/triage/GuidedIntakeModal";
import { MedicalReportScanner } from "@/components/triage/MedicalReportScanner";
import { ExplainabilityModal, RetrievalMeta } from "@/components/triage/ExplainabilityModal";
import { VoiceButton } from "@/components/ui/VoiceButton";
import { MedicalDisclaimerModal } from "@/components/layout/MedicalDisclaimer";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { checkSafetyGuardrails } from "@/lib/guardrails";
import {
  MessageSquareHeart,
  Send,
  Sparkles,
  FileText,
  RotateCcw,
  Bot,
  ShieldCheck,
  PhoneCall,
  HeartHandshake,
  UserCheck,
  HelpCircle,
  ClipboardList,
  FileImage,
  Loader2,
} from "lucide-react";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export default function TriagePage() {
  const router = useRouter();
  const { user, profile, isLoading: isUserLoading, lang, t } = useUser();
  const isUrdu = lang === "ur";

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentTriageLevel, setCurrentTriageLevel] = useState<string | null>(null);
  const [isMentalHealth, setIsMentalHealth] = useState(false);
  const [isSbarOpen, setIsSbarOpen] = useState(false);

  // Feature 2: Explainability metadata state
  const [retrievalMeta, setRetrievalMeta] = useState<RetrievalMeta | null>(null);
  const [isExplainOpen, setIsExplainOpen] = useState(false);

  // Multi-Question Doctor Report & Lab Image Analyzer state
  const [isGuidedOpen, setIsGuidedOpen] = useState(false);
  const [isReportScannerOpen, setIsReportScannerOpen] = useState(false);
  const [attachedLabSummary, setAttachedLabSummary] = useState<string | null>(null);
  const [structuredReport, setStructuredReport] = useState<StructuredDoctorReport | null>(null);
  const [reportAnsweredCount, setReportAnsweredCount] = useState<number>(0);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportNotice, setReportNotice] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/login");
    }
  }, [user, isUserLoading, router]);

  const scrollToBottom = useCallback((instant = false) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: instant ? "auto" : "smooth",
      });
    }
  }, []);

  useEffect(() => {
    if (isStreaming) {
      scrollToBottom(true);
    } else {
      scrollToBottom(false);
    }
  }, [messages, isStreaming, scrollToBottom]);

  // Hackathon clinical scenario prompt chips
  const starterChips = [
    {
      label: isUrdu ? "سینے میں شدید درد (ایمرجنسی)" : "Crushing Chest Pain & Breathing",
      value: "I have sudden crushing chest pain radiating to left arm and shortness of breath.",
      isEmergency: true,
    },
    {
      label: isUrdu ? "تیز بخار اور سردی (2 دن)" : "Tez Bukhar (2 days)",
      value: "Mujhe 2 din se tez bukhar hai aur thand lag rahi hai.",
    },
    {
      label: isUrdu ? "بچے کو الٹی اور دست" : "Pediatric Vomiting & Diarrhea",
      value: "Mere bacha ko 2 din se ulti aur dast ho rahe hain aur wo sust hai.",
    },
    {
      label: isUrdu ? "ذہنی دباؤ اور پریشانی (امنگ ہیلپ لائن)" : "Severe Emotional Crisis Support",
      value: "Mujhe bohat shadeed depression aur khauf mehsoos ho raha hai.",
    },
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || isStreaming) return;

    // Run client-side safety guardrails immediately
    const guardrailCheck = checkSafetyGuardrails(text);
    if (guardrailCheck.isSelfHarmOrCrisis) {
      setIsMentalHealth(true);
      setCurrentTriageLevel("emergency");
    } else if (guardrailCheck.isAcuteMedicalEmergency) {
      setCurrentTriageLevel("emergency");
    }

    const newMessages: Message[] = [...messages, { role: "user", content: text.trim() }];
    setMessages(newMessages);
    setInputMessage("");
    setIsStreaming(true);

    let assistantResponse = "";
    let detectedLevel: string | null = currentTriageLevel;
    let hadError = false;

    try {
      const res = await fetch("/api/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          messages: newMessages,
          userId: user?.id,
          profile,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to connect to triage service");
      }

      if (!res.body) {
        throw new Error("No response body received");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let rawBuffer = "";
      let metaCaptured = false;

      let done = false;
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          rawBuffer += chunk;

          // Parse the first SSE event for retrieval metadata without breaking tokens
          if (!metaCaptured) {
            const metaMatch = rawBuffer.match(/^data:\s*({[\s\S]*?})\n\n/);
            if (metaMatch) {
              try {
                const parsed = JSON.parse(metaMatch[1]);
                if (parsed.type === "meta") {
                  setRetrievalMeta(parsed);
                  metaCaptured = true;
                  rawBuffer = rawBuffer.slice(metaMatch[0].length);
                }
              } catch (e) {
                console.warn("Failed to parse retrieval meta event:", e);
              }
            }
          }

          assistantResponse = rawBuffer;

          // Detect TRIAGE_LEVEL: emergency from stream
          const match = assistantResponse.match(/TRIAGE_LEVEL:\s*(\w+)/i);
          if (match) {
            const lvl = match[1].toLowerCase();
            detectedLevel = lvl;
            setCurrentTriageLevel(lvl);
          }

          // Check for mental health guidance in response
          if (
            assistantResponse.toLowerCase().includes("umang") ||
            assistantResponse.includes("0317")
          ) {
            setIsMentalHealth(true);
          }

          // Update messages only when tokens actually arrive
          if (assistantResponse.trim()) {
            setMessages([...newMessages, { role: "assistant", content: assistantResponse }]);
          }
        }
      }

      // Persist completed triage session for authenticated users
      if (assistantResponse.trim() && user) {
        const fullThread: Message[] = [
          ...newMessages,
          { role: "assistant", content: assistantResponse },
        ];
        fetch("/api/triage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            messages: fullThread,
            userId: user.id,
            saveSession: true,
            triageLevel: detectedLevel,
          }),
        }).catch(() => {});
      }
    } catch {
      hadError = true;
      setMessages((prev) => [
        ...prev.filter((m) => m.content.trim().length > 0),
        {
          role: "assistant",
          content: isUrdu
            ? "⚠️ نیٹ ورک میں رکاوٹ آئی ہے۔ اگر یہ ہنگامی صورتحال ہے تو براہ کرم فوری طور پر 1122 پر کال کریں۔"
            : "⚠️ Network connectivity issue. If this is an emergency, please dial 1122 immediately.",
        },
      ]);
    } finally {
      setIsStreaming(false);
      // Ensure if the stream completed cleanly with an empty response, provide a safe fallback
      if (!hadError && !assistantResponse.trim()) {
        setMessages((prev) => [
          ...prev.filter((m) => m.content.trim().length > 0),
          {
            role: "assistant",
            content: isUrdu
              ? "TRIAGE_LEVEL: emergency\n\nاگر آپ کسی ہنگامی یا شدید ذہنی دباؤ کی صورتحال میں ہیں، تو براہِ کرم فوری طور پر ریسکیو 1122 یا امنگ ہیلپ لائن (0317-4288665) پر رابطہ کریں۔ آپ اکیلے نہیں ہیں۔"
              : "TRIAGE_LEVEL: emergency\n\nIf you are experiencing a medical or mental health emergency, please immediately call Rescue 1122 or the Umang Helpline at 0317-4288665. You are not alone and help is available.",
          },
        ]);
        setCurrentTriageLevel("emergency");
      }
    }
  };

  const userMessageCount = messages.filter((m) => m.role === "user").length;

  const handleGuidedReportSubmit = async (intakeAnswers: IntakeAnswerItem[]) => {
    setIsGeneratingReport(true);
    setReportNotice(null);
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          userId: user?.id,
          intakeAnswers,
          labReportSummary: attachedLabSummary,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.report) {
        throw new Error(data.error || "Failed to generate doctor report");
      }

      setStructuredReport(data.report);
      setReportAnsweredCount(data.answeredCount || intakeAnswers.length);
      if (data.report.triage_level) {
        setCurrentTriageLevel(String(data.report.triage_level).toLowerCase());
      }
      setIsGuidedOpen(false);
      setIsSbarOpen(true);
    } catch (err) {
      setReportNotice(
        err instanceof Error
          ? err.message
          : isUrdu
          ? "ڈاکٹر رپورٹ تیار کرنے میں مسئلہ آیا"
          : "Could not generate doctor report"
      );
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleChatReportClick = async () => {
    setReportNotice(null);

    // If a multi-question structured report was already generated, reopen it directly
    if (structuredReport && userMessageCount < 3) {
      setIsSbarOpen(true);
      return;
    }

    // Enforce multi-question intake (>= 3 answered turns) — never on 1 question only
    if (userMessageCount < 3) {
      setReportNotice(
        isUrdu
          ? `مکمل ڈاکٹر رپورٹ کے لیے کم از کم 3 سوالات کے جوابات ضروری ہیں (ابھی ${userMessageCount}/3 مکمل)۔ آپ اوپر "ڈاکٹر رپورٹ (5 سوالات)" بھی استعمال کر سکتے ہیں۔`
          : `Comprehensive doctor reports require at least 3 answered questions (${userMessageCount}/3 answered so far). Keep chatting or click "Guided Doctor Report (5 Qs)"!`
      );
      return;
    }

    setIsGeneratingReport(true);
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          userId: user?.id,
          messages,
          labReportSummary: attachedLabSummary,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.report) {
        throw new Error(data.error || "Failed to synthesize doctor report");
      }

      setStructuredReport(data.report);
      setReportAnsweredCount(data.answeredCount || userMessageCount);
      if (data.report.triage_level) {
        setCurrentTriageLevel(String(data.report.triage_level).toLowerCase());
      }
      setIsSbarOpen(true);
    } catch (err) {
      setReportNotice(
        err instanceof Error
          ? err.message
          : isUrdu
          ? "ڈاکٹر رپورٹ تیار نہیں ہو سکی"
          : "Failed to synthesize doctor report"
      );
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleReset = () => {
    setMessages([]);
    setCurrentTriageLevel(null);
    setIsMentalHealth(false);
    setInputMessage("");
    setRetrievalMeta(null);
    setIsExplainOpen(false);
    setStructuredReport(null);
    setReportAnsweredCount(0);
    setReportNotice(null);
  };

  if (isUserLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-slate-400 text-sm">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin" />
          <span>{isUrdu ? "ٹریآج سروس لوڈ ہو رہی ہے..." : "Loading triage session..."}</span>
        </div>
      </div>
    );
  }

  const isEmergencyOrUrgent =
    currentTriageLevel === "emergency" || currentTriageLevel === "urgent";

  return (
    <div className="w-full space-y-6 py-2">
      <MedicalDisclaimerModal featureKey="triage" />

      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/90 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <MessageSquareHeart className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                {t("triage_title")}
              </h1>
              <span className="text-xs text-teal-700 font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                WHO-inspired clinical protocol Context • RAG Powered
              </span>
            </div>
          </div>
        </div>

        {/* Action Header Buttons */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
          {/* Guided Multi-Question Doctor Report Intake */}
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setReportNotice(null);
              setIsGuidedOpen(true);
            }}
            className="gap-1.5 text-xs font-bold shadow-xs"
          >
            <ClipboardList className="w-3.5 h-3.5" />
            <span>{isUrdu ? "ڈاکٹر رپورٹ (5 سوالات)" : "Guided Doctor Report (5 Qs)"}</span>
          </Button>

          {/* Upload & Analyze Lab Report Image (OCR) */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsReportScannerOpen(true)}
            className="gap-1.5 text-xs font-semibold shadow-2xs border-teal-200 text-teal-800 bg-white hover:bg-teal-50"
          >
            <FileImage className="w-3.5 h-3.5 text-teal-600" />
            <span>
              {attachedLabSummary
                ? isUrdu
                  ? "لیب رپورٹ منسلک ✓"
                  : "Lab Report ✓"
                : isUrdu
                ? "لیب رپورٹ اپ لوڈ (OCR)"
                : "Upload Report Image"}
            </span>
          </Button>

          {retrievalMeta && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExplainOpen(true)}
              className="gap-1.5 text-xs font-semibold shadow-2xs text-teal-700 bg-teal-50 hover:bg-teal-100 border-teal-200"
            >
              <HelpCircle className="w-3.5 h-3.5 text-teal-600" />
              <span>{isUrdu ? "وجہ جانیں" : "Why this result?"}</span>
            </Button>
          )}

          {(messages.length > 0 || structuredReport) && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => void handleChatReportClick()}
                disabled={isGeneratingReport}
                className="gap-1.5 text-xs font-semibold shadow-2xs"
              >
                {isGeneratingReport ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-600" />
                ) : (
                  <FileText className="w-3.5 h-3.5 text-teal-600" />
                )}
                <span>
                  {structuredReport
                    ? isUrdu
                      ? "ڈاکٹر کارڈ دیکھیں (SBAR)"
                      : "View Doctor Report"
                    : userMessageCount >= 3
                    ? isUrdu
                      ? "ڈاکٹر رپورٹ بنائیں (SBAR)"
                      : "Generate SBAR Report"
                    : isUrdu
                    ? `رپورٹ (${userMessageCount}/3 سوالات)`
                    : `SBAR Report (${userMessageCount}/3 Qs)`}
                </span>
              </Button>
              {messages.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  className="gap-1 text-xs text-slate-500 hover:text-slate-800"
                  title={t("triage_btn_reset")}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{t("triage_btn_reset")}</span>
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Multi-Question Requirement Notice */}
      {reportNotice && (
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-xs sm:text-sm text-amber-950 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
          <span className="font-semibold">{reportNotice}</span>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setReportNotice(null);
              setIsGuidedOpen(true);
            }}
            className="text-xs gap-1.5"
          >
            <ClipboardList className="w-3.5 h-3.5" />
            <span>{isUrdu ? "5 سوالات شروع کریں" : "Start 5-Question Intake"}</span>
          </Button>
        </div>
      )}

      {/* Full-Width Workspace Layout: Left Sidebar + Right Live Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Clinical Sidebar (4 Columns on Desktop) */}
        <aside className="lg:col-span-4 space-y-4">
          {/* Active Patient Vitals Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-teal-600" />
                <span className="font-bold text-xs uppercase tracking-wider text-slate-800">
                  {isUrdu ? "مریض کا ریکارڈ" : "Patient Context"}
                </span>
              </div>
              <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200/60">
                Profile Synced
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-50">
                <span className="text-slate-400">{isUrdu ? "مریض" : "Name"}</span>
                <strong className="text-slate-800">{user.name}</strong>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-50">
                <span className="text-slate-400">{isUrdu ? "عمر و جنس" : "Age/Gender"}</span>
                <strong className="text-slate-800">
                  {profile?.age ? `${profile.age} yrs` : "N/A"} • {profile?.gender || "Male"}
                </strong>
              </div>
              <div className="py-1 border-b border-slate-50 space-y-1">
                <span className="text-slate-400 block">{isUrdu ? "دائمی بیماریاں" : "Conditions"}</span>
                <div className="flex flex-wrap gap-1">
                  {profile?.conditions && profile.conditions.length > 0 ? (
                    profile.conditions.map((c, i) => (
                      <Badge key={i} variant="primary" size="sm">
                        {c}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-slate-400 italic">None reported</span>
                  )}
                </div>
              </div>
              <div className="py-1 space-y-1">
                <span className="text-red-500 font-semibold block">{isUrdu ? "معلوم الرجیز" : "Allergies"}</span>
                <div className="flex flex-wrap gap-1">
                  {profile?.allergies && profile.allergies.length > 0 ? (
                    profile.allergies.map((a, i) => (
                      <Badge key={i} variant="emergency" size="sm">
                        {a}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-slate-400 italic">None reported</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Safety & Emergency Hotlines Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-red-50/70 to-rose-50/40 border border-red-200 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 text-red-900 font-bold text-xs uppercase tracking-wider">
              <PhoneCall className="w-4 h-4 text-red-600" />
              <span>{isUrdu ? "ہنگامی ہیلپ لائنز (پاکستان)" : "Emergency Helplines"}</span>
            </div>

            <div className="space-y-2 text-xs">
              <a
                href="tel:1122"
                className="flex items-center justify-between p-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition-all shadow-xs"
              >
                <span>Rescue 1122 Ambulance</span>
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded">Dial 1122</span>
              </a>

              <a
                href="tel:03174288665"
                className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-red-200 text-red-900 hover:bg-red-50 font-semibold transition-all shadow-2xs"
              >
                <div className="flex items-center gap-1.5">
                  <HeartHandshake className="w-4 h-4 text-red-600" />
                  <span>Umang Crisis Line</span>
                </div>
                <span className="text-[11px] font-mono text-red-700">0317-4288665</span>
              </a>
            </div>
          </div>

          {/* Common Scenario Chips */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              {t("triage_starter_label")}
            </span>
            <div className="flex flex-col gap-2">
              {starterChips.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(chip.value)}
                  className="text-left p-2.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-teal-50 hover:border-teal-300 text-xs text-slate-700 hover:text-teal-900 transition-all shadow-2xs flex items-center justify-between group active:scale-98"
                >
                  <span className="font-semibold line-clamp-1">{chip.label}</span>
                  <Sparkles className="w-3.5 h-3.5 text-teal-600 group-hover:scale-110 shrink-0 ml-1.5" />
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Right Live Triage Chat Area (8 Columns on Desktop) */}
        <div className="lg:col-span-8 space-y-4">
          {/* FEATURE 1 & Safety Guardrail: Emergency / Urgent / Mental Health Banner */}
          {isEmergencyOrUrgent ? (
            <div className="animate-in fade-in slide-in-from-top-3 duration-300">
              <EmergencyBanner
                level={currentTriageLevel}
                isMentalHealth={isMentalHealth}
              />
            </div>
          ) : isMentalHealth ? (
            <div className="animate-in fade-in slide-in-from-top-3 duration-300">
              <CrisisGuardrailBanner />
            </div>
          ) : null}

          {/* Chat Window Container */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col h-[68vh] min-h-[480px] max-h-[750px] overflow-hidden">
            {/* Messages Scroll Area with guaranteed bottom clearance */}
            <div
              ref={scrollContainerRef}
              className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/40"
            >
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4 p-4 max-w-lg mx-auto">
                  <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center shadow-xs">
                    <Bot className="w-7 h-7" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-base font-bold text-slate-800">
                      {isUrdu ? "طبیب کیئر سے اپنی علامات شیئر کریں" : "Describe Your Symptoms"}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                      {isUrdu
                        ? "اردو، انگریزی یا رومن اردو میں اپنی علامات بتائیں۔ سسٹم ڈبلیو ایچ او پروٹوکول کے مطابق خطرے کا فوری تعین کرے گا۔"
                        : "Type or speak in Urdu or English. The AI cross-references WHO-inspired clinical protocols with your health profile to assess urgency."}
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((msg, i) => (
                    <ChatBubble
                      key={i}
                      role={msg.role}
                      content={msg.content}
                      lang={lang}
                      onOpenExplain={() => setIsExplainOpen(true)}
                    />
                  ))}

                  {isStreaming && (
                    <div className="flex items-center gap-2 text-xs text-teal-700 font-semibold p-2">
                      <div className="w-2 h-2 rounded-full bg-teal-600 animate-ping" />
                      <span>{isUrdu ? "طبیب کیئر تجزیہ کر رہا ہے..." : "TabeebCare AI is analyzing symptoms..."}</span>
                    </div>
                  )}

                  {/* Guaranteed clearance space above the input bar */}
                  <div className="h-14 shrink-0 pointer-events-none" aria-hidden="true" />
                  <div ref={messagesEndRef} className="h-1 shrink-0" />
                </>
              )}
            </div>

            {/* Input Bar with VoiceButton */}
            <div className="p-3.5 sm:p-4 bg-white border-t border-slate-200 shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                {/* FEATURE 3: Voice input button */}
                <VoiceButton
                  onTranscript={(spoken) => {
                    setInputMessage((prev) => (prev ? `${prev} ${spoken}` : spoken));
                  }}
                  defaultLang={isUrdu ? "ur-PK" : "en-US"}
                />

                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  disabled={isStreaming}
                  placeholder={t("triage_input_placeholder")}
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-colors"
                />

                <Button
                  type="submit"
                  disabled={!inputMessage.trim() || isStreaming}
                  isLoading={isStreaming}
                  className="px-5 sm:px-7 py-3 font-bold gap-1.5 shadow-sm"
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">{t("triage_btn_send")}</span>
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* SBAR Card Modal (Synthesized Multi-Question Report) */}
      <SbarCard
        isOpen={isSbarOpen}
        onClose={() => setIsSbarOpen(false)}
        patientName={user.name}
        patientAge={profile?.age}
        patientGender={profile?.gender}
        conditions={profile?.conditions}
        allergies={profile?.allergies}
        medications={profile?.current_medications}
        situation={messages.find((m) => m.role === "user")?.content || "Multi-question clinical intake"}
        assessment={messages.filter((m) => m.role === "assistant").pop()?.content || "Clinical evaluation"}
        triageLevel={currentTriageLevel || "Clinical Evaluation"}
        structuredReport={structuredReport}
        answeredQuestionsCount={reportAnsweredCount || userMessageCount}
      />

      {/* Guided 5-Question Doctor Report Intake Modal */}
      <GuidedIntakeModal
        isOpen={isGuidedOpen}
        onClose={() => setIsGuidedOpen(false)}
        onSubmitAnswers={handleGuidedReportSubmit}
        isGenerating={isGeneratingReport}
        hasAttachedLabReport={!!attachedLabSummary}
      />

      {/* Real Image Upload & Lab Report OCR Analyzer Modal */}
      <MedicalReportScanner
        isOpen={isReportScannerOpen}
        onClose={() => setIsReportScannerOpen(false)}
        onAttachToReport={(summaryText) => {
          setAttachedLabSummary(summaryText);
        }}
      />

      {/* FEATURE 2: Explainability Modal */}
      <ExplainabilityModal
        isOpen={isExplainOpen}
        onClose={() => setIsExplainOpen(false)}
        metadata={retrievalMeta}
      />
    </div>
  );
}
