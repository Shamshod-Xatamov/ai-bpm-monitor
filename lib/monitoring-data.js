import { processes, stageStatus } from "@/lib/processes-data";

/**
 * Monitoring markazi ma'lumotlari.
 *
 * Vaqt yorliqlari nisbiy («−45m», «Kecha») — shu sababli server va client
 * renderi bir xil bo'ladi va hech qanday soatga bog'liqlik yo'q.
 */

export const ranges = [
  { id: "1h", label: "1 soat", unit: "jarayon/soat" },
  { id: "24h", label: "24 soat", unit: "jarayon/soat" },
  { id: "7d", label: "7 kun", unit: "jarayon/kun" },
];

/** Har bir nuqta: kutilgan qiymat va uning atrofidagi normal koridor. */
const BAND = { "1h": 9, "24h": 12, "7d": 10 };

const series = {
  "1h": {
    labels: [
      "−55m",
      "−50m",
      "−45m",
      "−40m",
      "−35m",
      "−30m",
      "−25m",
      "−20m",
      "−15m",
      "−10m",
      "−5m",
      "Hozir",
    ],
    actual: [116, 119, 121, 118, 115, 112, 96, 88, 94, 108, 115, 119],
    expected: [118, 118, 119, 119, 118, 117, 116, 116, 117, 117, 118, 118],
  },
  "24h": {
    labels: [
      "−24s",
      "−23s",
      "−22s",
      "−21s",
      "−20s",
      "−19s",
      "−18s",
      "−17s",
      "−16s",
      "−15s",
      "−14s",
      "−13s",
      "−12s",
      "−11s",
      "−10s",
      "−9s",
      "−8s",
      "−7s",
      "−6s",
      "−5s",
      "−4s",
      "−3s",
      "−2s",
      "Hozir",
    ],
    actual: [
      62, 58, 54, 51, 49, 55, 72, 94, 118, 132, 141, 138, 104, 131, 139, 144,
      136, 121, 104, 92, 84, 76, 70, 66,
    ],
    expected: [
      60, 56, 53, 50, 50, 57, 75, 96, 120, 134, 140, 136, 128, 133, 140, 142,
      134, 122, 106, 94, 85, 77, 71, 67,
    ],
  },
  "7d": {
    labels: ["−6k", "−5k", "−4k", "−3k", "−2k", "Kecha", "Bugun"],
    actual: [128, 134, 131, 126, 108, 74, 68],
    expected: [130, 132, 130, 128, 124, 76, 70],
  },
};

export function rangeSeries(rangeId) {
  const { labels, actual, expected } = series[rangeId];
  const band = BAND[rangeId];

  return labels.map((label, index) => ({
    label,
    actual: actual[index],
    expected: expected[index],
    low: expected[index] - band,
    high: expected[index] + band,
    anomaly:
      actual[index] < expected[index] - band ||
      actual[index] > expected[index] + band,
  }));
}

/* ---------------------------------------------------------------- events */

export const eventLog = [
  {
    id: "ev-01",
    severity: "critical",
    minutesAgo: 3,
    title: "SLA chegarasi buzildi",
    process: "BP-1024 · Ikkinchi tasdiqlash",
    detail: "Sikl vaqti 46 min — SLA 20 min",
  },
  {
    id: "ev-02",
    severity: "warning",
    minutesAgo: 8,
    title: "O‘tkazuvchanlik pasaydi",
    process: "Xaridlar bo‘limi",
    detail: "119 → 88 jarayon/soat, kutilgandan 25% past",
  },
  {
    id: "ev-03",
    severity: "info",
    minutesAgo: 14,
    title: "Navbat normallashdi",
    process: "BP-1066 · To‘lovlarni tasdiqlash",
    detail: "Kutish 0 min, barcha topshiriqlar oqimda",
  },
  {
    id: "ev-04",
    severity: "warning",
    minutesAgo: 22,
    title: "Qayta ishlash ko‘paydi",
    process: "BP-1053 · Tekshiruv",
    detail: "Qayta ishlash 12% — o‘rtachadan 2.4× yuqori",
  },
  {
    id: "ev-05",
    severity: "critical",
    minutesAgo: 37,
    title: "Anomaliya aniqlandi",
    process: "BP-1018 · Yuridik ko‘rik",
    detail: "38 min, prognoz koridori 22–28 min",
  },
  {
    id: "ev-06",
    severity: "info",
    minutesAgo: 52,
    title: "Model qayta o‘qitildi",
    process: "AI prognoz moduli",
    detail: "Ishonch darajasi 94% ga yangilandi",
  },
  {
    id: "ev-07",
    severity: "warning",
    minutesAgo: 95,
    title: "Kutish vaqti oshdi",
    process: "BP-1024 · Birinchi tasdiqlash",
    detail: "Kutish 12 min — kunlik o‘rtachadan 60% yuqori",
  },
  {
    id: "ev-08",
    severity: "info",
    minutesAgo: 143,
    title: "Jarayon tiklandi",
    process: "BP-1031 · IT resurslari",
    detail: "Risk 52 dan 43 ga tushdi",
  },
  {
    id: "ev-09",
    severity: "critical",
    minutesAgo: 218,
    title: "Kritik kechikish",
    process: "BP-1053 · Tekshiruv",
    detail: "32 min, SLA 24 min — 3 ta murojaat navbatda",
  },
  {
    id: "ev-10",
    severity: "warning",
    minutesAgo: 340,
    title: "Byudjet og‘ishi",
    process: "BP-1007 · Solishtirish",
    detail: "Rejadan 8.6% yuqori xarajat",
  },
  {
    id: "ev-11",
    severity: "info",
    minutesAgo: 610,
    title: "Kunlik yopilish yakunlandi",
    process: "BP-1007 · Oylik yopilish",
    detail: "86 min, SLA 82 min",
  },
  {
    id: "ev-12",
    severity: "warning",
    minutesAgo: 1180,
    title: "Kreativ bosqich cho‘zildi",
    process: "BP-1077 · Kreativ ishlab chiqish",
    detail: "34 min, SLA 30 min",
  },
  {
    id: "ev-13",
    severity: "info",
    minutesAgo: 2640,
    title: "Avtomatlashtirish yoqildi",
    process: "BP-1042 · Kvalifikatsiya",
    detail: "Avtomatik skoring ishga tushirildi",
  },
  {
    id: "ev-14",
    severity: "critical",
    minutesAgo: 4300,
    title: "Takroriy SLA buzilishi",
    process: "BP-1018 · Yuridik ko‘rik",
    detail: "Haftada 4-marta qayd etildi",
  },
];

