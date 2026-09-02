import { runWorkbookAnalysis } from "@/lib/server/imports/analyze";
import { toErrorResponse } from "@/lib/server/imports/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(_request, context) {
  try {
    const { id } = await context.params;
    const result = await runWorkbookAnalysis(id);
    return Response.json(result, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
