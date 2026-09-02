process.env.DATABASE_URL ??= "postgresql://test:test@localhost:5432/test";
process.env.IMPORT_MAX_FILE_BYTES ??= "10485760";
process.env.IMPORT_MAX_SHEETS ??= "20";
process.env.IMPORT_MAX_ROWS ??= "50000";
process.env.IMPORT_MAX_COLUMNS_PER_SHEET ??= "250";
process.env.IMPORT_SAMPLE_ROWS_PER_SHEET ??= "25";
process.env.IMPORT_AUTO_CONFIRM_THRESHOLD ??= "0.82";
