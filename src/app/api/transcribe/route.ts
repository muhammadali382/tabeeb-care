import { NextRequest, NextResponse } from "next/server";
import groq from "@/lib/groq";
import { checkRateLimit, getClientIp } from "@/lib/rate_limit";

const WHISPER_MODEL = "whisper-large-v3-turbo";
const NO_STORE_HEADERS = { "Cache-Control": "no-store" };
const MAX_AUDIO_BYTES = 10 * 1024 * 1024; // 10 MB cap

function getExtensionForMime(mimeType: string): string {
  const lower = mimeType.toLowerCase();
  if (lower.includes("ogg")) return "ogg";
  if (lower.includes("mp4") || lower.includes("m4a")) return "m4a";
  if (lower.includes("wav")) return "wav";
  if (lower.includes("mpeg") || lower.includes("mp3")) return "mp3";
  return "webm";
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rate = checkRateLimit(`transcribe:${ip}`, 20, 5 * 60 * 1000);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Too many voice transcription requests. Please wait a moment and try again." },
        {
          status: 429,
          headers: {
            ...NO_STORE_HEADERS,
            "Retry-After": String(rate.retryAfterSeconds),
          },
        }
      );
    }

    if (!process.env.GROQ_API_KEY?.trim()) {
      return NextResponse.json(
        { error: "AI transcription service is not configured (missing GROQ_API_KEY)." },
        { status: 503, headers: NO_STORE_HEADERS }
      );
    }

    const formData = await req.formData();
    const audioInput = formData.get("file");
    const langRaw = formData.get("lang");

    if (!audioInput || !(audioInput instanceof Blob)) {
      return NextResponse.json(
        { error: "Audio file is required" },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    if (audioInput.size === 0) {
      return NextResponse.json(
        { error: "Recorded audio is empty" },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    if (audioInput.size > MAX_AUDIO_BYTES) {
      return NextResponse.json(
        { error: "Recorded audio exceeds the 10 MB size limit." },
        { status: 413, headers: NO_STORE_HEADERS }
      );
    }

    const mimeType = audioInput.type || "audio/webm";
    const ext = getExtensionForMime(mimeType);
    const arrayBuffer = await audioInput.arrayBuffer();
    const file = new File([arrayBuffer], `recording.${ext}`, { type: mimeType });

    let language: string | undefined;
    if (typeof langRaw === "string" && langRaw.trim()) {
      const normalized = langRaw.trim().toLowerCase();
      if (normalized.startsWith("ur")) {
        language = "ur";
      } else if (normalized.startsWith("en")) {
        language = "en";
      }
    }

    const transcription = await groq.audio.transcriptions.create({
      file,
      model: WHISPER_MODEL,
      ...(language ? { language } : {}),
      prompt:
        "Medical symptoms, common medicine names like Panadol, Augmentin, Metformin, Glucophage, and clinical health consultation in English.",
      response_format: "json",
      temperature: 0,
    });

    const text = (transcription.text || "").trim();

    return NextResponse.json(
      {
        success: true,
        text,
        model: WHISPER_MODEL,
      },
      { headers: NO_STORE_HEADERS }
    );
  } catch (error: unknown) {
    console.error("Transcribe API error:", error);
    const msg =
      error instanceof Error ? error.message : "Failed to transcribe audio";
    return NextResponse.json(
      { error: msg },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}
