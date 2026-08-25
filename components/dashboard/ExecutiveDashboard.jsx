"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Icon from "@/components/ui/Icon";
import {
  criticalProcesses,
  decisionBrief,
  departmentPerformance,
  performanceSeries,
} from "@/lib/dashboard-data";
import styles from "./ExecutiveDashboard.module.css";

const liveSnapshots = [
  {
    bpei: 84.6,
    kpi: 87.2,
    activeProcesses: 24,
    criticalRisks: 3,
    economicImpact: 410,
    confidence: 94,
    delta: 4.2,
    trendEnd: 87.2,
    signal: "BP-1024 bo‘yicha yangi kechikish signali qabul qilindi",
  },
  {
    bpei: 84.8,
    kpi: 87.4,
    activeProcesses: 25,
    criticalRisks: 3,
    economicImpact: 412,
    confidence: 95,
    delta: 4.4,
    trendEnd: 87.4,
    signal: "Moliya bo‘limida KPI ko‘rsatkichi 0.2 punktga oshdi",
  },
  {
    bpei: 84.7,
    kpi: 87.3,
    activeProcesses: 24,
    criticalRisks: 2,
    economicImpact: 414,
    confidence: 95,
    delta: 4.3,
    trendEnd: 87.3,
    signal: "BP-1018 riski kritik zonadan kuzatuv zonasiga o‘tdi",
  },
];

