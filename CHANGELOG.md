# Changelog

All notable changes to **TabeebCare (طبیب کیئر)** are documented in this file.

## [Unreleased — `dev`]

### Product Upgrade & Responsive Architecture (320px–2560px)
- **English-Only Product UI**: Removed Urdu/RTL UI toggles and `src/lib/i18n/translations.ts`, streamlining all pages, prompts, SBAR handover cards, and OCR summaries into clear, patient-friendly English.
- **Mobile-First Responsive Redesign**: Added `viewportFit: "cover"`, `env(safe-area-inset-bottom)`, `100dvh` chat sizing, fluid `clamp()` typography, `>= 40–44px` touch targets, and mobile-first chat ordering across `320px–2560px` viewports.
- **New Product Pages**: Added Consultation & Medication History (`/history`) with search, severity filtering, and `.txt` export; Interactive Clinical Triage Protocols Library (`/protocols`); and dedicated `/privacy` and `/terms` pages.
- **Removed Blocking Splash Loader**: Deleted `InitialSplashLoader` for instant first-paint navigation.

### Security & Quality Hardening
- Enforced server-side signed `HttpOnly` session verification (`getSessionFromRequest`) on `/api/report` and `/api/report-analyze` to prevent unverified `userId` IDOR access.
- Added sliding-window rate limiting (`checkRateLimit`), `GROQ_API_KEY` guards, `Cache-Control: no-store`, and `10 MB` upload size + MIME/extension validation to `/api/ocr`, `/api/transcribe`, `/api/report`, and `/api/report-analyze`.
- Added graceful error handling in `/api/ocr` when the optional Linux `pdftotext` binary is absent.
- Replaced placeholder lint script with a zero-dependency static quality & security linter (`scripts/lint.mjs`) and added an automated unit test suite (`npm test` using `tsc` + `node:test`) covering `guardrails`, `retriever`, `auth`, and `rate_limit`.
- Updated `README.md`, `Footer.tsx`, and `translations.ts` to accurately reflect Turso/libSQL persistence, `scrypt` + `HttpOnly` auth, OCR, Whisper voice, and all 12 API routes.
- Added standard open-source repository files: `LICENSE` (MIT), `CONTRIBUTING.md`, `SECURITY.md`, `CHANGELOG.md`, `.editorconfig`, Dependabot config, and GitHub Issue/PR templates.

### Added (Consolidated from `demo`)
- **Server-Side OCR & Lab Report Analyzer**: Local `tesseract.js` OCR (`/api/ocr`) with optional image preprocessing and PDF text extraction, `PrescriptionImageUploader`, and `MedicalReportScanner` (`/api/report-analyze`).
- **Guided 5-Question Doctor Report Intake**: Structured multi-question clinical intake modal (`GuidedIntakeModal`) and `/api/report` SBAR synthesis engine with bilingual English/Urdu report cards and `.txt` export.
- **Groq Whisper Voice Transcription**: `/api/transcribe` (`whisper-large-v3-turbo`) integrated with `VoiceButton` alongside Web Speech API dictation.

### Added (Production Multi-User & Turso Architecture on `dev`)
- **Turso / libSQL Adapter**: Replaced `node:sqlite` with `@libsql/client` (`src/lib/db.ts`), supporting local `./tabibcare.db` in development and persistent Turso cloud storage in production.
- **Hardened Authentication**: Added salted `scrypt` password hashing, HMAC-SHA256 `HttpOnly` session cookies (`src/lib/auth.ts`), `/api/auth/me`, and `/api/auth/logout`.
- **Rate Limiting & Security Headers**: Added `src/lib/rate_limit.ts`, HTTP security headers in `next.config.mjs`, and consultation/medication history GET APIs.

## [1.0.0] — Hackathon Release (`main`)
- Medicine Demystifier (`/meds`) with 24-hour visual schedules, Urdu explanations, food instructions, and drug allergy conflict alerts.
- Multilingual Symptom Triage (`/triage`) with Groq SSE streaming, 15 WHO-inspired clinical RAG protocols, and "Why this level?" explainability modal.
- Pre-inference multilingual self-harm/crisis guardrails, Emergency Banner (`1122`, Google Maps Hospital/Psychiatrist, Umang `0317-4288665`).
- Bilingual English/Urdu RTL interface, initial clinical heartbeat splash screen, SBAR doctor handover card, and responsive light-theme design system.
