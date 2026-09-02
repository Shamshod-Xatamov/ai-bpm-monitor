import "server-only";
import { randomUUID } from "node:crypto";
import { db } from "@/lib/server/db";
import { ImportError } from "@/lib/server/imports/errors";

const ROW_BATCH_SIZE = 750;

function now() {
  return new Date();
}

function issueSeverity(affectedPct) {
  if (affectedPct >= 30) return "HIGH";
  if (affectedPct >= 10) return "MEDIUM";
  return "LOW";
}

function qualityIssuesForSheet(sheet, datasetId) {
  const percent = (count) =>
    sheet.rowCount ? Number(((count / sheet.rowCount) * 100).toFixed(2)) : 0;
  const issues = [];
  for (const profile of sheet.profiles) {
    if (profile.nullCount > 0) {
      const affectedPct = percent(profile.nullCount);
      issues.push({
        id: randomUUID(),
        dataset_id: datasetId,
        column_name: profile.label,
        issue_type: "MISSING",
        count: profile.nullCount,
        affected_pct: affectedPct,
        severity: issueSeverity(affectedPct),
        suggested_fix:
          "Manbadan qiymatni to‘ldiring yoki asosli default belgilang.",
      });
    }
    if (profile.invalidCount > 0) {
      const affectedPct = percent(profile.invalidCount);
      issues.push({
        id: randomUUID(),
        dataset_id: datasetId,
        column_name: profile.label,
        issue_type: "TYPE_ERROR",
        count: profile.invalidCount,
        affected_pct: affectedPct,
        severity: issueSeverity(affectedPct),
        suggested_fix: "Ustun qiymatlarini bitta mos formatga keltiring.",
      });
    }
    const outliers = profile.statistics.outlierCount ?? 0;
    if (outliers > 0) {
      const affectedPct = percent(outliers);
      issues.push({
        id: randomUUID(),
        dataset_id: datasetId,
        column_name: profile.label,
        issue_type: "OUTLIER",
        count: outliers,
        affected_pct: affectedPct,
        severity: issueSeverity(affectedPct),
        suggested_fix: "IQR chegarasidan tashqaridagi qiymatlarni tekshiring.",
      });
    }
  }
  if (sheet.duplicateCount > 0) {
    const affectedPct = percent(sheet.duplicateCount);
    issues.push({
      id: randomUUID(),
      dataset_id: datasetId,
      column_name: null,
      issue_type: "DUPLICATE",
      count: sheet.duplicateCount,
      affected_pct: affectedPct,
      severity: issueSeverity(affectedPct),
      suggested_fix:
        "Takroriy qatorlarni biznes kaliti bo‘yicha tasdiqlab olib tashlang.",
    });
  }
  return issues;
}

function mapImportSummary(item) {
  return {
    id: item.id,
    originalName: item.original_filename,
    format: item.format,
    sizeBytes: item.size_bytes,
    status: item.status,
    progress: item.progress,
    currentStage: item.current_stage,
    sheetCount: item.sheet_count,
    totalRows: item.total_rows,
    totalColumns: item.total_columns,
    warnings: item.warnings,
    errorCode: item.error_code,
    errorMessage: item.error_message,
    createdAt: item.created_at.toISOString(),
    updatedAt: item.updated_at.toISOString(),
    completedAt: item.completed_at?.toISOString() ?? null,
  };
}

export async function getOrCreateDefaultOrganization() {
  const existing = await db.organizations.findFirst({
    orderBy: { created_at: "asc" },
  });
  if (existing) return existing;

  const timestamp = now();
  return db.organizations.create({
    data: {
      id: randomUUID(),
      name: "Orient Business Group",
      updated_at: timestamp,
    },
  });
}

