"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Icon from "@/components/ui/Icon";
import Sparkline from "@/components/ui/Sparkline";
import {
  criticalProcesses,
  decisionQueue,
  departmentPerformance,
  microSeries,
  performanceSeries,
} from "@/lib/dashboard-data";
import {
  advanceSnapshot,
  createSignal,
  initialSignal,
  initialSnapshot,
  relativeTime,
} from "@/lib/live-stream";
import { useAnimatedValue } from "@/lib/use-animated-value";
import styles from "./ExecutiveDashboard.module.css";

const STREAM_INTERVAL = 4200;

const riskSignals = [
  {
    id: "BP-1024",
    label: "Xaridlarni tasdiqlash",
    department: "Xaridlar",
    x: 82,
    y: 84,
    score: 82,
    exposure: "148 mln so‘m",
    tone: "critical",
  },
  {
    id: "BP-1018",
    label: "Shartnoma kelishuvi",
    department: "Yuridik",
    x: 67,
    y: 73,
    score: 71,
    exposure: "96 mln so‘m",
    tone: "critical",
  },
  {
    id: "BP-1007",
    label: "Oylik yopilish",
    department: "Moliya",
    x: 74,
    y: 50,
    score: 58,
    exposure: "74 mln so‘m",
    tone: "warning",
  },
  {
    id: "BP-1031",
    label: "Xodim onboarding",
    department: "HR",
    x: 34,
    y: 30,
    score: 43,
    exposure: "22 mln so‘m",
    tone: "stable",
  },
  {
    id: "BP-1042",
    label: "Sotuv leadlari",
    department: "Sotuv",
    x: 52,
    y: 41,
    score: 47,
    exposure: "31 mln so‘m",
    tone: "stable",
  },
];

const flowHealth = [
  { label: "Xaridlarni tasdiqlash", base: 138, target: 75, tone: "critical" },
  { label: "Shartnoma kelishuvi", base: 112, target: 80, tone: "warning" },
  { label: "Oylik yopilish", base: 86, target: 82, tone: "stable" },
];

const economicBridge = [
  { label: "Vaqt", value: 96, display: "+96", tone: "positive" },
  { label: "Xarajat", value: 74, display: "+74", tone: "positive" },
  { label: "Risk", value: 31, display: "−31", tone: "negative" },
  { label: "Sof ta’sir", value: 139, display: "+139", tone: "total" },
];

const queueFilters = [
  { id: "all", label: "Barchasi" },
  { id: "critical", label: "Kritik" },
  { id: "warning", label: "Diqqatda" },
  { id: "stable", label: "Barqaror" },
];

const statusLabels = {
  critical: "Kritik",
  warning: "Diqqat",
  stable: "Barqaror",
};

/* ------------------------------------------------------------- primitives */

const CHART = { width: 760, height: 220, padX: 8, padY: 16, min: 64, max: 92 };

const AXIS_TICKS = [90, 80, 70];

function scaleY(value) {
  const { height, padY, min, max } = CHART;
  const plotHeight = height - padY * 2;
  return padY + plotHeight - ((value - min) / (max - min)) * plotHeight;
}

function project(values) {
  const { width, padX } = CHART;
  const plotWidth = width - padX * 2;

  return values.map((value, index) => ({
    value,
    x: padX + (index / (values.length - 1)) * plotWidth,
    y: scaleY(value),
  }));
}

const toPolyline = (points) =>
  points
    .map((point) => `${point.x.toFixed(1)},${point.y.toFixed(1)}`)
    .join(" ");

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

/* ----------------------------------------------------------------- header */

