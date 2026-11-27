"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
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
  History,
} from "lucide-react";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export default function TriagePage() {
  const router = useRouter();
  const { user, profile, isLoading: isUserLoading } = useUser();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentTriageLevel, setCurrentTriageLevel] = useState<string | null>(null);
  const [isMentalHealth, setIsMentalHealth] = useState(false);
  const [isSbarOpen, setIsSbarOpen] = useState(false);

  const [retrievalMeta, setRetrievalMeta] = useState<RetrievalMeta | null>(null);
  const [isExplainOpen, setIsExplainOpen] = useState(false);

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

  const starterChips = [
    {
      label: "Crushing Chest Pain & Breathing",
      value: "I have sudden crushing chest pain radiating to my left arm and shortness of breath.",
    },
    {
      label: "High Fever & Chills (2 Days)",
      value: "I have had a high fever with chills and body aches for the past 2 days.",
    },
    {
      label: "Pediatric Vomiting & Diarrhea",
      value: "My 4-year-old child has had vomiting and watery diarrhea for 2 days and looks lethargic.",
    },
    {
      label: "Severe Emotional Crisis Support",
      value: "I am experiencing overwhelming panic, hopelessness, and emotional distress right now.",
    },
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || isStreaming) return;

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

          const match = assistantResponse.match(/TRIAGE_LEVEL:\s*(\w+)/i);
          if (match) {
            const lvl = match[1].toLowerCase();
            detectedLevel = lvl;
            setCurrentTriageLevel(lvl);
          }

          if (
            assistantResponse.toLowerCase().includes("umang") ||
            assistantResponse.includes("0317")
          ) {
            setIsMentalHealth(true);
          }

          if (assistantResponse.trim()) {
            setMessages([...newMessages, { role: "assistant", content: assistantResponse }]);
          }
        }
      }

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
          content:
            "⚠️ Network connectivity issue. If this is an emergency, please dial 1122 immediately.",
        },
      ]);
    } finally {
      setIsStreaming(false);
      if (!hadError && !assistantResponse.trim()) {
        setMessages((prev) => [
          ...prev.filter((m) => m.content.trim().length > 0),
          {
            role: "assistant",
            content:
              "TRIAGE_LEVEL: emergency\n\nIf you are experiencing a medical or mental health emergency, please immediately call Rescue 1122 or the Umang Helpline at 0317-4288665. You are not alone and help is available.",
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
        err instanceof Error ? err.message : "Could not generate doctor report"
      );
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleChatReportClick = async () => {
    setReportNotice(null);

    if (structuredReport && userMessageCount < 3) {
      setIsSbarOpen(true);
      return;
    }

    if (userMessageCount < 3) {
      setReportNotice(
        `Comprehensive doctor reports require at least 3 answered questions (${userMessageCount}/3 answered so far). Keep chatting or click "Guided Doctor Report (5 Qs)".`
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
        err instanceof Error ? err.message : "Failed to synthesize doctor report"
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
      <div className="flex items-center justify-center min-h-[50dvh] text-slate-400 text-sm">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
          <span>Loading triage session...</span>
        </div>
      </div>
    );
  }

  const isEmergencyOrUrgent =
    currentTriageLevel === "emergency" || currentTriageLevel === "urgent";

  return (
    <div className="w-full space-y-5 sm:space-y-6 py-2">
      <MedicalDisclaimerModal featureKey="triage" />

      {/* Top Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200/90 pb-4">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <MessageSquareHeart className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight truncate">
                AI Symptom Triage
              </h1>
              <span className="text-xs text-teal-700 font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span>WHO-inspired clinical protocol context</span>
              </span>
            </div>
          </div>
        </div>

        {/* Action Header Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setReportNotice(null);
              setIsGuidedOpen(true);
            }}
            className="gap-1.5 text-xs font-bold shadow-xs min-h-[40px]"
          >
            <ClipboardList className="w-3.5 h-3.5 shrink-0" />
            <span>Guided Doctor Report (5 Qs)</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsReportScannerOpen(true)}
            className="gap-1.5 text-xs font-semibold shadow-2xs border-teal-200 text-teal-800 bg-white hover:bg-teal-50 min-h-[40px]"
          >
            <FileImage className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span>{attachedLabSummary ? "Lab Report ✓" : "Upload Report Image"}</span>
          </Button>

          {retrievalMeta && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExplainOpen(true)}
              className="gap-1.5 text-xs font-semibold shadow-2xs text-teal-700 bg-teal-50 hover:bg-teal-100 border-teal-200 min-h-[40px]"
            >
              <HelpCircle className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              <span>Why this result?</span>
            </Button>
          )}

          {(messages.length > 0 || structuredReport) && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => void handleChatReportClick()}
                disabled={isGeneratingReport}
                className="gap-1.5 text-xs font-semibold shadow-2xs min-h-[40px]"
              >
                {isGeneratingReport ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-600 shrink-0" />
                ) : (
                  <FileText className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                )}
                <span>
                  {structuredReport
                    ? "View Doctor Report"
                    : userMessageCount >= 3
                    ? "Generate SBAR Report"
                    : `SBAR Report (${userMessageCount}/3 Qs)`}
                </span>
              </Button>
              {messages.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  className="gap-1 text-xs text-slate-500 hover:text-slate-800 min-h-[40px]"
                  title="Reset Consultation"
                >
                  <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                  <span>Reset</span>
                </Button>
              )}
            </>
          )}

          <Link
            href="/history"
            className="inline-flex items-center gap-1.5 px-3 min-h-[40px] rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
          >
            <History className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span>History</span>
          </Link>
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
            className="text-xs gap-1.5 min-h-[40px]"
          >
            <ClipboardList className="w-3.5 h-3.5" />
            <span>Start 5-Question Intake</span>
          </Button>
        </div>
      )}

      {/* Workspace Layout: Chat First on Mobile (order-1), Sidebar Second (order-2); Left Sidebar + Right Chat on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Clinical Sidebar */}
        <aside className="order-2 lg:order-1 lg:col-span-4 space-y-4 min-w-0">
          {/* Active Patient Vitals Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <UserCheck className="w-4 h-4 text-teal-600 shrink-0" />
                <span className="font-bold text-xs uppercase tracking-wider text-slate-800 truncate">
                  Patient Context
                </span>
              </div>
              <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200/60 shrink-0">
                Profile Synced
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-50 gap-2">
                <span className="text-slate-400">Name</span>
                <strong className="text-slate-800 truncate">{user.name}</strong>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-50 gap-2">
                <span className="text-slate-400">Age / Gender</span>
                <strong className="text-slate-800">
                  {profile?.age ? `${profile.age} yrs` : "N/A"} • {profile?.gender || "Male"}
                </strong>
              </div>
              <div className="py-1 border-b border-slate-50 space-y-1">
                <span className="text-slate-400 block">Conditions</span>
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
                <span className="text-red-500 font-semibold block">Allergies</span>
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
              <PhoneCall className="w-4 h-4 text-red-600 shrink-0" />
              <span>Emergency Helplines</span>
            </div>

            <div className="space-y-2 text-xs">
              <a
                href="tel:1122"
                className="flex items-center justify-between p-2.5 min-h-[44px] rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition-all shadow-xs"
              >
                <span>Rescue 1122 Ambulance</span>
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded">Dial 1122</span>
              </a>

              <a
                href="tel:03174288665"
                className="flex items-center justify-between p-2.5 min-h-[44px] rounded-xl bg-white border border-red-200 text-red-900 hover:bg-red-50 font-semibold transition-all shadow-2xs"
              >
                <div className="flex items-center gap-1.5">
                  <HeartHandshake className="w-4 h-4 text-red-600 shrink-0" />
                  <span>Umang Crisis Line</span>
                </div>
                <span className="text-[11px] font-mono text-red-700">0317-4288665</span>
              </a>
            </div>
          </div>

          {/* Common Scenario Chips */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              Quick Symptom Scenarios
            </span>
            <div className="flex flex-col gap-2">
              {starterChips.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(chip.value)}
                  className="text-left p-2.5 min-h-[42px] rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-teal-50 hover:border-teal-300 text-xs text-slate-700 hover:text-teal-900 transition-all shadow-2xs flex items-center justify-between group"
                >
                  <span className="font-semibold line-clamp-1">{chip.label}</span>
                  <Sparkles className="w-3.5 h-3.5 text-teal-600 group-hover:scale-110 shrink-0 ml-1.5" />
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Live Triage Chat Area */}
        <div className="order-1 lg:order-2 lg:col-span-8 space-y-4 min-w-0">
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
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col h-[calc(100dvh-14rem)] min-h-[360px] max-h-[760px] overflow-hidden">
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
                      Describe Your Symptoms
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                      Type or dictate your symptoms below. TabeebCare cross-references clinical triage protocols with your saved health profile to assess urgency.
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
                      onOpenExplain={() => setIsExplainOpen(true)}
                    />
                  ))}

                  {isStreaming && (
                    <div className="flex items-center gap-2 text-xs text-teal-700 font-semibold p-2">
                      <div className="w-2 h-2 rounded-full bg-teal-600 animate-ping" />
                      <span>TabeebCare AI is analyzing symptoms...</span>
                    </div>
                  )}

                  <div className="h-8 shrink-0 pointer-events-none" aria-hidden="true" />
                  <div ref={messagesEndRef} className="h-1 shrink-0" />
                </>
              )}
            </div>

            {/* Input Bar with VoiceButton */}
            <div className="p-3 sm:p-4 bg-white border-t border-slate-200 shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <VoiceButton
                  onTranscript={(spoken) => {
                    setInputMessage((prev) => (prev ? `${prev} ${spoken}` : spoken));
                  }}
                />

                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  disabled={isStreaming}
                  placeholder="Describe your symptoms, duration, and severity..."
                  className="flex-1 min-w-0 min-h-[44px] rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-colors"
                />

                <Button
                  type="submit"
                  disabled={!inputMessage.trim() || isStreaming}
                  isLoading={isStreaming}
                  className="px-4 sm:px-6 min-h-[44px] font-bold gap-1.5 shadow-sm shrink-0"
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">Send</span>
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* SBAR Card Modal */}
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

      {/* Lab Report OCR Analyzer Modal */}
      <MedicalReportScanner
        isOpen={isReportScannerOpen}
        onClose={() => setIsReportScannerOpen(false)}
        onAttachToReport={(summaryText) => {
          setAttachedLabSummary(summaryText);
        }}
      />

      {/* Explainability Modal */}
      <ExplainabilityModal
        isOpen={isExplainOpen}
        onClose={() => setIsExplainOpen(false)}
        metadata={retrievalMeta}
      />
    </div>
  );
}
