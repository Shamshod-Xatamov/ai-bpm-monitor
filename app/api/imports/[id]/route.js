import { after } from "next/server";
import { toErrorResponse } from "@/lib/server/imports/errors";
import { requireApiUser } from "@/lib/server/auth/session";
import { drainImportJobs } from "@/lib/server/jobs/import-jobs";
import {
  getImportDetail,
  importDetailDto,
} from "@/lib/server/imports/repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request, context) {
  try {
    const user = await requireApiUser(request);
    const { id } = await context.params;
    const detail = await getImportDetail(id, {
      includeRows: true,
      organizationId: user.orgId,
    });
    if (detail.background_jobs?.[0]?.status === "PENDING") {
      after(() => drainImportJobs({ organizationId: user.orgId, limit: 1 }));
    }
    return Response.json(importDetailDto(detail), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
