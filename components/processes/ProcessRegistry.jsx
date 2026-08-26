"use client";

import { Fragment, useMemo, useState } from "react";
import Icon from "@/components/ui/Icon";
import Select from "@/components/ui/Select";
import Sparkline from "@/components/ui/Sparkline";
import {
  bottleneckIndex,
  cycleTime,
  departments,
  formatDuration,
  processes,
  stageStatus,
  stageTotal,
  statusLabels,
} from "@/lib/processes-data";
import styles from "./ProcessRegistry.module.css";

const statusFilters = [
  { id: "all", label: "Barchasi" },
  { id: "critical", label: "Kritik" },
  { id: "warning", label: "Diqqatda" },
  { id: "stable", label: "Barqaror" },
];

const sortOptions = [
  { id: "risk", label: "Risk bo‘yicha" },
  { id: "overrun", label: "SLA og‘ishi bo‘yicha" },
  { id: "efficiency", label: "Samaradorlik bo‘yicha" },
  { id: "volume", label: "Hajm bo‘yicha" },
  { id: "name", label: "Nomi bo‘yicha" },
];

const trendTone = { critical: "danger", warning: "amber", stable: "sage" };

/* -------------------------------------------------------------- overview */

function SummaryStrip({ visible }) {
  const stats = useMemo(() => {
    const cycles = visible.map(cycleTime);
    const withinSla = visible.filter(
      (process, index) => cycles[index] <= process.slaTarget,
    ).length;
    const average = cycles.length
      ? Math.round(
          cycles.reduce((sum, value) => sum + value, 0) / cycles.length,
        )
      : 0;

    return [
      {
        label: "Ko‘rinayotgan jarayon",
        value: String(visible.length),
        note: `${new Set(visible.map((item) => item.department)).size} ta bo‘lim`,
      },
      {
        label: "O‘rtacha sikl vaqti",
        value: visible.length ? formatDuration(average) : "—",
        note: "bosqichlar bo‘yicha hisoblangan",
      },
      {
        label: "SLA ichida",
        value: visible.length
          ? `${Math.round((withinSla / visible.length) * 100)}%`
          : "—",
        note: `${withinSla} / ${visible.length} jarayon`,
        meter: visible.length ? (withinSla / visible.length) * 100 : 0,
      },
      (() => {
        const critical = visible.filter(
          (item) => item.status === "critical",
        ).length;

        return {
          label: "Kritik jarayonlar",
          value: String(critical),
          note: critical ? "darhol e’tibor talab qiladi" : "kritik holat yo‘q",
          tone: critical ? "critical" : undefined,
        };
      })(),
    ];
  }, [visible]);

  return (
    <section className={styles.summary} aria-label="Portfel ko‘rsatkichlari">
      {stats.map((stat) => (
        <article key={stat.label}>
          <span>{stat.label}</span>
          <strong className={stat.tone ? styles.valueCritical : undefined}>
            {stat.value}
          </strong>
          {typeof stat.meter === "number" ? (
            <div className={styles.summaryMeter} aria-hidden="true">
              <i style={{ width: `${stat.meter}%` }} />
            </div>
          ) : null}
          <small>{stat.note}</small>
        </article>
      ))}
    </section>
  );
}

/* --------------------------------------------------------------- toolbar */

function Toolbar({
  query,
  onQuery,
  department,
  onDepartment,
  status,
  onStatus,
  sort,
  onSort,
  counts,
}) {
  return (
    <section className={styles.toolbar} aria-label="Reyestr filtrlari">
      <div className={styles.search}>
        <Icon name="search" size={16} />
        <input
          type="search"
          value={query}
          placeholder="Jarayon, ID yoki mas’ul bo‘yicha qidiring"
          aria-label="Jarayonlarni qidirish"
          onChange={(event) => onQuery(event.target.value)}
        />
        {query ? (
          <button
            type="button"
            aria-label="Qidiruvni tozalash"
            onClick={() => onQuery("")}
          >
            ×
          </button>
        ) : null}
      </div>

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
            onClick={() => onStatus(item.id)}
          >
            {item.label}
            <small>{counts[item.id] ?? 0}</small>
          </button>
        ))}
      </div>

      {/* Ikkala dropdown bitta guruh — tor ekranda birga qatorga tushadi. */}
      <div className={styles.selectGroup}>
        <Select
          label="Bo‘lim"
          value={department}
          onChange={onDepartment}
          options={[
            { value: "all", label: "Barchasi" },
            ...departments.map((item) => ({ value: item, label: item })),
          ]}
        />
        <Select
          label="Saralash"
          value={sort}
          onChange={onSort}
          align="end"
          options={sortOptions.map((item) => ({
            value: item.id,
            label: item.label,
          }))}
        />
      </div>
    </section>
  );
}

/* -------------------------------------------------------------- registry */

