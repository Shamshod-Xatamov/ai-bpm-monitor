import { toErrorResponse } from "@/lib/server/imports/errors";
import { userMappingSchema } from "@/lib/server/imports/inference-schema";
import {
  getImportDetail,
  importDetailDto,
  saveUserMapping,
} from "@/lib/server/imports/repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request, context) {
  try {
    const { id } = await context.params;
    const detail = await getImportDetail(id, { includeRows: true });
    return Response.json(importDetailDto(detail).mapping, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function PUT(request, context) {
  try {
    const { id } = await context.params;
    const payload = userMappingSchema.parse(await request.json());
    await saveUserMapping(id, payload);
    const detail = await getImportDetail(id, { includeRows: true });
    return Response.json(importDetailDto(detail), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
