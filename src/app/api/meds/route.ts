import { NextRequest, NextResponse } from "next/server";
import groq, { GROQ_MODEL } from "@/lib/groq";
import { MEDS_SYSTEM_PROMPT } from "@/lib/prompts/meds_prompt";
import { DatabaseConfigError, getDb } from "@/lib/db";
import {
  getSessionFromRequest,
  parseJsonArray,
} from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rate_limit";

const NO_STORE_HEADERS = { "Cache-Control": "no-store" };

export async function GET(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401, headers: NO_STORE_HEADERS }
      );
    }

    const db = await getDb();
    const result = await db.execute({
      sql: `
        SELECT id, medications_input, schedule_result, created_at
        FROM medication_checks
        WHERE user_id = ?
        ORDER BY created_at DESC, id DESC
        LIMIT 20
      `,
      args: [session.sub],
    });

    const checks = result.rows.map((row) => {
      let parsedSchedule: unknown = null;
      try {
        parsedSchedule = JSON.parse(String(row.schedule_result || "{}"));
      } catch {
        parsedSchedule = null;
      }

      return {
        id: Number(row.id),
        medications_input: String(row.medications_input || ""),
        schedule_result: parsedSchedule,
        created_at: row.created_at ? String(row.created_at) : null,
      };
    });

    return NextResponse.json(
      { success: true, checks },
      { headers: NO_STORE_HEADERS }
    );
  } catch (error: unknown) {
    if (error instanceof DatabaseConfigError) {
      return NextResponse.json(
        { error: error.message },
        { status: 503, headers: NO_STORE_HEADERS }
      );
    }
    console.error("Meds GET error:", error instanceof Error ? error.message : "unknown error");
    return NextResponse.json(
      { error: "Failed to load medication history" },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { medications } = body ?? {};

    const session = getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401, headers: NO_STORE_HEADERS }
      );
    }

    const effectiveUserId = session.sub;
    const ip = getClientIp(req);
    const rate = checkRateLimit(`meds:${effectiveUserId ?? ip}`, 15, 5 * 60 * 1000);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Too many medication analysis requests. Please wait a moment." },
        {
          status: 429,
          headers: {
            ...NO_STORE_HEADERS,
            "Retry-After": String(rate.retryAfterSeconds),
          },
        }
      );
    }

    if (!medications || typeof medications !== "string" || !medications.trim()) {
      return NextResponse.json(
        { error: "Please provide one or more medication names" },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    const cleanMeds = medications.trim();
    if (cleanMeds.length > 2000) {
      return NextResponse.json(
        { error: "Medication input is too long (maximum 2000 characters)." },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    if (!process.env.GROQ_API_KEY?.trim()) {
      return NextResponse.json(
        { error: "AI service is not configured (missing GROQ_API_KEY)." },
        { status: 503, headers: NO_STORE_HEADERS }
      );
    }

    // Retrieve user allergies and conditions for cross-checking
    let userContextString = "No specific patient profile provided.";
    let activeUserId: number | null = null;

    if (effectiveUserId) {
      const db = await getDb();
      const result = await db.execute({
        sql: `
          SELECT u.name, p.age, p.gender, p.conditions, p.allergies, p.current_medications
          FROM users u
          LEFT JOIN health_profiles p ON u.id = p.user_id
          WHERE u.id = ?
          LIMIT 1
        `,
        args: [effectiveUserId],
      });

      const row = result.rows[0];
      if (row) {
        activeUserId = effectiveUserId;
        const conditions = parseJsonArray(row.conditions);
        const allergies = parseJsonArray(row.allergies);
        const currentMeds = parseJsonArray(row.current_medications);
        userContextString = `Patient: ${row.name || session?.name || "Patient"}.
Age: ${row.age || "Unknown"}.
Gender: ${row.gender || "Unknown"}.
Known Chronic Conditions: ${conditions.join(", ") || "None"}.
Recorded Allergies: ${allergies.join(", ") || "None"}.
Current Medications: ${currentMeds.join(", ") || "None"}.`;
      }
    }

    const userPrompt = `Patient Profile Information:
${userContextString}

Prescription / Medication Names to Analyze:
"${cleanMeds}"

Analyze these medications, create a daily morning/afternoon/evening/night dosage schedule, explain their purpose in plain English, detail critical food/drink precautions, and flag any conflicts with the patient's recorded allergies or existing conditions.`;

    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        { role: "system", content: MEDS_SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.5,
      max_tokens: 1200,
    });

    const rawResponse = completion.choices[0]?.message?.content || "{}";
    let parsedResult;
    try {
      parsedResult = JSON.parse(rawResponse);
    } catch {
      return NextResponse.json(
        { error: "Failed to parse structured medication data" },
        { status: 500, headers: NO_STORE_HEADERS }
      );
    }

    // Save medication check to database if persistent authenticated user
    if (activeUserId) {
      try {
        const db = await getDb();
        await db.execute({
          sql: `
            INSERT INTO medication_checks (user_id, medications_input, schedule_result)
            VALUES (?, ?, ?)
          `,
          args: [activeUserId, cleanMeds, rawResponse],
        });
      } catch (err) {
        console.error(
          "Failed to save medication_check history:",
          err instanceof Error ? err.message : "unknown error"
        );
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: parsedResult,
      },
      { headers: NO_STORE_HEADERS }
    );
  } catch (error: unknown) {
    if (error instanceof DatabaseConfigError) {
      return NextResponse.json(
        { error: error.message },
        { status: 503, headers: NO_STORE_HEADERS }
      );
    }
    console.error("Meds API error:", error instanceof Error ? error.message : "unknown error");
    return NextResponse.json(
      { error: "Failed to analyze medications. Please try again." },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}
