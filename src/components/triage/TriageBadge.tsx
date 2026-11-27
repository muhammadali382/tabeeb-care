import React from "react";
import { AlertCircle, AlertTriangle, Clock, Home } from "lucide-react";
import clsx from "clsx";

export type TriageLevel = "emergency" | "urgent" | "routine" | "home";

interface TriageBadgeProps {
  level: TriageLevel | string;
  className?: string;
}

export function TriageBadge({ level, className }: TriageBadgeProps) {
  const normalizedLevel = (level || "routine").toLowerCase() as TriageLevel;

  const config = {
    emergency: {
      label: "EMERGENCY CARE",
      subtext: "Immediate ER or call 1122",
      icon: AlertCircle,
      bg: "bg-red-50 border-red-200 text-red-700",
      iconColor: "text-red-600",
    },
    urgent: {
      label: "URGENT CLINIC VISIT",
      subtext: "See a doctor today",
      icon: AlertTriangle,
      bg: "bg-amber-50 border-amber-200 text-amber-700",
      iconColor: "text-amber-600",
    },
    routine: {
      label: "ROUTINE APPOINTMENT",
      subtext: "Schedule within 2–3 days",
      icon: Clock,
      bg: "bg-sky-50 border-sky-200 text-sky-700",
      iconColor: "text-sky-600",
    },
    home: {
      label: "HOME CARE & MONITORING",
      subtext: "Rest, hydrate & monitor signs",
      icon: Home,
      bg: "bg-emerald-50 border-emerald-200 text-emerald-700",
      iconColor: "text-emerald-600",
    },
  }[normalizedLevel] || {
    label: "CLINICAL EVALUATION",
    subtext: "Consult healthcare provider",
    icon: Clock,
    bg: "bg-slate-100 border-slate-200 text-slate-700",
    iconColor: "text-slate-500",
  };

  const Icon = config.icon;

  return (
    <div
      className={clsx(
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border shadow-2xs font-sans",
        config.bg,
        className
      )}
    >
      <Icon className={clsx("w-4 h-4 shrink-0 animate-pulse", config.iconColor)} />
      <div className="flex flex-col">
        <span className="text-xs font-bold tracking-wide uppercase leading-tight">
          {config.label}
        </span>
        <span className="text-[11px] opacity-80 leading-tight">
          {config.subtext}
        </span>
      </div>
    </div>
  );
}
