"use client";

import Link from "next/link";
import { useCallback, useId, useMemo, useRef, useState } from "react";
import Icon from "@/components/ui/Icon";
import Sparkline from "@/components/ui/Sparkline";
import {
  CONFIDENCE_LEVEL,
  breachProbability,
  categories,
  categoryLabels,
  currentValue,
  forecasts,
  formatSigned,
  horizons,
  isAdverse,
  isBreaching,
  leverImpact,
  model,
  normalPdf,
  projectedAt,
  riskLabels,
  sigmaAt,
  weeksToBreach,
} from "@/lib/forecasts-data";
import styles from "./ForecastCenter.module.css";

const WEEKS = 12;
const ALL_WEEKS = Array.from({ length: WEEKS }, (_, index) => index + 1);

const fmt = (forecast, value) => value.toFixed(forecast.precision);

/**
 * Heatmap binlari. 5% dan past xavf rangsiz qoladi — yo'qlik rang bilan emas,
 * rangning yo'qligi bilan kodlanadi, shuning uchun har bir bo'yalgan qadam
 * yuzadan yetarlicha ajralib turadi.
 */
const RISK_BINS = [
  { min: 90, step: 5, label: "90%+" },
  { min: 75, step: 4, label: "75–90%" },
  { min: 50, step: 3, label: "50–75%" },
  { min: 25, step: 2, label: "25–50%" },
  { min: 5, step: 1, label: "5–25%" },
  { min: 0, step: 0, label: "<5%" },
];

const riskStep = (probability) =>
  RISK_BINS.find((bin) => probability >= bin.min)?.step ?? 0;

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

/* ================================================== 1. XAVF ISSIQLIK XARITASI */

/**
 * Portfel ko'rinishi: qaysi prognoz qaysi haftada chegarasini buzadi.
 * Kattalikni taqqoslash — sequential ramp (bitta ton, ochiqdan to'qqa).
 */
