import "server-only";
import { z } from "zod";
import { toGeminiJsonSchema } from "@/lib/server/imports/gemini-schema";

export const semanticRoles = [
  "identifier",
  "name",
  "description",
  "category",
  "department",
  "team",
  "owner",
  "employee",
  "customer",
  "supplier",
  "process",
  "stage",
  "status",
  "priority",
  "start_datetime",
  "end_datetime",
  "event_datetime",
  "deadline",
  "duration",
  "sla_target",
  "actual",
  "target",
  "amount",
  "cost",
  "revenue",
  "quantity",
  "percent",
  "score",
  "risk",
  "location",
  "free_text",
  "unknown",
];

export const analysisOperations = [
  "count",
  "distinct_count",
  "sum",
  "average",
  "median",
  "min_max",
  "distribution",
  "group_by",
  "trend",
  "duration",
  "completion_rate",
  "target_variance",
  "sla_breach_rate",
  "missing_rate",
  "duplicate_rate",
  "iqr_outlier",
  "zscore_outlier",
  "top_n",
  "correlation",
];

const nullableText = z.string().max(120).nullable();

export const columnMappingSchema = z.object({
  columnId: z.string().uuid(),
  canonicalKey: z
    .string()
    .min(1)
    .max(80)
    .regex(/^[a-z][a-z0-9_]*$/),
  semanticRole: z.enum(semanticRoles),
  semanticType: z.enum([
    "text",
    "number",
    "date",
    "boolean",
    "category",
    "unknown",
  ]),
  businessLabel: z.string().min(1).max(120),
  unit: nullableText,
  unitScale: z.number().positive().max(1_000_000_000).nullable(),
  confidence: z.number().min(0).max(1),
  reason: z.string().min(1).max(300),
});

export const sheetMappingSchema = z.object({
  sheetId: z.string().uuid(),
  purpose: z.enum([
    "fact_table",
    "dimension_table",
    "lookup",
    "summary",
    "unknown",
  ]),
  include: z.boolean(),
  confidence: z.number().min(0).max(1),
  columns: z.array(columnMappingSchema).max(250),
});

export const analysisRecipeSchema = z.object({
  operation: z.enum(analysisOperations),
  inputColumnIds: z.array(z.string().uuid()).max(4),
  groupByColumnIds: z.array(z.string().uuid()).max(3),
  priority: z.number().int().min(1).max(5),
  label: z.string().min(1).max(120),
});

export const inferenceResultSchema = z.object({
  datasetType: z.string().min(1).max(80),
  datasetSummary: z.string().min(1).max(600),
  languageHints: z.array(z.string().min(2).max(12)).max(5),
  primarySheetIds: z.array(z.string().uuid()).max(20),
  sheets: z.array(sheetMappingSchema).min(1).max(20),
  relationships: z
    .array(
      z.object({
        fromColumnId: z.string().uuid(),
        toColumnId: z.string().uuid(),
        relationType: z.enum([
          "one_to_one",
          "one_to_many",
          "many_to_one",
          "unknown",
        ]),
        confidence: z.number().min(0).max(1),
      }),
    )
    .max(30),
  analysisRecipes: z.array(analysisRecipeSchema).max(20),
  blockingWarnings: z.array(z.string().max(240)).max(20),
  confidence: z.number().min(0).max(1),
});

export const userMappingSchema = inferenceResultSchema.extend({
  confidence: z.number().min(0).max(1).default(1),
});

export const inferenceJsonSchema = toGeminiJsonSchema(
  z.toJSONSchema(inferenceResultSchema, { target: "draft-7" }),
);
