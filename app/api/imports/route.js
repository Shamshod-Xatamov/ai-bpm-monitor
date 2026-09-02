import { ingestSpreadsheetFile } from "@/lib/server/imports/ingest";
import { requireApiUser } from "@/lib/server/auth/session";
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
    const user = await requireApiUser(request);
    const url = new URL(request.url);
    const result = await listImports({
      organizationId: user.orgId,
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
    const user = await requireApiUser(request, ["ADMIN", "ANALYST"]);
    const formData = await request.formData();
    const file = formData.get("file");
    const imported = await ingestSpreadsheetFile(file, {
      organizationId: user.orgId,
      userId: user.id,
    });
    const detail = await getImportDetail(imported.id, {
      includeRows: true,
      organizationId: user.orgId,
    });
    return Response.json(importDetailDto(detail), {
      status: 201,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
