import { cookies, headers } from "next/headers";
import { z } from "zod";
import { authenticateUser } from "@/lib/server/auth/authenticate";
import {
  createSession,
  SESSION_COOKIE,
  sessionCookieOptions,
} from "@/lib/server/auth/session";
import { toErrorResponse } from "@/lib/server/imports/errors";

const loginSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(8).max(200),
});

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const credentials = loginSchema.parse(await request.json());
    const requestHeaders = await headers();
    const user = await authenticateUser(
      credentials.email,
      credentials.password,
    );
    const session = await createSession(user.id, {
      userAgent: requestHeaders.get("user-agent"),
      ipAddress:
        requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        requestHeaders.get("x-real-ip"),
    });
    (await cookies()).set(
      SESSION_COOKIE,
      session.id,
      sessionCookieOptions(session.expires),
    );
    return Response.json(
      { ok: true },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return toErrorResponse(error);
  }
}
