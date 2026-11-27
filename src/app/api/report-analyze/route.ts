import { NextRequest, NextResponse } from "next/server";
import groq, { GROQ_MODEL } from "@/lib/groq";
import { LAB_REPORT_SYSTEM_PROMPT } from "@/lib/prompts/lab_report_prompt";
import { getDb } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rate_limit";

const NO_STORE_HEADERS = { "Cache-Control": "no-store" };

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { reportText } = body ?? {};

    const session = getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401, headers: NO_STORE_HEADERS }
      );
    }

    const effectiveUserId = session.sub;

    const ip = getClientIp(req);
    const rate = checkRateLimit(`report-analyze:${effectiveUserId ?? ip}`, 15, 5 * 60 * 1000);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Too many lab analysis requests. Please wait a moment and try again." },
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
        { error: "AI service is not configured (missing GROQ_API_KEY)." },
        { status: 503, headers: NO_STORE_HEADERS }
      );
    }

    if (!reportText || typeof reportText !== "string" || reportText.trim().length < 5) {
      return NextResponse.json(
        { error: "Please upload an image or provide extracted medical report text to analyze" },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    // Retrieve verified patient profile (never trust unverified client userId)
    let profileContext = "No recorded patient profile.";
    if (effectiveUserId) {
      try {
        const db = await getDb();
        const result = await db.execute({
          sql: `
            SELECT u.name, p.age, p.gender, p.conditions, p.allergies, p.current_medications
            FROM users u
            LEFT JOIN health_profiles p ON u.id = p.user_id
            WHERE u.id = ?
          `,
          args: [effectiveUserId],
        });
        const row = result.rows[0] as Record<string, unknown> | undefined;

        if (row) {
          profileContext = `Patient: ${row.name || "Patient"} (Age: ${row.age || "N/A"}, Gender: ${row.gender || "N/A"}).
Known Chronic Conditions: ${row.conditions || "None"}.
Recorded Allergies: ${row.allergies || "None"}.
Current Medications: ${row.current_medications || "None"}.`;
        }
      } catch (dbErr) {
        console.warn("Report Analyze profile lookup skipped:", dbErr);
      }
    }

    const userPrompt = `[PATIENT HEALTH PROFILE]
${profileContext}

[OCR-EXTRACTED MEDICAL / LAB REPORT TEXT]
"""
${reportText.trim().slice(0, 4000)}
"""

Analyze all lab values and findings above, classify each marker as high, low, or normal against standard ranges, explain them clearly in simple English, and note any important connections to the patient's chronic conditions or medications.`;

    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        { role: "system", content: LAB_REPORT_SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
      max_tokens: 4096,
      ...({ reasoning_effort: "low" } as Record<string, unknown>),
    });

    const rawContent = completion.choices[0]?.message?.content || "{}";
    let parsedAnalysis: Record<string, unknown>;
    try {
      parsedAnalysis = JSON.parse(rawContent);
    } catch {
      return NextResponse.json(
        { error: "Failed to parse structured lab report analysis" },
        { status: 500, headers: NO_STORE_HEADERS }
      );
    }

    return NextResponse.json(
      {
        success: true,
        analysis: parsedAnalysis,
      },
      { headers: NO_STORE_HEADERS }
    );
  } catch (error: unknown) {
    console.error("Report Analyze API error:", error);
    const msg =
      error instanceof Error ? error.message : "Failed to analyze medical report";
    return NextResponse.json(
      { error: msg },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}
