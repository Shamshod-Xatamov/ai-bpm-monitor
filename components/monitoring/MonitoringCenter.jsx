"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Icon from "@/components/ui/Icon";
import {
  bottleneckWatch,
  createEvent,
  eventAge,
  eventLog,
  rangeMinutes,
  rangeSeries,
  ranges,
  severityLabels,
  smartAlerts,
} from "@/lib/monitoring-data";
import styles from "./MonitoringCenter.module.css";

const STREAM_INTERVAL = 5000;
const MAX_EVENTS = 40;

const severityFilters = [
  { id: "all", label: "Barchasi" },
  { id: "critical", label: "Kritik" },
  { id: "warning", label: "Ogohlantirish" },
  { id: "info", label: "Ma’lumot" },
];

/* ----------------------------------------------------------------- chart */

const CHART = { width: 720, height: 190, padX: 6, padY: 14 };

function buildScale(points) {
  const lows = points.map((point) => Math.min(point.low, point.actual));
  const highs = points.map((point) => Math.max(point.high, point.actual));
  const lo = Math.floor(Math.min(...lows) / 20) * 20;
  const hi = Math.ceil(Math.max(...highs) / 20) * 20;
  const plotHeight = CHART.height - CHART.padY * 2;
  const plotWidth = CHART.width - CHART.padX * 2;

  // Bitta shkala: chiziqlar, koridor va o‘q yorliqlari shu funksiyadan chiqadi.
  const y = (value) =>
    CHART.padY + plotHeight - ((value - lo) / (hi - lo)) * plotHeight;
  const x = (index) => CHART.padX + (index / (points.length - 1)) * plotWidth;

  return { x, y, ticks: [hi, Math.round((hi + lo) / 2), lo] };
}

