import "server-only";
import { analyzeWorkbook } from "@/lib/server/imports/analysis-engine";
import { errorMessage, ImportError } from "@/lib/server/imports/errors";
import { generateAnalysisNarrative } from "@/lib/server/imports/narrative";
import {
  completeAnalysisRun,
  createAnalysisRun,
  failAnalysisRun,
  findCompletedAnalysis,
  getAnalysisSource,
  getImportDetail,
  importDetailDto,
  saveNarrative,
  updateImportStage,
} from "@/lib/server/imports/repository";

export async function runWorkbookAnalysis(importId) {
  const detail = await getImportDetail(importId);
  const mapping = detail.schema_mappings?.[0];

  if (
    !mapping ||
    !["AUTO_CONFIRMED", "USER_CONFIRMED"].includes(mapping.status)
  ) {
    throw new ImportError(
      "MAPPING_CONFIRMATION_REQUIRED",
      "Tahlildan oldin ustun mappingini tasdiqlang.",
      409,
    );
  }

  const cached = await findCompletedAnalysis(mapping.id);
  if (cached) return importDetailDto(await getImportDetail(importId));

  await updateImportStage(importId, {
    status: "ANALYZING",
    progress: 75,
    current_stage: "Deterministic tahlil bajarilmoqda",
    error_code: null,
    error_message: null,
  });
  const run = await createAnalysisRun(importId, mapping.id);

  try {
    const source = await getAnalysisSource(importId, mapping.id);
    const result = analyzeWorkbook(source.item, source.mapping);
    const narrative = await generateAnalysisNarrative(source.item, result);
    await completeAnalysisRun(run.id, result, "COMPLETED");
    await saveNarrative(run.id, narrative);
    await updateImportStage(importId, {
      status: "COMPLETED",
      progress: 100,
      current_stage: "Tahlil tayyor",
      completed_at: new Date(),
    });

    return importDetailDto(await getImportDetail(importId));
  } catch (error) {
    const message = errorMessage(error);
    await failAnalysisRun(run.id, "ANALYSIS_FAILED", message);
    await updateImportStage(importId, {
      status: "FAILED",
      progress: 100,
      current_stage: "Tahlil xatosi",
      error_code: "ANALYSIS_FAILED",
      error_message: message,
    });
    throw error;
  }
}
