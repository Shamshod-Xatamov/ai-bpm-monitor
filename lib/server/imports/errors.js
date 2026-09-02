import "server-only";
import { ZodError } from "zod";

export class ImportError extends Error {
  constructor(code, message, status = 400, details = null) {
    super(message);
    this.name = "ImportError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export function toErrorResponse(error) {
  if (error instanceof ZodError) {
    return Response.json(
      {
        error: {
          code: "REQUEST_VALIDATION_FAILED",
          message: "Yuborilgan ma’lumot formati noto‘g‘ri.",
          details: error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
          })),
        },
      },
      { status: 400 },
    );
  }

  if (error instanceof ImportError) {
    return Response.json(
      {
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
      },
      { status: error.status },
    );
  }

  console.error("Import pipeline error", error);
  return Response.json(
    {
      error: {
        code: "IMPORT_INTERNAL_ERROR",
        message: "Kutilmagan server xatosi yuz berdi.",
      },
    },
    { status: 500 },
  );
}

export function errorMessage(error) {
  return error instanceof Error ? error.message : "Noma’lum xato";
}
