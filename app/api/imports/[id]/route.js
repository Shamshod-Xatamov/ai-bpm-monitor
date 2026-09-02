import { toErrorResponse } from "@/lib/server/imports/errors";
import {
  getImportDetail,
  importDetailDto,
} from "@/lib/server/imports/repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request, context) {
  try {
    const { id } = await context.params;
    const detail = await getImportDetail(id, { includeRows: true });
    return Response.json(importDetailDto(detail), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
