import React from "react";
import Link from "next/link";
import { Scale, AlertTriangle, PhoneCall, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 py-2">
      <div className="space-y-2 border-b border-slate-200 pb-5">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-800"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Terms & Conditions
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Clinical safety boundaries and responsible use of TabeebCare.
            </p>
          </div>
        </div>
      </div>

      <Card className="rounded-2xl border-slate-200 shadow-sm">
        <CardContent className="p-5 sm:p-8 space-y-6 text-sm text-slate-700 leading-relaxed">
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-amber-950">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm">
              <strong>Educational & Navigation Use Only:</strong> TabeebCare is an AI-assisted health literacy and symptom triage navigation tool. It does not provide medical diagnoses, prescriptions, or emergency medical dispatch.
            </p>
          </div>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-red-600" />
              <span>1. Emergency Escalation</span>
            </h2>
            <p>
              If you experience life-threatening symptoms (such as chest pain, severe shortness of breath, active bleeding, or neurological deficits) or a mental health crisis, do not wait for AI responses. Call <strong>Rescue 1122</strong>, contact the <strong>Umang Helpline (0317-4288665)</strong>, or proceed to the nearest emergency department immediately.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">2. Verification With a Clinician</h2>
            <p>
              Always verify AI-generated medication schedules, allergy alerts, lab report summaries, and SBAR handover cards with a licensed physician or pharmacist before starting, stopping, or changing any treatment.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">3. Account Responsibility</h2>
            <p>
              You are responsible for keeping your account credentials confidential and for ensuring the accuracy of the allergies and chronic conditions saved in your{" "}
              <Link href="/profile" className="text-teal-700 font-semibold hover:underline">
                Health Profile
              </Link>
              .
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
