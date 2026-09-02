import { toErrorResponse } from "@/lib/server/imports/errors";
import { requireApiUser } from "@/lib/server/auth/session";
import { userMappingSchema } from "@/lib/server/imports/inference-schema";
import {
  getImportDetail,
  importDetailDto,
  saveUserMapping,
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
    return Response.json(importDetailDto(detail).mapping, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function PUT(request, context) {
  try {
    const user = await requireApiUser(request, ["ADMIN", "ANALYST"]);
    const { id } = await context.params;
    const payload = userMappingSchema.parse(await request.json());
    await saveUserMapping(id, payload, user.orgId);
    const detail = await getImportDetail(id, {
      includeRows: true,
      organizationId: user.orgId,
    });
    return Response.json(importDetailDto(detail), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
