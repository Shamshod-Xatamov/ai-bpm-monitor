import { requireApiUser } from "@/lib/server/auth/session";
import { toErrorResponse } from "@/lib/server/imports/errors";
import { drainImportJobs } from "@/lib/server/jobs/import-jobs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request) {
  try {
    const user = await requireApiUser(request, ["ADMIN"]);
    const results = await drainImportJobs({
      organizationId: user.orgId,
      limit: 5,
    });
    return Response.json({ processed: results.length, results });
  } catch (error) {
    return toErrorResponse(error);
  }
}
