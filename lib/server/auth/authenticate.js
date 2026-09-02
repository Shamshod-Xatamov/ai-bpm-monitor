import "server-only";
import { db } from "@/lib/server/db";
import { verifyPassword } from "@/lib/server/auth/password";
import { ImportError } from "@/lib/server/imports/errors";

export async function authenticateUser(email, password) {
  const normalizedEmail = String(email).trim().toLowerCase();
  const user = await db.users.findUnique({
    where: { email: normalizedEmail },
    select: {
      id: true,
      password_hash: true,
      is_active: true,
    },
  });
  const valid = user
    ? await verifyPassword(user.password_hash, password)
    : await verifyPassword(
        "$argon2id$v=19$m=19456,t=2,p=1$MDAwMDAwMDAwMDAwMDAwMA$56ZhlLfm+wkMuO1w9JYQfJzZp4YJ4F0iQx7gLd9WvhE",
        password,
      );

  if (!user || !valid || !user.is_active) {
    throw new ImportError(
      "AUTH_INVALID_CREDENTIALS",
      "Email yoki parol noto‘g‘ri.",
      401,
    );
  }

  await db.users.update({
    where: { id: user.id },
    data: { last_login_at: new Date(), updated_at: new Date() },
  });
  return user;
}
