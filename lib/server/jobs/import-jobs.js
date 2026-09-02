import "server-only";
import { randomUUID } from "node:crypto";
import { db } from "@/lib/server/db";
import { runWorkbookAnalysis } from "@/lib/server/imports/analyze";
import { errorMessage, ImportError } from "@/lib/server/imports/errors";
import { inferWorkbook } from "@/lib/server/imports/inference";
import { getImportDetail } from "@/lib/server/imports/repository";

const STALE_LOCK_MS = 5 * 60 * 1000;

export function jobDto(job) {
  return {
    id: job.id,
    importId: job.workbook_import_id,
    type: job.type,
    status: job.status,
    attempts: job.attempts,
    maxAttempts: job.max_attempts,
    errorCode: job.error_code,
    errorMessage: job.error_message,
    createdAt: job.created_at.toISOString(),
    completedAt: job.completed_at?.toISOString() ?? null,
  };
}

export async function enqueueImportJob({ organizationId, importId, type }) {
  const detail = await getImportDetail(importId, { organizationId });
  if (
    type === "INFER_WORKBOOK" &&
    !["PROFILED", "NEEDS_REVIEW", "FAILED"].includes(detail.status)
  ) {
    throw new ImportError(
      "IMPORT_STAGE_INVALID",
      "Bu import hozir AI mapping bosqichiga tayyor emas.",
      409,
    );
  }
  if (type === "ANALYZE_WORKBOOK") {
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
  }
  const active = await db.background_jobs.findFirst({
    where: {
      org_id: organizationId,
      workbook_import_id: importId,
      type,
      status: { in: ["PENDING", "RUNNING"] },
    },
    orderBy: { created_at: "desc" },
  });
  if (active) return active;

  return db.background_jobs.create({
    data: {
      id: randomUUID(),
      org_id: organizationId,
      workbook_import_id: importId,
      type,
      updated_at: new Date(),
    },
  });
}

async function claimNextJob(organizationId) {
  const now = new Date();
  const staleBefore = new Date(now.getTime() - STALE_LOCK_MS);

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const candidate = await db.background_jobs.findFirst({
      where: {
        ...(organizationId ? { org_id: organizationId } : {}),
        attempts: { lt: 3 },
        OR: [
          { status: "PENDING", run_after: { lte: now } },
          { status: "RUNNING", locked_at: { lt: staleBefore } },
        ],
      },
      orderBy: [{ run_after: "asc" }, { created_at: "asc" }],
    });
    if (!candidate) return null;

    const claimed = await db.background_jobs.updateMany({
      where: {
        id: candidate.id,
        status: candidate.status,
        updated_at: candidate.updated_at,
      },
      data: {
        status: "RUNNING",
        locked_at: now,
        attempts: { increment: 1 },
        error_code: null,
        error_message: null,
        updated_at: now,
      },
    });
    if (claimed.count === 1) {
      return db.background_jobs.findUnique({ where: { id: candidate.id } });
    }
  }
  return null;
}

async function executeJob(job) {
  if (job.type === "INFER_WORKBOOK") {
    return inferWorkbook(job.workbook_import_id, job.org_id);
  }
  if (job.type === "ANALYZE_WORKBOOK") {
    return runWorkbookAnalysis(job.workbook_import_id, job.org_id);
  }
  throw new ImportError("JOB_TYPE_UNKNOWN", "Noma’lum background job turi.");
}

async function processClaimedJob(job) {
  try {
    await executeJob(job);
    await db.background_jobs.update({
      where: { id: job.id },
      data: {
        status: "COMPLETED",
        completed_at: new Date(),
        locked_at: null,
        updated_at: new Date(),
      },
    });
    return { id: job.id, status: "COMPLETED" };
  } catch (error) {
    const retry = job.attempts < job.max_attempts;
    const delaySeconds = Math.min(60, 2 ** job.attempts * 5);
    await db.background_jobs.update({
      where: { id: job.id },
      data: {
        status: retry ? "PENDING" : "FAILED",
        run_after: retry
          ? new Date(Date.now() + delaySeconds * 1000)
          : job.run_after,
        completed_at: retry ? null : new Date(),
        locked_at: null,
        error_code: error instanceof ImportError ? error.code : "JOB_FAILED",
        error_message: errorMessage(error).slice(0, 1000),
        updated_at: new Date(),
      },
    });
    return { id: job.id, status: retry ? "PENDING" : "FAILED" };
  }
}

export async function drainImportJobs({ organizationId, limit = 1 } = {}) {
  const results = [];
  for (let index = 0; index < Math.min(Math.max(limit, 1), 10); index += 1) {
    const job = await claimNextJob(organizationId);
    if (!job) break;
    results.push(await processClaimedJob(job));
  }
  return results;
}

export async function latestJobForImport(importId, organizationId) {
  return db.background_jobs.findFirst({
    where: { workbook_import_id: importId, org_id: organizationId },
    orderBy: { created_at: "desc" },
  });
}
