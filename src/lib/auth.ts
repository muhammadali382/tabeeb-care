import crypto from "crypto";
import type { NextRequest, NextResponse } from "next/server";

export const SESSION_COOKIE_NAME = "tabeebcare_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

export class SessionConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SessionConfigError";
  }
}

export interface SessionUser {
  id: number;
  name: string;
  email: string;
}

export interface SessionPayload {
  sub: number;
  name: string;
  email: string;
  iat: number;
  exp: number;
}

export interface StoredHealthProfile {
  age: number | null;
  gender: string | null;
  conditions: string[];
  allergies: string[];
  current_medications: string[];
  updated_at?: string | null;
}

function getSessionSecret(): string {
  const configured = process.env.SESSION_SECRET?.trim();
  if (configured && configured.length >= 16) {
    return configured;
  }

  if (process.env.VERCEL) {
    throw new SessionConfigError(
      "Session signing secret is not configured. Set SESSION_SECRET (at least 16 characters) in Vercel Environment Variables."
    );
  }

  // Local development fallback only (never used on Vercel)
  return crypto
    .createHash("sha256")
    .update("tabeebcare:local-dev-only-session-secret")
    .digest("hex");
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.scryptSync(password, salt, 64).toString("hex");
  return `scrypt:${salt}:${derivedKey}`;
}

export function verifyPassword(
  password: string,
  storedHash: string
): { valid: boolean; needsRehash: boolean } {
  if (!storedHash) {
    return { valid: false, needsRehash: false };
  }

  if (storedHash.startsWith("scrypt:")) {
    const parts = storedHash.split(":");
    if (parts.length !== 3) {
      return { valid: false, needsRehash: false };
    }
    const [, salt, keyHex] = parts;
    const derived = crypto.scryptSync(password, salt, 64);
    const storedBuf = Buffer.from(keyHex, "hex");
    if (derived.length !== storedBuf.length) {
      return { valid: false, needsRehash: false };
    }
    return {
      valid: crypto.timingSafeEqual(derived, storedBuf),
      needsRehash: false,
    };
  }

  // Legacy plaintext compatibility for existing local dev SQLite rows; upgrades on login
  const a = crypto.createHash("sha256").update(password).digest();
  const b = crypto.createHash("sha256").update(storedHash).digest();
  const valid = crypto.timingSafeEqual(a, b);
  return { valid, needsRehash: valid };
}

export function createSessionToken(user: SessionUser): string {
  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = {
    sub: user.id,
    name: user.name,
    email: user.email,
    iat: now,
    exp: now + SESSION_TTL_SECONDS,
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", getSessionSecret())
    .update(payloadB64)
    .digest("base64url");

  return `${payloadB64}.${signature}`;
}

export function verifySessionToken(token: string | undefined): SessionPayload | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [payloadB64, providedSig] = parts;
  if (!payloadB64 || !providedSig) return null;

  let expectedSig: string;
  try {
    expectedSig = crypto
      .createHmac("sha256", getSessionSecret())
      .update(payloadB64)
      .digest("base64url");
  } catch {
    return null;
  }

  const providedBuf = Buffer.from(providedSig);
  const expectedBuf = Buffer.from(expectedSig);
  if (
    providedBuf.length !== expectedBuf.length ||
    !crypto.timingSafeEqual(providedBuf, expectedBuf)
  ) {
    return null;
  }

  try {
    const decoded = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString("utf8")
    ) as SessionPayload;

    if (
      typeof decoded.sub !== "number" ||
      typeof decoded.email !== "string" ||
      typeof decoded.exp !== "number"
    ) {
      return null;
    }

    if (decoded.exp <= Math.floor(Date.now() / 1000)) {
      return null;
    }

    return decoded;
  } catch {
    return null;
  }
}

export function getSessionFromRequest(req: NextRequest): SessionPayload | null {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

export function setSessionCookie(res: NextResponse, user: SessionUser): void {
  const token = createSessionToken(user);
  res.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export function clearSessionCookie(res: NextResponse): void {
  res.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export function parseJsonArray(
  val: unknown,
  maxItems = 50,
  maxItemLength = 100
): string[] {
  let rawItems: string[] = [];

  if (Array.isArray(val)) {
    rawItems = val.map((item) => String(item).trim()).filter(Boolean);
  } else if (typeof val === "string") {
    const trimmed = val.trim();
    if (trimmed) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          rawItems = parsed.map((item) => String(item).trim()).filter(Boolean);
        } else {
          rawItems = [trimmed];
        }
      } catch {
        rawItems = trimmed
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      }
    }
  }

  return rawItems
    .slice(0, maxItems)
    .map((item) => item.slice(0, maxItemLength));
}

export function isValidEmail(email: string): boolean {
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
