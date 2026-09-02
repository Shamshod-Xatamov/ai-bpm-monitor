import { after } from "next/server";
import { toErrorResponse } from "@/lib/server/imports/errors";
import { requireApiUser } from "@/lib/server/auth/session";
import {
  drainImportJobs,
  enqueueImportJob,
} from "@/lib/server/jobs/import-jobs";
import {
  getImportDetail,
  importDetailDto,
} from "@/lib/server/imports/repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request, context) {
  try {
    const user = await requireApiUser(request, ["ADMIN", "ANALYST"]);
    const { id } = await context.params;
    await enqueueImportJob({
      organizationId: user.orgId,
      importId: id,
      type: "INFER_WORKBOOK",
    });
    after(() => drainImportJobs({ organizationId: user.orgId, limit: 1 }));
    const detail = await getImportDetail(id, {
      includeRows: true,
      organizationId: user.orgId,
    });
    return Response.json(importDetailDto(detail), {
      status: 202,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
