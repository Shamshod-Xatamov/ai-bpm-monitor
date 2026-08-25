/**
 * Operatsion telemetriya oqimi.
 *
 * Ko‘rsatkichlar mean-reverting random walk bo‘yicha siljiydi: har bir qadam
 * kichik tasodifiy og‘ish beradi, lekin qiymat o‘z tayanch darajasiga qaytadi.
 * Shu sababli panel jonli ko‘rinadi, ammo hech qachon real bo‘lmagan zonaga
 * chiqib ketmaydi.
 */

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

function drift(value, { anchor, step, min, max }) {
  const pull = (anchor - value) * 0.16;
  const noise = (Math.random() - 0.5) * 2 * step;
  return clamp(value + pull + noise, min, max);
}

const BASELINE_BPEI = 81.2;

const shape = {
  bpei: { anchor: 84.9, step: 0.24, min: 82.6, max: 87.4 },
  kpi: { anchor: 87.4, step: 0.3, min: 84.2, max: 90.8 },
  economicImpact: { anchor: 414, step: 3.4, min: 394, max: 441 },
  confidence: { anchor: 94.4, step: 0.8, min: 89, max: 98 },
  throughput: { anchor: 119, step: 2.6, min: 102, max: 138 },
  sla: { anchor: 92.6, step: 0.55, min: 88.2, max: 96.6 },
};

/** SSR va birinchi client render bir xil bo‘lishi uchun qat’iy boshlang‘ich holat. */
export const initialSnapshot = {
  bpei: 84.6,
  kpi: 87.2,
  activeProcesses: 24,
  criticalRisks: 3,
  economicImpact: 410,
  confidence: 94,
  delta: 4.2,
  throughput: 118,
  sla: 92.4,
  trend: [69, 71, 72, 71, 75, 77, 79, 78, 82, 83, 85, 84.6],
};

function stepInteger(value, min, max, probability) {
  if (Math.random() > probability) return value;
  return clamp(value + (Math.random() > 0.5 ? 1 : -1), min, max);
}

export function advanceSnapshot(previous) {
  const bpei = drift(previous.bpei, shape.bpei);
  const trend = [...previous.trend.slice(0, -1), Number(bpei.toFixed(1))];

  return {
    bpei,
    kpi: drift(previous.kpi, shape.kpi),
    economicImpact: drift(previous.economicImpact, shape.economicImpact),
    confidence: drift(previous.confidence, shape.confidence),
    throughput: drift(previous.throughput, shape.throughput),
    sla: drift(previous.sla, shape.sla),
    activeProcesses: stepInteger(previous.activeProcesses, 22, 27, 0.35),
    criticalRisks: stepInteger(previous.criticalRisks, 1, 4, 0.28),
    delta: ((bpei - BASELINE_BPEI) / BASELINE_BPEI) * 100,
    trend,
  };
}

/* ---------------------------------------------------------------- signals */

const round = (value, digits = 0) => Number(value.toFixed(digits));

const signalTemplates = [
  (s) => ({
    tone: "critical",
    process: "BP-1024",
    text: `Xaridlarni tasdiqlash bosqichida ${round(38 + Math.random() * 26)} daqiqalik qo‘shimcha kechikish qayd etildi`,
  }),
  (s) => ({
    tone: "stable",
    process: "Moliya",
    text: `Moliya bo‘limida KPI ko‘rsatkichi ${round(s.kpi, 1)}% darajasiga chiqdi`,
  }),
  () => ({
    tone: "stable",
    process: "BP-1018",
    text: "Shartnoma kelishuvi riski kritik zonadan kuzatuv zonasiga o‘tdi",
  }),
  (s) => ({
    tone: "warning",
    process: "BP-1007",
    text: `Oylik yopilish oqimi SLA chegarasidan ${round(4 + Math.random() * 9)}% chetlashdi`,
  }),
  (s) => ({
    tone: "stable",
    process: "Portfel",
    text: `Sof iqtisodiy ta’sir prognozi ${round(s.economicImpact)} mln so‘mga yangilandi`,
  }),
  () => ({
    tone: "warning",
    process: "BP-1042",
    text: "Sotuv leadlari oqimida takroriy tasdiqlash aniqlandi",
  }),
  (s) => ({
    tone: "stable",
    process: "AI model",
    text: `Prognoz modeli qayta o‘qitildi — ishonch darajasi ${round(s.confidence)}%`,
  }),
  (s) => ({
    tone: "warning",
    process: "BP-1031",
    text: `Onboarding jarayonida ${round(2 + Math.random() * 4)} ta vazifa muddatidan chiqdi`,
  }),
  (s) => ({
    tone: "critical",
    process: "Xaridlar",
    text: `Xaridlar bo‘limi BPEI ko‘rsatkichi ${round(s.bpei - 6.4, 1)} ballga tushdi`,
  }),
  (s) => ({
    tone: "stable",
    process: "Operatsiyalar",
    text: `Kunlik o‘tkazuvchanlik ${round(s.throughput)} ta jarayon/soatga yetdi`,
  }),
];

let signalCounter = 0;

export function createSignal(snapshot, previousText) {
  let candidate;

  // Ketma-ket bir xil matn chiqmasligi uchun boshqa shablon tanlanadi.
  for (let attempt = 0; attempt < 6; attempt += 1) {
    candidate =
      signalTemplates[Math.floor(Math.random() * signalTemplates.length)](
        snapshot,
      );
    if (candidate.text !== previousText) break;
  }

  signalCounter += 1;

  return { ...candidate, id: `sig-${signalCounter}`, at: Date.now() };
}

export const initialSignal = {
  id: "sig-0",
  tone: "stable",
  process: "Operatsiyalar",
  text: "Barcha kritik jarayonlar bo‘yicha telemetriya sinxronlandi",
  at: null,
};

/* ------------------------------------------------------------ formatting */

export function relativeTime(at, now) {
  if (!at) return "hozirgina";

  const seconds = Math.max(0, Math.round((now - at) / 1000));
  if (seconds < 10) return "hozirgina";
  if (seconds < 60) return `${seconds} s oldin`;

  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} daq oldin`;

  return `${Math.round(minutes / 60)} soat oldin`;
}

export function clockTime(date) {
  return new Intl.DateTimeFormat("uz-UZ", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
}
