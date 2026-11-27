"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  UserCheck,
  ShieldAlert,
  Plus,
  X,
  Check,
  Save,
  AlertTriangle,
  Mail,
  History,
  LayoutDashboard,
  ShieldCheck,
} from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const { user, profile, updateProfile, isLoading: isUserLoading } = useUser();

  const [age, setAge] = useState<string>("");
  const [gender, setGender] = useState<string>("Male");
  const [conditions, setConditions] = useState<string[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [medications, setMedications] = useState<string[]>([]);

  const [newConditionInput, setNewConditionInput] = useState("");
  const [newAllergyInput, setNewAllergyInput] = useState("");
  const [newMedInput, setNewMedInput] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/login");
    }
  }, [user, isUserLoading, router]);

  useEffect(() => {
    if (profile) {
      setAge(profile.age ? String(profile.age) : "");
      setGender(profile.gender || "Male");
      setConditions(profile.conditions || []);
      setAllergies(profile.allergies || []);
      setMedications(profile.current_medications || []);
    }
  }, [profile]);

  const handleAddCondition = () => {
    const val = newConditionInput.trim();
    if (val && !conditions.includes(val)) {
      setConditions([...conditions, val]);
      setNewConditionInput("");
    }
  };

  const handleRemoveCondition = (cond: string) => {
    setConditions(conditions.filter((c) => c !== cond));
  };

  const handleAddAllergy = () => {
    const val = newAllergyInput.trim();
    if (val && !allergies.includes(val)) {
      setAllergies([...allergies, val]);
      setNewAllergyInput("");
    }
  };

  const handleRemoveAllergy = (allergy: string) => {
    setAllergies(allergies.filter((a) => a !== allergy));
  };

  const handleAddMed = () => {
    const val = newMedInput.trim();
    if (val && !medications.includes(val)) {
      setMedications([...medications, val]);
      setNewMedInput("");
    }
  };

  const handleRemoveMed = (med: string) => {
    setMedications(medications.filter((m) => m !== med));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    const ok = await updateProfile({
      age: age ? Number(age) : null,
      gender,
      conditions,
      allergies,
      current_medications: medications,
    });

    setIsSaving(false);
    if (ok) {
      setSuccessMessage("Your health profile has been saved and synced.");
      setTimeout(() => setSuccessMessage(null), 4000);
    } else {
      setErrorMessage("Failed to save profile changes. Please try again.");
    }
  };

  if (isUserLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[50dvh] text-slate-400 text-sm">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
          <span>Loading patient profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 py-2 max-w-6xl mx-auto">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <UserCheck className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Health Profile & Settings
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Personal clinical context for triage & medication safety
            </p>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
          Your saved conditions, allergies, and current medications are automatically included when analyzing prescriptions or assessing symptoms.
        </p>
      </div>

      {/* Notification Banners */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs sm:text-sm flex items-center gap-2.5 animate-in fade-in duration-200">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{successMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div
          role="alert"
          className="p-4 rounded-xl bg-red-50 border border-red-300 text-red-800 text-xs sm:text-sm flex items-center gap-2.5 animate-in fade-in duration-200"
        >
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          <span className="font-semibold">{errorMessage}</span>
        </div>
      )}

      {/* 2-Column Product Settings Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Account Overview */}
        <aside className="lg:col-span-4 space-y-4">
          <Card className="rounded-2xl border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/70 p-5 border-b border-slate-100">
              <CardTitle className="text-base font-bold text-slate-800">
                Account Overview
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Signed-in patient account details
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-teal-100 text-teal-800 font-bold text-base flex items-center justify-center shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5 truncate">
                    <Mail className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{user.email}</span>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="text-base font-bold text-slate-800">{conditions.length}</div>
                  <div className="text-[11px] text-slate-500">Conditions</div>
                </div>
                <div className="p-2 rounded-lg bg-red-50/60 border border-red-100">
                  <div className="text-base font-bold text-red-700">{allergies.length}</div>
                  <div className="text-[11px] text-red-600">Allergies</div>
                </div>
                <div className="p-2 rounded-lg bg-sky-50/60 border border-sky-100">
                  <div className="text-base font-bold text-sky-700">{medications.length}</div>
                  <div className="text-[11px] text-sky-600">Meds</div>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 px-3 py-2.5 min-h-[40px] rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 border border-slate-200 transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>Back to Dashboard</span>
                </Link>
                <Link
                  href="/history"
                  className="flex items-center gap-2 px-3 py-2.5 min-h-[40px] rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 border border-slate-200 transition-colors"
                >
                  <History className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>View Consultation History</span>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-teal-200 bg-teal-50/40 shadow-sm">
            <CardContent className="p-4 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
              <p className="text-xs text-teal-900 leading-relaxed">
                Keep your allergy list up to date. Every prescription analysis cross-checks your reported allergies automatically.
              </p>
            </CardContent>
          </Card>
        </aside>

        {/* Right Column: Editable Health Profile Form */}
        <form onSubmit={handleSave} className="lg:col-span-8 space-y-6">
          {/* Section 1: Demographics */}
          <Card className="rounded-2xl border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/70 p-5 sm:p-6 border-b border-slate-100">
              <CardTitle className="text-base font-bold text-slate-800">
                Basic Information
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Age and biological sex help calibrate medication guidance and triage thresholds.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Age (years)"
                type="number"
                min="1"
                max="120"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="e.g. 42"
              />
              <div className="space-y-1">
                <label
                  htmlFor="profile-gender"
                  className="block text-xs font-semibold text-slate-700 uppercase tracking-wider"
                >
                  Gender
                </label>
                <select
                  id="profile-gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="flex h-11 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-colors"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Chronic Conditions */}
          <Card className="rounded-2xl border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/70 p-5 sm:p-6 border-b border-slate-100">
              <CardTitle className="text-base font-bold text-slate-800">
                Chronic Conditions
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                e.g. Type 2 Diabetes, Hypertension, Asthma, Ischemic Heart Disease.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={newConditionInput}
                  onChange={(e) => setNewConditionInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddCondition();
                    }
                  }}
                  placeholder="Type condition and click Add..."
                  className="flex-1 min-h-[44px] rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddCondition}
                  className="min-h-[44px] shrink-0"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {conditions.length > 0 ? (
                  conditions.map((c, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200"
                    >
                      <span>{c}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCondition(c)}
                        aria-label={`Remove ${c}`}
                        className="text-teal-600 hover:text-red-600 p-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 italic">None reported</span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Drug & Substance Allergies */}
          <Card className="rounded-2xl border-red-200 shadow-sm overflow-hidden">
            <CardHeader className="bg-red-50/40 p-5 sm:p-6 border-b border-red-100">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-600 shrink-0" />
                <CardTitle className="text-base font-bold text-red-950">
                  Drug & Substance Allergies
                </CardTitle>
              </div>
              <CardDescription className="text-xs text-red-700/80">
                Crucial: TabeebCare checks these against every prescription scan to flag dangerous reactions.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={newAllergyInput}
                  onChange={(e) => setNewAllergyInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddAllergy();
                    }
                  }}
                  placeholder="e.g. Penicillin, Sulfa, Aspirin..."
                  className="flex-1 min-h-[44px] rounded-lg border border-red-200 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-400/20 focus:border-red-500"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddAllergy}
                  className="min-h-[44px] shrink-0"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {allergies.length > 0 ? (
                  allergies.map((a, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300"
                    >
                      <span>{a}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAllergy(a)}
                        aria-label={`Remove ${a}`}
                        className="text-red-600 hover:text-red-900 p-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 italic">None reported</span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Section 4: Current Medications */}
          <Card className="rounded-2xl border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/70 p-5 sm:p-6 border-b border-slate-100">
              <CardTitle className="text-base font-bold text-slate-800">
                Current Medications
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Prescriptions you currently take regularly (e.g. Metformin 500mg, Amlodipine 5mg).
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={newMedInput}
                  onChange={(e) => setNewMedInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddMed();
                    }
                  }}
                  placeholder="e.g. Metformin 500mg, Amlodipine 5mg..."
                  className="flex-1 min-h-[44px] rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddMed}
                  className="min-h-[44px] shrink-0"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {medications.length > 0 ? (
                  medications.map((m, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-800 border border-sky-200"
                    >
                      <span>{m}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveMed(m)}
                        aria-label={`Remove ${m}`}
                        className="text-sky-600 hover:text-red-600 p-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 italic">None reported</span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              isLoading={isSaving}
              size="lg"
              className="w-full sm:w-auto min-h-[44px] font-bold gap-2 shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? "Saving..." : "Save Profile"}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
