"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import Icon from "@/components/ui/Icon";
import Sparkline from "@/components/ui/Sparkline";
import {
  deviation,
  findingTypes,
  findings,
  formatSigned,
  isAdverse,
  isImprovement,
  model,
  severityLabels,
  typeLabels,
} from "@/lib/ai-analytics-data";
import styles from "./AiAnalytics.module.css";

const reviewLabels = { confirmed: "Tasdiqlangan", dismissed: "Rad etilgan" };

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

/* ------------------------------------------------------------ driverlar */

function DriverChart({ finding }) {
  const total = deviation(finding);
  const max = Math.max(...finding.drivers.map((d) => Math.abs(d.value)));
  const sorted = [...finding.drivers].sort(
    (a, b) => Math.abs(b.value) - Math.abs(a.value),
  );

  return (
    <div className={styles.drivers}>
      <div className={styles.driverScale} aria-hidden="true">
        <div>
          <span>yaxshilaydi</span>
          <span>yomonlashtiradi</span>
        </div>
      </div>

      {sorted.map((driver) => {
        const adverse = isAdverse(finding, driver.value);
        const width = (Math.abs(driver.value) / max) * 50;

        return (
          <div className={styles.driverRow} key={driver.label}>
            <span className={styles.driverLabel}>{driver.label}</span>

            <div className={styles.driverTrack}>
              <i className={styles.driverAxis} aria-hidden="true" />
              <b
                className={adverse ? styles.barAdverse : styles.barBenign}
                style={
                  adverse
                    ? { left: "50%", width: `${width}%` }
                    : { right: "50%", width: `${width}%` }
                }
              />
            </div>

            <span
              className={`${styles.driverValue} ${
                adverse ? styles.negative : styles.positive
              }`}
            >
              {formatSigned(driver.value)}
            </span>
          </div>
        );
      })}

      <div className={styles.driverTotal}>
        <span>Umumiy og‘ish</span>
        <b
          className={isImprovement(finding) ? styles.positive : styles.negative}
        >
          {formatSigned(total)} {finding.metric.unit}
        </b>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- detal */

function FindingDetail({ finding, review, onReview, onUndo }) {
  const total = deviation(finding);
  const improvement = isImprovement(finding);

  return (
    <div className={styles.detail} key={finding.id}>
      <div className={styles.detailHead}>
        <div>
          <span className={styles.detailMeta}>
            {typeLabels[finding.type]} · {finding.process}
          </span>
          <h3>{finding.title}</h3>
        </div>
        <span className={styles[`badge_${finding.severity}`]}>
          {severityLabels[finding.severity]}
        </span>
      </div>

      <div className={styles.metricRow}>
        <div>
          <span>{finding.metric.label}</span>
          <strong>
            {finding.metric.actual} <em>{finding.metric.unit}</em>
          </strong>
        </div>
        <div>
          <span>Model kutgan</span>
          <strong>
            {finding.metric.expected} <em>{finding.metric.unit}</em>
          </strong>
        </div>
        <div>
          <span>Og‘ish</span>
          <strong className={improvement ? styles.positive : styles.negative}>
            {formatSigned(total)} <em>{finding.metric.unit}</em>
          </strong>
        </div>
        <div>
          <span>Ishonch</span>
          <strong>{finding.confidence}%</strong>
        </div>
      </div>

      <div className={styles.block}>
        <span className={styles.blockLabel}>Nima aniqlandi</span>
        <p className={styles.summary}>{finding.summary}</p>
      </div>

      <div className={styles.block}>
        <span className={styles.blockLabel}>Og‘ishga omillar hissasi</span>
        <DriverChart finding={finding} />
      </div>

      <div className={styles.evidence}>
        {finding.evidence.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>

      <div className={styles.recommendation}>
        <span>
          <Icon name="spark" size={15} /> Tavsiya
        </span>
        <p>{finding.recommendation}</p>
        <Link href="/recommendations">
          Tavsiyalar markazi <Icon name="chevron" size={13} />
        </Link>
      </div>

      <div className={styles.reviewBar}>
        {review ? (
          <>
            <span className={styles[`review_${review}`]}>
              <Icon
                name={review === "confirmed" ? "check" : "chevron"}
                size={14}
              />
              {reviewLabels[review]}
            </span>
            <button
              type="button"
              className={styles.undoButton}
              onClick={onUndo}
            >
              Qaytarish
            </button>
          </>
        ) : (
          <>
            <span className={styles.reviewHint}>
              Bu topilma to‘g‘rimi? Javobingiz modelni o‘qitishga qo‘shiladi.
            </span>
            <div className={styles.reviewActions}>
              <button
                type="button"
                className={styles.dismissButton}
                onClick={() => onReview("dismissed")}
              >
                Rad etish
              </button>
              <button
                type="button"
                className={styles.confirmButton}
                onClick={() => onReview("confirmed")}
              >
                <Icon name="check" size={14} />
                Tasdiqlash
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ page */

export default function AiAnalytics() {
  const [type, setType] = useState("all");
  const [selectedId, setSelectedId] = useState(findings[0].id);
  const [reviews, setReviews] = useState({});

  const rows = useMemo(
    () =>
      type === "all"
        ? findings
        : findings.filter((finding) => finding.type === type),
    [type],
  );

  // Tanlangan topilma filtrdan tushib qolsa — ro'yxatdagi birinchisi ko'rsatiladi.
  const activeId = rows.some((finding) => finding.id === selectedId)
    ? selectedId
    : rows[0]?.id;
  const selected = findings.find((finding) => finding.id === activeId);

  const counts = useMemo(
    () =>
      findings.reduce(
        (totals, finding) => ({
          ...totals,
          all: totals.all + 1,
          [finding.type]: (totals[finding.type] ?? 0) + 1,
        }),
        { all: 0 },
      ),
    [],
  );

  const pending = findings.filter((finding) => !reviews[finding.id]);
  const averageConfidence = pending.length
    ? Math.round(
        pending.reduce((sum, finding) => sum + finding.confidence, 0) /
          pending.length,
      )
    : 0;

  const confirmed =
    model.reviewed.confirmed +
    Object.values(reviews).filter((value) => value === "confirmed").length;
  const dismissed =
    model.reviewed.dismissed +
    Object.values(reviews).filter((value) => value === "dismissed").length;
  const precision = Math.round((confirmed / (confirmed + dismissed)) * 100);

  const stats = [
    {
      label: "Ko‘rib chiqilmagan",
      value: String(pending.length),
      note: pending.length ? "tekshiruv kutilmoqda" : "hammasi ko‘rib chiqildi",
      tone: pending.length ? undefined : "positive",
    },
    {
      label: "O‘rtacha ishonch",
      value: pending.length ? `${averageConfidence}%` : "—",
      note: "ko‘rib chiqilmagan topilmalar",
    },
    {
      label: "Model aniqligi",
      value: `${model.accuracy}%`,
      note: `avvalgi modeldan +${(model.accuracy - model.baseline).toFixed(1)}`,
      trend: model.accuracyTrend,
    },
    {
      label: "Tasdiqlash aniqligi",
      value: `${precision}%`,
      note: `${confirmed} tasdiq · ${dismissed} rad`,
      meter: precision,
    },
  ];

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <span className={styles.kicker}>Intelligence markazi</span>
          <h1>AI tahlil</h1>
          <p>
            Anomaliyalar, ularning sabablari va model xulosalari — har bir
            topilma omillarga ajratilgan holda.
          </p>
        </div>

        <div className={styles.modelChip}>
          <Icon name="spark" size={15} />
          <div>
            <strong>{model.name}</strong>
            <small>Oxirgi o‘qitish {model.trainedAgo}</small>
          </div>
        </div>
      </header>

      <section className={styles.strip} aria-label="Model ko‘rsatkichlari">
        {stats.map((stat) => (
          <article key={stat.label}>
            <span>{stat.label}</span>
            <div className={styles.statValue}>
              <strong className={stat.tone ? styles.positive : undefined}>
                {stat.value}
              </strong>
              {stat.trend ? (
                <Sparkline values={stat.trend} tone="sage" />
              ) : null}
            </div>
            {typeof stat.meter === "number" ? (
              <div className={styles.meter} aria-hidden="true">
                <i style={{ width: `${stat.meter}%` }} />
              </div>
            ) : null}
            <small>{stat.note}</small>
          </article>
        ))}
      </section>

      <section className={styles.workspace} aria-label="AI topilmalari">
        <div className={styles.listColumn}>
          <PanelHead
            eyebrow="Topilmalar"
            title="Aniqlangan signallar"
            meta={`${rows.length} ta`}
          />

          <div
            className={styles.chips}
            role="group"
            aria-label="Tur bo‘yicha filtr"
          >
            {findingTypes.map((item) => (
              <button
                key={item.id}
                type="button"
                className={type === item.id ? styles.chipOn : undefined}
                aria-pressed={type === item.id}
                onClick={() => setType(item.id)}
              >
                {item.label}
                <small>{counts[item.id] ?? 0}</small>
              </button>
            ))}
          </div>

          <div className={styles.list}>
            {rows.map((finding) => {
              const review = reviews[finding.id];

              return (
                <button
                  key={finding.id}
                  type="button"
                  className={`${styles.card} ${
                    finding.id === activeId ? styles.cardOn : ""
                  }`}
                  aria-pressed={finding.id === activeId}
                  onClick={() => setSelectedId(finding.id)}
                >
                  <div className={styles.cardTop}>
                    <span className={styles[`dot_${finding.severity}`]} />
                    <small>{typeLabels[finding.type]}</small>
                    {review ? (
                      <em className={styles[`tag_${review}`]}>
                        {reviewLabels[review]}
                      </em>
                    ) : null}
                  </div>

                  <strong>{finding.title}</strong>
                  <span className={styles.cardProcess}>{finding.process}</span>

                  <div className={styles.confidence}>
                    <div className={styles.confidenceTrack} aria-hidden="true">
                      <i style={{ width: `${finding.confidence}%` }} />
                    </div>
                    <b>{finding.confidence}%</b>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className={styles.detailColumn}>
          {selected ? (
            <FindingDetail
              finding={selected}
              review={reviews[selected.id]}
              onReview={(value) =>
                setReviews((current) => ({ ...current, [selected.id]: value }))
              }
              onUndo={() =>
                setReviews((current) => {
                  const next = { ...current };
                  delete next[selected.id];
                  return next;
                })
              }
            />
          ) : (
            <p className={styles.empty}>Bu turdagi topilma yo‘q.</p>
          )}
        </div>
      </section>

      <section className={styles.modelPanel} aria-label="Model haqida">
        <PanelHead
          eyebrow="Model explanation"
          title="Model va uning bazasi"
          meta={model.method}
        />

        <div className={styles.modelFacts}>
          <div>
            <span>Aniqlik dinamikasi</span>
            <div className={styles.modelTrend}>
              <strong>{model.accuracy}%</strong>
              <Sparkline
                values={model.accuracyTrend}
                tone="sage"
                label="Model aniqligi trendi"
              />
            </div>
          </div>
          <div>
            <span>O‘qitish bazasi</span>
            <strong>{model.dataset}</strong>
          </div>
          <div>
            <span>Belgilar soni</span>
            <strong>{model.features} ta</strong>
          </div>
          <div>
            <span>Analitik javoblari</span>
            <strong>
              {confirmed} / {confirmed + dismissed}
            </strong>
          </div>
        </div>

        <p className={styles.modelNote}>
          Har bir tasdiqlash yoki rad etish keyingi o‘qitish to‘plamiga
          qo‘shiladi — model analitik qarorlaridan o‘rganadi.
        </p>
      </section>
    </div>
  );
}
