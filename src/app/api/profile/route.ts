import { NextRequest, NextResponse } from "next/server";
import { DatabaseConfigError, getDb } from "@/lib/db";
import {
  getSessionFromRequest,
  parseJsonArray,
} from "@/lib/auth";

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
      return NextResponse.json(
        { error: "User not found" },
        { status: 404, headers: NO_STORE_HEADERS }
      );
    }

    return NextResponse.json(
      {
        success: true,
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
    if (error instanceof DatabaseConfigError) {
      return NextResponse.json(
        { error: error.message },
        { status: 503, headers: NO_STORE_HEADERS }
      );
    }
    console.error("Profile GET error:", error instanceof Error ? error.message : "unknown error");
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json(
        { error: "Authentication required. Please sign in again." },
        { status: 401, headers: NO_STORE_HEADERS }
      );
    }

    const body = await req.json();
    const {
      age,
      gender,
      conditions = [],
      allergies = [],
      current_medications = [],
    } = body ?? {};

    let parsedAge: number | null = null;
    if (age !== undefined && age !== null && String(age).trim() !== "") {
      const numAge = Number(age);
      if (!Number.isInteger(numAge) || numAge < 1 || numAge > 120) {
        return NextResponse.json(
          { error: "Age must be a whole number between 1 and 120." },
          { status: 400, headers: NO_STORE_HEADERS }
        );
      }
      parsedAge = numAge;
    }

    const cleanGender =
      typeof gender === "string" && ["Male", "Female", "Other"].includes(gender)
        ? gender
        : null;

    const conditionsList = parseJsonArray(conditions);
    const allergiesList = parseJsonArray(allergies);
    const medsList = parseJsonArray(current_medications);

    const updatedProfile = {
      age: parsedAge,
      gender: cleanGender,
      conditions: conditionsList,
      allergies: allergiesList,
      current_medications: medsList,
      updated_at: new Date().toISOString(),
    };

    const db = await getDb();

    const userExists = await db.execute({
      sql: "SELECT id FROM users WHERE id = ? LIMIT 1",
      args: [session.sub],
    });

    if (userExists.rows.length === 0) {
      return NextResponse.json(
        { error: "User account not found. Please sign in again." },
        { status: 404, headers: NO_STORE_HEADERS }
      );
    }

    await db.execute({
      sql: `
        INSERT INTO health_profiles (user_id, age, gender, conditions, allergies, current_medications, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(user_id) DO UPDATE SET
          age = excluded.age,
          gender = excluded.gender,
          conditions = excluded.conditions,
          allergies = excluded.allergies,
          current_medications = excluded.current_medications,
          updated_at = CURRENT_TIMESTAMP
      `,
      args: [
        session.sub,
        parsedAge,
        cleanGender,
        JSON.stringify(conditionsList),
        JSON.stringify(allergiesList),
        JSON.stringify(medsList),
      ],
    });

    return NextResponse.json(
      {
        success: true,
        profile: updatedProfile,
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
    console.error("Profile PUT error:", error instanceof Error ? error.message : "unknown error");
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}