export async function createPendingImport({
  organizationId,
  filename,
  extension,
  mimeType,
  sizeBytes,
  sha256,
}) {
  const duplicate = await db.workbook_imports.findFirst({
    where: { org_id: organizationId, sha256 },
    orderBy: { created_at: "desc" },
    select: { id: true, original_filename: true, created_at: true },
  });
  const warnings = duplicate
    ? [
        {
          code: "DUPLICATE_FILE",
          importId: duplicate.id,
          filename: duplicate.original_filename,
          uploadedAt: duplicate.created_at.toISOString(),
        },
      ]
    : [];

  return db.workbook_imports.create({
    data: {
      id: randomUUID(),
      org_id: organizationId,
      original_filename: filename,
      format: extension.toUpperCase(),
      mime_type: mimeType || null,
      size_bytes: sizeBytes,
      sha256,
      status: "PARSING",
      progress: 5,
      current_stage: "Fayl o‘qilmoqda",
      parser_version: "pending",
      warnings,
      updated_at: now(),
    },
  });
}

export async function persistParsedWorkbook(importRecord, parsed, userId) {
  const createdDatasetIds = [];

  try {
    for (const sheet of parsed.sheets) {
      const datasetId = randomUUID();
      const timestamp = now();
      await db.datasets.create({
        data: {
          id: datasetId,
          org_id: importRecord.org_id,
          workbook_import_id: importRecord.id,
          name: sheet.name,
          original_filename: importRecord.original_filename,
          format: parsed.extension.toUpperCase(),
          size_bytes: importRecord.size_bytes,
          row_count: sheet.rowCount,
          column_count: sheet.columnCount,
          status: "PROFILED",
          quality_score: sheet.qualityScore,
          valid_row_count: Math.max(0, sheet.rowCount - sheet.duplicateCount),
          uploaded_by_id: userId,
          sheet_name: sheet.name,
          sheet_index: sheet.index,
          header_row: sheet.headerRow,
          created_at: timestamp,
          updated_at: timestamp,
        },
      });
      createdDatasetIds.push(datasetId);

      if (sheet.profiles.length) {
        await db.dataset_columns.createMany({
          data: sheet.profiles.map((profile) => ({
            id: randomUUID(),
            dataset_id: datasetId,
            position: profile.position,
            source_name: profile.label,
            canonical_key: profile.key,
            data_type: profile.physicalType,
            null_count: profile.nullCount,
            distinct_count: profile.distinctCount,
            invalid_count: profile.invalidCount,
            min_value: profile.statistics.min,
            max_value: profile.statistics.max,
            mean_value: profile.statistics.mean,
            std_dev: profile.statistics.stdDev,
            q1: profile.statistics.q1,
            q3: profile.statistics.q3,
            sample_values: profile.sampleValues,
            mapped_by: "HEURISTIC",
            mapping_confidence: Math.round(sheet.headerConfidence * 100),
            mapping_reason: "Physical profiling va header detection",
          })),
        });
      }

      const qualityIssues = qualityIssuesForSheet(sheet, datasetId);
      if (qualityIssues.length) {
        await db.quality_issues.createMany({ data: qualityIssues });
      }

      for (
        let offset = 0;
        offset < sheet.rows.length;
        offset += ROW_BATCH_SIZE
      ) {
        const batch = sheet.rows.slice(offset, offset + ROW_BATCH_SIZE);
        await db.dataset_rows.createMany({
          data: batch.map((row) => ({
            id: randomUUID(),
            dataset_id: datasetId,
            row_index: row.sourceRowNumber,
            raw: row.values,
            clean: row.values,
            issues: row.isDuplicate ? ["DUPLICATE"] : [],
            is_duplicate: row.isDuplicate,
          })),
        });
      }
    }

    const existingWarnings = Array.isArray(importRecord.warnings)
      ? importRecord.warnings
      : [];
    return db.workbook_imports.update({
      where: { id: importRecord.id },
      data: {
        status: "PROFILED",
        progress: 35,
        current_stage: "Struktura aniqlandi",
        sheet_count: parsed.sheetCount,
        total_rows: parsed.totalRows,
        total_columns: parsed.totalColumns,
        parser_version: parsed.parserVersion,
        warnings: [...existingWarnings, ...parsed.warnings],
        updated_at: now(),
      },
    });
  } catch (error) {
    if (createdDatasetIds.length) {
      await db.datasets.deleteMany({
        where: { id: { in: createdDatasetIds } },
      });
    }
    throw error;
  }
}

