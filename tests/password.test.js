import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/server/auth/password";

describe("password hashing", () => {
  it("hashes with argon2id and verifies the correct password", async () => {
    const hash = await hashPassword("Mvp-password-123");

    expect(hash).toMatch(/^\$argon2id\$/);
    await expect(verifyPassword(hash, "Mvp-password-123")).resolves.toBe(true);
    await expect(verifyPassword(hash, "wrong-password")).resolves.toBe(false);
  });

  it("returns false for a malformed stored hash", async () => {
    await expect(verifyPassword("not-a-hash", "password")).resolves.toBe(false);
  });
});