function RiskHeatmap({ activeId, onSelect, weeks }) {
  const [hover, setHover] = useState(null);
  const [asTable, setAsTable] = useState(false);
  const tableId = useId();

  const grid = useMemo(
    () =>
      forecasts.map((forecast) => {
        const cells = ALL_WEEKS.map((week) => {
          const probability = breachProbability(
            forecast,
            projectedAt(forecast, week),
            week,
          );
          return { week, probability, step: riskStep(probability) };
        });

        // Birinchi 50% dan oshgan hafta — to'g'ridan-to'g'ri belgilanadi.
        const breachWeek = cells.find((cell) => cell.probability >= 50)?.week;
        return { forecast, cells, breachWeek };
      }),
    [],
  );

  return (
    <section className={styles.heatPanel} aria-label="Xavf issiqlik xaritasi">
      <PanelHead
        eyebrow="Portfel ko‘rinishi"
        title="Chegara buzilishi gorizonti"
        action={
          <button
            type="button"
            className={styles.tableToggle}
            aria-expanded={asTable}
            aria-controls={tableId}
            onClick={() => setAsTable((open) => !open)}
          >
            {asTable ? "Xarita" : "Jadval"}
          </button>
        }
      />

      <p className={styles.heatLead}>
        Har bir katak — o‘sha haftada ko‘rsatkichning chegaradan chiqish
        ehtimoli. To‘q rang yaqinroq va aniqroq buzilishni bildiradi.
      </p>

      {asTable ? (
        <div className={styles.tableWrap} id={tableId}>
          <table className={styles.dataTable}>
            <caption className={styles.srOnly}>
              Prognozlar bo‘yicha haftalik chegara buzilishi ehtimoli, foizda
            </caption>
            <thead>
              <tr>
                <th scope="col">Prognoz</th>
                {ALL_WEEKS.map((week) => (
                  <th scope="col" key={week}>
                    +{week}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {grid.map((row) => (
                <tr key={row.forecast.id}>
                  <th scope="row">{row.forecast.target}</th>
                  {row.cells.map((cell) => (
                    <td key={cell.week}>{cell.probability}%</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className={styles.heatGrid} id={tableId}>
          <div className={styles.heatCorner} aria-hidden="true" />
          <div className={styles.heatWeeks} aria-hidden="true">
            {ALL_WEEKS.map((week) => (
              <span
                key={week}
                className={week === weeks ? styles.heatWeekOn : undefined}
              >
                {week % 2 === 0 || week === 1 ? `+${week}` : ""}
              </span>
            ))}
          </div>

          {grid.map((row) => {
            const selected = row.forecast.id === activeId;

            return (
              <div
                className={`${styles.heatRow} ${selected ? styles.heatRowOn : ""}`}
                key={row.forecast.id}
              >
                <button
                  type="button"
                  className={styles.heatLabel}
                  aria-pressed={selected}
                  onClick={() => onSelect(row.forecast.id)}
                >
                  <i className={styles[`dot_${row.forecast.risk}`]} />
                  <span>
                    <strong>{row.forecast.target}</strong>
                    <small>{row.forecast.metric}</small>
                  </span>
                </button>

                <div className={styles.heatCells}>
                  {row.cells.map((cell) => (
                    <div
                      key={cell.week}
                      className={`${styles.heatCell} ${styles[`step${cell.step}`]} ${
                        cell.week === row.breachWeek ? styles.heatBreach : ""
                      }`}
                      onPointerEnter={() =>
                        setHover({
                          id: row.forecast.id,
                          week: cell.week,
                          probability: cell.probability,
                          target: row.forecast.target,
                        })
                      }
                      onPointerLeave={() => setHover(null)}
                    >
                      {hover?.id === row.forecast.id &&
                      hover?.week === cell.week ? (
                        <span className={styles.heatTip} role="status">
                          <b>+{cell.week} hafta</b>
                          {cell.probability}% buzilish ehtimoli
                        </span>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className={styles.heatFoot}>
        <div className={styles.scale} hidden={asTable}>
          <span>Buzilish ehtimoli</span>
          {[...RISK_BINS].reverse().map((bin) => (
            <em key={bin.label}>
              <i className={styles[`step${bin.step}`]} aria-hidden="true" />
              {bin.label}
            </em>
          ))}
        </div>
        <small>
          {asTable ? null : (
            <i className={styles.breachKey} aria-hidden="true" />
          )}
          {asTable
            ? "Qiymatlar — chegaradan chiqish ehtimoli, foizda."
            : "50% chegarasi kesib o‘tilgan hafta"}
        </small>
      </div>
    </section>
  );
}

/* ============================================ 2. NOANIQLIK RIDGELINE GRAFIGI */

const RIDGE = { width: 720, height: 250, padX: 16, padTop: 16, padBottom: 30 };

/**
 * Uch gorizontdagi natija taqsimoti. Barcha egri chiziqlar bitta shkalada
 * normallashtiriladi — shuning uchun uzoq gorizont yassiroq va kengroq
 * ko'rinadi, ya'ni noaniqlikning o'sishi shaklning o'zidan o'qiladi.
 */
function UncertaintyRidgeline({ forecast, weeks, whatIfValue }) {
  const [hover, setHover] = useState(null);

  const view = useMemo(() => {
    const steps = [4, 8, 12].map((weeks) => ({
      weeks,
      mu: projectedAt(forecast, weeks),
      sigma: sigmaAt(forecast, weeks),
    }));

    const current = currentValue(forecast);
    const widest = steps.at(-1);

    // What-if egri chizig'i tanlangan gorizontning ridgesi ustiga tushadi.
    const target = steps.find((step) => step.weeks === weeks) ?? steps.at(-1);
    const whatIfSpread = whatIfValue == null ? 0 : target.sigma * 3.2;

    const low = Math.min(
      forecast.threshold,
      current,
      widest.mu - widest.sigma * 3.2,
      whatIfValue == null ? Infinity : whatIfValue - whatIfSpread,
    );
    const high = Math.max(
      forecast.threshold,
      current,
      widest.mu + widest.sigma * 3.2,
      whatIfValue == null ? -Infinity : whatIfValue + whatIfSpread,
    );
    const pad = (high - low) * 0.06;
    const min = low - pad;
    const max = high + pad;

    const plotWidth = RIDGE.width - RIDGE.padX * 2;
    const xAt = (value) =>
      RIDGE.padX + ((value - min) / (max - min)) * plotWidth;

    // Barcha ridgelar eng tik cho'qqiga nisbatan o'lchanadi.
    const peak = Math.max(
      ...steps.map((step) => normalPdf(step.mu, step.mu, step.sigma)),
    );

    /*
     * Kanvas balandligi cho'qqi (amplitude) + qolgan ridgelarning siljishidan
     * iborat. Shu tenglamadan laneHeight yechiladi — natijada eng baland ridge
     * ham aynan yuqori chegarada tugaydi, hech qachon undan chiqib ketmaydi.
     */
    const available = RIDGE.height - RIDGE.padTop - RIDGE.padBottom;
    const overlap = 1.35;
    const laneHeight = available / (overlap + steps.length - 1);
    const amplitude = laneHeight * overlap;
    const samples = 84;

    const ridges = steps.map((step, index) => {
      // Eng uzoq gorizont orqada (tepada), eng yaqini oldinda (pastda).
      const baseline =
        RIDGE.padTop + amplitude + laneHeight * (steps.length - 1 - index);

      const points = Array.from({ length: samples + 1 }, (_, i) => {
        const value = min + ((max - min) * i) / samples;
        const density = normalPdf(value, step.mu, step.sigma);
        return {
          value,
          x: xAt(value),
          y: baseline - (density / peak) * amplitude,
        };
      });

      const toPath = (list) =>
        list
          .map((point) => `${point.x.toFixed(1)},${point.y.toFixed(1)}`)
          .join(" ");

      const breachSide =
        forecast.worseWhen === "up"
          ? points.filter((point) => point.value >= forecast.threshold)
          : points.filter((point) => point.value <= forecast.threshold);

      const thresholdX = xAt(forecast.threshold);
      const edge =
        forecast.worseWhen === "up" ? RIDGE.width - RIDGE.padX : RIDGE.padX;

      return {
        ...step,
        baseline,
        probability: breachProbability(forecast, step.mu, step.weeks),
        line: toPath(points),
        area: `${xAt(min)},${baseline} ${toPath(points)} ${xAt(max)},${baseline}`,
        breachArea: breachSide.length
          ? `${thresholdX.toFixed(1)},${baseline} ${toPath(breachSide)} ${edge},${baseline}`
          : null,
        peakX: xAt(step.mu),
        peakY: baseline - amplitude,
      };
    });

    const whatIfRidge =
      whatIfValue == null
        ? null
        : (() => {
            const host =
              ridges.find((ridge) => ridge.weeks === target.weeks) ??
              ridges.at(-1);
            return Array.from({ length: samples + 1 }, (_, i) => {
              const value = min + ((max - min) * i) / samples;
              const density = normalPdf(value, whatIfValue, target.sigma);
              const y = host.baseline - (density / peak) * amplitude;
              return `${xAt(value).toFixed(1)},${y.toFixed(1)}`;
            }).join(" ");
          })();

    const ticks = [min, (min + max) / 2, max].map((value) => ({
      value,
      x: xAt(value),
    }));

    return {
      ridges,
      whatIfRidge,
      ticks,
      thresholdX: xAt(forecast.threshold),
      currentX: xAt(current),
      current,
    };
  }, [forecast, weeks, whatIfValue]);

  const percent = (value, axis) =>
    `${(value / (axis === "x" ? RIDGE.width : RIDGE.height)) * 100}%`;

  return (
    <figure className={styles.ridge}>
      <div className={styles.ridgeRows} aria-hidden="true">
        {view.ridges.map((ridge) => (
          <button
            type="button"
            key={ridge.weeks}
            className={styles.ridgeRowLabel}
            style={{ top: percent(ridge.baseline, "y") }}
            onPointerEnter={() => setHover(ridge.weeks)}
            onPointerLeave={() => setHover(null)}
            onFocus={() => setHover(ridge.weeks)}
            onBlur={() => setHover(null)}
          >
            <b>+{ridge.weeks} hafta</b>
            <em>{ridge.probability}%</em>
          </button>
        ))}
      </div>

      <div className={styles.ridgeSurface}>
        <svg
          viewBox={`0 0 ${RIDGE.width} ${RIDGE.height}`}
          preserveAspectRatio="none"
          role="img"
          aria-label={`${forecast.metric} natijasining taqsimoti: +4 haftada ${view.ridges[0].probability}%, +8 haftada ${view.ridges[1].probability}%, +12 haftada ${view.ridges[2].probability}% chegara buzilishi ehtimoli`}
        >
          {view.ridges.map((ridge) => (
            <line
              key={`base-${ridge.weeks}`}
              className={styles.ridgeBaseline}
              x1={RIDGE.padX}
              x2={RIDGE.width - RIDGE.padX}
              y1={ridge.baseline}
              y2={ridge.baseline}
            />
          ))}

          {[...view.ridges].reverse().map((ridge) => (
            <g key={ridge.weeks}>
              <polygon className={styles.ridgeSafe} points={ridge.area} />
              {ridge.breachArea ? (
                <polygon
                  className={styles.ridgeBreach}
                  points={ridge.breachArea}
                />
              ) : null}
              <polyline className={styles.ridgeLine} points={ridge.line} />
            </g>
          ))}

          {view.whatIfRidge ? (
            <polyline
              className={styles.ridgeWhatIf}
              points={view.whatIfRidge}
            />
          ) : null}

          <line
            className={styles.ridgeThreshold}
            x1={view.thresholdX}
            x2={view.thresholdX}
            y1={RIDGE.padTop - 4}
            y2={RIDGE.height - RIDGE.padBottom}
          />
          <line
            className={styles.ridgeCurrent}
            x1={view.currentX}
            x2={view.currentX}
            y1={RIDGE.padTop - 4}
            y2={RIDGE.height - RIDGE.padBottom}
          />
        </svg>

        {hover
          ? (() => {
              const ridge = view.ridges.find((item) => item.weeks === hover);
              return (
                <div
                  className={styles.ridgeTip}
                  style={{
                    left: `${Math.min(80, Math.max(18, (ridge.peakX / RIDGE.width) * 100))}%`,
                    top: percent(ridge.peakY + 6, "y"),
                  }}
                  role="status"
                >
                  <span>+{ridge.weeks} hafta</span>
                  <strong>
                    {fmt(forecast, ridge.mu)} <em>{forecast.unit}</em>
                  </strong>
                  <small>
                    {CONFIDENCE_LEVEL}% oraliq{" "}
                    {fmt(forecast, ridge.mu - ridge.sigma * 1.645)} —{" "}
                    {fmt(forecast, ridge.mu + ridge.sigma * 1.645)}
                  </small>
                  <small>Buzilish ehtimoli {ridge.probability}%</small>
                </div>
              );
            })()
          : null}

        <span
          className={`${styles.ridgeMark} ${styles.ridgeMarkTop}`}
          style={{ left: percent(view.currentX, "x") }}
        >
          Bugun {fmt(forecast, view.current)}
        </span>
        <span
          className={`${styles.ridgeMark} ${styles.ridgeMarkThreshold}`}
          style={{ left: percent(view.thresholdX, "x") }}
        >
          {forecast.thresholdLabel} {fmt(forecast, forecast.threshold)}
        </span>
      </div>

      <div className={styles.ridgeAxis} aria-hidden="true">
        {view.ticks.map((tick, index) => (
          <span
            key={tick.value}
            style={{ left: percent(tick.x, "x") }}
            className={
              index === 0
                ? styles.axisStart
                : index === view.ticks.length - 1
                  ? styles.axisEnd
                  : undefined
            }
          >
            {fmt(forecast, tick.value)}
          </span>
        ))}
        <b>{forecast.unit}</b>
      </div>

      <figcaption className={styles.ridgeLegend}>
        <span className={styles.keySafe}>Chegara ichida</span>
        <span className={styles.keyBreach}>Chegaradan tashqarida</span>
        {view.whatIfRidge ? (
          <span className={styles.keyWhatIf}>What-if natijasi</span>
        ) : null}
      </figcaption>
    </figure>
  );
}

/* ======================================= 3. OMILLAR OQIMI (stacked area) */

const FLOW = { width: 720, height: 190, padX: 8, padY: 14 };

/**
 * Omillar hissasining gorizont bo'ylab to'planishi. Yomonlashtiruvchi omillar
 * nol chizig'idan yuqoriga, yaxshilovchilari pastga to'planadi — qutblanish
 * rang bilan emas, avvalo joylashuv bilan kodlanadi.
 */
function DriverFlow({ forecast, weeks }) {
  const [hoverWeek, setHoverWeek] = useState(null);
  const surfaceRef = useRef(null);

  const view = useMemo(() => {
    const current = currentValue(forecast);

    const series = forecast.drivers.map((driver) => {
      const values = ALL_WEEKS.slice(0, weeks).map(
        (week) => driver.share * (projectedAt(forecast, week) - current),
      );
      return {
        label: driver.label,
        values,
        adverse: isAdverse(forecast, values.at(-1)),
        total: values.at(-1),
      };
    });

    const adverse = series
      .filter((item) => item.adverse)
      .sort((a, b) => Math.abs(b.total) - Math.abs(a.total));
    const benign = series
      .filter((item) => !item.adverse)
      .sort((a, b) => Math.abs(b.total) - Math.abs(a.total));

    const stackTotals = (list, week) =>
      list.reduce((sum, item) => sum + Math.abs(item.values[week]), 0);
    const peakOf = (list) =>
      Math.max(
        ...ALL_WEEKS.slice(0, weeks).map((_, week) => stackTotals(list, week)),
        0,
      );

    /*
     * Nol chizig'i markazda emas, ikki tomonning haqiqiy nisbatiga qarab
     * joylashadi — bir tomon kichik bo'lganda kanvasning yarmi bo'sh qolmaydi.
     * Kichik tomonga ham eng kamida 18% ajratiladi, aks holda chiziq panel
     * chetiga yopishib qoladi.
     */
    const adversePeak = peakOf(adverse);
    const benignPeak = peakOf(benign);
    const share = Math.min(
      0.82,
      Math.max(0.18, adversePeak / (adversePeak + benignPeak || 1)),
    );

    const plotWidth = FLOW.width - FLOW.padX * 2;
    const plotHeight = FLOW.height - FLOW.padY * 2;
    const zeroY = FLOW.padY + plotHeight * share;

    const scaleUp = (plotHeight * share) / (adversePeak || 1);
    const scaleDown = (plotHeight * (1 - share)) / (benignPeak || 1);

    const xAt = (week) =>
      FLOW.padX + (weeks === 1 ? plotWidth : (week / (weeks - 1)) * plotWidth);
    const yAt = (offset, direction) =>
      direction > 0 ? zeroY - offset * scaleUp : zeroY + offset * scaleDown;

    const build = (list, direction) => {
      let cursor = ALL_WEEKS.slice(0, weeks).map(() => 0);

      return list.map((item, index) => {
        const lower = [...cursor];
        cursor = cursor.map(
          (value, week) => value + Math.abs(item.values[week]),
        );

        const upper = cursor.map((value, week) => ({
          x: xAt(week),
          y: yAt(value, direction),
        }));
        const lowerPoints = lower.map((value, week) => ({
          x: xAt(week),
          y: yAt(value, direction),
        }));

        const toPath = (points) =>
          points
            .map((point) => `${point.x.toFixed(1)},${point.y.toFixed(1)}`)
            .join(" ");

        return {
          label: item.label,
          total: item.total,
          adverse: item.adverse,
          tone: `${direction > 0 ? "warm" : "cool"}${Math.min(index, 3)}`,
          area: `${toPath(upper)} ${toPath([...lowerPoints].reverse())}`,
          endY: (upper.at(-1).y + lowerPoints.at(-1).y) / 2,
          thickness: Math.abs(upper.at(-1).y - lowerPoints.at(-1).y),
          values: item.values,
        };
      });
    };

    /*
     * Yorliqlar band markaziga bog'lanadi, ammo ingichka bandlarda markazlar
     * bir-biriga juda yaqin tushadi. Shuning uchun pastdan yuqoriga yurib,
     * har bir yorliqqa eng kamida MIN_GAP joy ajratiladi — hech qachon
     * ustma-ust tushmaydi.
     */
    const MIN_GAP = 20;
    const bands = [...build(adverse, 1), ...build(benign, -1)].sort(
      (a, b) => b.endY - a.endY,
    );

    let cursor = Infinity;
    for (const band of bands) {
      band.labelY = Math.min(band.endY, cursor - MIN_GAP);
      cursor = band.labelY;
    }

    return {
      bands,
      zeroY,
      xAt,
      weekList: ALL_WEEKS.slice(0, weeks),
    };
  }, [forecast, weeks]);

  const pickWeek = useCallback(
    (event) => {
      const bounds = surfaceRef.current?.getBoundingClientRect();
      if (!bounds || bounds.width === 0) return;
      const ratio = (event.clientX - bounds.left) / bounds.width;
      setHoverWeek(
        Math.max(0, Math.min(weeks - 1, Math.round(ratio * (weeks - 1)))),
      );
    },
    [weeks],
  );

  const percent = (value, axis) =>
    `${(value / (axis === "x" ? FLOW.width : FLOW.height)) * 100}%`;

  const activeWeek = hoverWeek ?? weeks - 1;

  return (
    <figure className={styles.flow}>
      <div className={styles.flowScale} aria-hidden="true">
        <span>yomonlashtiradi</span>
        <span>yaxshilaydi</span>
      </div>

      <div
        className={styles.flowSurface}
        ref={surfaceRef}
        onPointerMove={pickWeek}
        onPointerLeave={() => setHoverWeek(null)}
      >
        <svg
          viewBox={`0 0 ${FLOW.width} ${FLOW.height}`}
          preserveAspectRatio="none"
          role="img"
          aria-label={`Omillar hissasining ${weeks} hafta davomida to‘planishi`}
        >
          {view.bands.map((band) => (
            <polygon
              key={band.label}
              className={`${styles.flowBand} ${styles[band.tone]}`}
              points={band.area}
            />
          ))}

          <line
            className={styles.flowZero}
            x1={FLOW.padX}
            x2={FLOW.width - FLOW.padX}
            y1={view.zeroY}
            y2={view.zeroY}
          />

          {hoverWeek === null ? null : (
            <line
              className={styles.flowCrosshair}
              x1={view.xAt(hoverWeek)}
              x2={view.xAt(hoverWeek)}
              y1={FLOW.padY}
              y2={FLOW.height - FLOW.padY}
            />
          )}
        </svg>

        <div className={styles.flowHits}>
          {view.weekList.map((week, index) => (
            <button
              key={week}
              type="button"
              aria-label={`+${week} hafta bo‘yicha omillar hissasi`}
              onFocus={() => setHoverWeek(index)}
              onBlur={() => setHoverWeek(null)}
              onClick={() => setHoverWeek(index)}
            />
          ))}
        </div>
      </div>

      {/*
        Yorliqlar chizma ichida emas, o'ng gutterda — shunda ular hech qachon
        kesilmaydi va bandlar bilan bir qatorda turib to'g'ridan-to'g'ri
        belgilash vazifasini bajaradi.
      */}
      <figcaption className={styles.flowKeys}>
        {view.bands.map((band) => (
          <span
            key={band.label}
            className={styles.flowKey}
            style={{ top: percent(band.labelY, "y") }}
          >
            <i className={styles[band.tone]} aria-hidden="true" />
            <b>{band.label}</b>
            <em className={band.adverse ? styles.negative : styles.positive}>
              {formatSigned(band.values[activeWeek], 1)}
            </em>
          </span>
        ))}
      </figcaption>

      <div className={styles.flowAxis} aria-hidden="true">
        <span>+1 hafta</span>
        <span>+{weeks} hafta</span>
      </div>
    </figure>
  );
}

/* ================================== 4. WHAT-IF + EHTIMOLLIK DUMBBELL */

/** Aralashuvdan oldingi va keyingi holat — har bir gorizont uchun alohida. */
function ProbabilityDumbbell({ forecast, values }) {
  const rows = horizons.map((horizon) => {
    const baseline = projectedAt(forecast, horizon.id);
    const shift = forecast.levers.reduce(
      (sum, lever) =>
        sum + leverImpact(lever, values[lever.id] ?? lever.base, horizon.id),
      0,
    );

    return {
      label: horizon.label,
      base: 100 - breachProbability(forecast, baseline, horizon.id),
      next: 100 - breachProbability(forecast, baseline + shift, horizon.id),
    };
  });

  const moved = rows.some((row) => row.base !== row.next);

  return (
    <div className={styles.dumbbell}>
      <span className={styles.blockLabel}>Chegara ichida qolish ehtimoli</span>

      {rows.map((row) => {
        const left = Math.min(row.base, row.next);
        const right = Math.max(row.base, row.next);

        return (
          <div className={styles.dumbRow} key={row.label}>
            <small>{row.label}</small>

            <div className={styles.dumbTrack}>
              <i
                className={styles.dumbConnector}
                style={{ left: `${left}%`, width: `${right - left}%` }}
                aria-hidden="true"
              />
              <i
                className={styles.dumbBase}
                style={{ left: `${row.base}%` }}
                aria-hidden="true"
              />
              {moved ? (
                <i
                  className={styles.dumbNext}
                  style={{ left: `${row.next}%` }}
                  aria-hidden="true"
                />
              ) : null}
            </div>

            <b>
              {moved ? (
                <>
                  <s>{row.base}%</s> {row.next}%
                </>
              ) : (
                `${row.base}%`
              )}
            </b>
          </div>
        );
      })}

      <div className={styles.dumbLegend}>
        <span className={styles.keyBase}>Aralashuvsiz</span>
        {moved ? <span className={styles.keyNext}>Simulyatsiya</span> : null}
      </div>
    </div>
  );
}

function WhatIf({ forecast, weeks, values, onChange, onReset }) {
  const baseline = projectedAt(forecast, weeks);
  const impacts = forecast.levers.map((lever) =>
    leverImpact(lever, values[lever.id] ?? lever.base, weeks),
  );
  const projected = baseline + impacts.reduce((sum, value) => sum + value, 0);

  const touched = forecast.levers.some(
    (lever) => (values[lever.id] ?? lever.base) !== lever.base,
  );
  const delta = projected - baseline;

  return (
    <div className={styles.whatIf}>
      <div className={styles.whatIfHead}>
        <span className={styles.blockLabel}>What-if simulyatsiya</span>
        {touched ? (
          <button
            type="button"
            className={styles.resetButton}
            onClick={onReset}
          >
            <Icon name="refresh" size={13} />
            Boshlang‘ich holat
          </button>
        ) : null}
      </div>

      <div className={styles.whatIfBody}>
        <div className={styles.levers}>
          {forecast.levers.map((lever, index) => {
            const value = values[lever.id] ?? lever.base;
            const fill = ((value - lever.min) / (lever.max - lever.min)) * 100;

            return (
              <label className={styles.lever} key={lever.id}>
                <span className={styles.leverTop}>
                  <span className={styles.leverLabel}>{lever.label}</span>
                  <b>
                    {value > 0 && lever.min < 0 ? "+" : ""}
                    {value} {lever.unit}
                  </b>
                </span>

                <input
                  className={styles.slider}
                  type="range"
                  min={lever.min}
                  max={lever.max}
                  step={lever.step}
                  value={value}
                  style={{ "--fill": `${fill}%` }}
                  onChange={(event) =>
                    onChange(lever.id, Number(event.target.value))
                  }
                />

                <span className={styles.leverFoot}>
                  <small>
                    {lever.min} {lever.unit}
                  </small>
                  <em
                    className={
                      impacts[index] === 0
                        ? styles.leverIdle
                        : isAdverse(forecast, impacts[index])
                          ? styles.negative
                          : styles.positive
                    }
                  >
                    {impacts[index] === 0
                      ? "ta’sirsiz"
                      : `${formatSigned(impacts[index], 1)} ${forecast.unit}`}
                  </em>
                  <small>
                    {lever.max} {lever.unit}
                  </small>
                </span>
              </label>
            );
          })}
        </div>

        <div className={styles.outcome}>
          <span className={styles.outcomeLabel}>
            {touched ? "Simulyatsiya natijasi" : "Aralashuvsiz prognoz"} ·{" "}
            {weeks} hafta
          </span>

          <div className={styles.outcomeValue}>
            <strong>{fmt(forecast, projected)}</strong>
            <em>{forecast.unit}</em>
          </div>

          {touched ? (
            <p className={styles.outcomeBase}>
              Aralashuvsiz {fmt(forecast, baseline)} {forecast.unit}
              <b
                className={
                  isAdverse(forecast, delta) ? styles.negative : styles.positive
                }
              >
                {formatSigned(delta, 1)}
              </b>
            </p>
          ) : (
            <p className={styles.outcomeHint}>
              Richaglarni harakatlantiring — taqsimot egri chizig‘i grafikda
              yangilanadi.
            </p>
          )}

          <ProbabilityDumbbell forecast={forecast} values={values} />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ detal */

function ForecastDetail({ forecast, weeks, values, onChange, onReset }) {
  const current = currentValue(forecast);
  const baseline = projectedAt(forecast, weeks);

  const shift = forecast.levers.reduce(
    (sum, lever) =>
      sum + leverImpact(lever, values[lever.id] ?? lever.base, weeks),
    0,
  );
  const whatIfValue = shift === 0 ? null : baseline + shift;

  const gap = baseline - forecast.threshold;
  const breaching = isBreaching(forecast, baseline);

  return (
    <div className={styles.detail}>
      <div className={styles.detailHead}>
        <div>
          <span className={styles.detailMeta}>
            {categoryLabels[forecast.category]} · {forecast.target}
          </span>
          <h3>{forecast.title}</h3>
        </div>
        <span className={styles[`badge_${forecast.risk}`]}>
          {riskLabels[forecast.risk]}
        </span>
      </div>

      <div className={styles.metricRow}>
        <div>
          <span>Bugungi {forecast.metric.toLowerCase()}</span>
          <strong>
            {fmt(forecast, current)} <em>{forecast.unit}</em>
          </strong>
        </div>
        <div>
          <span>Prognoz · {weeks} hafta</span>
          <strong className={breaching ? styles.negative : styles.positive}>
            {fmt(forecast, baseline)} <em>{forecast.unit}</em>
          </strong>
        </div>
        <div>
          <span>{forecast.thresholdLabel}</span>
          <strong>
            {fmt(forecast, forecast.threshold)} <em>{forecast.unit}</em>
          </strong>
        </div>
        <div>
          <span>Chegaradan og‘ish</span>
          <strong className={breaching ? styles.negative : styles.positive}>
            {formatSigned(gap, 1)} <em>{forecast.unit}</em>
          </strong>
        </div>
      </div>

      <div className={styles.block}>
        <span className={styles.blockLabel}>
          Natija taqsimoti va noaniqlikning o‘sishi
        </span>
        <UncertaintyRidgeline
          forecast={forecast}
          weeks={weeks}
          whatIfValue={whatIfValue}
        />
      </div>

      <div className={styles.block}>
        <span className={styles.blockLabel}>Nima kutilmoqda</span>
        <p className={styles.summary}>{forecast.summary}</p>
      </div>

      <div className={styles.block}>
        <span className={styles.blockLabel}>
          Omillar hissasining to‘planishi
        </span>
        <DriverFlow forecast={forecast} weeks={weeks} />
      </div>

      <WhatIf
        forecast={forecast}
        weeks={weeks}
        values={values}
        onChange={onChange}
        onReset={onReset}
      />

      <div className={styles.recommendation}>
        <span>
          <Icon name="spark" size={15} /> Tavsiya
        </span>
        <p>{forecast.recommendation}</p>
        <Link href="/recommendations">
          Tavsiyalar markazi <Icon name="chevron" size={13} />
        </Link>
      </div>
    </div>
  );
}

/* ================================================= 5. KALIBRATSIYA GRAFIGI */

const CAL = { size: 220, pad: 26 };

/**
 * Model bergan ehtimollik va aslida ro'y bergan chastota. Nuqtalar diagonalga
 * qanchalik yaqin bo'lsa, model o'z ishonchini shunchalik to'g'ri baholaydi.
 */
function CalibrationPlot() {
  const [hover, setHover] = useState(null);
  const plot = CAL.size - CAL.pad * 2;
  const at = (value) => CAL.pad + (value / 100) * plot;
  // SVG'da y pastga o'sadi — kuzatilgan qiymat yuqoriga qarab chizilishi kerak.
  const yAt = (value) => CAL.pad + (1 - value / 100) * plot;
  const maxN = Math.max(...model.calibration.map((point) => point.n));

  return (
    <figure className={styles.calibration}>
      <svg
        viewBox={`0 0 ${CAL.size} ${CAL.size}`}
        role="img"
        aria-label="Model kalibratsiyasi: bashorat qilingan ehtimollik va kuzatilgan chastota taqqoslamasi"
      >
        {[0, 50, 100].map((tick) => (
          <g key={tick}>
            <line
              className={styles.calGrid}
              x1={at(tick)}
              x2={at(tick)}
              y1={yAt(0)}
              y2={yAt(100)}
            />
            <line
              className={styles.calGrid}
              x1={at(0)}
              x2={at(100)}
              y1={yAt(tick)}
              y2={yAt(tick)}
            />
          </g>
        ))}

        <line
          className={styles.calDiagonal}
          x1={at(0)}
          y1={yAt(0)}
          x2={at(100)}
          y2={yAt(100)}
        />

        {model.calibration.map((point) => (
          <circle
            key={point.predicted}
            className={styles.calDot}
            cx={at(point.predicted)}
            cy={yAt(point.observed)}
            r={4 + (point.n / maxN) * 3.5}
            onPointerEnter={() => setHover(point)}
            onPointerLeave={() => setHover(null)}
          />
        ))}
      </svg>

      <span className={styles.calAxisX}>bashorat qilingan →</span>
      <span className={styles.calAxisY}>kuzatilgan →</span>

      {hover ? (
        <div className={styles.calTip} role="status">
          <strong>{hover.predicted}% bashorat</strong>
          <small>
            {hover.observed}% kuzatilgan · {hover.n} hodisa
          </small>
        </div>
      ) : null}

      <figcaption>
        Nuqtalar diagonal ustida — model ishonchini oshirib ham, pasaytirib ham
        yubormayapti.
      </figcaption>
    </figure>
  );
}

function ReliabilityPanel() {
  const accuracy = model.mapeTrend.map((value) => 100 - value);

  return (
    <section className={styles.reliability} aria-label="Model ishonchliligi">
      <PanelHead
        eyebrow="Model ishonchliligi"
        title="Prognoz aniqligi va kalibratsiya"
        meta={model.method}
      />

      <div className={styles.reliabilityGrid}>
        <div className={styles.reliabilityCard}>
          <span>O‘rtacha aniqlik</span>
          <div className={styles.reliabilityValue}>
            <strong>{(100 - model.mape).toFixed(1)}%</strong>
            <Sparkline
              values={accuracy}
              tone="sage"
              label="Prognoz aniqligi trendi"
            />
          </div>
          <small>MAPE {model.mape}% · so‘nggi 8 sikl</small>

          <div className={styles.horizonRow}>
            {model.horizonReliability.map((item) => (
              <div key={item.label}>
                <span>{item.label}</span>
                <b>{item.mape}%</b>
              </div>
            ))}
          </div>
          <small className={styles.horizonNote}>
            Gorizont uzaygani sari xatolik ortadi — 8 haftadan uzoq prognozlar
            yo‘nalish sifatida o‘qilishi kerak.
          </small>
        </div>

        <div className={styles.reliabilityCard}>
          <span>Kalibratsiya</span>
          <CalibrationPlot />
        </div>

        <div className={styles.reliabilityCard}>
          <span>Model bazasi</span>
          <dl className={styles.modelFacts}>
            <div>
              <dt>Model</dt>
              <dd>{model.name}</dd>
            </div>
            <div>
              <dt>O‘qitish bazasi</dt>
              <dd>{model.dataset}</dd>
            </div>
            <div>
              <dt>Belgilar soni</dt>
              <dd>{model.features} ta</dd>
            </div>
            <div>
              <dt>Ishonch oralig‘i qamrovi</dt>
              <dd>{model.coverage}%</dd>
            </div>
            <div>
              <dt>Oxirgi o‘qitish</dt>
              <dd>{model.trainedAgo}</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------- page */

export default function ForecastCenter() {
  const [weeks, setWeeks] = useState(12);
  const [category, setCategory] = useState("all");
  const [selectedId, setSelectedId] = useState(forecasts[0].id);
  const [levers, setLevers] = useState({});

  const rows = useMemo(
    () =>
      category === "all"
        ? forecasts
        : forecasts.filter((forecast) => forecast.category === category),
    [category],
  );

  const activeId = rows.some((forecast) => forecast.id === selectedId)
    ? selectedId
    : rows[0]?.id;
  const selected = forecasts.find((forecast) => forecast.id === activeId);

  const counts = useMemo(
    () =>
      forecasts.reduce(
        (totals, forecast) => ({
          ...totals,
          all: totals.all + 1,
          [forecast.category]: (totals[forecast.category] ?? 0) + 1,
        }),
        { all: 0 },
      ),
    [],
  );

  const summary = useMemo(() => {
    const highRisk = forecasts.filter(
      (forecast) => forecast.risk === "critical",
    ).length;
    const impact = forecasts.reduce(
      (sum, forecast) => sum + forecast.impactPerMonth,
      0,
    );
    const adverse = forecasts.filter(
      (forecast) => forecast.impactPerMonth < 0,
    ).length;
    const upcoming = forecasts
      .map((forecast) => ({ forecast, weeks: weeksToBreach(forecast) }))
      .filter((item) => item.weeks !== null)
      .sort((a, b) => a.weeks - b.weeks)[0];

    return { highRisk, impact, adverse, upcoming };
  }, []);

  const stats = [
    {
      label: "Kuzatuvdagi prognoz",
      value: String(forecasts.length),
      note: `${summary.highRisk} ta yuqori xavf`,
    },
    {
      label: "Kutilayotgan oylik ta’sir",
      value: `${formatSigned(summary.impact, 0)} mln`,
      tone: summary.impact < 0 ? "negative" : "positive",
      note: `${summary.adverse} ta salbiy · ${forecasts.length - summary.adverse} ta ijobiy`,
    },
    {
      label: "Eng yaqin chegara buzilishi",
      value: summary.upcoming ? `${summary.upcoming.weeks} hafta` : "—",
      note: summary.upcoming
        ? summary.upcoming.forecast.target
        : "yaqin gorizontda yo‘q",
      tone: summary.upcoming ? "negative" : undefined,
    },
    {
      label: "Prognoz aniqligi",
      value: `${(100 - model.mape).toFixed(1)}%`,
      note: `MAPE ${model.mape}% · ${CONFIDENCE_LEVEL}% koridor`,
      trend: model.mapeTrend.map((value) => 100 - value),
    },
  ];

  const leverValues = levers[activeId] ?? {};

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <span className={styles.kicker}>Prognoz markazi</span>
          <p>
            Muddat, xarajat, samaradorlik va resurs talabining kelajakdagi
            holati — noaniqlik taqsimoti va what-if simulyatsiyasi bilan.
          </p>
        </div>

        <div className={styles.filterRow}>
          <div
            className={styles.chips}
            role="group"
            aria-label="Yo‘nalish bo‘yicha filtr"
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

          <div
            className={styles.horizonControl}
            role="group"
            aria-label="Prognoz gorizonti"
          >
            {horizons.map((item) => (
              <button
                key={item.id}
                type="button"
                className={weeks === item.id ? styles.horizonOn : undefined}
                aria-pressed={weeks === item.id}
                onClick={() => setWeeks(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <section className={styles.strip} aria-label="Prognoz ko‘rsatkichlari">
        {stats.map((stat) => (
          <article key={stat.label}>
            <span>{stat.label}</span>
            <div className={styles.statValue}>
              <strong className={stat.tone ? styles[stat.tone] : undefined}>
                {stat.value}
              </strong>
              {stat.trend ? (
                <Sparkline values={stat.trend} tone="sage" />
              ) : null}
            </div>
            <small>{stat.note}</small>
          </article>
        ))}
      </section>

      <RiskHeatmap activeId={activeId} onSelect={setSelectedId} weeks={weeks} />

      <section className={styles.detailPanel} aria-label="Prognoz tafsiloti">
        {selected ? (
          <ForecastDetail
            key={selected.id}
            forecast={selected}
            weeks={weeks}
            values={leverValues}
            onChange={(leverId, value) =>
              setLevers((current) => ({
                ...current,
                [selected.id]: {
                  ...(current[selected.id] ?? {}),
                  [leverId]: value,
                },
              }))
            }
            onReset={() =>
              setLevers((current) => {
                const next = { ...current };
                delete next[selected.id];
                return next;
              })
            }
          />
        ) : (
          <p className={styles.empty}>Bu yo‘nalishda prognoz yo‘q.</p>
        )}
      </section>

      <ReliabilityPanel />
    </div>
  );
}
