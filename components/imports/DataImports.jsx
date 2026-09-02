"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Icon from "@/components/ui/Icon";
import styles from "./DataImports.module.css";

const acceptedExtensions = ["xlsx", "xls", "xlsb", "xlsm", "csv", "ods"];
const maxFileBytes = 10 * 1024 * 1024;
const semanticRoles = [
  ["unknown", "Aniqlanmagan"],
  ["identifier", "Identifikator"],
  ["name", "Nomi"],
  ["description", "Tavsif"],
  ["category", "Kategoriya"],
  ["department", "Bo‘lim"],
  ["team", "Jamoa"],
  ["owner", "Mas’ul"],
  ["employee", "Xodim"],
  ["customer", "Mijoz"],
  ["supplier", "Yetkazib beruvchi"],
  ["process", "Jarayon"],
  ["stage", "Bosqich"],
  ["status", "Holat"],
  ["priority", "Ustuvorlik"],
  ["start_datetime", "Boshlanish sanasi"],
  ["end_datetime", "Yakun sanasi"],
  ["event_datetime", "Voqea sanasi"],
  ["deadline", "Muddat"],
  ["duration", "Davomiylik"],
  ["sla_target", "SLA target"],
  ["actual", "Fakt"],
  ["target", "Reja"],
  ["amount", "Summa"],
  ["cost", "Xarajat"],
  ["revenue", "Daromad"],
  ["quantity", "Miqdor"],
  ["percent", "Foiz"],
  ["score", "Ball"],
  ["risk", "Risk"],
  ["location", "Joylashuv"],
  ["free_text", "Erkin matn"],
];

const statusLabels = {
  UPLOADED: "Yuklandi",
  PARSING: "O‘qilmoqda",
  PROFILED: "Profil tayyor",
  INFERRING: "AI mapping",
  NEEDS_REVIEW: "Tekshiruv kerak",
  READY_TO_ANALYZE: "Tahlilga tayyor",
  ANALYZING: "Tahlil qilinmoqda",
  COMPLETED: "Tayyor",
  PARTIAL: "Qisman tayyor",
  FAILED: "Xatolik",
};

