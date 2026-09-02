import { describe, expect, it } from "vitest";
import { analyzeWorkbook } from "@/lib/server/imports/analysis-engine";

describe("deterministic analysis", () => {
  it("calculates completeness, duplicates, duration and SLA breach rate", () => {
    const rows = [
      { process: "Sotuv", duration: 2, sla: 3 },
      { process: "Sotuv", duration: 6, sla: 3 },
      { process: "Sotuv", duration: 6, sla: 3 },
      { process: null, duration: 40, sla: 3 },
    ];
    const item = {
      sheet_count: 1,
      datasets: [
        {
          id: "sheet-1",
          row_count: rows.length,
          column_count: 3,
          quality_score: 88,
          dataset_rows: rows.map((raw, index) => ({ id: index, raw })),
          dataset_columns: [
            { null_count: 1 },
            { null_count: 0 },
            { null_count: 0 },
          ],
        },
      ],
    };
    const mapping = {
      mapping: [
        {
          sheetId: "sheet-1",
          columns: [
            {
              semanticRole: "process",
              sourceKey: "process",
              businessLabel: "Jarayon",
            },
            {
              semanticRole: "duration",
              sourceKey: "duration",
              businessLabel: "Davomiylik",
            },
            {
              semanticRole: "sla_target",
              sourceKey: "sla",
              businessLabel: "SLA",
            },
          ],
        },
      ],
    };

    const result = analyzeWorkbook(item, mapping);
    const metric = (id) => result.metrics.find((entry) => entry.id === id);

    expect(metric("duplicate_rate").value).toBe(25);
    expect(metric("average_duration").value).toBe(13.5);
    expect(metric("sla_breach_rate").value).toBe(75);
    expect(result.findings.map((finding) => finding.id)).toContain(
      "finding_sla",
    );
    expect(result.chartSpecs[0].type).toBe("bar");
  });
});
