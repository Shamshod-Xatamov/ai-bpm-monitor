"use client";

import { useMemo, useState } from "react";
import Icon from "@/components/ui/Icon";
import Sparkline from "@/components/ui/Sparkline";
import {
  BPEI_TARGET,
  bpeiComponents,
  comparisonMatrix,
  defaultWeights,
  kpiProgress,
  kpiRegister,
  kpiStatus,
  kpiStatusLabels,
  periods,
  scoreBand,
  weightShare,
  weightedIndex,
} from "@/lib/kpi-data";
import styles from "./KpiCenter.module.css";

const statusFilters = [
  { id: "all", label: "Barchasi" },
  { id: "achieved", label: "Bajarildi" },
  { id: "risk", label: "Xavf ostida" },
  { id: "missed", label: "Bajarilmadi" },
];

const shortLabels = {
  time: "Vaqt",
  quality: "Sifat",
  cost: "Xarajat",
  sla: "SLA",
  automation: "Avtomatlashtirish",
};

const statusTone = { achieved: "sage", risk: "amber", missed: "danger" };

const formatValue = (value) =>
  Number.isInteger(value) ? String(value) : value.toFixed(1);

function PanelHead({ eyebrow, title, meta, action }) {
  return (
    <div className={styles.panelHead}>
      <div>
        <span>{eyebrow}</span>
        <h2>{title}</h2>
      </div>
      {action ?? (meta ? <small>{meta}</small> : null)}
    </div>
  );
}

/* ------------------------------------------------------------------ BPEI */

