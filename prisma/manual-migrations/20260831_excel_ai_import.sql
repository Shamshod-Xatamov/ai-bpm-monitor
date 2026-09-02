DO $$ BEGIN
  CREATE TYPE "workbook_status" AS ENUM (
    'PARSING', 'PROFILED', 'INFERRING', 'NEEDS_REVIEW',
    'READY_TO_ANALYZE', 'ANALYZING', 'COMPLETED', 'PARTIAL', 'FAILED'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "mapping_review_status" AS ENUM (
    'DRAFT', 'AUTO_CONFIRMED', 'USER_CONFIRMED', 'REJECTED'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "analysis_run_status" AS ENUM (
    'PENDING', 'RUNNING', 'COMPLETED', 'PARTIAL', 'FAILED'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TYPE "dataset_format" ADD VALUE IF NOT EXISTS 'XLS';
ALTER TYPE "dataset_format" ADD VALUE IF NOT EXISTS 'XLSB';
ALTER TYPE "dataset_format" ADD VALUE IF NOT EXISTS 'XLSM';
ALTER TYPE "dataset_format" ADD VALUE IF NOT EXISTS 'ODS';

CREATE TABLE IF NOT EXISTS "workbook_imports" (
  "id" UUID NOT NULL,
  "org_id" UUID NOT NULL,
  "original_filename" TEXT NOT NULL,
  "format" TEXT NOT NULL,
  "mime_type" TEXT,
  "size_bytes" INTEGER NOT NULL,
  "sha256" TEXT NOT NULL,
  "status" "workbook_status" NOT NULL DEFAULT 'PARSING',
  "progress" INTEGER NOT NULL DEFAULT 0,
  "current_stage" TEXT,
  "sheet_count" INTEGER NOT NULL DEFAULT 0,
  "total_rows" INTEGER NOT NULL DEFAULT 0,
  "total_columns" INTEGER NOT NULL DEFAULT 0,
  "parser_version" TEXT NOT NULL,
  "warnings" JSONB NOT NULL DEFAULT '[]'::jsonb,
  "error_code" TEXT,
  "error_message" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  "completed_at" TIMESTAMP(3),
  CONSTRAINT "workbook_imports_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "datasets" ADD COLUMN IF NOT EXISTS "workbook_import_id" UUID;
ALTER TABLE "datasets" ADD COLUMN IF NOT EXISTS "sheet_name" TEXT;
ALTER TABLE "datasets" ADD COLUMN IF NOT EXISTS "sheet_index" INTEGER;
ALTER TABLE "datasets" ADD COLUMN IF NOT EXISTS "header_row" INTEGER;

CREATE TABLE IF NOT EXISTS "schema_mappings" (
  "id" UUID NOT NULL,
  "workbook_import_id" UUID NOT NULL,
  "version" INTEGER NOT NULL,
  "status" "mapping_review_status" NOT NULL DEFAULT 'DRAFT',
  "dataset_type" TEXT NOT NULL,
  "dataset_summary" TEXT,
  "language_hints" JSONB NOT NULL DEFAULT '[]'::jsonb,
  "mapping" JSONB NOT NULL,
  "relationships" JSONB NOT NULL DEFAULT '[]'::jsonb,
  "analysis_plan" JSONB NOT NULL DEFAULT '[]'::jsonb,
  "confidence" DOUBLE PRECISION NOT NULL,
  "blocking_warnings" JSONB NOT NULL DEFAULT '[]'::jsonb,
  "model_name" TEXT,
  "prompt_version" TEXT NOT NULL,
  "schema_version" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "confirmed_at" TIMESTAMP(3),
  CONSTRAINT "schema_mappings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "analysis_runs" (
  "id" UUID NOT NULL,
  "workbook_import_id" UUID NOT NULL,
  "mapping_id" UUID NOT NULL,
  "status" "analysis_run_status" NOT NULL DEFAULT 'PENDING',
  "engine_version" TEXT NOT NULL,
  "metrics" JSONB NOT NULL DEFAULT '[]'::jsonb,
  "findings" JSONB NOT NULL DEFAULT '[]'::jsonb,
  "chart_specs" JSONB NOT NULL DEFAULT '[]'::jsonb,
  "data_quality" JSONB NOT NULL DEFAULT '{}'::jsonb,
  "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completed_at" TIMESTAMP(3),
  "error_code" TEXT,
  "error_message" TEXT,
  CONSTRAINT "analysis_runs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ai_narratives" (
  "id" UUID NOT NULL,
  "analysis_run_id" UUID NOT NULL,
  "model_name" TEXT NOT NULL,
  "prompt_version" TEXT NOT NULL,
  "summary" TEXT NOT NULL,
  "recommendations" JSONB NOT NULL DEFAULT '[]'::jsonb,
  "limitations" JSONB NOT NULL DEFAULT '[]'::jsonb,
  "evidence_links" JSONB NOT NULL DEFAULT '[]'::jsonb,
  "usage_metadata" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ai_narratives_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "workbook_imports_org_id_created_at_idx"
  ON "workbook_imports"("org_id", "created_at");
CREATE INDEX IF NOT EXISTS "workbook_imports_status_created_at_idx"
  ON "workbook_imports"("status", "created_at");
CREATE INDEX IF NOT EXISTS "workbook_imports_sha256_idx"
  ON "workbook_imports"("sha256");
CREATE INDEX IF NOT EXISTS "datasets_workbook_import_id_sheet_index_idx"
  ON "datasets"("workbook_import_id", "sheet_index");
CREATE UNIQUE INDEX IF NOT EXISTS "schema_mappings_workbook_import_id_version_key"
  ON "schema_mappings"("workbook_import_id", "version");
CREATE INDEX IF NOT EXISTS "schema_mappings_workbook_import_id_status_idx"
  ON "schema_mappings"("workbook_import_id", "status");
CREATE INDEX IF NOT EXISTS "analysis_runs_workbook_import_id_started_at_idx"
  ON "analysis_runs"("workbook_import_id", "started_at");
CREATE INDEX IF NOT EXISTS "analysis_runs_mapping_id_status_idx"
  ON "analysis_runs"("mapping_id", "status");
CREATE UNIQUE INDEX IF NOT EXISTS "ai_narratives_analysis_run_id_key"
  ON "ai_narratives"("analysis_run_id");

DO $$ BEGIN
  ALTER TABLE "workbook_imports"
    ADD CONSTRAINT "workbook_imports_org_id_fkey"
    FOREIGN KEY ("org_id") REFERENCES "organizations"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "datasets"
    ADD CONSTRAINT "datasets_workbook_import_id_fkey"
    FOREIGN KEY ("workbook_import_id") REFERENCES "workbook_imports"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "schema_mappings"
    ADD CONSTRAINT "schema_mappings_workbook_import_id_fkey"
    FOREIGN KEY ("workbook_import_id") REFERENCES "workbook_imports"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "analysis_runs"
    ADD CONSTRAINT "analysis_runs_workbook_import_id_fkey"
    FOREIGN KEY ("workbook_import_id") REFERENCES "workbook_imports"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "analysis_runs"
    ADD CONSTRAINT "analysis_runs_mapping_id_fkey"
    FOREIGN KEY ("mapping_id") REFERENCES "schema_mappings"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ai_narratives"
    ADD CONSTRAINT "ai_narratives_analysis_run_id_fkey"
    FOREIGN KEY ("analysis_run_id") REFERENCES "analysis_runs"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
