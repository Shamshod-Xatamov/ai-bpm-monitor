import "server-only";
import { z } from "zod";

const integerFromEnv = (fallback, min, max) =>
  z.coerce.number().int().min(min).max(max).default(fallback);

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  DIRECT_URL: z.string().url().optional(),
  GEMINI_API_KEY: z.string().min(10).optional(),
  GEMINI_MODEL: z.string().min(1).default("gemini-3.7-flash"),
  IMPORT_MAX_FILE_BYTES: integerFromEnv(10_485_760, 1_024, 100_000_000),
  IMPORT_MAX_SHEETS: integerFromEnv(20, 1, 100),
  IMPORT_MAX_ROWS: integerFromEnv(50_000, 1, 500_000),
  IMPORT_MAX_COLUMNS_PER_SHEET: integerFromEnv(250, 1, 2_000),
  IMPORT_SAMPLE_ROWS_PER_SHEET: integerFromEnv(25, 5, 100),
  IMPORT_AUTO_CONFIRM_THRESHOLD: z.coerce
    .number()
    .min(0.5)
    .max(1)
    .default(0.82),
});

let cachedEnv;

export function getServerEnv() {
  if (cachedEnv) return cachedEnv;

  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const fields = result.error.issues.map((issue) => issue.path.join("."));
    throw new Error(`Server environment noto‘g‘ri: ${fields.join(", ")}`);
  }

  cachedEnv = result.data;
  return cachedEnv;
}
