import "server-only";
import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { db } from "@/lib/server/db";
import { ImportError } from "@/lib/server/imports/errors";

export const SESSION_COOKIE = "ai_bpm_session";
const SESSION_DAYS = 7;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function sessionExpiry() {
  const expires = new Date();
  expires.setDate(expires.getDate() + SESSION_DAYS);
  return expires;
}

export function sessionCookieOptions(expires = sessionExpiry()) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires,
  };
}

function initials(name) {
  return String(name)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function userDto(session) {
  const user = session.users;
  return {
    id: user.id,
    orgId: user.org_id,
    email: user.email,
    name: user.full_name,
    initials: initials(user.full_name),
    role: user.role,
    organization: user.organizations.name,
  };
}

export async function createSession(userId, { userAgent, ipAddress } = {}) {
  const expires = sessionExpiry();
  const session = await db.sessions.create({
    data: {
      id: randomUUID(),
      user_id: userId,
      expires_at: expires,
      user_agent: userAgent?.slice(0, 500) || null,
      ip_address: ipAddress?.slice(0, 100) || null,
    },
  });

  await db.sessions.deleteMany({
    where: { user_id: userId, expires_at: { lt: new Date() } },
  });
  return { id: session.id, expires };
}

export async function deleteSession(sessionId) {
  if (!sessionId || !UUID_PATTERN.test(sessionId)) return;
  await db.sessions.deleteMany({ where: { id: sessionId } });
}

export async function getSessionUser(sessionId) {
  if (!sessionId || !UUID_PATTERN.test(sessionId)) return null;
  const session = await db.sessions.findFirst({
    where: {
      id: sessionId,
      expires_at: { gt: new Date() },
      users: { is_active: true },
    },
    include: {
      users: { include: { organizations: true } },
    },
  });
  return session ? userDto(session) : null;
}

export function sessionIdFromRequest(request) {
  const cookie = request.headers.get("cookie") ?? "";
  const value = cookie
    .split(";")
    .map((part) => part.trim().split("="))
    .find(([name]) => name === SESSION_COOKIE)?.[1];
  return value ? decodeURIComponent(value) : null;
}

export async function getCurrentUser() {
  const sessionId = (await cookies()).get(SESSION_COOKIE)?.value;
  return getSessionUser(sessionId);
}

export async function requireApiUser(request, allowedRoles = null) {
  const user = await getSessionUser(sessionIdFromRequest(request));
  if (!user) {
    throw new ImportError("AUTH_REQUIRED", "Avval tizimga kiring.", 401);
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    throw new ImportError(
      "AUTH_FORBIDDEN",
      "Bu amal uchun ruxsatingiz yetarli emas.",
      403,
    );
  }
  return user;
}
