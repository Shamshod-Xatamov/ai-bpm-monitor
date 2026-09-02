import "server-only";
import XLSX from "xlsx";
import { ImportError } from "@/lib/server/imports/errors";
import {
  extensionFromName,
  getImportLimits,
  supportedExtensions,
} from "@/lib/server/imports/limits";

const MAX_CELL_TEXT = 10_000;
const HEADER_SCAN_ROWS = 30;

function isBlank(value) {
  return value === null || value === undefined || String(value).trim() === "";
}

function safeCellValue(value) {
  if (isBlank(value)) return null;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value.slice(0, MAX_CELL_TEXT).trim();
  return String(value).slice(0, MAX_CELL_TEXT).trim();
}

function normalizeLabel(value, fallback) {
  const label = String(value ?? "")
    .normalize("NFKC")
    .replace(/\s+/g, " ")
    .trim();
  return label || fallback;
}

function keyFromLabel(label, index, used) {
  const base = String(label)
    .normalize("NFKD")
    .replace(/[‘’ʻʼ`']/g, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 80);
  const seed = base || `column_${index + 1}`;
  let key = seed;
  let suffix = 2;
  while (used.has(key)) {
    key = `${seed}_${suffix}`;
    suffix += 1;
  }
  used.add(key);
  return key;
}

function rowMetrics(row) {
  const values = row.filter((value) => !isBlank(value));
  const strings = values.filter((value) => typeof value === "string");
  const unique = new Set(
    values.map((value) => String(value).trim().toLowerCase()),
  );
  return {
    nonEmpty: values.length,
    stringRatio: values.length ? strings.length / values.length : 0,
    uniqueRatio: values.length ? unique.size / values.length : 0,
  };
}

function detectHeaderRow(rows) {
  const candidates = [];
  const scanEnd = Math.min(rows.length, HEADER_SCAN_ROWS);
  const widest = rows
    .slice(0, scanEnd)
    .reduce((max, row) => Math.max(max, row.length), 0);

  for (let index = 0; index < scanEnd; index += 1) {
    const row = rows[index] ?? [];
    const metrics = rowMetrics(row);
    if (metrics.nonEmpty < 2) continue;

    const nextRows = rows
      .slice(index + 1, index + 6)
      .filter((next) => rowMetrics(next).nonEmpty > 0);
    const nextDensity = nextRows.length
      ? nextRows.reduce(
          (sum, next) => sum + rowMetrics(next).nonEmpty / Math.max(widest, 1),
          0,
        ) / nextRows.length
      : 0;
    const coverage = metrics.nonEmpty / Math.max(widest, 1);
    const sparsePenalty = coverage < 0.35 ? 3 : 0;
    const score =
      metrics.stringRatio * 4 +
      metrics.uniqueRatio * 2 +
      nextDensity * 3 +
      coverage * 2 -
      sparsePenalty -
      index * 0.015;

    candidates.push({ index, score });
  }

  if (!candidates.length) {
    const firstMeaningful = rows.findIndex(
      (row) => rowMetrics(row).nonEmpty > 0,
    );
    return { rowIndex: Math.max(firstMeaningful, 0), confidence: 0.35 };
  }

  candidates.sort((left, right) => right.score - left.score);
  const best = candidates[0];
  const runnerUp = candidates[1];
  const gap = runnerUp ? Math.max(0, best.score - runnerUp.score) : 2;
  const confidence = Math.min(0.98, Math.max(0.45, 0.62 + gap * 0.08));
  return { rowIndex: best.index, confidence };
}

function stringLooksNumeric(value) {
  const normalized = value
    .replace(/[\s_]/g, "")
    .replace(/[%₽$€£¥]|UZS|USD|EUR|so['‘’ʻʼ`]?m/giu, "")
    .replace(/,(?=\d{1,2}$)/, ".");
  return /^[-+]?\d+(?:\.\d+)?$/.test(normalized);
}

