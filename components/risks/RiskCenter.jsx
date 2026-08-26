"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import Icon from "@/components/ui/Icon";
import {
  MITIGATION_WEEKS,
  categories,
  categoryLabels,
  exposure,
  formatSigned,
  levelLabels,
  levelStep,
  rankShift,
  residualScore,
  riskLevel,
  risks,
  statusLabels,
  targetScore,
  trendMonths,
} from "@/lib/risks-data";
import styles from "./RiskCenter.module.css";

const money = (value) => `${value.toFixed(1)} mln`;

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

/* =================================================== 1. EKSPOZITSIYA TREEMAP */

/** Qatordagi eng yomon tomonlar nisbati — squarified algoritmining mezoni. */
function worstRatio(row, side, scale) {
  const areas = row.map((item) => item.value * scale);
  const total = areas.reduce((sum, area) => sum + area, 0);
  const max = Math.max(...areas);
  const min = Math.min(...areas);

  return Math.max(
    (side * side * max) / (total * total),
    (total * total) / (side * side * min),
  );
}

/**
 * Squarified treemap: kataklar imkon qadar kvadratga yaqin bo'ladi, shuning
 * uchun yuza — ya'ni kutilayotgan yo'qotish — ko'z bilan solishtiriladi.
 */
function squarify(items, bounds) {
  const rects = [];
  const queue = [...items].sort((a, b) => b.value - a.value);
  const totalValue = queue.reduce((sum, item) => sum + item.value, 0);

  let { x, y, w, h } = bounds;
  const scale = (w * h) / (totalValue || 1);

  while (queue.length) {
    const side = Math.min(w, h);
    let row = [];
    let best = Infinity;

    while (queue.length) {
      const candidate = [...row, queue[0]];
      const ratio = worstRatio(candidate, side, scale);
      if (ratio > best) break;
      best = ratio;
      row = candidate;
      queue.shift();
    }

    const rowArea = row.reduce((sum, item) => sum + item.value, 0) * scale;
    const thickness = rowArea / side;
    let offset = 0;

    for (const item of row) {
      const length = (item.value * scale) / thickness;
      rects.push(
        w >= h
          ? { ...item, x, y: y + offset, w: thickness, h: length }
          : { ...item, x: x + offset, y, w: length, h: thickness },
      );
      offset += length;
    }

    if (w >= h) {
      x += thickness;
      w -= thickness;
    } else {
      y += thickness;
      h -= thickness;
    }
  }

  return rects;
}

