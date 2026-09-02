import "server-only";

const roleMatchers = [
  ["start_datetime", /(^|_)(start|started|boshl|начал)/i],
  ["end_datetime", /(^|_)(end|finish|complete|tug|yakun|окон|заверш)/i],
  ["deadline", /(deadline|due|muddat|срок)/i],
  ["event_datetime", /(date|time|sana|vaqt|дата|время)/i],
  ["department", /(department|dept|bo_?lim|отдел|подраздел)/i],
  ["process", /(process|jarayon|процесс)/i],
  ["stage", /(stage|step|bosqich|этап)/i],
  ["status", /(status|holat|состоя|статус)/i],
  ["owner", /(owner|responsible|egasi|mas_ul|ответств)/i],
  ["employee", /(employee|xodim|сотруд)/i],
  ["customer", /(customer|client|mijoz|клиент)/i],
  ["supplier", /(supplier|vendor|yetkaz|постав)/i],
  ["sla_target", /(^|_)(sla|service_level)/i],
  ["duration", /(duration|cycle_time|davom|muddati|длитель)/i],
  ["target", /(target|plan|reja|maqsad|план)/i],
  ["actual", /(actual|fact|fakt|факт)/i],
  ["revenue", /(revenue|income|daromad|выруч|доход)/i],
  ["cost", /(cost|expense|xarajat|затрат|расход)/i],
  ["amount", /(amount|summa|total|сумм|итого)/i],
  ["quantity", /(quantity|count|soni|miqdor|колич)/i],
  ["percent", /(percent|percentage|foiz|процент|pct)/i],
  ["risk", /(risk|xavf|риск)/i],
  ["score", /(score|ball|index|indeks|оцен|индекс)/i],
  ["priority", /(priority|ustuvor|приоритет)/i],
  ["category", /(category|type|tur|kategori|категор|тип)/i],
  ["location", /(location|region|city|joy|hudud|город|регион)/i],
  ["description", /(description|comment|izoh|tavsif|опис|коммент)/i],
  ["identifier", /(^|_)(id|code|number|no|kod|raqam|номер|код)($|_)/i],
  ["name", /(name|nomi|назван|фио)/i],
];

function safeKey(value, fallback) {
  const normalized = String(value || "")
    .normalize("NFKD")
    .replace(/[‘’ʻʼ`']/g, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 80);
  const ascii = normalized.replace(/[^a-z0-9_]/g, "");
  return /^[a-z]/.test(ascii) ? ascii : fallback;
}

export function inferRole(name) {
  const comparable = String(name || "")
    .normalize("NFKD")
    .replace(/[‘’ʻʼ`']/g, "_")
    .replace(/[^\p{L}\p{N}]+/gu, "_");
  return (
    roleMatchers.find(([, matcher]) => matcher.test(comparable))?.[0] ??
    "unknown"
  );
}

function semanticType(role, physicalType) {
  if (
    ["start_datetime", "end_datetime", "event_datetime", "deadline"].includes(
      role,
    )
  ) {
    return "date";
  }
  if (
    [
      "category",
      "department",
      "team",
      "status",
      "priority",
      "process",
      "stage",
    ].includes(role)
  ) {
    return "category";
  }
  if (
    [
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
    ].includes(role)
  ) {
    return "number";
  }
  const mapping = {
    NUMBER: "number",
    DATE: "date",
    BOOLEAN: "boolean",
    TEXT: "text",
  };
  return mapping[physicalType] ?? "unknown";
}

function datasetTypeFromRoles(roles) {
  if (
    roles.includes("process") &&
    (roles.includes("duration") || roles.includes("start_datetime"))
  ) {
    return "business_process_events";
  }
  if (roles.includes("target") && roles.includes("actual"))
    return "plan_fact_performance";
  if (roles.some((role) => ["cost", "revenue", "amount"].includes(role))) {
    return "financial_records";
  }
  if (roles.some((role) => role.endsWith("datetime")))
    return "time_series_records";
  return "generic_business_dataset";
}

function recipesForColumns(columns) {
  const byRole = new Map(
    columns.map((column) => [column.semanticRole, column]),
  );
  const recipes = [
    {
      operation: "count",
      inputColumnIds: [],
      groupByColumnIds: [],
      priority: 1,
      label: "Jami qatorlar",
    },
    {
      operation: "missing_rate",
      inputColumnIds: columns.map((column) => column.columnId).slice(0, 4),
      groupByColumnIds: [],
      priority: 1,
      label: "Ma’lumot to‘liqligi",
    },
  ];
  const start = byRole.get("start_datetime");
  const end = byRole.get("end_datetime");
  const group =
    byRole.get("department") ?? byRole.get("process") ?? byRole.get("category");
  if (start && end) {
    recipes.push({
      operation: "duration",
      inputColumnIds: [start.columnId, end.columnId],
      groupByColumnIds: group ? [group.columnId] : [],
      priority: 1,
      label: "O‘rtacha sikl vaqti",
    });
  }
  const actual = byRole.get("actual");
  const target = byRole.get("target");
  if (actual && target) {
    recipes.push({
      operation: "target_variance",
      inputColumnIds: [actual.columnId, target.columnId],
      groupByColumnIds: group ? [group.columnId] : [],
      priority: 1,
      label: "Reja va fakt og‘ishi",
    });
  }
  return recipes;
}

export function createHeuristicInference(detail, warning = null) {
  const sheets = detail.datasets.map((dataset) => {
    const columns = dataset.dataset_columns.map((column, index) => {
      const role = inferRole(
        `${column.source_name} ${column.canonical_key || ""}`,
      );
      return {
        columnId: column.id,
        canonicalKey: safeKey(
          column.canonical_key || column.source_name,
          `column_${index + 1}`,
        ),
        semanticRole: role,
        semanticType: semanticType(role, column.data_type),
        businessLabel: column.source_name,
        unit: null,
        unitScale: null,
        confidence: role === "unknown" ? 0.35 : 0.68,
        reason:
          role === "unknown"
            ? "Ustun ma’nosi aniq emas"
            : "Ustun nomi asosidagi lokal taxmin",
      };
    });
    return {
      sheetId: dataset.id,
      purpose: dataset.sheet_index === 0 ? "fact_table" : "unknown",
      include: dataset.row_count > 0,
      confidence: columns.some((column) => column.semanticRole !== "unknown")
        ? 0.62
        : 0.4,
      columns,
    };
  });
  const allColumns = sheets.flatMap((sheet) => sheet.columns);
  const roles = allColumns.map((column) => column.semanticRole);

  return {
    datasetType: datasetTypeFromRoles(roles),
    datasetSummary: `${detail.original_filename} fayli ${sheets.length} ta sheet va ${detail.total_rows} ta qatordan iborat.`,
    languageHints: ["uz"],
    primarySheetIds: sheets
      .filter((sheet) => sheet.include)
      .slice(0, 1)
      .map((sheet) => sheet.sheetId),
    sheets,
    relationships: [],
    analysisRecipes: recipesForColumns(allColumns),
    blockingWarnings: warning
      ? [warning]
      : ["AI mapping foydalanuvchi tasdig‘ini talab qiladi."],
    confidence: 0.55,
    modelName: null,
    promptVersion: "heuristic-v1",
    schemaVersion: "mapping-v1",
  };
}
