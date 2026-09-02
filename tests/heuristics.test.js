import { describe, expect, it } from "vitest";
import {
  createHeuristicInference,
  inferRole,
} from "@/lib/server/imports/heuristics";

describe("heuristic schema mapping", () => {
  it("understands common Uzbek, Russian and English column labels", () => {
    expect(inferRole("Bo‘lim nomi")).toBe("department");
    expect(inferRole("Ответственный")).toBe("owner");
    expect(inferRole("revenue_usd")).toBe("revenue");
    expect(inferRole("mystery field")).toBe("unknown");
  });

  it("creates a reviewable mapping and safe analysis recipes", () => {
    const detail = {
      original_filename: "process.xlsx",
      total_rows: 2,
      datasets: [
        {
          id: "sheet-1",
          sheet_index: 0,
          row_count: 2,
          dataset_columns: [
            {
              id: "column-1",
              source_name: "Jarayon",
              canonical_key: "jarayon",
              data_type: "TEXT",
            },
            {
              id: "column-2",
              source_name: "Davomiylik",
              canonical_key: "davomiylik",
              data_type: "NUMBER",
            },
          ],
        },
      ],
    };

    const result = createHeuristicInference(detail, "AI vaqtincha mavjud emas");

    expect(result.datasetType).toBe("business_process_events");
    expect(
      result.sheets[0].columns.map((column) => column.semanticRole),
    ).toEqual(["process", "duration"]);
    expect(result.analysisRecipes[0].operation).toBe("count");
    expect(result.blockingWarnings).toEqual(["AI vaqtincha mavjud emas"]);
  });
});
