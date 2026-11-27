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
  History,
  BookOpen,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import clsx from "clsx";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isAuthPage = pathname === "/login" || pathname === "/signup";

  const authNavLinks = [
    { href: "/dashboard", label: "Dashboard", icon: HeartPulse },
    { href: "/triage", label: "Triage", icon: MessageSquareHeart },
    { href: "/meds", label: "Medications", icon: Pill },
    { href: "/history", label: "History", icon: History },
    { href: "/protocols", label: "Protocols", icon: BookOpen },
    { href: "/profile", label: "Profile", icon: UserCheck },
  ];

  const publicNavLinks = [
    { href: "/protocols", label: "Clinical Protocols", icon: BookOpen },
  ];

  const navLinks = user ? authNavLinks : publicNavLinks;

  const handleLogout = async () => {
    await logout();
    setIsMobileMenuOpen(false);
    router.push("/");
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs pt-[env(safe-area-inset-top)]">
      <div className="w-full max-w-[1440px] 2xl:max-w-[1680px] mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        {/* Brand Logo & Name */}
        <Link
          href="/"
          onClick={closeMobileMenu}
          className="flex items-center gap-2.5 sm:gap-3 group focus:outline-none focus:ring-2 focus:ring-teal-500 rounded-xl p-1 min-h-[44px] shrink-0"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-xs group-hover:bg-teal-700 transition-colors shrink-0">
            <HeartPulse className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-slate-900 text-base sm:text-lg leading-tight tracking-tight">
              TabeebCare
            </span>
            <span className="text-[11px] text-slate-500 font-medium hidden sm:block lg:hidden xl:block leading-none mt-0.5">
              Clinical Triage &amp; Medication Intelligence
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1 min-w-0" aria-label="Main navigation">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || pathname?.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                className={clsx(
                  "flex items-center gap-1.5 px-2.5 xl:px-3 py-2 rounded-lg text-xs xl:text-sm font-medium transition-all min-h-[40px] whitespace-nowrap",
                  isActive
                    ? "bg-teal-50 text-teal-700 border border-teal-200/80 shadow-2xs font-semibold"
                    : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                )}
              >
                <Icon
                  className={clsx(
                    "w-4 h-4 shrink-0",
                    isActive ? "text-teal-600" : "text-slate-400"
                  )}
                />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Controls: Auth + Mobile Menu Toggle */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {user ? (
            <div className="hidden sm:flex items-center gap-1.5">
              <Link
                href="/profile"
                className="flex items-center gap-2 px-3 py-2 min-h-[40px] rounded-lg bg-slate-100/90 text-slate-700 text-xs font-semibold border border-slate-200 hover:bg-slate-200/70 transition-colors"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <span className="max-w-[130px] truncate">{user.name.split(" ")[0]}</span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="min-w-[40px] min-h-[40px] flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            !isAuthPage && (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3.5 py-2 min-h-[40px] inline-flex items-center text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors whitespace-nowrap"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex items-center px-3.5 py-2 min-h-[40px] text-xs font-semibold bg-teal-600 text-white rounded-lg hover:bg-teal-700 shadow-xs transition-colors whitespace-nowrap"
                >
                  Get Started
                </Link>
              </div>
            )
          )}

          {/* Mobile / Tablet Hamburger Toggle Button */}
          {!isAuthPage && (
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile / Tablet Navigation Drawer */}
      {isMobileMenuOpen && !isAuthPage && (
        <div className="lg:hidden bg-white border-t border-slate-200 px-3 sm:px-6 py-4 space-y-3 shadow-md animate-in slide-in-from-top-2 duration-200 max-h-[calc(100dvh-4rem)] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {navLinks.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href || pathname?.startsWith(`${href}/`);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={closeMobileMenu}
                  className={clsx(
                    "flex items-center gap-3 px-3.5 py-3 min-h-[44px] rounded-xl text-sm font-medium transition-colors",
                    isActive
                      ? "bg-teal-50 text-teal-800 border border-teal-200 font-semibold"
                      : "text-slate-700 hover:bg-slate-50"
                  )}
                >
                  <Icon
                    className={clsx(
                      "w-4 h-4 shrink-0",
                      isActive ? "text-teal-600" : "text-slate-400"
                    )}
                  />
                  <span>{label}</span>
                </Link>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100">
            {user ? (
              <div className="flex items-center justify-between gap-2 px-1">
                <Link
                  href="/profile"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-2 text-xs font-semibold text-slate-700 min-h-[44px] px-2"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span className="truncate max-w-[180px]">{user.name}</span>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 font-semibold px-3 min-h-[44px] rounded-lg hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2.5">
                <Link
                  href="/login"
                  onClick={closeMobileMenu}
                  className="flex items-center justify-center px-3 py-2.5 min-h-[44px] rounded-xl text-sm font-semibold text-slate-700 border border-slate-200 hover:bg-slate-50"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  onClick={closeMobileMenu}
                  className="flex items-center justify-center px-3 py-2.5 min-h-[44px] rounded-xl text-sm font-semibold bg-teal-600 text-white hover:bg-teal-700 shadow-xs"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
