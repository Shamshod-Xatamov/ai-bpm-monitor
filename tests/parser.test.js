import { describe, expect, it } from "vitest";
import XLSX from "xlsx";
import { parseSpreadsheet } from "@/lib/server/imports/parser";

function workbookBuffer(rows) {
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.aoa_to_sheet(rows),
    "Jarayonlar",
  );
  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
}

describe("spreadsheet parser", () => {
  it("detects headers, duplicate rows, missing cells and numeric outliers", () => {
    const rows = [["Jarayon", "Davomiylik"]];
    for (let index = 0; index < 9; index += 1) {
      rows.push([`Jarayon ${index}`, 10]);
    }
    rows.push(["Jarayon 9", 1000]);
    rows.push(["Jarayon 9", 1000]);
    rows.push(["Bo‘sh qiymat", null]);

    const parsed = parseSpreadsheet({
      buffer: workbookBuffer(rows),
      filename: "jarayonlar.xlsx",
      mimeType:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    expect(parsed.sheetCount).toBe(1);
    expect(parsed.sheets[0]).toMatchObject({
      headerRow: 0,
      rowCount: 12,
      columnCount: 2,
      duplicateCount: 1,
    });
    expect(parsed.sheets[0].rows.filter((row) => row.isDuplicate)).toHaveLength(
      1,
    );
    expect(parsed.sheets[0].profiles[1].nullCount).toBe(1);
    expect(
      parsed.sheets[0].profiles[1].statistics.outlierCount,
    ).toBeGreaterThan(0);
  });

  it("rejects unsupported formats and invalid XLSX signatures", () => {
    expect(() =>
      parseSpreadsheet({
        buffer: Buffer.from("hello"),
        filename: "data.txt",
        mimeType: "text/plain",
      }),
    ).toThrow(/qo‘llab-quvvatlanmaydi/);

    expect(() =>
      parseSpreadsheet({
        buffer: Buffer.from("not a zip"),
        filename: "data.xlsx",
        mimeType:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
    ).toThrow(/ichki formatiga mos emas/);
  });
});