export async function markImportFailed(importId, code, message) {
  return db.workbook_imports.update({
    where: { id: importId },
    data: {
      status: "FAILED",
      progress: 100,
      current_stage: "Xatolik",
      error_code: code,
      error_message: message,
      updated_at: now(),
    },
  });
}

export async function updateImportStage(importId, data) {
  return db.workbook_imports.update({
    where: { id: importId },
    data: { ...data, updated_at: now() },
  });
}

export async function listImports({ organizationId, page = 1, pageSize = 20 }) {
  const safePage = Math.max(1, Number(page) || 1);
  const safePageSize = Math.min(50, Math.max(1, Number(pageSize) || 20));
  const [items, total] = await Promise.all([
    db.workbook_imports.findMany({
      where: { org_id: organizationId },
      orderBy: { created_at: "desc" },
      skip: (safePage - 1) * safePageSize,
      take: safePageSize,
    }),
    db.workbook_imports.count({ where: { org_id: organizationId } }),
  ]);

  return {
    items: items.map(mapImportSummary),
    page: safePage,
    pageSize: safePageSize,
    total,
  };
}

export async function getImportDetail(
  importId,
  { includeRows = false, organizationId } = {},
) {
  const item = await db.workbook_imports.findFirst({
    where: {
      id: importId,
      ...(organizationId ? { org_id: organizationId } : {}),
    },
    include: {
      datasets: {
        orderBy: { sheet_index: "asc" },
        include: {
          dataset_columns: { orderBy: { position: "asc" } },
          quality_issues: {
            orderBy: [{ severity: "asc" }, { created_at: "asc" }],
          },
          dataset_rows: includeRows
            ? { orderBy: { row_index: "asc" }, take: 50 }
            : false,
        },
      },
      schema_mappings: {
        orderBy: { version: "desc" },
        take: 1,
      },
      analysis_runs: {
        orderBy: { started_at: "desc" },
        take: 1,
        include: { ai_narratives: true },
      },
      background_jobs: {
        orderBy: { created_at: "desc" },
        take: 1,
      },
    },
  });

  if (!item) {
    throw new ImportError("IMPORT_NOT_FOUND", "Import topilmadi.", 404);
  }

  return item;
}