function stringLooksDate(value) {
  const clean = value.trim();
  if (!/[./-]/.test(clean)) return false;
  if (!/^\d{1,4}[./-]\d{1,2}[./-]\d{1,4}(?:[ T].*)?$/.test(clean)) {
    return false;
  }
  return Number.isFinite(Date.parse(clean));
}

function valueType(value) {
  if (isBlank(value)) return "BLANK";
  if (typeof value === "boolean") return "BOOLEAN";
  if (typeof value === "number") return "NUMBER";
  if (value instanceof Date) return "DATE";
  const text = String(value).trim();
  if (/^(true|false|yes|no|ha|yo['‘’ʻʼ`]?q)$/i.test(text)) return "BOOLEAN";
  if (stringLooksNumeric(text)) return "NUMBER";
  if (stringLooksDate(text)) return "DATE";
  return "TEXT";
}

function numericValue(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return null;
  const normalized = value
    .replace(/[\s_]/g, "")
    .replace(/[%₽$€£¥]|UZS|USD|EUR|so['‘’ʻʼ`]?m/giu, "")
    .replace(/,(?=\d{1,2}$)/, ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function quantile(sorted, percentile) {
  if (!sorted.length) return null;
  const position = (sorted.length - 1) * percentile;
  const base = Math.floor(position);
  const rest = position - base;
  const next = sorted[base + 1];
  return next === undefined
    ? sorted[base]
    : sorted[base] + rest * (next - sorted[base]);
}

function profileColumn(values) {
  const counts = { BLANK: 0, BOOLEAN: 0, NUMBER: 0, DATE: 0, TEXT: 0 };
  const samples = [];
  const seenSamples = new Set();
  const unique = new Set();

  for (const value of values) {
    const type = valueType(value);
    counts[type] += 1;
    if (type === "BLANK") continue;
    const comparable = JSON.stringify(safeCellValue(value));
    unique.add(comparable);
    if (samples.length < 8 && !seenSamples.has(comparable)) {
      samples.push(safeCellValue(value));
      seenSamples.add(comparable);
    }
  }

  const nonBlank = values.length - counts.BLANK;
  const dominant = ["BOOLEAN", "NUMBER", "DATE", "TEXT"].sort(
    (left, right) => counts[right] - counts[left],
  )[0];
  const dominance = nonBlank ? counts[dominant] / nonBlank : 0;
  const physicalType =
    nonBlank === 0 ? "UNKNOWN" : dominance >= 0.7 ? dominant : "UNKNOWN";
  const invalidCount =
    physicalType === "UNKNOWN"
      ? 0
      : Math.max(0, nonBlank - counts[physicalType]);
  const numbers =
    physicalType === "NUMBER"
      ? values
          .map(numericValue)
          .filter((value) => value !== null)
          .sort((left, right) => left - right)
      : [];
  const mean = numbers.length
    ? numbers.reduce((sum, value) => sum + value, 0) / numbers.length
    : null;
  const variance = numbers.length
    ? numbers.reduce((sum, value) => sum + (value - mean) ** 2, 0) /
      numbers.length
    : null;
  const q1 = quantile(numbers, 0.25);
  const q3 = quantile(numbers, 0.75);
  const iqr = q1 === null || q3 === null ? null : q3 - q1;
  const outlierCount =
    iqr === null
      ? 0
      : iqr === 0
        ? numbers.filter((value) => value !== q1).length
        : numbers.filter(
            (value) => value < q1 - 1.5 * iqr || value > q3 + 1.5 * iqr,
          ).length;

  return {
    physicalType,
    nullCount: counts.BLANK,
    distinctCount: unique.size,
    invalidCount,
    sampleValues: samples,
    statistics: {
      typeCounts: counts,
      completeness: values.length
        ? (values.length - counts.BLANK) / values.length
        : 0,
      min: numbers.length ? numbers[0] : null,
      max: numbers.length ? numbers.at(-1) : null,
      mean,
      stdDev: variance === null ? null : Math.sqrt(variance),
      q1,
      median: quantile(numbers, 0.5),
      q3,
      outlierCount,
    },
  };
}

function isRepeatedHeader(row, labels) {
  if (!labels.length) return false;
  const matches = labels.reduce((count, label, index) => {
    const current = normalizeLabel(row[index], "").toLowerCase();
    return count + (current === label.toLowerCase() ? 1 : 0);
  }, 0);
  return matches / labels.length >= 0.8;
}

function parseSheet(workbook, sheetName, sheetIndex) {
  const sheet = workbook.Sheets[sheetName];
  const matrix = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    raw: true,
    defval: null,
    blankrows: true,
  });
  const normalizedMatrix = matrix.map((row) => row.map(safeCellValue));
  const { rowIndex: headerRow, confidence: headerConfidence } =
    detectHeaderRow(normalizedMatrix);
  const headerValues = normalizedMatrix[headerRow] ?? [];
  const lastHeaderColumn = headerValues.reduce(
    (last, value, index) => (!isBlank(value) ? index : last),
    -1,
  );
  const nextRowsWidth = normalizedMatrix
    .slice(headerRow + 1)
    .reduce((max, row) => Math.max(max, row.length), 0);
  const columnCount = Math.max(lastHeaderColumn + 1, nextRowsWidth);
  const usedKeys = new Set();
  const labels = Array.from({ length: columnCount }, (_, index) =>
    normalizeLabel(headerValues[index], `Ustun ${index + 1}`),
  );
  const keys = labels.map((label, index) =>
    keyFromLabel(label, index, usedKeys),
  );
  const rawDataRows = normalizedMatrix
    .slice(headerRow + 1)
    .map((row, rowOffset) => ({
      row,
      sourceRowNumber: headerRow + rowOffset + 2,
    }))
    .filter(({ row }) => row.some((value) => !isBlank(value)))
    .filter(({ row }) => !isRepeatedHeader(row, labels))
    .map(({ row, sourceRowNumber }) => ({
      sourceRowNumber,
      values: Object.fromEntries(
        keys.map((key, index) => [key, safeCellValue(row[index])]),
      ),
    }));
  const seenRows = new Set();
  let duplicateCount = 0;
  const dataRows = rawDataRows.map((row) => {
    const signature = JSON.stringify(row.values);
    const isDuplicate = seenRows.has(signature);
    if (isDuplicate) duplicateCount += 1;
    else seenRows.add(signature);
    return { ...row, isDuplicate };
  });
  const profiles = keys.map((key, index) => ({
    position: index,
    key,
    label: labels[index],
    ...profileColumn(dataRows.map((row) => row.values[key])),
  }));
  const completeness = profiles.length
    ? profiles.reduce(
        (sum, profile) => sum + profile.statistics.completeness,
        0,
      ) / profiles.length
    : 0;
  const mixedPenalty = profiles.filter(
    (profile) => profile.physicalType === "UNKNOWN",
  ).length;
  const qualityScore = Math.max(
    0,
    Math.min(100, Math.round(completeness * 100 - mixedPenalty * 2)),
  );
  const warnings = [];
  if (headerConfidence < 0.65) warnings.push("HEADER_LOW_CONFIDENCE");
  if (!dataRows.length) warnings.push("SHEET_HAS_NO_DATA_ROWS");
  if (!columnCount) warnings.push("SHEET_HAS_NO_COLUMNS");
  const visibilityCode = workbook.Workbook?.Sheets?.[sheetIndex]?.Hidden ?? 0;

  return {
    name: sheetName,
    index: sheetIndex,
    visibility: visibilityCode === 0 ? "visible" : "hidden",
    headerRow,
    headerConfidence,
    rowCount: dataRows.length,
    columnCount,
    qualityScore,
    duplicateCount,
    rows: dataRows,
    profiles,
    warnings,
  };
}

function validateSignature(buffer, extension) {
  if (extension === "csv") return;
  const zipBased = ["xlsx", "xlsb", "xlsm", "ods"].includes(extension);
  const isZip = buffer[0] === 0x50 && buffer[1] === 0x4b;
  const isCompound =
    buffer[0] === 0xd0 &&
    buffer[1] === 0xcf &&
    buffer[2] === 0x11 &&
    buffer[3] === 0xe0;

  if ((zipBased && !isZip) || (extension === "xls" && !isCompound && !isZip)) {
    throw new ImportError(
      "IMPORT_SIGNATURE_INVALID",
      "Fayl kengaytmasi uning ichki formatiga mos emas.",
    );
  }
}

export function parseSpreadsheet({ buffer, filename, mimeType }) {
  const limits = getImportLimits();
  const extension = extensionFromName(filename);

  if (!supportedExtensions.has(extension)) {
    throw new ImportError(
      "IMPORT_FORMAT_UNSUPPORTED",
      "Bu spreadsheet formati qo‘llab-quvvatlanmaydi.",
      415,
      { supported: [...supportedExtensions] },
    );
  }
  if (!buffer.length) {
    throw new ImportError("IMPORT_WORKBOOK_EMPTY", "Yuklangan fayl bo‘sh.");
  }
  if (buffer.length > limits.maxFileBytes) {
    throw new ImportError(
      "IMPORT_FILE_TOO_LARGE",
      `Fayl hajmi ${Math.round(limits.maxFileBytes / 1024 / 1024)} MB limitdan oshdi.`,
      413,
    );
  }

  validateSignature(buffer, extension);

  let workbook;
  try {
    workbook = XLSX.read(buffer, {
      type: "buffer",
      cellDates: true,
      cellFormula: true,
      dense: true,
      WTF: false,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Parse error";
    const passwordProtected = /password|encrypted|encrypt/i.test(message);
    throw new ImportError(
      passwordProtected ? "IMPORT_PASSWORD_PROTECTED" : "IMPORT_PARSE_FAILED",
      passwordProtected
        ? "Parol bilan himoyalangan faylni o‘qib bo‘lmaydi."
        : "Spreadsheet faylini o‘qib bo‘lmadi.",
      422,
    );
  }

  if (!workbook.SheetNames.length) {
    throw new ImportError(
      "IMPORT_WORKBOOK_EMPTY",
      "Workbook ichida sheet topilmadi.",
    );
  }
  if (workbook.SheetNames.length > limits.maxSheets) {
    throw new ImportError(
      "IMPORT_LIMIT_EXCEEDED",
      `Workbook ${limits.maxSheets} tadan ko‘p sheetga ega.`,
      413,
    );
  }

  const sheets = workbook.SheetNames.map((sheetName, index) =>
    parseSheet(workbook, sheetName, index),
  );
  const totalRows = sheets.reduce((sum, sheet) => sum + sheet.rowCount, 0);
  const totalColumns = sheets.reduce(
    (sum, sheet) => sum + sheet.columnCount,
    0,
  );
  const tooWide = sheets.find(
    (sheet) => sheet.columnCount > limits.maxColumnsPerSheet,
  );

  if (totalRows > limits.maxRows) {
    throw new ImportError(
      "IMPORT_LIMIT_EXCEEDED",
      `Workbook ${limits.maxRows.toLocaleString("uz-UZ")} qator limitidan oshdi.`,
      413,
    );
  }
  if (tooWide) {
    throw new ImportError(
      "IMPORT_LIMIT_EXCEEDED",
      `“${tooWide.name}” sheetida ${limits.maxColumnsPerSheet} tadan ko‘p ustun bor.`,
      413,
    );
  }

  return {
    extension,
    mimeType: mimeType || null,
    parserVersion: `sheetjs-${XLSX.version}`,
    sheetCount: sheets.length,
    totalRows,
    totalColumns,
    sheets,
    warnings: sheets.flatMap((sheet) =>
      sheet.warnings.map((warning) => ({ sheet: sheet.name, code: warning })),
    ),
  };
}
