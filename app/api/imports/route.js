import { ingestSpreadsheetFile } from "@/lib/server/imports/ingest";
import { toErrorResponse } from "@/lib/server/imports/errors";
import {
  getImportDetail,
  importDetailDto,
  listImports,
} from "@/lib/server/imports/repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const result = await listImports({
      page: url.searchParams.get("page"),
      pageSize: url.searchParams.get("pageSize"),
    });
    return Response.json(result, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const imported = await ingestSpreadsheetFile(file);
    const detail = await getImportDetail(imported.id, { includeRows: true });
    return Response.json(importDetailDto(detail), {
      status: 201,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