function RegistryRow({ process, selected, onSelect }) {
  const cycle = cycleTime(process);
  const overrun = cycle - process.slaTarget;
  const scale = Math.max(cycle, process.slaTarget);

  return (
    <button
      type="button"
      className={`${styles.row} ${selected ? styles.rowOn : ""}`}
      aria-pressed={selected}
      onClick={() => onSelect(process.id)}
    >
      <div className={styles.identity}>
        <span
          className={styles[`marker_${process.status}`]}
          aria-hidden="true"
        />
        <div>
          <small>
            {process.id} · {process.category}
          </small>
          <strong>{process.name}</strong>
        </div>
      </div>

      <div className={styles.owner}>
        <span className={styles.avatar} aria-hidden="true">
          {process.initials}
        </span>
        <div>
          <strong>{process.department}</strong>
          <small>{process.owner}</small>
        </div>
      </div>

      <div className={styles.stagesCell}>
        <strong>{process.stages.length}</strong>
        <small>bosqich</small>
      </div>

      <div className={styles.cycleCell}>
        <div>
          <strong>{formatDuration(cycle)}</strong>
          <small className={overrun > 0 ? styles.negative : styles.positive}>
            {overrun > 0 ? `+${overrun}` : overrun} min
          </small>
        </div>
        <div className={styles.cycleTrack} aria-hidden="true">
          <i
            className={styles[`fill_${process.status}`]}
            style={{ width: `${(cycle / scale) * 100}%` }}
          />
          <b style={{ left: `${(process.slaTarget / scale) * 100}%` }} />
        </div>
      </div>

      <div className={styles.efficiencyCell}>
        <strong>{process.efficiency}%</strong>
        <div className={styles.efficiencyTrack} aria-hidden="true">
          <i style={{ width: `${process.efficiency}%` }} />
        </div>
      </div>

      <div className={styles.riskCell}>
        <span className={styles[`risk_${process.status}`]}>{process.risk}</span>
      </div>

      <div className={styles.trendCell}>
        <Sparkline values={process.trend} tone={trendTone[process.status]} />
      </div>
    </button>
  );
}

/* ---------------------------------------------------------------- detail */

function StagePipeline({ process }) {
  const bottleneck = bottleneckIndex(process);

  return (
    <div
      className={styles.pipeline}
      role="list"
      aria-label="Jarayon bosqichlari"
    >
      {process.stages.map((stage, index) => {
        const tone = stageStatus(stage);
        const scale = Math.max(stage.avg, stage.sla);

        return (
          <Fragment key={stage.name}>
            {index > 0 ? (
              <div className={styles.connector} aria-hidden="true">
                <small>
                  {stage.wait > 0 ? `${stage.wait} min kutish` : "kutishsiz"}
                </small>
              </div>
            ) : null}

            <article
              role="listitem"
              className={`${styles.stage} ${styles[`stage_${tone}`]} ${
                index === bottleneck ? styles.stageBottleneck : ""
              }`}
            >
              <header>
                <span className={styles.stageIndex}>
                  {String(index + 1).padStart(2, "0")}
                </span>
                {index === bottleneck ? (
                  <b className={styles.bottleneckTag}>Bottleneck</b>
                ) : null}
              </header>

              <strong>{stage.name}</strong>
              <small>{stage.role}</small>

              <div className={styles.stageTime}>
                <b>{stage.avg} min</b>
                <em>SLA {stage.sla}</em>
              </div>

              <div className={styles.stageTrack} aria-hidden="true">
                <i style={{ width: `${(stage.avg / scale) * 100}%` }} />
                <u style={{ left: `${(stage.sla / scale) * 100}%` }} />
              </div>

              <footer>
                {stage.rework > 0
                  ? `Qayta ishlash ${stage.rework}%`
                  : "Qayta ishlash yo‘q"}
              </footer>
            </article>
          </Fragment>
        );
      })}
    </div>
  );
}

