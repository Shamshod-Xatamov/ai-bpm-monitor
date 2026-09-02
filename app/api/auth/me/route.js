import { requireApiUser } from "@/lib/server/auth/session";
import { toErrorResponse } from "@/lib/server/imports/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    return Response.json(await requireApiUser(request), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
