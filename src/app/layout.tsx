import type { Metadata, Viewport } from "next";
import { UserProvider } from "@/context/UserContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "TabeebCare — Clinical Triage, Medication Intelligence & Patient Portal",
  description:
    "AI-powered prescription demystifier, clinical symptom triage, lab report analysis, and SBAR doctor handover platform.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-dvh flex flex-col bg-slate-50 text-slate-800 antialiased selection:bg-teal-100 selection:text-teal-900 overflow-x-hidden">
        <UserProvider>
          <Navbar />
          <main className="flex-1 w-full max-w-[1440px] 2xl:max-w-[1680px] mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
            {children}
          </main>
          <Footer />
        </UserProvider>
      </body>
    </html>
  );
}
