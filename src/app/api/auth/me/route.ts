import { NextRequest, NextResponse } from "next/server";
import { DatabaseConfigError, getDb } from "@/lib/db";
import {
  clearSessionCookie,
  getSessionFromRequest,
  parseJsonArray,
  SessionConfigError,
} from "@/lib/auth";

const NO_STORE_HEADERS = { "Cache-Control": "no-store" };

export async function GET(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json(
        { authenticated: false, user: null, profile: null },
        { status: 401, headers: NO_STORE_HEADERS }
      );
    }

    const db = await getDb();
    const result = await db.execute({
      sql: `
        SELECT u.id, u.name, u.email,
               p.age, p.gender, p.conditions, p.allergies, p.current_medications, p.updated_at
        FROM users u
        LEFT JOIN health_profiles p ON u.id = p.user_id
        WHERE u.id = ?
        LIMIT 1
      `,
      args: [session.sub],
    });

    const row = result.rows[0];
    if (!row) {
      const response = NextResponse.json(
        { authenticated: false, user: null, profile: null },
        { status: 401, headers: NO_STORE_HEADERS }
      );
      clearSessionCookie(response);
      return response;
    }

    return NextResponse.json(
      {
        authenticated: true,
        user: {
          id: Number(row.id),
          name: String(row.name),
          email: String(row.email),
        },
        profile: {
          age: row.age !== null && row.age !== undefined ? Number(row.age) : null,
          gender: row.gender ? String(row.gender) : null,
          conditions: parseJsonArray(row.conditions),
          allergies: parseJsonArray(row.allergies),
          current_medications: parseJsonArray(row.current_medications),
          updated_at: row.updated_at ? String(row.updated_at) : null,
        },
      },
      { headers: NO_STORE_HEADERS }
    );
  } catch (error: unknown) {
    if (error instanceof DatabaseConfigError || error instanceof SessionConfigError) {
      return NextResponse.json(
        { authenticated: false, error: error.message },
        { status: 503, headers: NO_STORE_HEADERS }
      );
    }
    console.error(
      "Auth session check error:",
      error instanceof Error ? error.message : "unknown error"
    );
    return NextResponse.json(
      { authenticated: false, error: "Failed to verify session" },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}
