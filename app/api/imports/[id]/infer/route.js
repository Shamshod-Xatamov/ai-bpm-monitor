import { toErrorResponse } from "@/lib/server/imports/errors";
import { inferWorkbook } from "@/lib/server/imports/inference";
import {
  getImportDetail,
  importDetailDto,
} from "@/lib/server/imports/repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(_request, context) {
  try {
    const { id } = await context.params;
    await inferWorkbook(id);
    const detail = await getImportDetail(id, { includeRows: true });
    return Response.json(importDetailDto(detail), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