function formatBytes(bytes) {
  if (!bytes) return "0 KB";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function formatDate(value) {
  return new Intl.DateTimeFormat("uz-UZ", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

async function api(path, options) {
  const response = await fetch(path, { cache: "no-store", ...options });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(
      body?.error?.message ?? "Server bilan bog‘lanishda xatolik.",
    );
  }
  return body;
}

function statusTone(status) {
  if (status === "FAILED") return "danger";
  if (status === "COMPLETED") return "success";
  if (status === "NEEDS_REVIEW") return "warning";
  return "neutral";
}

function UploadPanel({ busy, onUpload }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const acceptFile = (file) => {
    if (!file) return;
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (!acceptedExtensions.includes(extension)) {
      onUpload(null, "XLSX, XLS, XLSB, XLSM, CSV yoki ODS fayl tanlang.");
      return;
    }
    if (file.size > maxFileBytes) {
      onUpload(null, "Fayl hajmi 10 MB dan oshmasligi kerak.");
      return;
    }
    onUpload(file);
  };

  return (
    <section
      className={`${styles.uploadPanel} ${dragging ? styles.dragging : ""}`}
      onDragEnter={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragOver={(event) => event.preventDefault()}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        acceptFile(event.dataTransfer.files[0]);
      }}
    >
      <div className={styles.uploadIcon}>
        <Icon name="upload" size={24} />
      </div>
      <div>
        <span className={styles.eyebrow}>Yangi manba</span>
        <h2>
          {busy ? "Fayl qayta ishlanmoqda…" : "Excel faylni shu yerga tashlang"}
        </h2>
        <p>XLSX, XLS, XLSB, XLSM, CSV yoki ODS · maksimum 10 MB</p>
      </div>
      <button
        type="button"
        className={styles.primaryButton}
        disabled={busy}
        onClick={() => inputRef.current?.click()}
      >
        {busy ? (
          <span className={styles.spinner} />
        ) : (
          <Icon name="upload" size={16} />
        )}
        {busy ? "Tahlil qilinmoqda" : "Fayl tanlash"}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls,.xlsb,.xlsm,.csv,.ods"
        hidden
        onChange={(event) => {
          acceptFile(event.target.files?.[0]);
          event.target.value = "";
        }}
      />
    </section>
  );
}

function ImportHistory({ items, selectedId, loading, onSelect }) {
  return (
    <section className={styles.historyPanel}>
      <div className={styles.panelHead}>
        <div>
          <span className={styles.eyebrow}>Importlar</span>
          <h2>Oxirgi fayllar</h2>
        </div>
        <small>{items.length} ta</small>
      </div>
      <div className={styles.historyList}>
        {loading && !items.length ? (
          <p className={styles.empty}>Yuklanmoqda…</p>
        ) : null}
        {!loading && !items.length ? (
          <p className={styles.empty}>Hali fayl yuklanmagan.</p>
        ) : null}
        {items.map((item) => (
          <button
            type="button"
            key={item.id}
            className={`${styles.historyItem} ${selectedId === item.id ? styles.historyItemActive : ""}`}
            onClick={() => onSelect(item.id)}
          >
            <span className={styles.fileMark}>{item.format}</span>
            <span className={styles.fileCopy}>
              <strong>{item.originalName}</strong>
              <small>
                {formatDate(item.createdAt)} · {formatBytes(item.sizeBytes)}
              </small>
            </span>
            <span
              className={`${styles.status} ${styles[statusTone(item.status)]}`}
            >
              {statusLabels[item.status] ?? item.status}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

function WorkbookOverview({ detail }) {
  return (
    <div className={styles.overview}>
      <div className={styles.detailTitle}>
        <div>
          <span className={styles.eyebrow}>Workbook</span>
          <h2>{detail.originalName}</h2>
          <p>{detail.currentStage}</p>
        </div>
        <span
          className={`${styles.statusLarge} ${styles[statusTone(detail.status)]}`}
        >
          {statusLabels[detail.status] ?? detail.status}
        </span>
      </div>
      <div className={styles.statGrid}>
        <article>
          <span>Sheet</span>
          <strong>{detail.sheetCount}</strong>
        </article>
        <article>
          <span>Qator</span>
          <strong>{detail.totalRows?.toLocaleString("uz-UZ")}</strong>
        </article>
        <article>
          <span>Ustun</span>
          <strong>{detail.totalColumns}</strong>
        </article>
        <article>
          <span>Progress</span>
          <strong>{detail.progress}%</strong>
        </article>
      </div>
      <div className={styles.progress}>
        <i style={{ width: `${detail.progress}%` }} />
      </div>
    </div>
  );
}

function MappingEditor({ detail, busy, onConfirm, onInfer }) {
  const [sheets, setSheets] = useState(detail.mapping?.mapping ?? []);

  if (!detail.mapping) {
    return (
      <section className={styles.contentPanel}>
        <div className={styles.panelHead}>
          <div>
            <span className={styles.eyebrow}>2-bosqich</span>
            <h2>Semantic mapping</h2>
          </div>
        </div>
        <p className={styles.panelText}>
          AI ustunlarning biznes ma’nosini aniqlaydi. Hisob-kitoblar keyin
          serverda deterministic bajariladi.
        </p>
        <button
          type="button"
          className={styles.primaryButton}
          disabled={busy}
          onClick={onInfer}
        >
          <Icon name="spark" size={16} /> AI mappingni boshlash
        </button>
      </section>
    );
  }

  const confirmed = ["AUTO_CONFIRMED", "USER_CONFIRMED"].includes(
    detail.mapping.status,
  );
  const updateRole = (sheetId, columnId, role) => {
    setSheets((current) =>
      current.map((sheet) =>
        sheet.sheetId !== sheetId
          ? sheet
          : {
              ...sheet,
              columns: sheet.columns.map((column) =>
                column.columnId === columnId
                  ? {
                      ...column,
                      semanticRole: role,
                      confidence: 1,
                      reason: "Foydalanuvchi tomonidan tasdiqlandi",
                    }
                  : column,
              ),
            },
      ),
    );
  };

  const submit = () =>
    onConfirm({
      datasetType: detail.mapping.datasetType,
      datasetSummary: detail.mapping.datasetSummary,
      languageHints: ["uz"],
      primarySheetIds: sheets
        .filter((sheet) => sheet.include)
        .slice(0, 1)
        .map((sheet) => sheet.sheetId),
      sheets,
      relationships: detail.mapping.relationships ?? [],
      analysisRecipes: detail.mapping.analysisPlan ?? [],
      blockingWarnings: [],
      confidence: 1,
    });

  return (
    <section className={styles.contentPanel}>
      <div className={styles.panelHead}>
        <div>
          <span className={styles.eyebrow}>AI semantic mapping</span>
          <h2>{detail.mapping.datasetType.replaceAll("_", " ")}</h2>
        </div>
        <small>
          {Math.round((detail.mapping.confidence ?? 0) * 100)}% ishonch
        </small>
      </div>
      <p className={styles.panelText}>{detail.mapping.datasetSummary}</p>
      {detail.mapping.blockingWarnings?.length ? (
        <div className={styles.warningBox}>
          {detail.mapping.blockingWarnings.join(" ")}
        </div>
      ) : null}
      <div className={styles.mappingSheets}>
        {sheets.map((sheet) => {
          const sourceSheet = detail.sheets.find(
            (item) => item.id === sheet.sheetId,
          );
          return (
            <div className={styles.mappingSheet} key={sheet.sheetId}>
              <div className={styles.sheetHead}>
                <strong>{sourceSheet?.name ?? "Sheet"}</strong>
                <span>
                  {sourceSheet?.rowCount ?? 0} qator ·{" "}
                  {sheet.purpose.replaceAll("_", " ")}
                </span>
              </div>
              <div className={styles.mappingTableWrap}>
                <table className={styles.mappingTable}>
                  <thead>
                    <tr>
                      <th>Excel ustuni</th>
                      <th>Namuna</th>
                      <th>Biznes ma’nosi</th>
                      <th>Ishonch</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sheet.columns.map((column) => {
                      const source = sourceSheet?.columns.find(
                        (item) => item.id === column.columnId,
                      );
                      return (
                        <tr key={column.columnId}>
                          <td>
                            <strong>
                              {source?.sourceName ?? column.businessLabel}
                            </strong>
                            <small>{source?.physicalType}</small>
                          </td>
                          <td className={styles.samples}>
                            {source?.samples
                              ?.slice(0, 2)
                              .map(String)
                              .join(", ") || "—"}
                          </td>
                          <td>
                            <select
                              value={column.semanticRole}
                              disabled={busy}
                              onChange={(event) =>
                                updateRole(
                                  sheet.sheetId,
                                  column.columnId,
                                  event.target.value,
                                )
                              }
                            >
                              {semanticRoles.map(([value, label]) => (
                                <option value={value} key={value}>
                                  {label}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td>{Math.round(column.confidence * 100)}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
      {!confirmed ? (
        <button
          type="button"
          className={styles.primaryButton}
          disabled={busy}
          onClick={submit}
        >
          <Icon name="check" size={16} /> Mappingni tasdiqlash
        </button>
      ) : (
        <div className={styles.confirmed}>
          <Icon name="check" size={15} /> Mapping tasdiqlangan
        </div>
      )}
    </section>
  );
}

function AnalysisResult({ detail, busy, onAnalyze }) {
  if (!detail.analysis) {
    const canAnalyze = detail.status === "READY_TO_ANALYZE";
    return (
      <section className={styles.contentPanel}>
        <div className={styles.panelHead}>
          <div>
            <span className={styles.eyebrow}>3-bosqich</span>
            <h2>Biznes tahlili</h2>
          </div>
        </div>
        <p className={styles.panelText}>
          {canAnalyze
            ? "Mapping tayyor. Metric, data-quality va anomaliya tekshiruvlarini ishga tushiring."
            : "Tahlil uchun avval mappingni tayyorlab tasdiqlang."}
        </p>
        <button
          type="button"
          className={styles.primaryButton}
          disabled={!canAnalyze || busy}
          onClick={onAnalyze}
        >
          <Icon name="spark" size={16} /> Tahlilni boshlash
        </button>
      </section>
    );
  }

  return (
    <section className={styles.analysisPanel}>
      <div className={styles.panelHead}>
        <div>
          <span className={styles.eyebrow}>Tahlil natijasi</span>
          <h2>Workbook xulosasi</h2>
        </div>
        <small>{detail.analysis.status}</small>
      </div>
      <div className={styles.metrics}>
        {detail.analysis.metrics.map((item) => (
          <article key={item.id}>
            <span>{item.label}</span>
            <strong>
              {item.value}
              <em>{item.unit}</em>
            </strong>
            <small>{item.detail}</small>
          </article>
        ))}
      </div>
      {detail.analysis.narrative ? (
        <div className={styles.narrative}>
          <span>
            <Icon name="spark" size={15} /> Gemini izohi
          </span>
          <p>{detail.analysis.narrative.summary}</p>
          <ul>
            {detail.analysis.narrative.recommendations.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}
      <div className={styles.findings}>
        {detail.analysis.findings.map((item) => (
          <article key={item.id} className={styles[`finding_${item.severity}`]}>
            <span>{item.severity}</span>
            <h3>{item.title}</h3>
            <p>{item.summary}</p>
            <small>{item.calculationMethod}</small>
          </article>
        ))}
      </div>
      {detail.analysis.chartSpecs?.map((chart) => {
        const max = Math.max(...chart.data.map((item) => item.value), 1);
        return (
          <div className={styles.chart} key={chart.id}>
            <h3>{chart.title}</h3>
            {chart.data.map((item) => (
              <div className={styles.chartRow} key={item.label}>
                <span>{item.label}</span>
                <i>
                  <b style={{ width: `${(item.value / max) * 100}%` }} />
                </i>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        );
      })}
    </section>
  );
}

export default function DataImports() {
  const [imports, setImports] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const loadImports = useCallback(async () => {
    const result = await api("/api/imports?pageSize=30");
    setImports(result.items);
    setSelectedId((current) => current ?? result.items[0]?.id ?? null);
  }, []);

  useEffect(() => {
    api("/api/imports?pageSize=30")
      .then((result) => {
        setImports(result.items);
        setSelectedId(result.items[0]?.id ?? null);
      })
      .catch((reason) => setError(reason.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    api(`/api/imports/${selectedId}`)
      .then(setDetail)
      .catch((reason) => setError(reason.message))
      .finally(() => setLoading(false));
  }, [selectedId]);

  const runAction = async (path, options) => {
    setBusy(true);
    setError("");
    try {
      const result = await api(path, options);
      setDetail(result);
      await loadImports();
      return result;
    } catch (reason) {
      setError(reason.message);
      return null;
    } finally {
      setBusy(false);
    }
  };

  const upload = async (file, validationError) => {
    if (validationError) {
      setError(validationError);
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    setBusy(true);
    setError("");
    try {
      const imported = await api("/api/imports", {
        method: "POST",
        body: formData,
      });
      setSelectedId(imported.id);
      setDetail(imported);
      await loadImports();
      const inferred = await api(`/api/imports/${imported.id}/infer`, {
        method: "POST",
      });
      setDetail(inferred);
      await loadImports();
    } catch (reason) {
      setError(reason.message);
      await loadImports().catch(() => {});
    } finally {
      setBusy(false);
    }
  };

  const summary = useMemo(
    () => ({
      completed: imports.filter((item) => item.status === "COMPLETED").length,
      rows: imports.reduce((sum, item) => sum + (item.totalRows ?? 0), 0),
    }),
    [imports],
  );

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <span className={styles.eyebrow}>Data intelligence</span>
          <p>
            Istalgan biznes spreadsheetini yuklang — platforma strukturasini
            aniqlab, tekshiriladigan hisob-kitoblar va AI xulosa tayyorlaydi.
          </p>
        </div>
        <div className={styles.headerStats}>
          <span>
            <strong>{imports.length}</strong> import
          </span>
          <span>
            <strong>{summary.rows.toLocaleString("uz-UZ")}</strong> qator
          </span>
          <span>
            <strong>{summary.completed}</strong> tayyor
          </span>
        </div>
      </header>
      <UploadPanel busy={busy} onUpload={upload} />
      {error ? (
        <div className={styles.errorBox} role="alert">
          <strong>Xatolik:</strong> {error}
          <button type="button" onClick={() => setError("")}>
            ×
          </button>
        </div>
      ) : null}
      <div className={styles.workspace}>
        <ImportHistory
          items={imports}
          selectedId={selectedId}
          loading={loading}
          onSelect={setSelectedId}
        />
        <div className={styles.detailColumn}>
          {loading && !detail ? (
            <div className={styles.loadingCard}>Ma’lumot yuklanmoqda…</div>
          ) : null}
          {!loading && !detail ? (
            <div className={styles.loadingCard}>
              Tahlil uchun birinchi spreadsheet faylingizni yuklang.
            </div>
          ) : null}
          {detail ? (
            <>
              <WorkbookOverview detail={detail} />
              <MappingEditor
                key={detail.mapping?.id ?? `unmapped-${detail.id}`}
                detail={detail}
                busy={busy}
                onInfer={() =>
                  runAction(`/api/imports/${detail.id}/infer`, {
                    method: "POST",
                  })
                }
                onConfirm={(payload) =>
                  runAction(`/api/imports/${detail.id}/mapping`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                  })
                }
              />
              <AnalysisResult
                detail={detail}
                busy={busy}
                onAnalyze={() =>
                  runAction(`/api/imports/${detail.id}/analyze`, {
                    method: "POST",
                  })
                }
              />
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
