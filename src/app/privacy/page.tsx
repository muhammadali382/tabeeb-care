import React from "react";
import Link from "next/link";
import { ShieldCheck, Lock, Database, FileText, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";

export default function PrivacyPage() {
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
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Privacy Policy
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              How TabeebCare handles your health profile, triage logs, and medication data.
            </p>
          </div>
        </div>
      </div>

      <Card className="rounded-2xl border-slate-200 shadow-sm">
        <CardContent className="p-5 sm:p-8 space-y-6 text-sm text-slate-700 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Database className="w-4 h-4 text-teal-600" />
              <span>1. Information You Provide</span>
            </h2>
            <p>
              When you register and use TabeebCare, we store your account details (name and email address), optional health profile fields (age, gender, chronic conditions, drug allergies, and current medications), symptom triage transcripts, and medication schedule checks so you can review your history across sessions.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-teal-600" />
              <span>2. Authentication & Session Security</span>
            </h2>
            <p>
              Passwords are salted and hashed with Node.js <code className="px-1.5 py-0.5 rounded bg-slate-100 text-xs">scrypt</code>. Authenticated sessions use signed <code className="px-1.5 py-0.5 rounded bg-slate-100 text-xs">HttpOnly</code> cookies to prevent client-side script access to session tokens.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-600" />
              <span>3. Document OCR & Voice Processing</span>
            </h2>
            <p>
              Uploaded prescription or lab report images are processed with local server-side OCR to extract text for clinical structuring. Voice dictation audio is transcribed on demand and is not retained as raw audio files.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">4. Your Control</h2>
            <p>
              You can update or clear your conditions, allergies, and medications at any time from your{" "}
              <Link href="/profile" className="text-teal-700 font-semibold hover:underline">
                Health Profile
              </Link>{" "}
              page, and export your consultation records from{" "}
              <Link href="/history" className="text-teal-700 font-semibold hover:underline">
                History
              </Link>
              .
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
