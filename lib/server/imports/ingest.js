import "server-only";
import { createHash } from "node:crypto";
import { ImportError, errorMessage } from "@/lib/server/imports/errors";
import { extensionFromName } from "@/lib/server/imports/limits";
import { parseSpreadsheet } from "@/lib/server/imports/parser";
import {
  createPendingImport,
  getOrCreateDefaultOrganization,
  markImportFailed,
  persistParsedWorkbook,
} from "@/lib/server/imports/repository";

function safeFilename(name) {
  return String(name || "spreadsheet")
    .replace(/[\\/\0\r\n]/g, "_")
    .slice(0, 180);
}

export async function ingestSpreadsheetFile(file) {
  if (!(file instanceof File)) {
    throw new ImportError(
      "IMPORT_FILE_MISSING",
      "Spreadsheet fayl tanlanmagan.",
    );
  }

  const filename = safeFilename(file.name);
  const extension = extensionFromName(filename);
  const buffer = Buffer.from(await file.arrayBuffer());
  const sha256 = createHash("sha256").update(buffer).digest("hex");
  const organization = await getOrCreateDefaultOrganization();
  const pending = await createPendingImport({
    organizationId: organization.id,
    filename,
    extension,
    mimeType: file.type,
    sizeBytes: buffer.length,
    sha256,
  });

  try {
    const parsed = parseSpreadsheet({
      buffer,
      filename,
      mimeType: file.type,
    });
    return await persistParsedWorkbook(pending, parsed);
  } catch (error) {
    const code =
      error instanceof ImportError ? error.code : "IMPORT_PARSE_FAILED";
    await markImportFailed(pending.id, code, errorMessage(error));
    throw error;
  }
}