function StreamHeader({
  isLive,
  onToggleLive,
  onRefresh,
  refreshing,
  period,
  onPeriod,
  onExport,
}) {
  return (
    <header className={styles.pageHeader}>
      <div>
        <span className={styles.pageKicker}>
          <i className={!isLive ? styles.pausedDot : undefined} />
          {isLive ? "Jonli oqim" : "Oqim pauzada"}
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
          onClick={onToggleLive}
        >
          <i />
          <span>{isLive ? "Jonli" : "Pauza"}</span>
          <Icon name={isLive ? "pause" : "play"} size={13} />
        </button>

        <button
          className={`${styles.refreshButton} ${refreshing ? styles.refreshSpinning : ""}`}
          type="button"
          aria-label="Ko‘rsatkichlarni hozir yangilash"
          onClick={onRefresh}
        >
          <Icon name="refresh" size={16} />
        </button>

        <div className={styles.periodControl} role="group" aria-label="Davr">
          <span
            className={styles.periodThumb}
            data-position={period}
            aria-hidden="true"
          />
          {["6m", "12m"].map((option) => (
            <button
              key={option}
              className={period === option ? styles.periodActive : undefined}
              type="button"
              aria-pressed={period === option}
              onClick={() => onPeriod(option)}
            >
              {option === "6m" ? "6 oy" : "12 oy"}
            </button>
          ))}
        </div>

        <button
          className={styles.exportButton}
          type="button"
          onClick={onExport}
        >
          <Icon name="download" size={15} />
          Executive report
        </button>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------ signal feed */

function SignalFeed({ signals, now, expanded, onToggle }) {
  const [latest, ...history] = signals;

  return (
    <section
      className={`${styles.signalFeed} ${styles[`signalTone_${latest.tone}`]}`}
      aria-label="So‘nggi operatsion signallar"
    >
      <div className={styles.signalBar}>
        <span className={styles.signalTag}>
          <i />
          Yangi signal
        </span>

        <strong key={latest.id} className={styles.signalText}>
          <b>{latest.process}</b>
          <span>{latest.text}</span>
        </strong>

        <small className={styles.signalTime}>
          {relativeTime(latest.at, now)}
        </small>

        {history.length > 0 ? (
          <button
            className={styles.signalToggle}
            type="button"
            aria-expanded={expanded}
            onClick={onToggle}
          >
            +{history.length}
            <Icon name="chevron" size={12} />
          </button>
        ) : null}
      </div>

      {expanded && history.length > 0 ? (
        <ul className={styles.signalHistory}>
          {history.map((signal) => (
            <li key={signal.id} className={styles[`signalDot_${signal.tone}`]}>
              <i />
              <b>{signal.process}</b>
              <span>{signal.text}</span>
              <small>{relativeTime(signal.at, now)}</small>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

/* --------------------------------------------------------- performance */

function PerformanceChart({ values, planValues, months, isLive, period }) {
  const [hoverIndex, setHoverIndex] = useState(null);
  const plotRef = useRef(null);

  const actualPoints = useMemo(() => project(values), [values]);
  const planPoints = useMemo(() => project(planValues), [planValues]);

  const activeIndex = hoverIndex ?? values.length - 1;
  const active = actualPoints[activeIndex];
  const activePlan = planPoints[activeIndex];
  const last = actualPoints[actualPoints.length - 1];

  const area = `${CHART.padX},${CHART.height - CHART.padY} ${toPolyline(actualPoints)} ${CHART.width - CHART.padX},${CHART.height - CHART.padY}`;

  const pickIndex = useCallback(
    (event) => {
      const bounds = plotRef.current?.getBoundingClientRect();
      if (!bounds || bounds.width === 0) return;

      const ratio = (event.clientX - bounds.left) / bounds.width;
      const index = Math.round(ratio * (values.length - 1));
      setHoverIndex(Math.max(0, Math.min(values.length - 1, index)));
    },
    [values.length],
  );

  const gap = active.value - activePlan.value;
  // Nuqta yuqorida bo'lsa tooltip panel sarlavhasini yopib qo'ymasligi uchun pastga ag'dariladi.
  const flipTooltip = active.y < CHART.height * 0.42;

  return (
    <div className={styles.performanceChart}>
      <div className={styles.chartYAxis} aria-hidden="true">
        {AXIS_TICKS.map((tick) => (
          <span
            key={tick}
            style={{ top: `${(scaleY(tick) / CHART.height) * 100}%` }}
          >
            {tick}
          </span>
        ))}
      </div>

      <div
        className={styles.chartSurface}
        ref={plotRef}
        onPointerMove={pickIndex}
        onPointerLeave={() => setHoverIndex(null)}
      >
        <svg
          viewBox="0 0 760 220"
          preserveAspectRatio="none"
          role="img"
          aria-label={`BPEI ko‘rsatkichi ${months[0]} oyidagi ${values[0]} balldan ${months.at(-1)} oyida ${values.at(-1).toFixed(1)} ballgacha o‘zgargan`}
        >
          <defs>
            <linearGradient id="bpei-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#e56a35" stopOpacity="0.24" />
              <stop offset="74%" stopColor="#e56a35" stopOpacity="0.04" />
              <stop offset="100%" stopColor="#e56a35" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Gridline va o‘q yorliqlari bir xil shkaladan hisoblanadi. */}
          {AXIS_TICKS.map((tick) => (
            <line
              key={tick}
              className={styles.chartGrid}
              x1={CHART.padX}
              x2={CHART.width - CHART.padX}
              y1={scaleY(tick)}
              y2={scaleY(tick)}
            />
          ))}

          <polygon className={styles.chartArea} points={area} />
          <polyline
            key={`plan-${period}`}
            className={styles.chartPlan}
            points={toPolyline(planPoints)}
          />
          <polyline
            key={`actual-${period}`}
            className={styles.chartActual}
            points={toPolyline(actualPoints)}
            pathLength="1"
          />

          {hoverIndex !== null ? (
            <line
              className={styles.chartCrosshair}
              x1={active.x}
              y1={CHART.padY - 6}
              x2={active.x}
              y2={CHART.height - CHART.padY}
            />
          ) : null}

          {isLive ? (
            <circle
              className={styles.chartPulse}
              cx={last.x}
              cy={last.y}
              r="6"
            />
          ) : null}

          <circle
            className={styles.chartMarker}
            cx={active.x}
            cy={active.y}
            r="4.5"
          />
        </svg>

        {/* Klaviatura foydalanuvchilari uchun nuqtalarga fokus imkoniyati. */}
        <div className={styles.chartHitAreas}>
          {months.map((month, index) => (
            <button
              key={month}
              type="button"
              tabIndex={0}
              aria-label={`${month}: ${values[index].toFixed(1)} BPEI`}
              onFocus={() => setHoverIndex(index)}
              onBlur={() => setHoverIndex(null)}
              onClick={() => setHoverIndex(index)}
            />
          ))}
        </div>

        <div
          className={`${styles.chartTooltip} ${flipTooltip ? styles.tooltipBelow : ""}`}
          style={{
            left: `${Math.min(92, Math.max(8, (active.x / CHART.width) * 100))}%`,
            top: `${(active.y / CHART.height) * 100}%`,
          }}
        >
          <span>{months[activeIndex]}</span>
          <strong>{values[activeIndex].toFixed(1)}</strong>
          <em>
            Reja {planValues[activeIndex]}
            <b className={gap >= 0 ? styles.positive : styles.negative}>
              {gap >= 0 ? `+${gap.toFixed(1)}` : gap.toFixed(1)}
            </b>
          </em>
        </div>
      </div>

      <div className={styles.chartMonths} aria-hidden="true">
        {months.map((month, index) => (
          <span
            key={month}
            className={index === activeIndex ? styles.monthActive : undefined}
          >
            {month}
          </span>
        ))}
      </div>
    </div>
  );
}

function PerformancePanel({ snapshot, period, isLive }) {
  const bpei = useAnimatedValue(snapshot.bpei);
  const kpi = useAnimatedValue(snapshot.kpi);
  const delta = useAnimatedValue(snapshot.delta);
  const sla = useAnimatedValue(snapshot.sla);

  const chartData = useMemo(() => {
    const values = [...snapshot.trend];
    const start = period === "6m" ? 6 : 0;

    return {
      values: values.slice(start),
      planValues: performanceSeries.plan.slice(start),
      months: performanceSeries.months.slice(start),
    };
  }, [period, snapshot.trend]);

  const planGap =
    snapshot.bpei - performanceSeries.plan[performanceSeries.plan.length - 1];

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
          <strong>{bpei.toFixed(1)}</strong>
          <span>BPEI</span>
        </div>
        <div className={styles.performanceDelta}>
          <b>
            <Icon name="arrowUp" size={13} /> {delta.toFixed(1)}%
          </b>
          <span>o‘tgan davrga nisbatan</span>
        </div>
        <p>
          {period === "6m" ? "6" : "12"} oylik trend barqaror o‘smoqda. Amaldagi
          natija reja chizig‘idan{" "}
          <b>
            {planGap >= 0
              ? `${planGap.toFixed(1)} punkt yuqori`
              : `${Math.abs(planGap).toFixed(1)} punkt past`}
          </b>
          .
        </p>
      </div>

      <PerformanceChart {...chartData} isLive={isLive} period={period} />

      <div className={styles.performanceFoot}>
        <div>
          <span>KPI bajarilishi</span>
          <strong>{kpi.toFixed(1)}%</strong>
          <Sparkline
            className={styles.footSpark}
            values={microSeries.kpi}
            tone="sage"
          />
        </div>
        <div>
          <span>Faol jarayonlar</span>
          <strong>{snapshot.activeProcesses}</strong>
          <Sparkline
            className={styles.footSpark}
            values={microSeries.processes}
            tone="ink"
          />
        </div>
        <div>
          <span>Kritik risk</span>
          <strong>{snapshot.criticalRisks}</strong>
          <Sparkline
            className={styles.footSpark}
            values={microSeries.risks}
            tone="danger"
          />
        </div>
        <div>
          <span>SLA bajarilishi</span>
          <strong>{sla.toFixed(1)}%</strong>
          <Sparkline
            className={styles.footSpark}
            values={microSeries.sla}
            tone="sage"
          />
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------- decision desk */

function DecisionDesk({ confidence }) {
  const [index, setIndex] = useState(0);
  const decision = decisionQueue[index];
  const score = useAnimatedValue(confidence);

  const move = (step) =>
    setIndex(
      (current) =>
        (current + step + decisionQueue.length) % decisionQueue.length,
    );

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
          <i /> {Math.round(score)}% ishonch
        </b>
      </div>

      <div className={styles.decisionIndex}>
        <span>Ustuvor qaror</span>
        <div className={styles.decisionNav}>
          <button
            type="button"
            aria-label="Oldingi qaror"
            onClick={() => move(-1)}
          >
            <Icon name="collapse" size={14} />
          </button>
          <strong>
            {String(index + 1).padStart(2, "0")}
            <small>/ {String(decisionQueue.length).padStart(2, "0")}</small>
          </strong>
          <button
            type="button"
            aria-label="Keyingi qaror"
            onClick={() => move(1)}
          >
            <Icon name="chevron" size={14} />
          </button>
        </div>
      </div>

      <div className={styles.decisionBody} key={decision.processId}>
        <div className={styles.decisionProcess}>
          <small>{decision.processId}</small>
          <span>{decision.process}</span>
        </div>

        <h2 id="decision-desk-title">{decision.title}</h2>
        <p>{decision.reason}</p>

        <div className={styles.decisionEffects}>
          {decision.effects.map((effect) => (
            <div key={effect.label}>
              <span>{effect.label}</span>
              <strong>{effect.value}</strong>
            </div>
          ))}
        </div>

        <div className={styles.decisionRecommendation}>
          <span>AI tavsiyasi</span>
          <p>{decision.recommendation}</p>
        </div>
      </div>

      <div className={styles.decisionDots} aria-hidden="true">
        {decisionQueue.map((item, dot) => (
          <i
            key={item.processId}
            className={dot === index ? styles.dotOn : undefined}
          />
        ))}
      </div>

      <Link className={styles.decisionAction} href="/recommendations">
        Qarorni ko‘rib chiqish
        <Icon name="chevron" size={15} />
      </Link>
    </aside>
  );
}

/* ------------------------------------------------------------ flow health */

function FlowHealth({ snapshot }) {
  const critical = snapshot.criticalRisks;
  const watch = Math.max(2, Math.round(snapshot.activeProcesses * 0.25));
  const stable = Math.max(1, snapshot.activeProcesses - critical - watch);
  const total = critical + watch + stable;

  return (
    <section className={`${styles.panel} ${styles.flowPanel}`}>
      <PanelHeading
        eyebrow="Process velocity"
        title="Jarayonlar oqimi"
        meta={`${snapshot.activeProcesses} ta faol`}
      />

      <div className={styles.flowDistribution} aria-label="Jarayonlar holati">
        <span
          className={styles.flowStable}
          style={{ width: `${(stable / total) * 100}%` }}
        />
        <span
          className={styles.flowWatch}
          style={{ width: `${(watch / total) * 100}%` }}
        />
        <span
          className={styles.flowCritical}
          style={{ width: `${(critical / total) * 100}%` }}
        />
      </div>

      <div className={styles.flowLegend}>
        <span>
          <i className={styles.dotStable} /> {stable} barqaror
        </span>
        <span>
          <i className={styles.dotWatch} /> {watch} diqqatda
        </span>
        <span>
          <i className={styles.dotCritical} /> {critical} kritik
        </span>
      </div>

      <div className={styles.bulletList}>
        {flowHealth.map((item) => {
          // O‘tkazuvchanlik oshgan sari sikl vaqti mutanosib qisqaradi.
          const value = Math.round(item.base * (119 / snapshot.throughput));
          const met = value <= item.target;

          return (
            <div className={styles.bulletRow} key={item.label}>
              <div>
                <span>{item.label}</span>
                <strong className={styles[`bullet_${item.tone}`]}>
                  {value} min
                </strong>
              </div>
              <div className={styles.bulletTrack}>
                <span
                  className={styles[`bulletFill_${item.tone}`]}
                  style={{ width: `${Math.min(100, (value / 145) * 100)}%` }}
                />
                <i
                  style={{ left: `${(item.target / 145) * 100}%` }}
                  title={`SLA: ${item.target} min`}
                />
              </div>
              <small className={met ? styles.positive : undefined}>
                SLA {item.target}
              </small>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ risk matrix */

function RiskMatrix() {
  const [active, setActive] = useState(null);
  const signal = riskSignals.find((item) => item.id === active);

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

        <div className={styles.riskPlot}>
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

            {riskSignals.map((item) => {
              const cx = (item.x / 100) * 500 + 10;
              const cy = 216 - (item.y / 100) * 206;
              const radius = 7 + item.score / 16;
              const dimmed = active && active !== item.id;

              return (
                <g
                  className={`${styles[`risk_${item.tone}`]} ${dimmed ? styles.riskDimmed : ""}`}
                  key={item.id}
                  onPointerEnter={() => setActive(item.id)}
                  onPointerLeave={() => setActive(null)}
                >
                  <circle
                    className={styles.riskHalo}
                    cx={cx}
                    cy={cy}
                    r={radius + 7}
                  />
                  <circle
                    className={styles.riskDot}
                    cx={cx}
                    cy={cy}
                    r={radius}
                  />
                  <text x={cx + radius + 7} y={cy - 3}>
                    {item.id}
                  </text>
                  <text
                    className={styles.riskTextMuted}
                    x={cx + radius + 7}
                    y={cy + 11}
                  >
                    {item.label.split(" ")[0]}
                  </text>
                  <circle
                    className={styles.riskTarget}
                    cx={cx}
                    cy={cy}
                    r={radius + 12}
                    tabIndex="0"
                    role="button"
                    aria-label={`${item.id} ${item.label}, risk ${item.score}`}
                    onFocus={() => setActive(item.id)}
                    onBlur={() => setActive(null)}
                  />
                </g>
              );
            })}
          </svg>

          {signal ? (
            <div
              className={`${styles.riskPopover} ${styles[`popover_${signal.tone}`]}`}
              style={{
                left: `${Math.min(80, Math.max(20, signal.x))}%`,
                top: `${100 - signal.y}%`,
              }}
            >
              <span>
                {signal.id} · {signal.department}
              </span>
              <strong>{signal.label}</strong>
              <div>
                <b>Risk {signal.score}</b>
                <em>{signal.exposure}</em>
              </div>
            </div>
          ) : null}
        </div>

        <div className={styles.riskAxisX}>
          <span>Past ta’sir</span>
          <span>Yuqori ta’sir</span>
        </div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------- economic value */

const barHeight = (item) => Math.max(24, (item.value / 150) * 100);

function EconomicBridge({ impact }) {
  const value = useAnimatedValue(impact);

  return (
    <section className={`${styles.panel} ${styles.economicPanel}`}>
      <PanelHeading
        eyebrow="Value realization"
        title="Sof iqtisodiy ta’sir"
        meta="Yillik"
      />

      <div className={styles.economicValue}>
        <strong>{Math.round(value)}</strong>
        <span>mln so‘m</span>
        <small>
          <Icon name="arrowUp" size={12} /> 18.4%
        </small>
      </div>

      <div
        className={styles.bridgeChart}
        aria-label="Iqtisodiy ta’sir bridge grafigi"
      >
        {economicBridge.map((item, index) => (
          <div className={styles.bridgeColumn} key={item.label}>
            <div className={styles.bridgeWell}>
              <i
                className={styles[`bridge_${item.tone}`]}
                style={{
                  height: `${barHeight(item)}%`,
                  animationDelay: `${index * 90}ms`,
                }}
              />
              <span style={{ bottom: `calc(${barHeight(item)}% + 7px)` }}>
                {item.display}
              </span>
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

/* ----------------------------------------------------------------- queue */

function CriticalQueue() {
  const [filter, setFilter] = useState("all");

  const counts = useMemo(
    () =>
      criticalProcesses.reduce(
        (totals, process) => ({
          ...totals,
          all: totals.all + 1,
          [process.status]: (totals[process.status] ?? 0) + 1,
        }),
        { all: 0 },
      ),
    [],
  );

  const rows = useMemo(
    () =>
      criticalProcesses
        .filter((process) => filter === "all" || process.status === filter)
        .sort((a, b) => b.risk - a.risk),
    [filter],
  );

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

      <div
        className={styles.queueFilters}
        role="group"
        aria-label="Holat bo‘yicha filtr"
      >
        {queueFilters.map((item) => (
          <button
            key={item.id}
            type="button"
            className={filter === item.id ? styles.queueFilterOn : undefined}
            aria-pressed={filter === item.id}
            onClick={() => setFilter(item.id)}
          >
            {item.label}
            <small>{counts[item.id] ?? 0}</small>
          </button>
        ))}
      </div>

      <div className={styles.queueHeader} aria-hidden="true">
        <span>Jarayon</span>
        <span>Mas’ul</span>
        <span>Oqim tezligi</span>
        <span>Risk</span>
        <span>Prognoz</span>
      </div>

      {rows.length === 0 ? (
        <p className={styles.queueEmpty}>
          Bu holatda jarayon yo‘q — tanlangan filtrni o‘zgartiring.
        </p>
      ) : (
        <div className={styles.queueList} key={filter}>
          {rows.map((process, index) => (
            <Link
              className={styles.queueRow}
              href="/processes"
              key={process.id}
            >
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
                <small>{statusLabels[process.status]}</small>
              </div>
              <div className={styles.queueForecast}>
                {process.forecast}
                <Icon name="chevron" size={13} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

function DepartmentRanking() {
  const [active, setActive] = useState(null);

  return (
    <section className={`${styles.panel} ${styles.departmentPanel}`}>
      <PanelHeading
        eyebrow="Portfolio benchmark"
        title="Bo‘limlar BPEI reytingi"
        meta="100 ball"
      />

      <div className={styles.departmentList}>
        {departmentPerformance.map((department, index) => (
          <div
            className={`${styles.departmentRow} ${active === department.name ? styles.departmentActive : ""}`}
            key={department.name}
            onPointerEnter={() => setActive(department.name)}
            onPointerLeave={() => setActive(null)}
          >
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{department.name}</strong>
            <div className={styles.lollipop}>
              <i
                style={{
                  width: `${department.score}%`,
                  animationDelay: `${index * 70}ms`,
                }}
              >
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

/* ------------------------------------------------------------------- page */

export default function ExecutiveDashboard() {
  const [snapshot, setSnapshot] = useState(initialSnapshot);
  const [signals, setSignals] = useState([initialSignal]);
  const [period, setPeriod] = useState("12m");
  const [isLive, setIsLive] = useState(true);
  const [now, setNow] = useState(() => Date.now());
  const [refreshing, setRefreshing] = useState(false);
  const [feedOpen, setFeedOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const tick = useCallback(() => {
    setSnapshot((current) => {
      const next = advanceSnapshot(current);
      setSignals((feed) =>
        [createSignal(next, feed[0]?.text), ...feed].slice(0, 6),
      );
      return next;
    });
    setNow(Date.now());
  }, []);

  useEffect(() => {
    if (!isLive) return undefined;
    const interval = window.setInterval(tick, STREAM_INTERVAL);
    return () => window.clearInterval(interval);
  }, [isLive, tick]);

  // Nisbiy vaqt yorliqlari («12 s oldin») oqim to‘xtaganda ham yangilanadi.
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const handleRefresh = () => {
    setRefreshing(true);
    tick();
    window.setTimeout(() => setRefreshing(false), 620);
  };

  const handleExport = () => {
    const rows = [
      ["Ko‘rsatkich", "Qiymat"],
      ["BPEI", snapshot.bpei.toFixed(1)],
      ["KPI bajarilishi", `${snapshot.kpi.toFixed(1)}%`],
      ["SLA bajarilishi", `${snapshot.sla.toFixed(1)}%`],
      ["Faol jarayonlar", snapshot.activeProcesses],
      ["Kritik risklar", snapshot.criticalRisks],
      ["Iqtisodiy ta’sir", `${Math.round(snapshot.economicImpact)} mln so‘m`],
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
    anchor.download = "ai-bpm-executive-report.csv";
    anchor.click();
    URL.revokeObjectURL(url);

    setToast("Executive report yuklab olindi");
  };

  return (
    <div className={styles.dashboard}>
      <span className={styles.visuallyHidden} aria-live="polite">
        Ko‘rsatkichlar yangilandi: BPEI {snapshot.bpei.toFixed(1)}, kritik
        risklar {snapshot.criticalRisks}
      </span>

      <StreamHeader
        isLive={isLive}
        onToggleLive={() => setIsLive((current) => !current)}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        period={period}
        onPeriod={setPeriod}
        onExport={handleExport}
      />

      <SignalFeed
        signals={signals}
        now={now}
        expanded={feedOpen}
        onToggle={() => setFeedOpen((current) => !current)}
      />

      <div className={styles.overviewGrid}>
        <PerformancePanel snapshot={snapshot} period={period} isLive={isLive} />
        <DecisionDesk confidence={snapshot.confidence} />
      </div>

      <div className={styles.intelligenceGrid}>
        <FlowHealth snapshot={snapshot} />
        <RiskMatrix />
        <EconomicBridge impact={snapshot.economicImpact} />
      </div>

      <div className={styles.operationsGrid}>
        <CriticalQueue />
        <DepartmentRanking />
      </div>

      <div className={styles.toastZone} aria-live="polite">
        {toast ? (
          <div className={styles.toast}>
            <Icon name="check" size={15} />
            {toast}
          </div>
        ) : null}
      </div>
    </div>
  );
}