function BpeiPanel({ period, weights, onWeight, onReset }) {
  const index = weightedIndex(weights, period);
  const previous = weightedIndex(weights, period, "previous");
  const growth = ((index - previous) / previous) * 100;
  const progress = (index / BPEI_TARGET) * 100;
  const isCustom = bpeiComponents.some(
    (item) => weights[item.id] !== defaultWeights[item.id],
  );

  return (
    <section className={`${styles.panel} ${styles.bpeiPanel}`}>
      <PanelHead
        eyebrow="BPEI vaznlari"
        title="Samaradorlik indeksi"
        action={
          <button
            type="button"
            className={styles.resetButton}
            disabled={!isCustom}
            onClick={onReset}
          >
            <Icon name="refresh" size={13} />
            Standart vaznlar
          </button>
        }
      />

      <div className={styles.bpeiLead}>
        <div className={styles.bpeiScore}>
          <strong>{index.toFixed(1)}</strong>
          <span>BPEI</span>
        </div>

        <div className={styles.bpeiDelta}>
          <b className={growth >= 0 ? styles.positive : styles.negative}>
            <Icon name={growth >= 0 ? "arrowUp" : "arrowDown"} size={13} />
            {Math.abs(growth).toFixed(1)}%
          </b>
          <span>o‘tgan davrga nisbatan</span>
        </div>

        <div className={styles.bpeiTarget}>
          <div>
            <span>Maqsad {BPEI_TARGET.toFixed(1)}</span>
            <b>{Math.round(progress)}%</b>
          </div>
          <div className={styles.targetTrack} aria-hidden="true">
            <i style={{ width: `${Math.min(100, progress)}%` }} />
          </div>
          <small>
            {index >= BPEI_TARGET
              ? "Maqsadga erishildi"
              : `Maqsadgacha ${(BPEI_TARGET - index).toFixed(1)} ball`}
          </small>
        </div>
      </div>

      <div className={styles.componentHead} aria-hidden="true">
        <span>Komponent</span>
        <span>Ball</span>
        <span>Vazn</span>
        <span>Ulush</span>
        <span>Hissa</span>
      </div>

      <div className={styles.componentList}>
        {bpeiComponents.map((component) => {
          const score = component.scores[period];
          const share = weightShare(weights, component.id);

          return (
            <div className={styles.componentRow} key={component.id}>
              <div className={styles.componentName}>
                <strong>{component.label}</strong>
                <small>{component.hint}</small>
              </div>

              <div className={styles.componentScore}>
                <b>{score}</b>
                <div className={styles.scoreTrack} aria-hidden="true">
                  <i
                    className={styles[`band_${scoreBand(score)}`]}
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>

              <input
                className={styles.slider}
                type="range"
                min="5"
                max="45"
                step="5"
                value={weights[component.id]}
                aria-label={`${component.label} vazni`}
                style={{
                  "--fill": `${((weights[component.id] - 5) / 40) * 100}%`,
                }}
                onChange={(event) =>
                  onWeight(component.id, Number(event.target.value))
                }
              />

              <span className={styles.componentShare}>{share.toFixed(0)}%</span>

              <span className={styles.componentImpact}>
                {((score * share) / 100).toFixed(1)}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- scorecard */

function KpiScorecard({ period }) {
  const [status, setStatus] = useState("all");

  const rows = useMemo(
    () =>
      kpiRegister.map((kpi) => {
        const value = kpi.values[period];
        return { kpi, value, state: kpiStatus(kpi, value) };
      }),
    [period],
  );

  const counts = useMemo(
    () =>
      rows.reduce(
        (totals, row) => ({
          ...totals,
          all: totals.all + 1,
          [row.state]: (totals[row.state] ?? 0) + 1,
        }),
        { all: 0 },
      ),
    [rows],
  );

  const visible =
    status === "all" ? rows : rows.filter((row) => row.state === status);

  return (
    <section className={`${styles.panel} ${styles.scorecardPanel}`}>
      <PanelHead
        eyebrow="KPI konstruktor"
        title="Indikatorlar jadvali"
        action={
          <div
            className={styles.chips}
            role="group"
            aria-label="Holat bo‘yicha filtr"
          >
            {statusFilters.map((item) => (
              <button
                key={item.id}
                type="button"
                className={status === item.id ? styles.chipOn : undefined}
                aria-pressed={status === item.id}
                onClick={() => setStatus(item.id)}
              >
                {item.label}
                <small>{counts[item.id] ?? 0}</small>
              </button>
            ))}
          </div>
        }
      />

      <div className={styles.tableHead} aria-hidden="true">
        <span>Indikator</span>
        <span>Amaldagi</span>
        <span>Maqsad</span>
        <span>Bajarilish</span>
        <span>Trend</span>
        <span>Holat</span>
      </div>

      {visible.length === 0 ? (
        <p className={styles.empty}>Bu holatdagi indikator yo‘q.</p>
      ) : (
        <div className={styles.rows}>
          {visible.map(({ kpi, value, state }) => {
            const progress = kpiProgress(kpi, value);

            return (
              <div className={styles.row} key={kpi.id}>
                <div className={styles.kpiName}>
                  <strong>{kpi.name}</strong>
                  <small>
                    {kpi.department} ·{" "}
                    {kpi.direction === "down" ? "past yaxshi" : "yuqori yaxshi"}
                  </small>
                </div>

                <div className={styles.kpiValue}>
                  <strong>{formatValue(value)}</strong>
                  <small>{kpi.unit}</small>
                </div>

                <div className={styles.kpiTarget}>
                  {formatValue(kpi.target)} {kpi.unit}
                </div>

                <div className={styles.kpiProgress}>
                  <div className={styles.progressTrack} aria-hidden="true">
                    <i
                      className={styles[`fill_${state}`]}
                      style={{ width: `${Math.min(100, progress)}%` }}
                    />
                  </div>
                  <b>{Math.round(progress)}%</b>
                </div>

                <div className={styles.kpiTrend}>
                  <Sparkline values={kpi.trend} tone={statusTone[state]} />
                </div>

                <div className={styles.kpiStatus}>
                  <span className={styles[`status_${state}`]}>
                    {kpiStatusLabels[state]}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

/* -------------------------------------------------------------- matritsa */

function ComparisonMatrix({ period }) {
  const rows = useMemo(
    () => comparisonMatrix(period).sort((a, b) => b.average - a.average),
    [period],
  );

  return (
    <section className={`${styles.panel} ${styles.matrixPanel}`}>
      <PanelHead
        eyebrow="Dinamik taqqoslash"
        title="Bo‘limlar va komponentlar kesimi"
        meta={`${rows.length} ta bo‘lim`}
      />

      <div className={styles.matrixScroll}>
        <table className={styles.matrix}>
          <thead>
            <tr>
              <th scope="col">Bo‘lim</th>
              {bpeiComponents.map((component) => (
                <th key={component.id} scope="col">
                  {shortLabels[component.id]}
                </th>
              ))}
              <th scope="col">O‘rtacha</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.department}>
                <th scope="row">{row.department}</th>
                {row.cells.map((cell) => (
                  <td key={cell.id}>
                    <span className={styles[`cell_${scoreBand(cell.score)}`]}>
                      {cell.score}
                    </span>
                  </td>
                ))}
                <td className={styles.matrixAverage}>{row.average}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.matrixLegend}>
        <span>
          <i className={styles.cell_weak} /> 72 dan past
        </span>
        <span>
          <i className={styles.cell_watch} /> 72–79
        </span>
        <span>
          <i className={styles.cell_good} /> 80–87
        </span>
        <span>
          <i className={styles.cell_strong} /> 88 va yuqori
        </span>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ page */

export default function KpiCenter() {
  const [period, setPeriod] = useState("month");
  const [weights, setWeights] = useState(defaultWeights);

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <span className={styles.kicker}>Samaradorlik o‘lchovi</span>
          <h1>KPI va BPEI</h1>
          <p>
            Indeks tarkibi, indikatorlar bajarilishi va bo‘limlar kesimidagi
            taqqoslash.
          </p>
        </div>

        <div className={styles.periodControl} role="group" aria-label="Davr">
          {periods.map((item) => (
            <button
              key={item.id}
              type="button"
              className={period === item.id ? styles.periodOn : undefined}
              aria-pressed={period === item.id}
              onClick={() => setPeriod(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </header>

      <BpeiPanel
        period={period}
        weights={weights}
        onWeight={(id, value) =>
          setWeights((current) => ({ ...current, [id]: value }))
        }
        onReset={() => setWeights(defaultWeights)}
      />

      <KpiScorecard period={period} />
      <ComparisonMatrix period={period} />
    </div>
  );
}