export function importDetailDto(item) {
  const latestMapping = item.schema_mappings?.[0] ?? null;
  const latestAnalysis = item.analysis_runs?.[0] ?? null;
  return {
    ...mapImportSummary(item),
    sheets: item.datasets.map((dataset) => ({
      id: dataset.id,
      name: dataset.sheet_name ?? dataset.name,
      index: dataset.sheet_index,
      headerRow: dataset.header_row,
      rowCount: dataset.row_count,
      columnCount: dataset.column_count,
      qualityScore: dataset.quality_score,
      qualityIssues: dataset.quality_issues.map((issue) => ({
        id: issue.id,
        columnName: issue.column_name,
        type: issue.issue_type,
        count: issue.count,
        affectedPct: issue.affected_pct,
        severity: issue.severity,
        suggestedFix: issue.suggested_fix,
      })),
      columns: dataset.dataset_columns.map((column) => ({
        id: column.id,
        position: column.position,
        sourceName: column.source_name,
        canonicalKey: column.canonical_key,
        physicalType: column.data_type,
        semanticRole: column.mapping_reason?.startsWith("semantic:")
          ? column.mapping_reason.slice(9)
          : null,
        confidence: column.mapping_confidence,
        nullCount: column.null_count,
        distinctCount: column.distinct_count,
        invalidCount: column.invalid_count,
        samples: column.sample_values,
        statistics: {
          min: column.min_value,
          max: column.max_value,
          mean: column.mean_value,
          stdDev: column.std_dev,
          q1: column.q1,
          q3: column.q3,
          outlierCount:
            dataset.quality_issues.find(
              (issue) =>
                issue.issue_type === "OUTLIER" &&
                issue.column_name === column.source_name,
            )?.count ?? 0,
        },
      })),
      sampleRows:
        dataset.dataset_rows?.map((row) => row.clean ?? row.raw) ?? [],
    })),
    mapping: latestMapping
      ? {
          id: latestMapping.id,
          version: latestMapping.version,
          status: latestMapping.status,
          datasetType: latestMapping.dataset_type,
          datasetSummary: latestMapping.dataset_summary,
          mapping: latestMapping.mapping,
          analysisPlan: latestMapping.analysis_plan,
          relationships: latestMapping.relationships,
          confidence: latestMapping.confidence,
          blockingWarnings: latestMapping.blocking_warnings,
        }
      : null,
    analysis: latestAnalysis
      ? {
          id: latestAnalysis.id,
          status: latestAnalysis.status,
          metrics: latestAnalysis.metrics,
          findings: latestAnalysis.findings,
          chartSpecs: latestAnalysis.chart_specs,
          dataQuality: latestAnalysis.data_quality,
          narrative: latestAnalysis.ai_narratives
            ? {
                summary: latestAnalysis.ai_narratives.summary,
                recommendations: latestAnalysis.ai_narratives.recommendations,
                limitations: latestAnalysis.ai_narratives.limitations,
              }
            : null,
        }
      : null,
    job: item.background_jobs?.[0]
      ? {
          id: item.background_jobs[0].id,
          type: item.background_jobs[0].type,
          status: item.background_jobs[0].status,
          attempts: item.background_jobs[0].attempts,
          maxAttempts: item.background_jobs[0].max_attempts,
          errorMessage: item.background_jobs[0].error_message,
        }
      : null,
  };
}

export async function createMapping(
  importId,
  mappingResult,
  status,
  organizationId,
) {
  const [latest, sourceColumns] = await Promise.all([
    db.schema_mappings.findFirst({
      where: {
        workbook_import_id: importId,
        ...(organizationId
          ? { workbook_imports: { org_id: organizationId } }
          : {}),
      },
      orderBy: { version: "desc" },
      select: { version: true },
    }),
    db.dataset_columns.findMany({
      where: {
        datasets: {
          workbook_import_id: importId,
          ...(organizationId ? { org_id: organizationId } : {}),
        },
      },
      select: { id: true, canonical_key: true },
    }),
  ]);
  const sourceKeys = new Map(
    sourceColumns.map((column) => [column.id, column.canonical_key]),
  );
  const storedSheets = mappingResult.sheets.map((sheet) => ({
    ...sheet,
    columns: sheet.columns.map((column) => ({
      ...column,
      sourceKey: sourceKeys.get(column.columnId) ?? column.canonicalKey,
    })),
  }));
  const mapping = await db.schema_mappings.create({
    data: {
      id: randomUUID(),
      workbook_import_id: importId,
      version: (latest?.version ?? 0) + 1,
      status,
      dataset_type: mappingResult.datasetType,
      dataset_summary: mappingResult.datasetSummary,
      language_hints: mappingResult.languageHints,
      mapping: storedSheets,
      relationships: mappingResult.relationships,
      analysis_plan: mappingResult.analysisRecipes,
      confidence: mappingResult.confidence,
      blocking_warnings: mappingResult.blockingWarnings,
      model_name: mappingResult.modelName,
      prompt_version: mappingResult.promptVersion,
      schema_version: mappingResult.schemaVersion,
      confirmed_at: status === "AUTO_CONFIRMED" ? now() : null,
    },
  });

  for (const sheetMapping of mappingResult.sheets) {
    for (const column of sheetMapping.columns) {
      await db.dataset_columns.updateMany({
        where: { id: column.columnId, dataset_id: sheetMapping.sheetId },
        data: {
          mapping_confidence: Math.round(column.confidence * 100),
          mapped_by: "AI",
          mapping_reason: `semantic:${column.semanticRole}`,
          unit_scale: column.unitScale ?? null,
        },
      });
    }
  }

  return mapping;
}