function formatSyncTime(date) {
  return new Intl.DateTimeFormat("uz-UZ", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
}

const riskSignals = [
  {
    id: "BP-1024",
    label: "Xaridlar",
    x: 82,
    y: 84,
    score: 82,
    tone: "critical",
  },
  {
    id: "BP-1018",
    label: "Shartnoma",
    x: 67,
    y: 73,
    score: 71,
    tone: "critical",
  },
  {
    id: "BP-1007",
    label: "Oy yopilishi",
    x: 74,
    y: 50,
    score: 58,
    tone: "warning",
  },
  {
    id: "BP-1031",
    label: "Onboarding",
    x: 45,
    y: 34,
    score: 43,
    tone: "stable",
  },
  {
    id: "BP-1042",
    label: "Sotuv leadlari",
    x: 58,
    y: 41,
    score: 47,
    tone: "stable",
  },
];

const flowHealth = [
  { label: "Xaridlarni tasdiqlash", value: 138, target: 75, tone: "critical" },
  { label: "Shartnoma kelishuvi", value: 112, target: 80, tone: "warning" },
  { label: "Oylik yopilish", value: 86, target: 82, tone: "stable" },
];

const economicBridge = [
  { label: "Vaqt", value: 96, display: "+96", tone: "positive" },
  { label: "Xarajat", value: 74, display: "+74", tone: "positive" },
  { label: "Risk", value: 31, display: "−31", tone: "negative" },
  { label: "Sof ta’sir", value: 139, display: "+139", tone: "total" },
];

function makePoints(values, width = 760, height = 220) {
  const minimum = 64;
  const maximum = 92;
  const horizontalPadding = 8;
  const verticalPadding = 16;
  const chartWidth = width - horizontalPadding * 2;
  const chartHeight = height - verticalPadding * 2;

  return values
    .map((value, index) => {
      const x = horizontalPadding + (index / (values.length - 1)) * chartWidth;
      const y =
        verticalPadding +
        chartHeight -
        ((value - minimum) / (maximum - minimum)) * chartHeight;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

function PanelHeading({ eyebrow, title, meta, action }) {
  return (
    <div className={styles.panelHeading}>
      <div>
        <span>{eyebrow}</span>
        <h2>{title}</h2>
      </div>
      {action ?? (meta ? <small>{meta}</small> : null)}
    </div>
  );
}

function PerformanceChart({ values, planValues, months }) {
  const [activePoint, setActivePoint] = useState(values.length - 1);
  const actual = makePoints(values);
  const plan = makePoints(planValues);
  const area = `8,220 ${actual} 752,220`;
  const selectedPoint = Math.min(activePoint, values.length - 1);

  return (
    <div className={styles.performanceChart}>
      <div className={styles.chartYAxis} aria-hidden="true">
        <span>90</span>
        <span>80</span>
        <span>70</span>
      </div>
      <div className={styles.chartPlot}>
        <svg
          viewBox="0 0 760 220"
          preserveAspectRatio="none"
          role="img"
          aria-label={`BPEI ko‘rsatkichi ${months[0]} oyidagi ${values[0]} balldan ${months.at(-1)} oyida ${values.at(-1)} ballgacha o‘zgargan`}
        >
          <defs>
            <linearGradient id="bpei-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#e56a35" stopOpacity="0.22" />
              <stop offset="74%" stopColor="#e56a35" stopOpacity="0.035" />
              <stop offset="100%" stopColor="#e56a35" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            className={styles.chartGrid}
            d="M8 27h744M8 110h744M8 193h744"
          />
          <polygon className={styles.chartArea} points={area} />
          <polyline className={styles.chartPlan} points={plan} />
          <polyline className={styles.chartActual} points={actual} />
          {values.map((value, index) => {
            const x = 8 + (index / (values.length - 1)) * 744;
            const y = 16 + 188 - ((value - 64) / 28) * 188;
            return (
              <circle
                className={`${styles.chartPoint} ${selectedPoint === index ? styles.chartPointActive : ""}`}
                cx={x}
                cy={y}
                r={selectedPoint === index ? 5 : 3}
                key={`${value}-${index}`}
                tabIndex="0"
                onMouseEnter={() => setActivePoint(index)}
                onFocus={() => setActivePoint(index)}
              >
                <title>{`${months[index]}: ${value} BPEI`}</title>
              </circle>
            );
          })}
        </svg>
        <div className={styles.chartCallout}>
          <span>{months[selectedPoint]}</span>
          <strong>{values[selectedPoint]}</strong>
        </div>
        <div className={styles.chartMonths} aria-hidden="true">
          {months.map((month, index) => (
            <span
              key={month}
              className={index % 2 ? styles.monthHidden : undefined}
            >
              {month}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function PerformancePanel({ snapshot, period }) {
  const chartData = useMemo(() => {
    const values = [...performanceSeries.actual];
    values[values.length - 1] = snapshot.trendEnd;
    const start = period === "6m" ? 6 : 0;

    return {
      values: values.slice(start),
      planValues: performanceSeries.plan.slice(start),
      months: performanceSeries.months.slice(start),
    };
  }, [period, snapshot.trendEnd]);

  return (
    <section className={`${styles.panel} ${styles.performancePanel}`}>
      <PanelHeading
        eyebrow="Business performance index"
        title="Tashkilot samaradorligi"
        action={
          <div className={styles.legend} aria-label="Grafik belgilari">
            <span>
              <i className={styles.actualLegend} /> Amaldagi
            </span>
            <span>
              <i className={styles.planLegend} /> Reja
            </span>
          </div>
        }
      />

      <div className={styles.performanceLead}>
        <div className={styles.performanceScore}>
          <strong>{snapshot.bpei.toFixed(1)}</strong>
          <span>BPEI</span>
        </div>
        <div className={styles.performanceDelta}>
          <b>
            <Icon name="arrowUp" size={13} /> {snapshot.delta.toFixed(1)}%
          </b>
          <span>o‘tgan davrga nisbatan</span>
        </div>
        <p>
          12 oylik trend barqaror o‘smoqda. Amaldagi natija reja chizig‘idan{" "}
          <b>1.6 punkt</b> yuqori.
        </p>
      </div>

      <PerformanceChart {...chartData} />

      <div className={styles.performanceFoot}>
        <div>
          <span>KPI bajarilishi</span>
          <strong>{snapshot.kpi.toFixed(1)}%</strong>
          <small className={styles.positive}>+2.8%</small>
        </div>
        <div>
          <span>Faol jarayonlar</span>
          <strong>{snapshot.activeProcesses}</strong>
          <small>5 ta bo‘lim</small>
        </div>
        <div>
          <span>Kritik risk</span>
          <strong>{snapshot.criticalRisks}</strong>
          <small
            className={
              snapshot.criticalRisks > 2 ? styles.negative : styles.positive
            }
          >
            {snapshot.criticalRisks > 2 ? "+1 bugun" : "−1 hozir"}
          </small>
        </div>
      </div>
    </section>
  );
}

function DecisionDesk({ confidence }) {
  return (
    <aside
      className={styles.decisionDesk}
      aria-labelledby="decision-desk-title"
    >
      <div className={styles.decisionHeader}>
        <span>
          <Icon name="spark" size={16} /> AI Decision Desk
        </span>
        <b>
          <i /> {confidence}% ishonch
        </b>
      </div>

      <div className={styles.decisionIndex}>
        <span>Ustuvor qaror</span>
        <strong>
          01 <small>/ 03</small>
        </strong>
      </div>

      <div className={styles.decisionProcess}>
        <small>{decisionBrief.processId}</small>
        <span>{decisionBrief.process}</span>
      </div>

      <h2 id="decision-desk-title">{decisionBrief.title}</h2>
      <p>{decisionBrief.reason}</p>

      <div className={styles.decisionEffects}>
        {decisionBrief.effects.map((effect) => (
          <div key={effect.label}>
            <span>{effect.label}</span>
            <strong>{effect.value}</strong>
          </div>
        ))}
      </div>

      <div className={styles.decisionRecommendation}>
        <span>AI tavsiyasi</span>
        <p>{decisionBrief.recommendation}</p>
      </div>

      <Link className={styles.decisionAction} href="/recommendations">
        Qarorni ko‘rib chiqish
        <Icon name="chevron" size={15} />
      </Link>
    </aside>
  );
}

function FlowHealth({ activeProcesses }) {
  return (
    <section className={`${styles.panel} ${styles.flowPanel}`}>
      <PanelHeading
        eyebrow="Process velocity"
        title="Jarayonlar oqimi"
        meta={`${activeProcesses} ta faol`}
      />

      <div className={styles.flowDistribution} aria-label="Jarayonlar holati">
        <span className={styles.flowStable} style={{ width: "62%" }} />
        <span className={styles.flowWatch} style={{ width: "25%" }} />
        <span className={styles.flowCritical} style={{ width: "13%" }} />
      </div>
      <div className={styles.flowLegend}>
        <span>
          <i className={styles.dotStable} /> 15 barqaror
        </span>
        <span>
          <i className={styles.dotWatch} /> 6 diqqatda
        </span>
        <span>
          <i className={styles.dotCritical} /> 3 kritik
        </span>
      </div>

      <div className={styles.bulletList}>
        {flowHealth.map((item) => (
          <div className={styles.bulletRow} key={item.label}>
            <div>
              <span>{item.label}</span>
              <strong className={styles[`bullet_${item.tone}`]}>
                {item.value} min
              </strong>
            </div>
            <div className={styles.bulletTrack}>
              <span
                className={styles[`bulletFill_${item.tone}`]}
                style={{ width: `${Math.min(100, (item.value / 145) * 100)}%` }}
              />
              <i
                style={{ left: `${(item.target / 145) * 100}%` }}
                title={`SLA: ${item.target} min`}
              />
            </div>
            <small>SLA {item.target}</small>
          </div>
        ))}
      </div>
    </section>
  );
}

function RiskMatrix() {
  return (
    <section className={`${styles.panel} ${styles.riskPanel}`}>
      <PanelHeading
        eyebrow="Predictive risk map"
        title="Risk va iqtisodiy ta’sir"
        action={
          <Link className={styles.panelLink} href="/risks">
            Risk markazi <Icon name="chevron" size={13} />
          </Link>
        }
      />

      <div className={styles.riskCanvas}>
        <span className={styles.riskAxisY}>Ehtimollik</span>
        <svg
          viewBox="0 0 520 226"
          role="img"
          aria-label="Jarayonlarning ehtimollik va iqtisodiy ta’sir bo‘yicha risk xaritasi"
        >
          <rect
            className={styles.riskZone}
            x="260"
            y="0"
            width="260"
            height="113"
          />
          <path
            className={styles.riskGrid}
            d="M0 56.5h520M0 113h520M0 169.5h520M130 0v226M260 0v226M390 0v226"
          />
          {riskSignals.map((signal) => {
            const cx = (signal.x / 100) * 500 + 10;
            const cy = 216 - (signal.y / 100) * 206;
            const radius = 7 + signal.score / 16;
            return (
              <g className={styles[`risk_${signal.tone}`]} key={signal.id}>
                <circle
                  className={styles.riskHalo}
                  cx={cx}
                  cy={cy}
                  r={radius + 7}
                />
                <circle className={styles.riskDot} cx={cx} cy={cy} r={radius}>
                  <title>{`${signal.id} · ${signal.label} · risk ${signal.score}`}</title>
                </circle>
                <text x={cx + radius + 7} y={cy - 3}>
                  {signal.id}
                </text>
                <text
                  className={styles.riskTextMuted}
                  x={cx + radius + 7}
                  y={cy + 11}
                >
                  {signal.label}
                </text>
              </g>
            );
          })}
        </svg>
        <div className={styles.riskAxisX}>
          <span>Past ta’sir</span>
          <span>Yuqori ta’sir</span>
        </div>
      </div>
    </section>
  );
}

function EconomicBridge({ impact }) {
  return (
    <section className={`${styles.panel} ${styles.economicPanel}`}>
      <PanelHeading
        eyebrow="Value realization"
        title="Sof iqtisodiy ta’sir"
        meta="Yillik"
      />
      <div className={styles.economicValue}>
        <strong>{impact}</strong>
        <span>mln so‘m</span>
        <small>
          <Icon name="arrowUp" size={12} /> 18.4%
        </small>
      </div>
      <div
        className={styles.bridgeChart}
        aria-label="Iqtisodiy ta’sir bridge grafigi"
      >
        {economicBridge.map((item) => (
          <div className={styles.bridgeColumn} key={item.label}>
            <span>{item.display}</span>
            <div className={styles.bridgeWell}>
              <i
                className={styles[`bridge_${item.tone}`]}
                style={{ height: `${Math.max(24, (item.value / 150) * 100)}%` }}
              />
            </div>
            <small>{item.label}</small>
          </div>
        ))}
      </div>
      <p className={styles.economicNote}>
        AI tavsiyalari qabul qilinsa, keyingi 90 kunda qo‘shimcha{" "}
        <b>62 mln so‘m</b> effekt kutilmoqda.
      </p>
    </section>
  );
}

function CriticalQueue() {
  return (
    <section className={`${styles.panel} ${styles.queuePanel}`}>
      <PanelHeading
        eyebrow="Management queue"
        title="E’tibor talab qilayotgan jarayonlar"
        action={
          <Link className={styles.panelLink} href="/processes">
            Barcha jarayonlar <Icon name="chevron" size={13} />
          </Link>
        }
      />
      <div className={styles.queueHeader} aria-hidden="true">
        <span>Jarayon</span>
        <span>Mas’ul</span>
        <span>Oqim tezligi</span>
        <span>Risk</span>
        <span>Prognoz</span>
      </div>
      <div className={styles.queueList}>
        {criticalProcesses.map((process, index) => (
          <Link className={styles.queueRow} href="/processes" key={process.id}>
            <div className={styles.queueIdentity}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <small>{process.id}</small>
                <strong>{process.name}</strong>
              </div>
            </div>
            <div className={styles.queueOwner}>
              <strong>{process.department}</strong>
              <small>{process.owner}</small>
            </div>
            <div className={styles.queueVelocity}>
              <span>
                <i style={{ width: `${process.efficiency}%` }} />
              </span>
              <strong>{process.efficiency}%</strong>
            </div>
            <div className={styles.queueRisk}>
              <span className={styles[`queueRisk_${process.status}`]}>
                {process.risk}
              </span>
              <small>
                {process.status === "critical"
                  ? "Kritik"
                  : process.status === "warning"
                    ? "Diqqat"
                    : "Barqaror"}
              </small>
            </div>
            <div className={styles.queueForecast}>
              {process.forecast}
              <Icon name="chevron" size={13} />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function DepartmentRanking() {
  return (
    <section className={`${styles.panel} ${styles.departmentPanel}`}>
      <PanelHeading
        eyebrow="Portfolio benchmark"
        title="Bo‘limlar BPEI reytingi"
        meta="100 ball"
      />
      <div className={styles.departmentList}>
        {departmentPerformance.map((department, index) => (
          <div className={styles.departmentRow} key={department.name}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{department.name}</strong>
            <div className={styles.lollipop}>
              <i style={{ width: `${department.score}%` }}>
                <b />
              </i>
            </div>
            <b>{department.score}</b>
            <small
              className={
                department.trend.startsWith("−")
                  ? styles.negative
                  : styles.positive
              }
            >
              {department.trend}
            </small>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function ExecutiveDashboard() {
  const [snapshotIndex, setSnapshotIndex] = useState(0);
  const [period, setPeriod] = useState("12m");
  const [isLive, setIsLive] = useState(true);
  const [syncTime, setSyncTime] = useState("hozir");
  const [exported, setExported] = useState(false);
  const snapshot = liveSnapshots[snapshotIndex];

  useEffect(() => {
    if (!isLive) return undefined;

    const interval = window.setInterval(() => {
      setSnapshotIndex((current) => (current + 1) % liveSnapshots.length);
      setSyncTime(formatSyncTime(new Date()));
    }, 4500);

    return () => window.clearInterval(interval);
  }, [isLive]);

  const refreshMockData = () => {
    setSnapshotIndex((current) => (current + 1) % liveSnapshots.length);
    setSyncTime(formatSyncTime(new Date()));
  };

  const exportMockReport = () => {
    const rows = [
      ["Ko‘rsatkich", "Qiymat"],
      ["BPEI", snapshot.bpei],
      ["KPI bajarilishi", `${snapshot.kpi}%`],
      ["Faol jarayonlar", snapshot.activeProcesses],
      ["Kritik risklar", snapshot.criticalRisks],
      ["Iqtisodiy ta’sir", `${snapshot.economicImpact} mln so‘m`],
      ...criticalProcesses.map((process) => [
        `${process.id} ${process.name}`,
        `Risk ${process.risk}`,
      ]),
    ];
    const csv = rows
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "ai-bpm-executive-mock-report.csv";
    anchor.click();
    URL.revokeObjectURL(url);
    setExported(true);
    window.setTimeout(() => setExported(false), 1800);
  };

  return (
    <div className={styles.dashboard}>
      <span className={styles.visuallyHidden} aria-live="polite">
        Mock ma’lumot yangilandi: BPEI {snapshot.bpei.toFixed(1)}, kritik
        risklar {snapshot.criticalRisks}
      </span>
      <header className={styles.pageHeader}>
        <div>
          <span className={styles.pageKicker}>
            <i className={!isLive ? styles.pausedDot : undefined} /> Live mock
            stream · so‘nggi yangilanish {syncTime}
          </span>
          <h1>Operatsion panorama</h1>
          <p>
            Natija, risk va qarorlar — tashkilotning ayni paytdagi yagona
            boshqaruv ko‘rinishi.
          </p>
        </div>
        <div className={styles.pageActions}>
          <button
            className={`${styles.streamButton} ${!isLive ? styles.streamPaused : ""}`}
            type="button"
            aria-pressed={!isLive}
            onClick={() => setIsLive((current) => !current)}
          >
            <i /> {isLive ? "Mock stream · Live" : "Mock stream · Pauza"}
            <Icon name={isLive ? "pause" : "play"} size={14} />
          </button>
          <button
            className={styles.refreshButton}
            type="button"
            aria-label="Mock ma’lumotni hozir yangilash"
            onClick={refreshMockData}
          >
            <Icon name="refresh" size={16} />
          </button>
          <div className={styles.periodControl} aria-label="Grafik davri">
            <button
              className={period === "6m" ? styles.periodActive : undefined}
              type="button"
              aria-pressed={period === "6m"}
              onClick={() => setPeriod("6m")}
            >
              6 oy
            </button>
            <button
              className={period === "12m" ? styles.periodActive : undefined}
              type="button"
              aria-pressed={period === "12m"}
              onClick={() => setPeriod("12m")}
            >
              12 oy
            </button>
          </div>
          <button
            className={styles.exportButton}
            type="button"
            onClick={exportMockReport}
          >
            <Icon name={exported ? "check" : "download"} size={16} />
            {exported ? "CSV tayyor" : "Executive report"}
          </button>
        </div>
      </header>

      <section className={styles.signalBar} aria-label="So‘nggi mock signal">
        <span>
          <i /> Yangi signal
        </span>
        <strong>{snapshot.signal}</strong>
        <small>{syncTime}</small>
      </section>

      <div className={styles.overviewGrid}>
        <PerformancePanel snapshot={snapshot} period={period} />
        <DecisionDesk confidence={snapshot.confidence} />
      </div>

      <div className={styles.intelligenceGrid}>
        <FlowHealth activeProcesses={snapshot.activeProcesses} />
        <RiskMatrix />
        <EconomicBridge impact={snapshot.economicImpact} />
      </div>

      <div className={styles.operationsGrid}>
        <CriticalQueue />
        <DepartmentRanking />
      </div>
    </div>
  );
}
