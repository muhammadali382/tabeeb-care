"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import {
  HeartPulse,
  Pill,
  MessageSquareHeart,
  UserCheck,
  LogOut,
  Menu,
  X,
  Globe,
} from "lucide-react";
import clsx from "clsx";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, lang, setLang, t } = useUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isAuthPage = pathname === "/login" || pathname === "/signup";

  const navLinks = [
    { href: "/dashboard", label: t("nav_dashboard"), icon: HeartPulse },
    { href: "/meds", label: t("nav_meds"), icon: Pill },
    { href: "/triage", label: t("nav_triage"), icon: MessageSquareHeart },
    { href: "/profile", label: t("nav_profile"), icon: UserCheck },
  ];

  const handleLogout = async () => {
    await logout();
    setIsMobileMenuOpen(false);
    router.push("/");
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
      <div className="max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <Link
          href="/"
          onClick={closeMobileMenu}
          className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-teal-500 rounded-xl p-1"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-xs group-hover:bg-teal-700 transition-colors shrink-0">
            <HeartPulse className="w-5 h-5 sm:w-5 sm:h-5" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-slate-900 text-base sm:text-lg leading-tight tracking-tight">
                TabeebCare
              </span>
              <span className="text-[10px] font-semibold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200/70">
                SDG 3
              </span>
            </div>
            <span className="text-xs text-slate-400 font-medium">
              طبیب کیئر • AI صحت گائیڈ
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links (when logged in or on feature pages) */}
        {!isAuthPage && (
          <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
            {navLinks.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={clsx(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs lg:text-sm font-medium transition-all",
                    isActive
                      ? "bg-teal-50 text-teal-700 border border-teal-200 font-semibold shadow-2xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                  )}
                >
                  <Icon className={clsx("w-4 h-4", isActive ? "text-teal-600" : "text-slate-400")} />
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>
        )}

        {/* Right Actions: Language Switcher, User Badge, Mobile Hamburger */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Toggle Button */}
          <button
            onClick={() => setLang(lang === "en" ? "ur" : "en")}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all shadow-2xs focus:outline-none focus:ring-2 focus:ring-teal-500"
            title="Switch Language / زبان تبدیل کریں"
            aria-label="Switch Language"
          >
            <Globe className="w-3.5 h-3.5 text-teal-600" />
            <span className={clsx(lang === "ur" ? "text-teal-700 font-bold" : "text-slate-500")}>
              اردو
            </span>
            <span className="text-slate-300">/</span>
            <span className={clsx(lang === "en" ? "text-teal-700 font-bold" : "text-slate-500")}>
              EN
            </span>
          </button>

          {/* Desktop User Status & Auth Buttons */}
          {user ? (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                href="/profile"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100/90 text-slate-700 text-xs font-medium border border-slate-200 hover:bg-slate-200/70 transition-colors"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="max-w-[120px] truncate">{user.name.split(" ")[0]}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                title={t("nav_logout")}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            !isAuthPage && (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  {t("nav_signin")}
                </Link>
                <Link
                  href="/signup"
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-teal-600 text-white rounded-lg hover:bg-teal-700 shadow-xs transition-colors"
                >
                  {t("nav_signup")}
                </Link>
              </div>
            )
          )}

          {/* Mobile Hamburger Toggle Button */}
          {!isAuthPage && (
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
              aria-label={isMobileMenuOpen ? t("nav_close") : t("nav_menu")}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Navigation Drawer / Dropdown */}
      {isMobileMenuOpen && !isAuthPage && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3 shadow-lg animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-1">
            {navLinks.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={closeMobileMenu}
                  className={clsx(
                    "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors",
                    isActive
                      ? "bg-teal-50 text-teal-700 font-bold border border-teal-200"
                      : "text-slate-600 hover:bg-slate-50"
                  )}
                >
                  <Icon className={clsx("w-4 h-4", isActive ? "text-teal-600" : "text-slate-400")} />
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            {user ? (
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-semibold text-slate-700">{user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700 font-semibold px-2 py-1 rounded-lg hover:bg-red-50"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{t("nav_logout")}</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  onClick={closeMobileMenu}
                  className="text-center px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 border border-slate-200 hover:bg-slate-50"
                >
                  {t("nav_signin")}
                </Link>
                <Link
                  href="/signup"
                  onClick={closeMobileMenu}
                  className="flex items-center justify-center gap-1 text-center px-3 py-2 rounded-lg text-xs font-semibold bg-teal-600 text-white hover:bg-teal-700 shadow-xs"
                >
                  <span>{t("nav_signup")}</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
