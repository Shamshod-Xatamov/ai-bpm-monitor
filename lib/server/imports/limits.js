import "server-only";
import { getServerEnv } from "@/lib/server/env";

export const supportedExtensions = new Set([
  "xlsx",
  "xls",
  "xlsb",
  "xlsm",
  "csv",
  "ods",
]);

export function getImportLimits() {
  const env = getServerEnv();

  return {
    maxFileBytes: env.IMPORT_MAX_FILE_BYTES,
    maxSheets: env.IMPORT_MAX_SHEETS,
    maxRows: env.IMPORT_MAX_ROWS,
    maxColumnsPerSheet: env.IMPORT_MAX_COLUMNS_PER_SHEET,
    sampleRowsPerSheet: env.IMPORT_SAMPLE_ROWS_PER_SHEET,
    autoConfirmThreshold: env.IMPORT_AUTO_CONFIRM_THRESHOLD,
  };
}

export function extensionFromName(filename) {
  const clean = String(filename || "")
    .trim()
    .toLowerCase();
  const dot = clean.lastIndexOf(".");
  return dot >= 0 ? clean.slice(dot + 1) : "";
}

export function datasetFormat(extension) {
  const normalized = extension.toUpperCase();
  return normalized === "CSV" ? "CSV" : normalized;
}
