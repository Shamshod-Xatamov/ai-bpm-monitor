import { cookies } from "next/headers";
import {
  deleteSession,
  SESSION_COOKIE,
  sessionCookieOptions,
} from "@/lib/server/auth/session";
import { toErrorResponse } from "@/lib/server/imports/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const cookieStore = await cookies();
    await deleteSession(cookieStore.get(SESSION_COOKIE)?.value);
    cookieStore.set(SESSION_COOKIE, "", {
      ...sessionCookieOptions(new Date(0)),
      maxAge: 0,
    });
    return Response.json(
      { ok: true },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return toErrorResponse(error);
  }
}
