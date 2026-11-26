import { NextRequest, NextResponse } from "next/server";
import { DatabaseConfigError, getDb } from "@/lib/db";
import {
  hashPassword,
  isValidEmail,
  parseJsonArray,
  SessionConfigError,
  setSessionCookie,
} from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rate_limit";

const NO_STORE_HEADERS = { "Cache-Control": "no-store" };

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rate = checkRateLimit(`signup:${ip}`, 5, 15 * 60 * 1000);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Too many signup attempts. Please try again later." },
        {
          status: 429,
          headers: {
            ...NO_STORE_HEADERS,
            "Retry-After": String(rate.retryAfterSeconds),
          },
        }
      );
    }

    const body = await req.json();
    const {
      name,
      email,
      password,
      age,
      gender,
      conditions = [],
      allergies = [],
      current_medications = [],
    } = body ?? {};

    const cleanName = typeof name === "string" ? name.trim() : "";
    const cleanEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const rawPassword = typeof password === "string" ? password : "";

    if (!cleanName || cleanName.length < 2 || cleanName.length > 100) {
      return NextResponse.json(
        { error: "Please enter your full name (2 to 100 characters)." },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    if (!cleanEmail || !isValidEmail(cleanEmail)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    if (rawPassword.length < 6 || rawPassword.length > 128) {
      return NextResponse.json(
        { error: "Password must be between 6 and 128 characters long." },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

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
    const medicationsList = parseJsonArray(current_medications);

    const db = await getDb();

    const existing = await db.execute({
      sql: "SELECT id FROM users WHERE email = ?",
      args: [cleanEmail],
    });

    if (existing.rows.length > 0) {
      return NextResponse.json(
        { error: "An account with this email already exists. Please sign in instead." },
        { status: 409, headers: NO_STORE_HEADERS }
      );
    }

    const passwordHash = hashPassword(rawPassword);

    const userResult = await db.execute({
      sql: "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      args: [cleanName, cleanEmail, passwordHash],
    });

    const userId = Number(userResult.lastInsertRowid);

    await db.execute({
      sql: `
        INSERT INTO health_profiles (user_id, age, gender, conditions, allergies, current_medications)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(user_id) DO UPDATE SET
          age = excluded.age,
          gender = excluded.gender,
          conditions = excluded.conditions,
          allergies = excluded.allergies,
          current_medications = excluded.current_medications,
          updated_at = CURRENT_TIMESTAMP
      `,
      args: [
        userId,
        parsedAge,
        cleanGender,
        JSON.stringify(conditionsList),
        JSON.stringify(allergiesList),
        JSON.stringify(medicationsList),
      ],
    });

    const user = {
      id: userId,
      name: cleanName,
      email: cleanEmail,
    };

    const profile = {
      age: parsedAge,
      gender: cleanGender,
      conditions: conditionsList,
      allergies: allergiesList,
      current_medications: medicationsList,
    };

    const response = NextResponse.json(
      {
        success: true,
        user,
        profile,
      },
      { status: 201, headers: NO_STORE_HEADERS }
    );

    setSessionCookie(response, user);
    return response;
  } catch (error: unknown) {
    if (error instanceof DatabaseConfigError || error instanceof SessionConfigError) {
      return NextResponse.json(
        { error: error.message },
        { status: 503, headers: NO_STORE_HEADERS }
      );
    }
    const message = error instanceof Error ? error.message : "";
    if (message.includes("UNIQUE") || message.includes("SQLITE_CONSTRAINT")) {
      return NextResponse.json(
        { error: "An account with this email already exists. Please sign in instead." },
        { status: 409, headers: NO_STORE_HEADERS }
      );
    }
    console.error("Signup error:", message || "unknown error");
    return NextResponse.json(
      { error: "Failed to create account. Please try again." },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}