export const rangeMinutes = { "1h": 60, "24h": 1440, "7d": 10080 };

const eventTemplates = [
  {
    severity: "warning",
    title: "Kutish vaqti oshdi",
    process: "BP-1024 · Ikkinchi tasdiqlash",
    detail: () =>
      `Kutish ${22 + Math.round(Math.random() * 14)} min — SLA dan yuqori`,
  },
  {
    severity: "info",
    title: "Topshiriq yakunlandi",
    process: "BP-1066 · Bank topshirig‘i",
    detail: () =>
      `${3 + Math.round(Math.random() * 9)} ta to‘lov oqimdan chiqdi`,
  },
  {
    severity: "critical",
    title: "Anomaliya aniqlandi",
    process: "BP-1053 · Tekshiruv",
    detail: () =>
      `${28 + Math.round(Math.random() * 12)} min, koridor 18–24 min`,
  },
  {
    severity: "warning",
    title: "O‘tkazuvchanlik pasaydi",
    process: "Sotuv bo‘limi",
    detail: () => `${86 + Math.round(Math.random() * 18)} jarayon/soat`,
  },
  {
    severity: "info",
    title: "Navbat normallashdi",
    process: "BP-1042 · Kvalifikatsiya",
    detail: () => "Kutish 0 min",
  },
  {
    severity: "warning",
    title: "Qayta ishlash qayd etildi",
    process: "BP-1018 · Yuridik ko‘rik",
    detail: () => `Qayta ishlash ${7 + Math.round(Math.random() * 8)}%`,
  },
  {
    severity: "info",
    title: "Bosqich tugadi",
    process: "BP-1031 · Kirish treningi",
    detail: () => "Barcha vazifalar muddatida",
  },
];

let counter = 0;

export function createEvent(previousTitle) {
  let template = eventTemplates[0];

  for (let attempt = 0; attempt < 6; attempt += 1) {
    template =
      eventTemplates[Math.floor(Math.random() * eventTemplates.length)];
    if (template.title !== previousTitle) break;
  }

  counter += 1;

  return {
    id: `live-${counter}`,
    severity: template.severity,
    title: template.title,
    process: template.process,
    detail: template.detail(),
    minutesAgo: 0,
  };
}

export function eventAge(minutesAgo) {
  if (minutesAgo < 1) return "hozirgina";
  if (minutesAgo < 60) return `${minutesAgo} daq oldin`;

  const hours = Math.floor(minutesAgo / 60);
  if (hours < 24) return `${hours} soat oldin`;

  return `${Math.floor(hours / 24)} kun oldin`;
}

/* ---------------------------------------------------------------- alerts */

export const smartAlerts = [
  {
    id: "al-1",
    severity: "critical",
    title: "Tasdiqlash navbati to‘planmoqda",
    process: "BP-1024",
    metric: "Kutish 22 min",
    threshold: "chegara 10 min",
    minutesAgo: 4,
  },
  {
    id: "al-2",
    severity: "critical",
    title: "Yuridik ko‘rik koridordan chiqdi",
    process: "BP-1018",
    metric: "38 min",
    threshold: "koridor 22–28 min",
    minutesAgo: 37,
  },
  {
    id: "al-3",
    severity: "warning",
    title: "Shikoyatlar navbati o‘smoqda",
    process: "BP-1053",
    metric: "3 ta navbatda",
    threshold: "chegara 2 ta",
    minutesAgo: 18,
  },
  {
    id: "al-4",
    severity: "warning",
    title: "Xarajat rejadan og‘di",
    process: "BP-1007",
    metric: "+8.6%",
    threshold: "chegara +5%",
    minutesAgo: 92,
  },
];

/* ------------------------------------------------------ bottleneck watch */

/**
 * SLA dan chiqqan bosqichlar — jarayonlar reyestridagi bir xil manbadan
 * hisoblanadi, shuning uchun ikki bo'lim raqamlari hech qachon ajralmaydi.
 */
export const bottleneckWatch = processes
  .flatMap((process) =>
    process.stages
      .filter((stage) => stageStatus(stage) !== "stable")
      .map((stage) => ({
        key: `${process.id}-${stage.name}`,
        processId: process.id,
        processName: process.name,
        stage: stage.name,
        avg: stage.avg,
        sla: stage.sla,
        wait: stage.wait,
        overrun: Math.round(((stage.avg - stage.sla) / stage.sla) * 100),
        tone: stageStatus(stage),
      })),
  )
  .sort((a, b) => b.overrun - a.overrun);

export const severityLabels = {
  critical: "Kritik",
  warning: "Ogohlantirish",
  info: "Ma’lumot",
};
