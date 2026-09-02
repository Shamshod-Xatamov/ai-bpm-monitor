import "server-only";
import { randomUUID } from "node:crypto";
import { db } from "@/lib/server/db";
import { hashPassword } from "@/lib/server/auth/password";
import { ImportError } from "@/lib/server/imports/errors";

const userSelect = {
  id: true,
  email: true,
  full_name: true,
  role: true,
  is_active: true,
  last_login_at: true,
  created_at: true,
};

function userDto(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.full_name,
    role: user.role,
    isActive: user.is_active,
    lastLoginAt: user.last_login_at?.toISOString() ?? null,
    createdAt: user.created_at.toISOString(),
  };
}

function normalizeEmail(email) {
  return String(email).trim().toLowerCase();
}

function translateDatabaseError(error) {
  if (error?.code === "P2002") {
    throw new ImportError(
      "USER_EMAIL_EXISTS",
      "Bu email bilan foydalanuvchi allaqachon mavjud.",
      409,
    );
  }
  throw error;
}

export async function listOrganizationUsers(organizationId) {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const users = await db.users.findMany({
    where: { org_id: organizationId },
    select: userSelect,
    orderBy: [{ is_active: "desc" }, { created_at: "asc" }],
  });

  return {
    items: users.map(userDto),
    stats: {
      total: users.length,
      active: users.filter((user) => user.is_active).length,
      admins: users.filter((user) => user.role === "ADMIN" && user.is_active)
        .length,
      loggedInToday: users.filter(
        (user) => user.last_login_at && user.last_login_at >= startOfToday,
      ).length,
    },
  };
}

export async function createOrganizationUser(organizationId, payload) {
  const passwordHash = await hashPassword(payload.password);
  try {
    const user = await db.users.create({
      data: {
        id: randomUUID(),
        org_id: organizationId,
        email: normalizeEmail(payload.email),
        password_hash: passwordHash,
        full_name: payload.name.trim(),
        role: payload.role,
        is_active: true,
        updated_at: new Date(),
      },
      select: userSelect,
    });
    return userDto(user);
  } catch (error) {
    return translateDatabaseError(error);
  }
}

export async function updateOrganizationUser({
  organizationId,
  actorId,
  userId,
  payload,
}) {
  const passwordHash = payload.password
    ? await hashPassword(payload.password)
    : null;

  try {
    const user = await db.$transaction(async (transaction) => {
      const existing = await transaction.users.findFirst({
        where: { id: userId, org_id: organizationId },
        select: { id: true, role: true, is_active: true },
      });
      if (!existing) {
        throw new ImportError(
          "USER_NOT_FOUND",
          "Foydalanuvchi topilmadi.",
          404,
        );
      }

      const nextRole = payload.role ?? existing.role;
      const nextActive = payload.isActive ?? existing.is_active;
      if (existing.id === actorId && (!nextActive || nextRole !== "ADMIN")) {
        throw new ImportError(
          "USER_SELF_LOCKOUT",
          "O‘z admin accountingizni o‘chira yoki role’ini pasaytira olmaysiz.",
          409,
        );
      }

      if (
        existing.role === "ADMIN" &&
        existing.is_active &&
        (!nextActive || nextRole !== "ADMIN")
      ) {
        const activeAdmins = await transaction.users.count({
          where: {
            org_id: organizationId,
            role: "ADMIN",
            is_active: true,
          },
        });
        if (activeAdmins <= 1) {
          throw new ImportError(
            "USER_LAST_ADMIN",
            "Tashkilotda kamida bitta faol admin qolishi kerak.",
            409,
          );
        }
      }

      const updated = await transaction.users.update({
        where: { id: existing.id },
        data: {
          ...(payload.name ? { full_name: payload.name.trim() } : {}),
          ...(payload.email ? { email: normalizeEmail(payload.email) } : {}),
          ...(payload.role ? { role: payload.role } : {}),
          ...(payload.isActive !== undefined
            ? { is_active: payload.isActive }
            : {}),
          ...(passwordHash ? { password_hash: passwordHash } : {}),
          updated_at: new Date(),
        },
        select: userSelect,
      });
      if (passwordHash || !nextActive) {
        await transaction.sessions.deleteMany({
          where: { user_id: existing.id },
        });
      }
      return updated;
    });
    return userDto(user);
  } catch (error) {
    return translateDatabaseError(error);
  }
}
