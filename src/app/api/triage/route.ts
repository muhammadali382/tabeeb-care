import { NextRequest, NextResponse } from "next/server";
import groq, { GROQ_MODEL } from "@/lib/groq";
import { buildSystemPrompt, PatientProfileContext } from "@/lib/memory/context_builder";
import { retrieveDetailedContext } from "@/lib/rag/retriever";
import { DatabaseConfigError, getDb } from "@/lib/db";
import {
  getSessionFromRequest,
  parseJsonArray,
} from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rate_limit";

const NO_STORE_HEADERS = { "Cache-Control": "no-store" };
const ALLOWED_ROLES = new Set(["user", "assistant"]);

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
        SELECT id, messages, triage_level, summary, created_at
        FROM triage_sessions
        WHERE user_id = ?
        ORDER BY created_at DESC, id DESC
        LIMIT 20
      `,
      args: [session.sub],
    });

    const sessions = result.rows.map((row) => {
      let parsedMessages: unknown[] = [];
      try {
        const parsed = JSON.parse(String(row.messages || "[]"));
        if (Array.isArray(parsed)) parsedMessages = parsed;
      } catch {
        parsedMessages = [];
      }

      return {
        id: Number(row.id),
        messages: parsedMessages,
        triage_level: row.triage_level ? String(row.triage_level) : null,
        summary: row.summary ? String(row.summary) : "",
        created_at: row.created_at ? String(row.created_at) : null,
      };
    });

    return NextResponse.json(
      { success: true, sessions },
      { headers: NO_STORE_HEADERS }
    );
  } catch (error: unknown) {
    if (error instanceof DatabaseConfigError) {
      return NextResponse.json(
        { error: error.message },
        { status: 503, headers: NO_STORE_HEADERS }
      );
    }
    console.error("Triage GET error:", error instanceof Error ? error.message : "unknown error");
    return NextResponse.json(
      { error: "Failed to load triage history" },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      messages,
      saveSession = false,
      triageLevel = null,
    } = body ?? {};

    const session = getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401, headers: NO_STORE_HEADERS }
      );
    }

    const effectiveUserId = session.sub;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Conversation messages array is required" },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    if (messages.length > 50) {
      return NextResponse.json(
        { error: "Conversation exceeds maximum message limit (50)." },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    // Sanitize and validate messages
    const sanitizedMessages = messages
      .filter(
        (m: { role?: unknown; content?: unknown }) =>
          m &&
          typeof m.role === "string" &&
          ALLOWED_ROLES.has(m.role) &&
          typeof m.content === "string" &&
          m.content.trim().length > 0
      )
      .map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content.trim().slice(0, 4000),
      }));

    if (sanitizedMessages.length === 0) {
      return NextResponse.json(
        { error: "At least one valid non-empty message is required." },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    // Handle session saving request for authenticated users
    if (saveSession) {
      if (effectiveUserId) {
        const db = await getDb();
        const lastAssistant = [...sanitizedMessages]
          .reverse()
          .find((m) => m.role === "assistant");
        const summary =
          lastAssistant?.content?.slice(0, 150) || "Triage consultation";
        const safeLevel =
          typeof triageLevel === "string" &&
          ["emergency", "urgent", "routine", "home"].includes(
            triageLevel.toLowerCase()
          )
            ? triageLevel.toLowerCase()
            : null;

        await db.execute({
          sql: `
            INSERT INTO triage_sessions (user_id, messages, triage_level, summary)
            VALUES (?, ?, ?, ?)
          `,
          args: [
            effectiveUserId,
            JSON.stringify(sanitizedMessages),
            safeLevel,
            summary,
          ],
        });
      }
      return NextResponse.json(
        { success: true, saved: Boolean(effectiveUserId) },
        { headers: NO_STORE_HEADERS }
      );
    }

    // Rate limit AI triage invocations
    const ip = getClientIp(req);
    const rateKey = `triage:${effectiveUserId ?? ip}`;
    const rate = checkRateLimit(rateKey, 20, 5 * 60 * 1000);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Too many triage requests. Please wait a moment and try again." },
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

    // Find last user message for RAG retrieval
    const lastUserMsg =
      [...sanitizedMessages].reverse().find((m) => m.role === "user")?.content ||
      "";

    // Retrieve patient profile for long-term memory
    let profile: PatientProfileContext | null = null;
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
        profile = {
          name: String(row.name || session?.name || "Patient"),
          age: row.age !== null && row.age !== undefined ? Number(row.age) : null,
          gender: row.gender ? String(row.gender) : null,
          conditions: parseJsonArray(row.conditions),
          allergies: parseJsonArray(row.allergies),
          current_medications: parseJsonArray(row.current_medications),
        };
      }
    }

    // Retrieve real RAG context & protocol metadata
    const ragResult = retrieveDetailedContext(lastUserMsg);
    const normalizedUserMsg = lastUserMsg.toLowerCase();

    // Extract exact matched keywords from the matched protocols
    const matchedKeywords: string[] = [];
    for (const protocol of ragResult.matchedProtocols) {
      for (const keyword of protocol.keywords) {
        if (
          normalizedUserMsg.includes(keyword.toLowerCase()) &&
          !matchedKeywords.includes(keyword)
        ) {
          matchedKeywords.push(keyword);
        }
      }
    }

    // First SSE Event: Retrieval Metadata
    const retrievalMetadata = {
      type: "meta",
      protocols: ragResult.matchedProtocols.map((p) => ({
        id: p.id,
        title: p.title,
      })),
      matchedKeywords,
      severity: ragResult.highestSeverity || "routine",
      profileUsed: {
        conditions: profile ? parseJsonArray(profile.conditions) : [],
        allergies: profile ? parseJsonArray(profile.allergies) : [],
      },
    };

    // Assemble system prompt with RAG context and safety rules
    const { systemPrompt } = buildSystemPrompt(profile, lastUserMsg);

    // Call Groq API with streaming
    const groqStream = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        ...sanitizedMessages,
      ],
      stream: true,
      max_tokens: 800,
      temperature: 0.3,
    });

    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(retrievalMetadata)}\n\n`)
          );

          for await (const chunk of groqStream) {
            const text = chunk.choices[0]?.delta?.content || "";
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          }
          controller.close();
        } catch (err) {
          console.error(
            "Groq stream iteration error:",
            err instanceof Error ? err.message : "unknown error"
          );
          controller.error(err);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (error: unknown) {
    if (error instanceof DatabaseConfigError) {
      return NextResponse.json(
        { error: error.message },
        { status: 503, headers: NO_STORE_HEADERS }
      );
    }
    console.error("Triage API error:", error instanceof Error ? error.message : "unknown error");
    return NextResponse.json(
      { error: "Failed to process triage consultation. Please try again." },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}