function ExposureTreemap({ rows, activeId, onSelect }) {
  const [hover, setHover] = useState(null);

  const tiles = useMemo(
    () =>
      squarify(
        rows.map((risk) => ({ risk, value: exposure(risk) })),
        { x: 0, y: 0, w: 100, h: 100 },
      ),
    [rows],
  );

  const total = rows.reduce((sum, risk) => sum + exposure(risk), 0);

  return (
    <div className={styles.treemap}>
      <div className={styles.treemapPlot}>
        {tiles.map((tile) => {
          const level = riskLevel(tile.risk);
          // Yorliq faqat sig'sa chiziladi — kesilgan matn hech qachon chiqmaydi.
          const roomy = tile.w > 17 && tile.h > 20;
          const tight = tile.w > 9 && tile.h > 11;

          return (
            <button
              type="button"
              key={tile.risk.id}
              className={`${styles.tile} ${tile.risk.id === activeId ? styles.tileOn : ""}`}
              style={{
                left: `${tile.x}%`,
                top: `${tile.y}%`,
                width: `${tile.w}%`,
                height: `${tile.h}%`,
              }}
              aria-pressed={tile.risk.id === activeId}
              onClick={() => onSelect(tile.risk.id)}
              onPointerEnter={() => setHover(tile.risk.id)}
              onPointerLeave={() => setHover(null)}
            >
              <span
                className={`${styles.tileFill} ${styles[`level${levelStep[level]}`]}`}
              >
                {tight ? <b>{tile.risk.id}</b> : null}
                {roomy ? (
                  <>
                    <em>{tile.risk.department}</em>
                    <i>{money(exposure(tile.risk))}</i>
                  </>
                ) : null}
              </span>

              {hover === tile.risk.id ? (
                <span className={styles.tileTip} role="status">
                  <b>{tile.risk.title}</b>
                  {money(exposure(tile.risk))} · {levelLabels[level]} ·{" "}
                  {tile.risk.department}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      <div className={styles.treemapFoot}>
        <div className={styles.scale}>
          <span>Qoldiq daraja</span>
          {["low", "medium", "high", "critical"].map((level) => (
            <em key={level}>
              <i
                className={styles[`level${levelStep[level]}`]}
                aria-hidden="true"
              />
              {levelLabels[level]}
            </em>
          ))}
        </div>
        <small>
          Katak yuzasi — kutilayotgan yo‘qotish. Jami {money(total)} so‘m.
        </small>
      </div>
    </div>
  );
}

/* ======================================================= 2. REYTING BUMP CHART */

const BUMP = { width: 300, height: 232, padX: 14, padY: 16 };

/**
 * Risklarning oxirgi 6 oydagi reyting harakati. Bitta risk urg'ulanadi,
 * qolganlari fon bo'lib qoladi — "qaysi biri ko'tarilmoqda" savoliga
 * kategorik palitrasiz javob beradi.
 */
function RankBump({ rows, activeId, onSelect }) {
  const [hover, setHover] = useState(null);

  const maxRank = risks.length;
  const stepX =
    (BUMP.width - BUMP.padX * 2) / Math.max(1, trendMonths.length - 1);
  const stepY = (BUMP.height - BUMP.padY * 2) / Math.max(1, maxRank - 1);

  const xAt = (index) => BUMP.padX + index * stepX;
  const yAt = (rank) => BUMP.padY + (rank - 1) * stepY;

  const highlighted = hover ?? activeId;

  return (
    <figure className={styles.bump}>
      <div className={styles.bumpPlot}>
        <svg
          viewBox={`0 0 ${BUMP.width} ${BUMP.height}`}
          role="img"
          aria-label="Risklarning oxirgi olti oydagi reyting harakati"
        >
          {trendMonths.map((month, index) => (
            <line
              key={month}
              className={styles.bumpGrid}
              x1={xAt(index)}
              x2={xAt(index)}
              y1={BUMP.padY - 6}
              y2={BUMP.height - BUMP.padY + 6}
            />
          ))}

          {rows.map((risk) => {
            const on = risk.id === highlighted;
            const points = risk.rank
              .map((rank, index) => `${xAt(index)},${yAt(rank)}`)
              .join(" ");

            return (
              <g
                key={risk.id}
                className={on ? styles.bumpOn : styles.bumpOff}
                onPointerEnter={() => setHover(risk.id)}
                onPointerLeave={() => setHover(null)}
              >
                <polyline className={styles.bumpHit} points={points} />
                <polyline className={styles.bumpLine} points={points} />
                {risk.rank.map((rank, index) => (
                  <circle
                    key={`${risk.id}-${index}`}
                    className={styles.bumpDot}
                    cx={xAt(index)}
                    cy={yAt(rank)}
                    r={on ? 4 : 2.6}
                  />
                ))}
              </g>
            );
          })}
        </svg>

        {rows.map((risk) => (
          <button
            type="button"
            key={risk.id}
            className={`${styles.bumpLabel} ${risk.id === highlighted ? styles.bumpLabelOn : ""}`}
            style={{ top: `${(yAt(risk.rank.at(-1)) / BUMP.height) * 100}%` }}
            onClick={() => onSelect(risk.id)}
            onPointerEnter={() => setHover(risk.id)}
            onPointerLeave={() => setHover(null)}
            onFocus={() => setHover(risk.id)}
            onBlur={() => setHover(null)}
          >
            {risk.id}
          </button>
        ))}
      </div>

      <div className={styles.bumpAxis} aria-hidden="true">
        <span>{trendMonths[0]}</span>
        <span>{trendMonths.at(-1)}</span>
      </div>

      <figcaption>
        Yuqoriroq chiziq — jiddiyroq risk. Urg‘ulangan chiziq tanlangan riskka
        tegishli.
      </figcaption>
    </figure>
  );
}

/* ============================================================ 3. BOWTIE DIAGRAMMA */

const TIE = {
  width: 780,
  height: 330,
  stackTop: 22,
  stackHeight: 286,
  knotHeight: 76,
  leftX: 196,
  rightX: 584,
  knotWidth: 132,
};

/** Ikki bezye egri chizig'idan iborat lenta — manba va nishon bandlarini bog'laydi. */
function ribbon(x0, y0a, y0b, x1, y1a, y1b) {
  const mid = (x0 + x1) / 2;
  return [
    `M${x0},${y0a}`,
    `C${mid},${y0a} ${mid},${y1a} ${x1},${y1a}`,
    `L${x1},${y1b}`,
    `C${mid},${y1b} ${mid},${y0b} ${x0},${y0b}`,
    "Z",
  ].join(" ");
}

/**
 * Bowtie tahlili — risk boshqaruvining kanonik diagrammasi: chapda sabablar,
 * markazda hodisa, o'ngda oqibatlar. Lenta qalinligi hissa ulushiga teng,
 * to'siqlar esa oqimni kesib o'tuvchi darvoza sifatida chiziladi.
 */
function BowtieDiagram({ risk }) {
  const [hover, setHover] = useState(null);

  const knotTop = (TIE.height - TIE.knotHeight) / 2;
  const knotLeft = (TIE.width - TIE.knotWidth) / 2;
  const knotRight = knotLeft + TIE.knotWidth;

  const build = (items, side) => {
    let stack = TIE.stackTop;
    let knot = knotTop;

    return items.map((item, index) => {
      const outer = (item.weight / 100) * TIE.stackHeight;
      const inner = (item.weight / 100) * TIE.knotHeight;

      const y0a = stack;
      const y0b = stack + outer;
      const y1a = knot;
      const y1b = knot + inner;
      stack = y0b;
      knot = y1b;

      const path =
        side === "left"
          ? ribbon(TIE.leftX, y0a, y0b, knotLeft, y1a, y1b)
          : ribbon(knotRight, y1a, y1b, TIE.rightX, y0a, y0b);

      return {
        ...item,
        side,
        path,
        tone: `flow${Math.min(index, 3)}`,
        labelY: (y0a + y0b) / 2,
      };
    });
  };

  const causes = build(risk.causes, "left");
  const consequences = build(risk.consequences, "right");

  const gates = [
    ...risk.preventive.map((label, index) => ({
      label,
      kind: "Oldini olish",
      x: TIE.leftX + 44 + index * 52,
    })),
    ...risk.corrective.map((label, index) => ({
      label,
      kind: "Bartaraf etish",
      x: knotRight + 40 + index * 52,
    })),
  ];

  const percent = (value, axis) =>
    `${(value / (axis === "x" ? TIE.width : TIE.height)) * 100}%`;

  return (
    <figure className={styles.bowtie}>
      <div className={styles.bowtieSurface}>
        <svg
          viewBox={`0 0 ${TIE.width} ${TIE.height}`}
          role="img"
          aria-label={`${risk.title} riskining bowtie tahlili: ${risk.causes.length} ta sabab, ${risk.consequences.length} ta oqibat`}
        >
          {[...causes, ...consequences].map((item) => (
            <path
              key={`${item.side}-${item.label}`}
              className={`${styles.ribbon} ${styles[item.tone]} ${
                hover && hover !== item.label ? styles.ribbonDim : ""
              }`}
              d={item.path}
              onPointerEnter={() => setHover(item.label)}
              onPointerLeave={() => setHover(null)}
            />
          ))}

          {gates.map((gate) => (
            <line
              key={gate.label}
              className={styles.gate}
              x1={gate.x}
              x2={gate.x}
              y1={44}
              y2={knotTop + TIE.knotHeight + 30}
            />
          ))}

          <rect
            className={styles.knot}
            x={knotLeft}
            y={knotTop}
            width={TIE.knotWidth}
            height={TIE.knotHeight}
            rx="10"
          />
        </svg>

        <span
          className={styles.knotLabel}
          style={{ left: "50%", top: percent(TIE.height / 2, "y") }}
        >
          <b>{risk.id}</b>
          <em>Risk hodisasi</em>
        </span>

        {causes.map((item) => (
          <span
            key={item.label}
            className={styles.tieLabel}
            style={{
              top: percent(item.labelY, "y"),
              right: `${100 - (TIE.leftX / TIE.width) * 100}%`,
            }}
          >
            <b>{item.label}</b>
            <em>{item.weight}%</em>
          </span>
        ))}

        {consequences.map((item) => (
          <span
            key={item.label}
            className={`${styles.tieLabel} ${styles.tieLabelRight}`}
            style={{
              top: percent(item.labelY, "y"),
              left: percent(TIE.rightX, "x"),
            }}
          >
            <b>{item.label}</b>
            <em>{item.weight}%</em>
          </span>
        ))}

        {gates.map((gate) => (
          <span
            key={gate.label}
            className={styles.gateLabel}
            style={{ left: percent(gate.x, "x") }}
          >
            {gate.label}
          </span>
        ))}
      </div>

      <figcaption className={styles.bowtieLegend}>
        <span className={styles.keyCause}>Sabablar — ehtimollikka hissa</span>
        <span className={styles.keyEffect}>Oqibatlar — ta’sirga hissa</span>
        <span className={styles.keyGate}>To‘siq nazorati</span>
      </figcaption>
    </figure>
  );
}

/* ========================================================= 4. MITIGATSIYA GANTT */

function MitigationPlan({ risk }) {
  const done = risk.mitigations.filter((item) => item.status === "done");
  // "Bugun" — oxirgi yakunlangan chora tugagan hafta.
  const currentWeek = Math.max(1, ...done.map((item) => item.end));

  const residual = residualScore(risk);
  const target = targetScore(risk);

  const track = (week) => ((week - 1) / MITIGATION_WEEKS) * 100;

  return (
    <div className={styles.plan}>
      <div className={styles.planHead}>
        <span className={styles.blockLabel}>Mitigatsiya rejasi</span>
        <div className={styles.planScore}>
          <span>
            Nazoratsiz <b>{risk.inherentScore}</b>
          </span>
          <Icon name="chevron" size={12} />
          <span>
            Bugun <b className={styles.scoreNow}>{residual}</b>
          </span>
          <Icon name="chevron" size={12} />
          <span>
            Reja bajarilsa <b className={styles.scoreTarget}>{target}</b>
          </span>
        </div>
      </div>

      <div className={styles.planWeeks} aria-hidden="true">
        {Array.from({ length: MITIGATION_WEEKS }, (_, index) => index + 1).map(
          (week) => (
            <span key={week}>{week % 2 === 0 ? `+${week}` : ""}</span>
          ),
        )}
      </div>

      <ol className={styles.planRows}>
        {risk.mitigations.map((item) => (
          <li key={item.label}>
            <div className={styles.planLabel}>
              <b>{item.label}</b>
              <em>{item.owner}</em>
            </div>

            <div className={styles.planTrack}>
              <i
                className={styles.planToday}
                style={{ left: `${track(currentWeek + 1)}%` }}
                aria-hidden="true"
              />
              <span
                className={`${styles.planBar} ${styles[`bar_${item.status}`]}`}
                style={{
                  left: `${track(item.start)}%`,
                  width: `${((item.end - item.start + 1) / MITIGATION_WEEKS) * 100}%`,
                }}
              >
                {item.status === "done" ? (
                  <Icon name="check" size={11} />
                ) : null}
              </span>
            </div>

            <div className={styles.planMeta}>
              <span className={styles[`status_${item.status}`]}>
                {statusLabels[item.status]}
              </span>
              <b>−{item.effect}</b>
            </div>
          </li>
        ))}
      </ol>

      <div className={styles.planLegend}>
        <span className={styles.keyDone}>Bajarilgan</span>
        <span className={styles.keyActive}>Jarayonda</span>
        <span className={styles.keyPlanned}>Rejalashtirilgan</span>
        <small>Raqam — qoldiq balldan ayiriladigan ta’sir.</small>
      </div>
    </div>
  );
}

/* ================================================================ 5. REGISTR */

const columns = [
  { id: "risk", label: "Risk", align: "left" },
  { id: "department", label: "Bo‘lim", align: "left" },
  { id: "probability", label: "Ehtimollik" },
  { id: "impact", label: "Ta’sir" },
  { id: "exposure", label: "Ekspozitsiya" },
  { id: "residual", label: "Qoldiq ball" },
  { id: "shift", label: "Reyting" },
];

const sortValue = {
  risk: (risk) => risk.id,
  department: (risk) => risk.department,
  probability: (risk) => risk.probability,
  impact: (risk) => risk.impact,
  exposure,
  residual: residualScore,
  shift: rankShift,
};

function Register({ rows, activeId, onSelect, sort, onSort }) {
  const sorted = useMemo(() => {
    const read = sortValue[sort.key];
    return [...rows].sort((a, b) => {
      const left = read(a);
      const right = read(b);
      const compare =
        typeof left === "string" ? left.localeCompare(right) : left - right;
      return sort.desc ? -compare : compare;
    });
  }, [rows, sort]);

  return (
    <div className={styles.registerWrap}>
      <table className={styles.register}>
        <caption className={styles.srOnly}>
          Risk registri — ustun sarlavhasini bosib tartiblash mumkin
        </caption>
        <thead>
          <tr>
            {columns.map((column) => {
              const on = sort.key === column.id;
              return (
                <th
                  key={column.id}
                  scope="col"
                  className={
                    column.align === "left" ? styles.cellLeft : undefined
                  }
                  aria-sort={
                    on ? (sort.desc ? "descending" : "ascending") : "none"
                  }
                >
                  <button type="button" onClick={() => onSort(column.id)}>
                    {column.label}
                    <i className={on ? styles.sortOn : styles.sortOff}>
                      {on && !sort.desc ? "▲" : "▼"}
                    </i>
                  </button>
                </th>
              );
            })}
          </tr>
        </thead>

        <tbody>
          {sorted.map((risk) => {
            const level = riskLevel(risk);
            const shift = rankShift(risk);

            return (
              <tr
                key={risk.id}
                className={risk.id === activeId ? styles.rowOn : undefined}
                aria-selected={risk.id === activeId}
              >
                <th scope="row" className={styles.cellLeft}>
                  <button
                    type="button"
                    className={styles.rowButton}
                    onClick={() => onSelect(risk.id)}
                  >
                    <i
                      className={styles[`level${levelStep[level]}`]}
                      aria-hidden="true"
                    />
                    <span>
                      <b>{risk.id}</b> {risk.title}
                      <em>
                        {categoryLabels[risk.category]}
                        {risk.process ? ` · ${risk.process}` : ""}
                      </em>
                    </span>
                  </button>
                </th>
                <td className={styles.cellLeft}>{risk.department}</td>
                <td>{risk.probability}%</td>
                <td>{risk.impact} mln</td>
                <td className={styles.cellStrong}>{money(exposure(risk))}</td>
                <td>
                  <span className={styles[`chip${levelStep[level]}`]}>
                    {residualScore(risk)} · {levelLabels[level]}
                  </span>
                </td>
                <td>
                  {shift === 0 ? (
                    <em className={styles.shiftFlat}>o‘zgarishsiz</em>
                  ) : (
                    <em
                      className={shift > 0 ? styles.shiftUp : styles.shiftDown}
                    >
                      <Icon
                        name={shift > 0 ? "arrowUp" : "arrowDown"}
                        size={12}
                      />
                      {formatSigned(shift)} o‘rin
                    </em>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------------------------------------------------ detal */

function RiskDetail({ risk }) {
  const level = riskLevel(risk);
  const residual = residualScore(risk);

  return (
    <div className={styles.detail}>
      <div className={styles.detailHead}>
        <div>
          <span className={styles.detailMeta}>
            {categoryLabels[risk.category]} · {risk.department}
            {risk.process ? ` · ${risk.process}` : ""}
          </span>
          <h3>{risk.title}</h3>
        </div>
        <span className={styles[`badge${levelStep[level]}`]}>
          {levelLabels[level]}
        </span>
      </div>

      <div className={styles.metricRow}>
        <div>
          <span>Ehtimollik</span>
          <strong>
            {risk.probability} <em>%</em>
          </strong>
        </div>
        <div>
          <span>Ta’sir</span>
          <strong>
            {risk.impact} <em>mln so‘m</em>
          </strong>
        </div>
        <div>
          <span>Kutilayotgan yo‘qotish</span>
          <strong className={styles.negative}>
            {money(exposure(risk))} <em>so‘m</em>
          </strong>
        </div>
        <div>
          <span>Qoldiq ball</span>
          <strong>{residual}</strong>
        </div>
      </div>

      <div className={styles.block}>
        <span className={styles.blockLabel}>Holat</span>
        <p className={styles.summary}>{risk.summary}</p>
      </div>

      <div className={styles.block}>
        <span className={styles.blockLabel}>
          Bowtie tahlili — sabab, hodisa va oqibat
        </span>
        <BowtieDiagram risk={risk} />
      </div>

      <MitigationPlan risk={risk} />

      <div className={styles.ownerBar}>
        <div>
          <span>Mas’ul</span>
          <b>{risk.owner}</b>
        </div>
        <div>
          <span>Oxirgi ko‘rik</span>
          <b>{risk.reviewed}</b>
        </div>
      </div>

      <div className={styles.recommendation}>
        <span>
          <Icon name="spark" size={15} /> Tavsiya
        </span>
        <p>{risk.recommendation}</p>
        <Link href="/recommendations">
          Tavsiyalar markazi <Icon name="chevron" size={13} />
        </Link>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------- page */

export default function RiskCenter() {
  const [category, setCategory] = useState("all");
  const [selectedId, setSelectedId] = useState(risks[0].id);
  const [sort, setSort] = useState({ key: "exposure", desc: true });

  const rows = useMemo(
    () =>
      category === "all"
        ? risks
        : risks.filter((risk) => risk.category === category),
    [category],
  );

  const activeId = rows.some((risk) => risk.id === selectedId)
    ? selectedId
    : rows[0]?.id;
  const selected = risks.find((risk) => risk.id === activeId);

  const counts = useMemo(
    () =>
      risks.reduce(
        (totals, risk) => ({
          ...totals,
          all: totals.all + 1,
          [risk.category]: (totals[risk.category] ?? 0) + 1,
        }),
        { all: 0 },
      ),
    [],
  );

  // Filtr sarlavhada turibdi, ya'ni u butun sahifani qamrab oladi —
  // ko'rsatkichlar ham treemap bilan bir xil kesimdan hisoblanadi.
  const summary = useMemo(() => {
    const critical = rows.filter((risk) => riskLevel(risk) === "critical");
    const total = rows.reduce((sum, risk) => sum + exposure(risk), 0);
    const reduced = rows.reduce(
      (sum, risk) => sum + (risk.inherentScore - residualScore(risk)),
      0,
    );
    const inherent = rows.reduce((sum, risk) => sum + risk.inherentScore, 0);
    const climbing = [...rows].sort((a, b) => rankShift(b) - rankShift(a))[0];
    const active = rows.reduce(
      (sum, risk) =>
        sum + risk.mitigations.filter((item) => item.status !== "done").length,
      0,
    );

    return { critical, total, reduced, inherent, climbing, active };
  }, [rows]);

  const stats = [
    {
      label: "Kritik risk",
      value: String(summary.critical.length),
      note: `${rows.length} ta ko‘rinishda`,
      tone: "negative",
    },
    {
      label: "Kutilayotgan yo‘qotish",
      value: money(summary.total),
      note: "ehtimollik × ta’sir",
      tone: "negative",
    },
    {
      label: "Nazorat bilan kamaytirildi",
      value: summary.inherent
        ? `−${Math.round((summary.reduced / summary.inherent) * 100)}%`
        : "—",
      note: `${summary.reduced} ball · ${summary.active} ta chora davom etmoqda`,
      tone: "positive",
    },
    {
      label: "Eng tez o‘sayotgan",
      value: summary.climbing?.id ?? "—",
      note: summary.climbing
        ? `${summary.climbing.department} · ${formatSigned(rankShift(summary.climbing))} o‘rin`
        : "ko‘rinishda risk yo‘q",
    },
  ];

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <span className={styles.kicker}>Risk markazi</span>
          <h1>Risklar</h1>
          <p>
            Risk registri, sabab-oqibat tahlili va mitigatsiya nazorati — har
            bir ball nazorat choralaridan hisoblanadi.
          </p>
        </div>

        <div
          className={styles.chips}
          role="group"
          aria-label="Kategoriya filtri"
        >
          {categories.map((item) => (
            <button
              key={item.id}
              type="button"
              className={category === item.id ? styles.chipOn : undefined}
              aria-pressed={category === item.id}
              onClick={() => setCategory(item.id)}
            >
              {item.label}
              <small>{counts[item.id] ?? 0}</small>
            </button>
          ))}
        </div>
      </header>

      <section className={styles.strip} aria-label="Risk ko‘rsatkichlari">
        {stats.map((stat) => (
          <article key={stat.label}>
            <span>{stat.label}</span>
            <strong className={stat.tone ? styles[stat.tone] : undefined}>
              {stat.value}
            </strong>
            <small>{stat.note}</small>
          </article>
        ))}
      </section>

      <section className={styles.portfolio} aria-label="Risk portfeli">
        <div className={styles.portfolioMain}>
          <PanelHead
            eyebrow="Portfel"
            title="Ekspozitsiya taqsimoti"
            meta={`${rows.length} ta risk`}
          />
          <ExposureTreemap
            rows={rows}
            activeId={activeId}
            onSelect={setSelectedId}
          />
        </div>

        <div className={styles.portfolioSide}>
          <PanelHead eyebrow="Harakat" title="Reyting siljishi" />
          <RankBump rows={rows} activeId={activeId} onSelect={setSelectedId} />
        </div>
      </section>

      <section className={styles.registerPanel} aria-label="Risk registri">
        <PanelHead
          eyebrow="Registr"
          title="Barcha risklar"
          meta="Ustun sarlavhasi — tartiblash"
        />
        <Register
          rows={rows}
          activeId={activeId}
          onSelect={setSelectedId}
          sort={sort}
          onSort={(key) =>
            setSort((current) =>
              current.key === key
                ? { key, desc: !current.desc }
                : { key, desc: true },
            )
          }
        />
      </section>

      <section className={styles.detailPanel} aria-label="Risk tafsiloti">
        {selected ? (
          <RiskDetail key={selected.id} risk={selected} />
        ) : (
          <p className={styles.empty}>Bu kategoriyada risk yo‘q.</p>
        )}
      </section>
    </div>
  );
}
