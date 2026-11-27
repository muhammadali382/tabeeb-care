"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  HeartPulse,
  LogIn,
  AlertCircle,
  Eye,
  EyeOff,
  ShieldCheck,
  Lock,
  Activity,
  CheckCircle2,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading, login } = useUser();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthLoading && user) {
      router.replace("/dashboard");
    }
  }, [isAuthLoading, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      setError("Please enter both your email address and password.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: cleanEmail, password }),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        login(data.user, data.profile);
        router.replace("/dashboard");
      } else {
        setError(data.error || "Invalid email or password.");
      }
    } catch {
      setError("Network error while signing in. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-4 sm:py-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
        {/* Left Product Value & Security Panel (Desktop) */}
        <div className="hidden lg:flex lg:col-span-6 flex-col space-y-6 pr-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold w-fit">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span>Protected Patient Health Portal</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Welcome back to <span className="text-teal-600">TabeebCare</span>
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              Access your longitudinal health profile, medication conflict alerts, past triage consultations, and doctor-ready SBAR handover reports.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {[
              {
                icon: Lock,
                title: "Encrypted Session Security",
                desc: "Salted scrypt credentials and signed HttpOnly session cookies protect your account.",
              },
              {
                icon: Activity,
                title: "Personalized Safety Cross-Checks",
                desc: "Every prescription scan and symptom assessment checks against your recorded allergies.",
              },
              {
                icon: CheckCircle2,
                title: "Full Consultation History",
                desc: "Review saved triage timelines, lab breakdowns, and medication schedules anytime.",
              },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs"
                >
                  <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 text-teal-600 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5">
                    <h2 className="text-xs font-bold text-slate-900">{item.title}</h2>
                    <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Sign-In Card */}
        <div className="lg:col-span-6 w-full max-w-md mx-auto">
          <Card className="rounded-3xl border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/70 p-5 sm:p-6 text-center space-y-2 border-b border-slate-100">
              <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center mx-auto shadow-xs">
                <HeartPulse className="w-6 h-6" />
              </div>
              <CardTitle className="text-xl font-bold text-slate-900">
                Sign in to TabeebCare
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Access your patient profile, medication checks, and triage history
              </CardDescription>
            </CardHeader>

            <CardContent className="p-5 sm:p-6 space-y-5">
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <Input
                  label="Email Address"
                  type="email"
                  name="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="min-h-[44px]"
                  required
                />

                <div className="relative">
                  <Input
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="pr-11 min-h-[44px]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-1.5 top-[28px] min-w-[38px] min-h-[38px] flex items-center justify-center text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {error && (
                  <div
                    role="alert"
                    className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2"
                  >
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isLoading}
                  className="w-full min-h-[46px] font-bold gap-2 bg-teal-600 hover:bg-teal-700"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </Button>
              </form>

              <div className="pt-3 border-t border-slate-100 text-center space-y-2">
                <p className="text-xs text-slate-500">
                  Don&apos;t have an account?{" "}
                  <Link href="/signup" className="text-teal-700 font-bold hover:underline">
                    Create Free Account
                  </Link>
                </p>
                <p className="text-[11px] text-slate-400">
                  By signing in, you agree to our{" "}
                  <Link href="/terms" className="underline hover:text-slate-600">
                    Terms
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="underline hover:text-slate-600">
                    Privacy Policy
                  </Link>
                  .
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
