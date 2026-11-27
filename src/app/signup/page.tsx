"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { UserPlus, AlertCircle, CheckCircle2, Eye, EyeOff, ShieldCheck } from "lucide-react";
import clsx from "clsx";

export default function SignupPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading, login } = useUser();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("Male");
  const [conditions, setConditions] = useState<string[]>([]);
  const [allergies, setAllergies] = useState("");
  const [medications, setMedications] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthLoading && user) {
      router.replace("/dashboard");
    }
  }, [isAuthLoading, user, router]);

  const conditionOptions = [
    "Type 2 Diabetes",
    "Hypertension (High BP)",
    "Asthma / Respiratory",
    "Ischemic Heart Disease",
    "Chronic Kidney Disease",
    "High Cholesterol",
  ];

  const toggleCondition = (cond: string) => {
    setConditions((prev) =>
      prev.includes(cond) ? prev.filter((c) => c !== cond) : [...prev, cond]
    );
  };

  const passwordStrength = useMemo(() => {
    if (!password) return { score: 0, label: "", color: "bg-slate-200" };
    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 10) score += 1;
    if (/[A-Z]/.test(password) && /[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 1) return { score: 1, label: "Weak", color: "bg-red-500" };
    if (score === 2) return { score: 2, label: "Fair", color: "bg-amber-500" };
    if (score === 3) return { score: 3, label: "Good", color: "bg-sky-500" };
    return { score: 4, label: "Strong", color: "bg-emerald-500" };
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (cleanName.length < 2) {
      setError("Please enter your full name (at least 2 characters).");
      return;
    }

    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    let parsedAge: number | null = null;
    if (age.trim() !== "") {
      const n = Number(age);
      if (!Number.isInteger(n) || n < 1 || n > 120) {
        setError("Age must be a valid whole number between 1 and 120.");
        return;
      }
      parsedAge = n;
    }

    if (!acceptedTerms) {
      setError("Please accept the Terms & Conditions and Medical Safety Disclaimer to continue.");
      return;
    }

    setIsLoading(true);
    setError(null);

    const allergyList = allergies
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const medList = medications
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: cleanName,
          email: cleanEmail,
          password,
          age: parsedAge,
          gender,
          conditions,
          allergies: allergyList,
          current_medications: medList,
        }),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        login(data.user, data.profile);
        router.replace("/dashboard");
      } else {
        setError(data.error || "Failed to register account.");
      }
    } catch {
      setError("Network error while creating your account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl w-full mx-auto py-4 sm:py-8">
      <Card className="rounded-3xl border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="bg-slate-50/70 p-5 sm:p-8 text-center space-y-2 border-b border-slate-100">
          <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center mx-auto shadow-xs">
            <UserPlus className="w-6 h-6" />
          </div>
          <CardTitle className="text-xl sm:text-2xl font-bold text-slate-900">
            Create Your Patient Account
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            Set up your personal health profile once so every prescription check and triage session automatically guards against allergies and drug interactions.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-5 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {/* Account Credentials */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-teal-700 border-b border-teal-100 pb-2">
                1. Account Credentials
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  type="text"
                  name="name"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sara Ahmed"
                  className="min-h-[44px]"
                  required
                />
                <Input
                  label="Email Address"
                  type="email"
                  name="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="sara@example.com"
                  className="min-h-[44px]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="relative">
                    <Input
                      label="Password (min 6 characters)"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a secure password"
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
                  {password && (
                    <div className="space-y-1 pt-0.5">
                      <div className="grid grid-cols-4 gap-1 h-1.5">
                        {[1, 2, 3, 4].map((lvl) => (
                          <div
                            key={lvl}
                            className={clsx(
                              "rounded-full transition-colors",
                              passwordStrength.score >= lvl
                                ? passwordStrength.color
                                : "bg-slate-200"
                            )}
                          />
                        ))}
                      </div>
                      <span className="text-[11px] font-medium text-slate-500 block">
                        Strength: <strong className="text-slate-700">{passwordStrength.label}</strong>
                      </span>
                    </div>
                  )}
                </div>

                <div className="relative">
                  <Input
                    label="Confirm Password"
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    className="pr-11 min-h-[44px]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                    className="absolute right-1.5 top-[28px] min-w-[38px] min-h-[38px] flex items-center justify-center text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Demographics */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-teal-700 border-b border-teal-100 pb-2">
                2. Demographics (Optional)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Age (Years)"
                  type="number"
                  min={1}
                  max={120}
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="e.g. 38"
                  className="min-h-[44px]"
                />
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 tracking-wide">
                    Gender
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 min-h-[44px] text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Health History & Allergies */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-teal-700 border-b border-teal-100 pb-2">
                3. Medical History &amp; Allergies (Optional)
              </h3>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Chronic Conditions
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {conditionOptions.map((item) => {
                    const isSelected = conditions.includes(item);
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => toggleCondition(item)}
                        className={clsx(
                          "flex items-center justify-between px-3.5 py-2.5 min-h-[44px] rounded-xl border text-xs font-medium transition-all text-left",
                          isSelected
                            ? "bg-teal-50 border-teal-500 text-teal-900 font-semibold shadow-2xs"
                            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                        )}
                      >
                        <span>{item}</span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <Input
                  label="Known Drug / Food Allergies"
                  type="text"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  placeholder="e.g. Penicillin, Sulfa, Peanuts"
                  helperText="Comma separated — checked automatically during medication scans"
                  className="min-h-[44px]"
                />
                <Input
                  label="Current Medications"
                  type="text"
                  value={medications}
                  onChange={(e) => setMedications(e.target.value)}
                  placeholder="e.g. Metformin 500mg, Amlodipine 5mg"
                  helperText="Comma separated — included in SBAR doctor handovers"
                  className="min-h-[44px]"
                />
              </div>
            </div>

            {/* Terms & Clinical Safety Acknowledgment */}
            <label className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 shrink-0"
              />
              <span className="text-xs text-slate-600 leading-relaxed">
                I understand that TabeebCare provides educational health literacy and triage navigation—not a medical diagnosis—and I agree to the{" "}
                <Link href="/terms" className="text-teal-700 font-semibold underline">
                  Terms &amp; Conditions
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-teal-700 font-semibold underline">
                  Privacy Policy
                </Link>
                .
              </span>
            </label>

            {error && (
              <div
                role="alert"
                className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full min-h-[48px] font-bold gap-2 shadow-sm"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Create Account &amp; Continue</span>
            </Button>

            <p className="text-center text-xs text-slate-500 pt-1">
              Already have an account?{" "}
              <Link href="/login" className="text-teal-700 font-bold hover:underline">
                Sign In
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
