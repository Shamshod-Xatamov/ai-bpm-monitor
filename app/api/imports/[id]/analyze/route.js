import { after } from "next/server";
import { requireApiUser } from "@/lib/server/auth/session";
import { toErrorResponse } from "@/lib/server/imports/errors";
import {
  getImportDetail,
  importDetailDto,
} from "@/lib/server/imports/repository";
import {
  drainImportJobs,
  enqueueImportJob,
} from "@/lib/server/jobs/import-jobs";

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
      type: "ANALYZE_WORKBOOK",
    });
    after(() => drainImportJobs({ organizationId: user.orgId, limit: 1 }));
    const result = importDetailDto(
      await getImportDetail(id, { organizationId: user.orgId }),
    );
    return Response.json(result, {
      status: 202,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