function ThroughputChart({ points, unit }) {
  const [hover, setHover] = useState(null);
  const scale = useMemo(() => buildScale(points), [points]);

  const activeIndex = hover ?? points.length - 1;
  const active = points[activeIndex];
  const step = Math.ceil(points.length / 8);

  const line = (key) =>
    points
      .map(
        (point, index) =>
          `${scale.x(index).toFixed(1)},${scale.y(point[key]).toFixed(1)}`,
      )
      .join(" ");

  const band = [
    ...points.map(
      (point, index) =>
        `${scale.x(index).toFixed(1)},${scale.y(point.high).toFixed(1)}`,
    ),
    ...points
      .map(
        (point, index) =>
          `${scale.x(index).toFixed(1)},${scale.y(point.low).toFixed(1)}`,
      )
      .reverse(),
  ].join(" ");

  const pick = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    if (!bounds.width) return;
    const ratio = (event.clientX - bounds.left) / bounds.width;
    setHover(
      Math.max(
        0,
        Math.min(points.length - 1, Math.round(ratio * (points.length - 1))),
      ),
    );
  };

  return (
    <div className={styles.chart}>
      <div className={styles.chartAxis} aria-hidden="true">
        {scale.ticks.map((tick) => (
          <span
            key={tick}
            style={{ top: `${(scale.y(tick) / CHART.height) * 100}%` }}
          >
            {tick}
          </span>
        ))}
      </div>

      <div
        className={styles.chartSurface}
        onPointerMove={pick}
        onPointerLeave={() => setHover(null)}
      >
        <svg
          viewBox={`0 0 ${CHART.width} ${CHART.height}`}
          preserveAspectRatio="none"
          role="img"
          aria-label={`O‘tkazuvchanlik ${points[0].label} dan ${points.at(-1).label} gacha, oxirgi qiymat ${active.actual} ${unit}`}
        >
          {scale.ticks.map((tick) => (
            <line
              key={tick}
              className={styles.gridLine}
              x1={CHART.padX}
              x2={CHART.width - CHART.padX}
              y1={scale.y(tick)}
              y2={scale.y(tick)}
            />
          ))}

          <polygon className={styles.band} points={band} />
          <polyline className={styles.expected} points={line("expected")} />
          <polyline className={styles.actual} points={line("actual")} />

          {hover !== null ? (
            <line
              className={styles.crosshair}
              x1={scale.x(activeIndex)}
              x2={scale.x(activeIndex)}
              y1={CHART.padY - 6}
              y2={CHART.height - CHART.padY}
            />
          ) : null}
        </svg>

        {points.map((point, index) =>
          point.anomaly ? (
            <span
              key={point.label}
              className={styles.anomalyDot}
              style={{
                left: `${(scale.x(index) / CHART.width) * 100}%`,
                top: `${(scale.y(point.actual) / CHART.height) * 100}%`,
              }}
            />
          ) : null,
        )}

        <span
          className={styles.markerDot}
          style={{
            left: `${(scale.x(activeIndex) / CHART.width) * 100}%`,
            top: `${(scale.y(active.actual) / CHART.height) * 100}%`,
          }}
        />

        <div
          className={styles.tooltip}
          style={{
            left: `${Math.min(88, Math.max(12, (scale.x(activeIndex) / CHART.width) * 100))}%`,
            top: `${(scale.y(active.actual) / CHART.height) * 100}%`,
          }}
        >
          <span>{active.label}</span>
          <strong>{active.actual}</strong>
          <em>
            kutilgan {active.low}–{active.high}
          </em>
        </div>
      </div>

      <div className={styles.chartLabels} aria-hidden="true">
        {points.map((point, index) => (
          <span
            key={point.label}
            className={index === activeIndex ? styles.labelActive : undefined}
          >
            {index % step === 0 || index === points.length - 1
              ? point.label
              : ""}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- panels */

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

function AlertPanel({ acknowledged, onAcknowledge, onReset }) {
  const active = smartAlerts.filter(
    (alert) => !acknowledged.includes(alert.id),
  );

  return (
    <section className={`${styles.panel} ${styles.alertPanel}`}>
      <PanelHead
        eyebrow="Smart alertlar"
        title="Faol ogohlantirishlar"
        meta={`${active.length} ta faol`}
      />

      {active.length === 0 ? (
        <div className={styles.alertEmpty}>
          <Icon name="check" size={18} />
          <p>Barcha ogohlantirishlar tasdiqlandi.</p>
          <button type="button" onClick={onReset}>
            Ro‘yxatni tiklash
          </button>
        </div>
      ) : (
        <ul className={styles.alertList}>
          {active.map((alert) => (
            <li key={alert.id} className={styles[`alert_${alert.severity}`]}>
              <div className={styles.alertTop}>
                <span className={styles.alertProcess}>{alert.process}</span>
                <small>{eventAge(alert.minutesAgo)}</small>
              </div>
              <strong>{alert.title}</strong>
              <div className={styles.alertMetric}>
                <div>
                  <b>{alert.metric}</b>
                  <em>{alert.threshold}</em>
                </div>
                <button type="button" onClick={() => onAcknowledge(alert.id)}>
                  <Icon name="check" size={13} />
                  Tasdiqlash
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function EventStream({ events, severity, onSeverity, isLive }) {
  return (
    <section className={`${styles.panel} ${styles.streamPanel}`}>
      <PanelHead
        eyebrow="Event stream"
        title="Hodisalar oqimi"
        action={
          <div
            className={styles.chips}
            role="group"
            aria-label="Muhimlik bo‘yicha filtr"
          >
            {severityFilters.map((item) => (
              <button
                key={item.id}
                type="button"
                className={severity === item.id ? styles.chipOn : undefined}
                aria-pressed={severity === item.id}
                onClick={() => onSeverity(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
        }
      />

      {events.length === 0 ? (
        <p className={styles.streamEmpty}>
          Tanlangan davr va muhimlik bo‘yicha hodisa qayd etilmagan.
        </p>
      ) : (
        <ol className={styles.timeline}>
          {events.map((event, index) => (
            <li
              key={event.id}
              className={`${styles[`event_${event.severity}`]} ${
                isLive && index === 0 ? styles.eventNew : ""
              }`}
            >
              <span className={styles.eventDot} aria-hidden="true" />
              <div className={styles.eventBody}>
                <div className={styles.eventTop}>
                  <strong>{event.title}</strong>
                  <small>{eventAge(event.minutesAgo)}</small>
                </div>
                <span className={styles.eventProcess}>{event.process}</span>
                <p>{event.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function BottleneckWatch() {
  const visible = bottleneckWatch.slice(0, 6);
  const rest = bottleneckWatch.length - visible.length;

  return (
    <section className={`${styles.panel} ${styles.watchPanel}`}>
      <PanelHead
        eyebrow="Bottleneck nazorati"
        title="SLA dan chiqqan bosqichlar"
        meta={`${bottleneckWatch.length} ta bosqich`}
      />

      <ul className={styles.watchList}>
        {visible.map((item) => {
          const scale = Math.max(item.avg, item.sla);

          return (
            <li key={item.key}>
              <div className={styles.watchTop}>
                <span>{item.processId}</span>
                {/* Manfiy og'ish — bosqich hali SLA ichida, ammo chegaraga yaqin. */}
                {item.overrun > 0 ? (
                  <b className={styles[`over_${item.tone}`]}>
                    +{item.overrun}%
                  </b>
                ) : (
                  <b className={styles.overNear}>SLA ga yaqin</b>
                )}
              </div>
              <strong>{item.stage}</strong>
              <div className={styles.watchTrack} aria-hidden="true">
                <i
                  className={styles[`fill_${item.tone}`]}
                  style={{ width: `${(item.avg / scale) * 100}%` }}
                />
                <u style={{ left: `${(item.sla / scale) * 100}%` }} />
              </div>
              <small>
                {item.avg} min · SLA {item.sla} min · kutish {item.wait} min
              </small>
            </li>
          );
        })}
      </ul>

      {rest > 0 ? (
        <p className={styles.watchRest}>Yana {rest} ta bosqich kuzatuvda.</p>
      ) : null}
    </section>
  );
}

/* ------------------------------------------------------------------ page */

export default function MonitoringCenter() {
  const [range, setRange] = useState("1h");
  const [isLive, setIsLive] = useState(true);
  const [severity, setSeverity] = useState("all");
  const [events, setEvents] = useState(eventLog);
  const [acknowledged, setAcknowledged] = useState([]);

  const points = useMemo(() => rangeSeries(range), [range]);

  const tick = useCallback(() => {
    setEvents((current) => {
      const next = createEvent(current[0]?.title);
      const aged = current.map((event) =>
        event.id.startsWith("live-")
          ? { ...event, minutesAgo: event.minutesAgo + 1 }
          : event,
      );
      return [next, ...aged].slice(0, MAX_EVENTS);
    });
  }, []);

  useEffect(() => {
    if (!isLive) return undefined;
    const interval = window.setInterval(tick, STREAM_INTERVAL);
    return () => window.clearInterval(interval);
  }, [isLive, tick]);

  const inRange = useMemo(
    () => events.filter((event) => event.minutesAgo <= rangeMinutes[range]),
    [events, range],
  );

  const visibleEvents = useMemo(
    () =>
      severity === "all"
        ? inRange
        : inRange.filter((event) => event.severity === severity),
    [inRange, severity],
  );

  const activeAlerts = smartAlerts.filter(
    (alert) => !acknowledged.includes(alert.id),
  );

  const last = points.at(-1);
  const deviation = Math.round(
    ((last.actual - last.expected) / last.expected) * 100,
  );
  const normalShare = Math.round(
    (points.filter((point) => !point.anomaly).length / points.length) * 100,
  );

  const stats = [
    {
      label: "Faol alertlar",
      value: String(activeAlerts.length),
      note: activeAlerts.length
        ? "tasdiqlash kutilmoqda"
        : "hammasi tasdiqlangan",
      tone: activeAlerts.length ? "critical" : undefined,
    },
    {
      label: "Kritik hodisalar",
      value: String(
        inRange.filter((event) => event.severity === "critical").length,
      ),
      note: "tanlangan davrda",
    },
    {
      label: "Joriy o‘tkazuvchanlik",
      value: String(last.actual),
      note: `kutilgandan ${deviation >= 0 ? "+" : ""}${deviation}%`,
      tone: Math.abs(deviation) > 10 ? "critical" : undefined,
    },
    {
      label: "Normal holat",
      value: `${normalShare}%`,
      note: "koridor ichidagi o‘lchovlar",
      meter: normalShare,
    },
  ];

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <span className={styles.kicker}>
            <i className={!isLive ? styles.pausedDot : undefined} />
            {isLive ? "Jonli kuzatuv" : "Kuzatuv pauzada"}
          </span>
          <h1>Monitoring markazi</h1>
          <p>
            Jarayon hodisalari, kechikishlar va smart alertlar — real vaqt
            oqimida.
          </p>
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={`${styles.liveButton} ${!isLive ? styles.livePaused : ""}`}
            aria-pressed={!isLive}
            onClick={() => setIsLive((current) => !current)}
          >
            <i />
            <span>{isLive ? "Jonli" : "Pauza"}</span>
            <Icon name={isLive ? "pause" : "play"} size={13} />
          </button>

          <div
            className={styles.rangeControl}
            role="group"
            aria-label="Vaqt oralig‘i"
          >
            {ranges.map((item) => (
              <button
                key={item.id}
                type="button"
                className={range === item.id ? styles.rangeOn : undefined}
                aria-pressed={range === item.id}
                onClick={() => setRange(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <section className={styles.strip} aria-label="Joriy holat">
        {stats.map((stat) => (
          <article key={stat.label}>
            <span>{stat.label}</span>
            <strong className={stat.tone ? styles.valueCritical : undefined}>
              {stat.value}
            </strong>
            {typeof stat.meter === "number" ? (
              <div className={styles.meter} aria-hidden="true">
                <i style={{ width: `${stat.meter}%` }} />
              </div>
            ) : null}
            <small>{stat.note}</small>
          </article>
        ))}
      </section>

      <div className={styles.grid}>
        <section className={`${styles.panel} ${styles.chartPanel}`}>
          <PanelHead
            eyebrow="Oqim nazorati"
            title="O‘tkazuvchanlik va kutilgan koridor"
            action={
              <div className={styles.legend}>
                <span>
                  <i className={styles.legendActual} /> Amaldagi
                </span>
                <span>
                  <i className={styles.legendBand} /> Kutilgan koridor
                </span>
                <span>
                  <i className={styles.legendAnomaly} /> Anomaliya
                </span>
              </div>
            }
          />
          <ThroughputChart
            points={points}
            unit={ranges.find((item) => item.id === range).unit}
          />
        </section>

        <AlertPanel
          acknowledged={acknowledged}
          onAcknowledge={(id) => setAcknowledged((current) => [...current, id])}
          onReset={() => setAcknowledged([])}
        />

        <EventStream
          events={visibleEvents}
          severity={severity}
          onSeverity={setSeverity}
          isLive={isLive}
        />

        <BottleneckWatch />
      </div>
    </div>
  );
}