function TimeComposition({ process }) {
  const total = cycleTime(process);
  const bottleneck = bottleneckIndex(process);

  return (
    <div className={styles.composition}>
      <div className={styles.compositionBar} aria-hidden="true">
        {process.stages.map((stage, index) => (
          <i
            key={stage.name}
            className={`${styles[`segment_${stageStatus(stage)}`]} ${
              index === bottleneck ? styles.segmentBottleneck : ""
            }`}
            style={{ width: `${(stageTotal(stage) / total) * 100}%` }}
            title={`${stage.name}: ${stageTotal(stage)} min`}
          />
        ))}
      </div>

      <ul className={styles.compositionLegend}>
        {process.stages.map((stage, index) => (
          <li key={stage.name}>
            <i className={styles[`dot_${stageStatus(stage)}`]} />
            <span>{stage.name}</span>
            <b>{Math.round((stageTotal(stage) / total) * 100)}%</b>
            {index === bottleneck ? <em>eng katta ulush</em> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ProcessDetail({ process }) {
  const cycle = cycleTime(process);
  const overrun = cycle - process.slaTarget;
  const waiting = process.stages.reduce((sum, stage) => sum + stage.wait, 0);

  const facts = [
    { label: "Sikl vaqti", value: formatDuration(cycle) },
    { label: "SLA maqsadi", value: formatDuration(process.slaTarget) },
    {
      label: "Og‘ish",
      value: `${overrun > 0 ? "+" : ""}${overrun} min`,
      tone: overrun > 0 ? "negative" : "positive",
    },
    { label: "Kutishda", value: `${Math.round((waiting / cycle) * 100)}%` },
    { label: "Oylik hajm", value: `${process.volume} ta` },
    { label: "Avtomatlashtirilgan", value: `${process.automation}%` },
  ];

  return (
    <section
      className={styles.detail}
      aria-label={`${process.name} tafsilotlari`}
    >
      <header className={styles.detailHead}>
        <div>
          <span className={styles.detailEyebrow}>
            {process.id} · {process.department} · {process.owner}
          </span>
          <h2>{process.name}</h2>
        </div>
        <span className={styles[`badge_${process.status}`]}>
          {statusLabels[process.status]}
        </span>
      </header>

      <div className={styles.facts}>
        {facts.map((fact) => (
          <div key={fact.label}>
            <span>{fact.label}</span>
            <strong className={fact.tone ? styles[fact.tone] : undefined}>
              {fact.value}
            </strong>
          </div>
        ))}
      </div>

      <div className={styles.detailBlock}>
        <span className={styles.blockLabel}>Bosqichlar oqimi</span>
        <StagePipeline process={process} />
      </div>

      <div className={styles.detailBlock}>
        <span className={styles.blockLabel}>Sikl vaqtining taqsimoti</span>
        <TimeComposition process={process} />
      </div>

      <div className={styles.insight}>
        <span>
          <Icon name="spark" size={15} /> AI xulosasi
        </span>
        <p>{process.insight}</p>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ page */

export default function ProcessRegistry() {
  const [query, setQuery] = useState("");
  const [department, setDepartment] = useState("all");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("risk");
  const [selectedId, setSelectedId] = useState(processes[0].id);

  // Holat hisoblagichlari qidiruv va bo'lim filtridan keyingi to'plamga tayanadi.
  const scoped = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return processes.filter((process) => {
      const matchesQuery =
        !needle ||
        [process.id, process.name, process.owner, process.department]
          .join(" ")
          .toLowerCase()
          .includes(needle);

      return (
        matchesQuery &&
        (department === "all" || process.department === department)
      );
    });
  }, [query, department]);

  const counts = useMemo(
    () =>
      scoped.reduce(
        (totals, process) => ({
          ...totals,
          all: totals.all + 1,
          [process.status]: (totals[process.status] ?? 0) + 1,
        }),
        { all: 0 },
      ),
    [scoped],
  );

  const rows = useMemo(() => {
    const filtered = scoped.filter(
      (process) => status === "all" || process.status === status,
    );

    const comparators = {
      risk: (a, b) => b.risk - a.risk,
      overrun: (a, b) =>
        cycleTime(b) - b.slaTarget - (cycleTime(a) - a.slaTarget),
      efficiency: (a, b) => a.efficiency - b.efficiency,
      volume: (a, b) => b.volume - a.volume,
      name: (a, b) => a.name.localeCompare(b.name, "uz"),
    };

    return [...filtered].sort(comparators[sort]);
  }, [scoped, status, sort]);

  // Tanlangan jarayon filtrdan tushib qolsa, ro'yxatdagi birinchisi ko'rsatiladi.
  const activeId = rows.some((process) => process.id === selectedId)
    ? selectedId
    : rows[0]?.id;
  const selected = processes.find((process) => process.id === activeId);

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <span className={styles.kicker}>Jarayonlar reyestri</span>
        <p>
          Har bir jarayonning egasi, bosqichlari va SLA bo‘yicha holati — bitta
          ro‘yxatda.
        </p>
      </header>

      <SummaryStrip visible={scoped} />

      <Toolbar
        query={query}
        onQuery={setQuery}
        department={department}
        onDepartment={setDepartment}
        status={status}
        onStatus={setStatus}
        sort={sort}
        onSort={setSort}
        counts={counts}
      />

      <section className={styles.registry} aria-label="Jarayonlar ro‘yxati">
        <div className={styles.tableHead} aria-hidden="true">
          <span>Jarayon</span>
          <span>Bo‘lim va mas’ul</span>
          <span>Bosqich</span>
          <span>Sikl vaqti / SLA</span>
          <span>Samaradorlik</span>
          <span>Risk</span>
          <span>Trend</span>
        </div>

        {rows.length === 0 ? (
          <p className={styles.empty}>
            Tanlangan shartlarga mos jarayon topilmadi. Filtrlarni yumshating.
          </p>
        ) : (
          <div className={styles.rows}>
            {rows.map((process) => (
              <RegistryRow
                key={process.id}
                process={process}
                selected={process.id === activeId}
                onSelect={setSelectedId}
              />
            ))}
          </div>
        )}
      </section>

      {selected ? <ProcessDetail process={selected} /> : null}
    </div>
  );
}
