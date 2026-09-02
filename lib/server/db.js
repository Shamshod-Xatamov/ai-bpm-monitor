import "server-only";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@/lib/generated/prisma/client";
import { getServerEnv } from "@/lib/server/env";

const globalForPrisma = globalThis;

function createPrismaClient() {
  const { DATABASE_URL } = getServerEnv();
  const adapter = new PrismaNeon({ connectionString: DATABASE_URL });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const db = globalForPrisma.__aiBpmPrisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.__aiBpmPrisma = db;
}