export async function saveUserMapping(importId, payload, organizationId) {
  const detail = await getImportDetail(importId, { organizationId });
  const existingColumns = new Map(
    detail.datasets.flatMap((dataset) =>
      dataset.dataset_columns.map((column) => [column.id, dataset.id]),
    ),
  );
  for (const sheet of payload.sheets) {
    for (const column of sheet.columns) {
      if (existingColumns.get(column.columnId) !== sheet.sheetId) {
        throw new ImportError(
          "MAPPING_INVALID",
          "Mapping ichida workbookga tegishli bo‘lmagan ustun bor.",
        );
      }
    }
  }

  const normalized = {
    ...payload,
    modelName: null,
    promptVersion: "user-review-v1",
    schemaVersion: "mapping-v1",
    blockingWarnings: [],
  };
  const mapping = await createMapping(
    importId,
    normalized,
    "USER_CONFIRMED",
    organizationId,
  );
  await updateImportStage(importId, {
    status: "READY_TO_ANALYZE",
    progress: 65,
    current_stage: "Mapping tasdiqlandi",
  });
  return mapping;
}

export async function createAnalysisRun(importId, mappingId) {
  return db.analysis_runs.create({
    data: {
      id: randomUUID(),
      workbook_import_id: importId,
      mapping_id: mappingId,
      status: "RUNNING",
      engine_version: "analysis-v1",
      metrics: [],
      findings: [],
      chart_specs: [],
      data_quality: {},
    },
  });
}

export async function findCompletedAnalysis(mappingId) {
  return db.analysis_runs.findFirst({
    where: {
      mapping_id: mappingId,
      status: { in: ["COMPLETED", "PARTIAL"] },
    },
    orderBy: { completed_at: "desc" },
    include: { ai_narratives: true },
  });
}

export async function getAnalysisSource(importId, mappingId, organizationId) {
  const item = await db.workbook_imports.findFirst({
    where: {
      id: importId,
      ...(organizationId ? { org_id: organizationId } : {}),
    },
    include: {
      datasets: {
        orderBy: { sheet_index: "asc" },
        include: {
          dataset_columns: { orderBy: { position: "asc" } },
          dataset_rows: { orderBy: { row_index: "asc" } },
        },
      },
      schema_mappings: {
        where: { id: mappingId },
        take: 1,
      },
    },
  });
  if (!item || !item.schema_mappings.length) {
    throw new ImportError(
      "MAPPING_INVALID",
      "Tasdiqlangan mapping topilmadi.",
      404,
    );
  }
  return { item, mapping: item.schema_mappings[0] };
}

export async function completeAnalysisRun(runId, result, status = "COMPLETED") {
  return db.analysis_runs.update({
    where: { id: runId },
    data: {
      status,
      metrics: result.metrics,
      findings: result.findings,
      chart_specs: result.chartSpecs,
      data_quality: result.dataQuality,
      completed_at: now(),
    },
  });
}

export async function failAnalysisRun(runId, code, message) {
  return db.analysis_runs.update({
    where: { id: runId },
    data: {
      status: "FAILED",
      error_code: code,
      error_message: message,
      completed_at: now(),
    },
  });
}

export async function saveNarrative(runId, narrative) {
  return db.ai_narratives.upsert({
    where: { analysis_run_id: runId },
    create: {
      id: randomUUID(),
      analysis_run_id: runId,
      model_name: narrative.modelName ?? "deterministic",
      prompt_version: narrative.promptVersion,
      summary: narrative.summary,
      recommendations: narrative.recommendations,
      limitations: narrative.limitations,
      evidence_links: narrative.evidenceLinks,
      usage_metadata: narrative.usageMetadata,
    },
    update: {
      model_name: narrative.modelName ?? "deterministic",
      prompt_version: narrative.promptVersion,
      summary: narrative.summary,
      recommendations: narrative.recommendations,
      limitations: narrative.limitations,
      evidence_links: narrative.evidenceLinks,
      usage_metadata: narrative.usageMetadata,
    },
  });
}
