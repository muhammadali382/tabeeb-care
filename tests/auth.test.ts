import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  hashPassword,
  verifyPassword,
  createSessionToken,
  verifySessionToken,
  parseJsonArray,
  isValidEmail,
} from "../src/lib/auth";

describe("Authentication, Password Hashing & Session Security", () => {
  it("hashes passwords with salted scrypt and verifies valid vs invalid passwords", () => {
    const hash = hashPassword("TabeebSecure123!");
    assert.ok(hash.startsWith("scrypt:"));

    const valid = verifyPassword("TabeebSecure123!", hash);
    assert.equal(valid.valid, true);
    assert.equal(valid.needsRehash, false);

    const invalid = verifyPassword("WrongPassword", hash);
    assert.equal(invalid.valid, false);
  });

  it("supports legacy plaintext verification and flags needsRehash", () => {
    const legacy = verifyPassword("oldpass123", "oldpass123");
    assert.equal(legacy.valid, true);
    assert.equal(legacy.needsRehash, true);
  });

  it("creates, verifies, and rejects tampered HMAC session tokens", () => {
    const token = createSessionToken({
      id: 42,
      name: "Fatima Ali",
      email: "fatima@example.com",
    });

    const payload = verifySessionToken(token);
    assert.ok(payload);
    assert.equal(payload.sub, 42);
    assert.equal(payload.email, "fatima@example.com");

    // Tamper signature
    const tampered = `${token.slice(0, -4)}AAAA`;
    assert.equal(verifySessionToken(tampered), null);
    assert.equal(verifySessionToken("not-a-valid-token"), null);
    assert.equal(verifySessionToken(undefined), null);
  });

  it("parses JSON arrays, comma-separated strings, and handles empty values", () => {
    assert.deepEqual(parseJsonArray(["Diabetes", "Hypertension"]), [
      "Diabetes",
      "Hypertension",
    ]);
    assert.deepEqual(parseJsonArray('["Penicillin", "Sulfa"]'), [
      "Penicillin",
      "Sulfa",
    ]);
    assert.deepEqual(parseJsonArray("Asthma, Migraine"), ["Asthma", "Migraine"]);
    assert.deepEqual(parseJsonArray(null), []);
  });

  it("validates email syntax accurately", () => {
    assert.equal(isValidEmail("patient@tabeebcare.pk"), true);
    assert.equal(isValidEmail("invalid-email"), false);
    assert.equal(isValidEmail("no@domain"), false);
  });
});
