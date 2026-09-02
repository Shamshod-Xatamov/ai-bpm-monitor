import "server-only";

const ENGINE_VERSION = "analysis-v1";

function isBlank(value) {
  return value === null || value === undefined || String(value).trim() === "";
}

function toNumber(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return null;
  const normalized = value
    .replace(/[\s_]/g, "")
    .replace(/[%₽$€£¥]|UZS|USD|EUR|so['‘’ʻʼ`]?m/giu, "")
    .replace(/,(?=\d{1,2}$)/, ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function toDate(value) {
  if (value instanceof Date && Number.isFinite(value.getTime())) return value;
  if (typeof value !== "string" && typeof value !== "number") return null;
  const parsed = new Date(value);
  return Number.isFinite(parsed.getTime()) ? parsed : null;
}

function average(values) {
  return values.length
    ? values.reduce((sum, value) => sum + value, 0) / values.length
    : null;
}

function median(values) {
  if (!values.length) return null;
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? sorted[middle]
    : (sorted[middle - 1] + sorted[middle]) / 2;
}

function quantile(values, percentile) {
  if (!values.length) return null;
  const sorted = [...values].sort((left, right) => left - right);
  const position = (sorted.length - 1) * percentile;
  const base = Math.floor(position);
  const rest = position - base;
  return sorted[base + 1] === undefined
    ? sorted[base]
    : sorted[base] + rest * (sorted[base + 1] - sorted[base]);
}

function round(value, digits = 1) {
  return value === null || !Number.isFinite(value)
    ? null
    : Number(value.toFixed(digits));
}

function topCategories(rows, sourceKey, limit = 8) {
  const counts = new Map();
  for (const row of rows) {
    const value = row[sourceKey];
    if (isBlank(value)) continue;
    const label = String(value).slice(0, 80);
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, limit)
    .map(([label, value]) => ({ label, value }));
}

function mappingColumns(mapping) {
  const sheets = Array.isArray(mapping.mapping) ? mapping.mapping : [];
  return sheets.flatMap((sheet) =>
    sheet.columns.map((column) => ({ ...column, sheetId: sheet.sheetId })),
  );
}

function metric(id, label, value, unit, detail, tone = "neutral") {
  return { id, label, value, unit, detail, tone };
}

function finding(id, severity, title, summary, evidence, method) {
  return {
    id,
    type: "deterministic",
    severity,
    title,
    summary,
    evidence,
    calculationMethod: method,
    limitations: [],
  };
}

export function analyzeWorkbook(item, mapping) {
  const columns = mappingColumns(mapping);
  const columnByRole = new Map();
  for (const column of columns) {
    if (!columnByRole.has(column.semanticRole)) {
      columnByRole.set(column.semanticRole, column);
    }
  }
  const rowsBySheet = new Map(
    item.datasets.map((dataset) => [
      dataset.id,
      dataset.dataset_rows.map((row) => row.clean ?? row.raw),
    ]),
  );
  const allRows = item.datasets.flatMap((dataset) =>
    dataset.dataset_rows.map((row) => row.clean ?? row.raw),
  );
  const totalCells = item.datasets.reduce(
    (sum, dataset) => sum + dataset.row_count * dataset.column_count,
    0,
  );
  const missingCells = item.datasets.reduce(
    (sum, dataset) =>
      sum +
      dataset.dataset_columns.reduce(
        (columnSum, column) => columnSum + column.null_count,
        0,
      ),
    0,
  );
  const completeness = totalCells
    ? ((totalCells - missingCells) / totalCells) * 100
    : 0;
  const duplicateKeys = new Set();
  let duplicates = 0;
  for (const row of allRows) {
    const key = JSON.stringify(row);
    if (duplicateKeys.has(key)) duplicates += 1;
    else duplicateKeys.add(key);
  }
  const duplicateRate = allRows.length
    ? (duplicates / allRows.length) * 100
    : 0;
  const metrics = [
    metric(
      "row_count",
      "Jami qatorlar",
      allRows.length,
      "ta",
      `${item.sheet_count} ta sheet`,
      "neutral",
    ),
    metric(
      "completeness",
      "Ma’lumot to‘liqligi",
      round(completeness),
      "%",
      `${missingCells} ta bo‘sh cell`,
      completeness >= 90 ? "positive" : "warning",
    ),
    metric(
      "duplicate_rate",
      "Takroriy qatorlar",
      round(duplicateRate),
      "%",
      `${duplicates} ta qator`,
      duplicateRate > 5 ? "warning" : "positive",
    ),
    metric(
      "quality_score",
      "O‘rtacha sifat balli",
      round(
        average(item.datasets.map((dataset) => dataset.quality_score ?? 0)),
      ),
      "ball",
      "100 ballik profil",
      completeness >= 90 ? "positive" : "warning",
    ),
  ];
  const findings = [];
  const chartSpecs = [];

  if (completeness < 90) {
    findings.push(
      finding(
        "finding_missing",
        completeness < 70 ? "critical" : "warning",
        "Ma’lumotlarda bo‘sh qiymatlar bor",
        `Umumiy to‘liqlik ${round(completeness)}%: ${missingCells} ta cell bo‘sh.`,
        ["completeness"],
        "1 − bo‘sh celllar / barcha celllar",
      ),
    );
  }
  if (duplicateRate > 2) {
    findings.push(
      finding(
        "finding_duplicates",
        duplicateRate > 10 ? "critical" : "warning",
        "Takroriy qatorlar aniqlandi",
        `${duplicates} ta qator boshqa qator bilan to‘liq bir xil.`,
        ["duplicate_rate"],
        "Canonical JSON qatorlarining exact comparison’i",
      ),
    );
  }

  const categoryColumn =
    columnByRole.get("department") ??
    columnByRole.get("process") ??
    columnByRole.get("category") ??
    columnByRole.get("status");
  if (categoryColumn) {
    const rows = rowsBySheet.get(categoryColumn.sheetId) ?? [];
    const data = topCategories(rows, categoryColumn.sourceKey);
    if (data.length) {
      chartSpecs.push({
        id: "category_distribution",
        type: "bar",
        title: categoryColumn.businessLabel,
        data,
      });
    }
  }

  const startColumn = columnByRole.get("start_datetime");
  const endColumn = columnByRole.get("end_datetime");
  const durationColumn = columnByRole.get("duration");
  const slaColumn = columnByRole.get("sla_target");
  let durationValues = [];
  let durationRows = [];
  if (durationColumn) {
    const rows = rowsBySheet.get(durationColumn.sheetId) ?? [];
    durationRows = rows
      .map((row) => ({
        row,
        duration: toNumber(row[durationColumn.sourceKey]),
      }))
      .filter((entry) => entry.duration !== null);
    durationValues = durationRows.map((entry) => entry.duration);
  } else if (
    startColumn &&
    endColumn &&
    startColumn.sheetId === endColumn.sheetId
  ) {
    const rows = rowsBySheet.get(startColumn.sheetId) ?? [];
    durationRows = rows
      .map((row) => {
        const start = toDate(row[startColumn.sourceKey]);
        const end = toDate(row[endColumn.sourceKey]);
        return {
          row,
          duration:
            start && end ? (end.getTime() - start.getTime()) / 3_600_000 : null,
        };
      })
      .filter((entry) => entry.duration !== null && entry.duration >= 0);
    durationValues = durationRows.map((entry) => entry.duration);
  }
  if (durationValues.length) {
    const avgDuration = average(durationValues);
    const medianDuration = median(durationValues);
    metrics.push(
      metric(
        "average_duration",
        "O‘rtacha davomiylik",
        round(avgDuration),
        "soat",
        `Median ${round(medianDuration)} soat`,
        "neutral",
      ),
    );
    const q1 = quantile(durationValues, 0.25);
    const q3 = quantile(durationValues, 0.75);
    const outlierLimit = q3 + 1.5 * (q3 - q1);
    const outliers = durationValues.filter(
      (value) => value > outlierLimit,
    ).length;
    if (outliers) {
      findings.push(
        finding(
          "finding_duration_outliers",
          outliers / durationValues.length > 0.1 ? "critical" : "warning",
          "Davomiylik bo‘yicha noodatiy qatorlar bor",
          `${outliers} ta yozuv IQR yuqori chegarasidan oshgan.`,
          ["average_duration"],
          "Q3 + 1.5 × IQR",
        ),
      );
    }
    if (
      slaColumn &&
      slaColumn.sheetId === (durationColumn?.sheetId ?? startColumn?.sheetId)
    ) {
      const valid = durationRows
        .map((entry) => ({
          duration: entry.duration,
          sla: toNumber(entry.row[slaColumn.sourceKey]),
        }))
        .filter((entry) => entry.sla !== null && entry.sla > 0);
      const breaches = valid.filter(
        (entry) => entry.duration > entry.sla,
      ).length;
      const rate = valid.length ? (breaches / valid.length) * 100 : 0;
      metrics.push(
        metric(
          "sla_breach_rate",
          "SLA buzilishi",
          round(rate),
          "%",
          `${breaches}/${valid.length} ta yozuv`,
          rate > 20 ? "warning" : "positive",
        ),
      );
      if (rate > 20) {
        findings.push(
          finding(
            "finding_sla",
            rate > 40 ? "critical" : "warning",
            "SLA buzilishi yuqori",
            `Tekshirilgan yozuvlarning ${round(rate)}%ida davomiylik SLA’dan oshgan.`,
            ["sla_breach_rate", "average_duration"],
            "duration > SLA target",
          ),
        );
      }
    }
  }

  const actualColumn = columnByRole.get("actual");
  const targetColumn = columnByRole.get("target");
  if (
    actualColumn &&
    targetColumn &&
    actualColumn.sheetId === targetColumn.sheetId
  ) {
    const rows = rowsBySheet.get(actualColumn.sheetId) ?? [];
    const pairs = rows
      .map((row) => ({
        actual: toNumber(row[actualColumn.sourceKey]),
        target: toNumber(row[targetColumn.sourceKey]),
      }))
      .filter((pair) => pair.actual !== null && pair.target !== null);
    const actualTotal = pairs.reduce((sum, pair) => sum + pair.actual, 0);
    const targetTotal = pairs.reduce((sum, pair) => sum + pair.target, 0);
    const variance = targetTotal
      ? ((actualTotal - targetTotal) / Math.abs(targetTotal)) * 100
      : 0;
    metrics.push(
      metric(
        "target_variance",
        "Reja/fakt og‘ishi",
        round(variance),
        "%",
        `Fakt ${round(actualTotal)}, reja ${round(targetTotal)}`,
        variance < -10 ? "warning" : "neutral",
      ),
    );
    if (variance < -10) {
      findings.push(
        finding(
          "finding_target_variance",
          variance < -25 ? "critical" : "warning",
          "Fakt reja ko‘rsatkichidan past",
          `Umumiy og‘ish ${round(variance)}%ni tashkil etdi.`,
          ["target_variance"],
          "(fakt − reja) / |reja| × 100",
        ),
      );
    }
  }

  const financialColumn =
    columnByRole.get("revenue") ??
    columnByRole.get("cost") ??
    columnByRole.get("amount");
  if (financialColumn) {
    const rows = rowsBySheet.get(financialColumn.sheetId) ?? [];
    const values = rows
      .map((row) => toNumber(row[financialColumn.sourceKey]))
      .filter((value) => value !== null);
    if (values.length) {
      metrics.push(
        metric(
          "financial_total",
          `${financialColumn.businessLabel} jami`,
          round(
            values.reduce((sum, value) => sum + value, 0),
            2,
          ),
          financialColumn.unit ?? "",
          `${values.length} ta qiymat`,
          "neutral",
        ),
      );
    }
  }

  if (!findings.length) {
    findings.push(
      finding(
        "finding_stable",
        "positive",
        "Kritik og‘ish aniqlanmadi",
        "Mavjud ustunlar bo‘yicha asosiy sifat va taqsimot tekshiruvlari kritik muammo ko‘rsatmadi.",
        ["completeness", "duplicate_rate"],
        "Universal data-quality checks",
      ),
    );
  }

  const dataQuality = {
    score: round(
      average(item.datasets.map((dataset) => dataset.quality_score ?? 0)),
    ),
    completeness: round(completeness),
    missingCells,
    duplicates,
    duplicateRate: round(duplicateRate),
    analyzedRows: allRows.length,
    analyzedSheets: item.datasets.length,
  };

  return {
    engineVersion: ENGINE_VERSION,
    metrics,
    findings,
    chartSpecs,
    dataQuality,
  };
}
