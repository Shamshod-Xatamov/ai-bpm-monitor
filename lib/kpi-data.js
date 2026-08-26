/**
 * KPI va BPEI ma'lumotlari.
 *
 * BPEI hech qayerda qat'iy yozilmaydi — u komponent ballari va ularning
 * vaznlaridan hisoblanadi. Shu sababli vazn o'zgarganda indeks ham, o'sish
 * foizi ham darhol qayta hisoblanadi.
 */

export const periods = [
  { id: "month", label: "Oy" },
  { id: "quarter", label: "Chorak" },
  { id: "year", label: "Yil" },
];

export const BPEI_TARGET = 88;

export const defaultWeights = {
  time: 30,
  quality: 20,
  cost: 20,
  sla: 20,
  automation: 10,
};

export const bpeiComponents = [
  {
    id: "time",
    label: "Vaqt samaradorligi",
    hint: "Sikl vaqti SLA ga nisbatan",
    scores: { month: 78, quarter: 76, year: 73 },
    previous: { month: 74, quarter: 72, year: 70 },
  },
  {
    id: "quality",
    label: "Sifat",
    hint: "Qayta ishlash va xatolar darajasi",
    scores: { month: 86, quarter: 85, year: 83 },
    previous: { month: 83, quarter: 82, year: 80 },
  },
  {
    id: "cost",
    label: "Xarajat samaradorligi",
    hint: "Bir instansiyaga to‘g‘ri keladigan xarajat",
    scores: { month: 88, quarter: 86, year: 84 },
    previous: { month: 85, quarter: 83, year: 81 },
  },
  {
    id: "sla",
    label: "SLA bajarilishi",
    hint: "Muddatida yakunlangan jarayonlar ulushi",
    scores: { month: 91, quarter: 90, year: 88 },
    previous: { month: 89, quarter: 88, year: 86 },
  },
  {
    id: "automation",
    label: "Avtomatlashtirish",
    hint: "Qo‘lsiz bajariladigan qadamlar ulushi",
    scores: { month: 82, quarter: 79, year: 74 },
    previous: { month: 76, quarter: 73, year: 68 },
  },
];

/** Vazndan qat'i nazar to‘g‘ri ishlaydigan vaznli o‘rtacha. */
export function weightedIndex(weights, period, key = "scores") {
  const total = bpeiComponents.reduce(
    (sum, item) => sum + (weights[item.id] ?? 0),
    0,
  );
  if (!total) return 0;

  return (
    bpeiComponents.reduce(
      (sum, item) => sum + item[key][period] * (weights[item.id] ?? 0),
      0,
    ) / total
  );
}

export const weightShare = (weights, id) => {
  const total = Object.values(weights).reduce((sum, value) => sum + value, 0);
  return total ? (weights[id] / total) * 100 : 0;
};

/* -------------------------------------------------------------------- KPI */

export const kpiRegister = [
  {
    id: "kpi-1",
    name: "O‘rtacha sikl vaqti",
    department: "Operatsiyalar",
    unit: "min",
    direction: "down",
    target: 75,
    values: { month: 90, quarter: 94, year: 101 },
    trend: [104, 101, 99, 97, 95, 93, 91, 90],
  },
  {
    id: "kpi-2",
    name: "SLA bajarilishi",
    department: "Operatsiyalar",
    unit: "%",
    direction: "up",
    target: 90,
    values: { month: 91.4, quarter: 90.2, year: 88.1 },
    trend: [87, 88, 88, 89, 90, 90, 91, 91.4],
  },
  {
    id: "kpi-3",
    name: "Qayta ishlash darajasi",
    department: "Sifat nazorati",
    unit: "%",
    direction: "down",
    target: 5,
    values: { month: 5.4, quarter: 5.9, year: 6.8 },
    trend: [7.1, 6.8, 6.5, 6.2, 6.0, 5.7, 5.5, 5.4],
  },
  {
    id: "kpi-4",
    name: "Birinchi urinishda tasdiqlash",
    department: "Xaridlar",
    unit: "%",
    direction: "up",
    target: 80,
    values: { month: 74, quarter: 72, year: 69 },
    trend: [68, 69, 70, 70, 72, 73, 73, 74],
  },
  {
    id: "kpi-5",
    name: "Bir jarayon xarajati",
    department: "Moliya",
    unit: "ming so‘m",
    direction: "down",
    target: 45,
    values: { month: 42, quarter: 44, year: 47 },
    trend: [49, 48, 46, 46, 44, 43, 43, 42],
  },
  {
    id: "kpi-6",
    name: "Avtomatlashtirilgan qadamlar",
    department: "IT",
    unit: "%",
    direction: "up",
    target: 60,
    values: { month: 56, quarter: 52, year: 45 },
    trend: [44, 46, 48, 50, 51, 53, 55, 56],
  },
  {
    id: "kpi-7",
    name: "Muddatida yopilgan topshiriqlar",
    department: "HR",
    unit: "%",
    direction: "up",
    target: 90,
    values: { month: 94, quarter: 93, year: 91 },
    trend: [90, 91, 91, 92, 92, 93, 94, 94],
  },
  {
    id: "kpi-8",
    name: "Mijozga javob vaqti",
    department: "Xizmat ko‘rsatish",
    unit: "soat",
    direction: "down",
    target: 4,
    values: { month: 3.2, quarter: 3.6, year: 4.3 },
    trend: [4.6, 4.4, 4.1, 3.9, 3.7, 3.5, 3.3, 3.2],
  },
];

export function kpiStatus(kpi, value) {
  const ratio =
    kpi.direction === "down" ? kpi.target / value : value / kpi.target;

  if (ratio >= 1) return "achieved";
  if (ratio >= 0.92) return "risk";
  return "missed";
}

/** Maqsadga nisbatan bajarilish foizi (100% dan oshishi mumkin). */
export function kpiProgress(kpi, value) {
  const ratio =
    kpi.direction === "down" ? kpi.target / value : value / kpi.target;
  return ratio * 100;
}

export const kpiStatusLabels = {
  achieved: "Bajarildi",
  risk: "Xavf ostida",
  missed: "Bajarilmadi",
};

/* ----------------------------------------------------------- comparison */

const matrixBase = {
  Moliya: { time: 88, quality: 91, cost: 93, sla: 94, automation: 86 },
  "Xizmat ko‘rsatish": {
    time: 74,
    quality: 79,
    cost: 84,
    sla: 82,
    automation: 77,
  },
  Marketing: { time: 82, quality: 87, cost: 85, sla: 89, automation: 74 },
  Sotuv: { time: 85, quality: 82, cost: 80, sla: 88, automation: 90 },
  HR: { time: 79, quality: 84, cost: 82, sla: 91, automation: 71 },
  Xaridlar: { time: 61, quality: 72, cost: 76, sla: 68, automation: 64 },
};

/**
 * Uzoqroq davr o‘rtachasi pastroq bo‘ladi — bir xil siljish barcha katakka
 * qo‘llanadi, shunda matritsa tanlangan davrga mos qoladi.
 */
const periodShift = { month: 0, quarter: 2, year: 4 };

export function comparisonMatrix(period) {
  const shift = periodShift[period];

  return Object.entries(matrixBase).map(([department, scores]) => {
    const cells = bpeiComponents.map((component) => ({
      id: component.id,
      label: component.label,
      score: Math.max(0, scores[component.id] - shift),
    }));

    return {
      department,
      cells,
      average: Math.round(
        cells.reduce((sum, cell) => sum + cell.score, 0) / cells.length,
      ),
    };
  });
}

export function scoreBand(score) {
  if (score >= 88) return "strong";
  if (score >= 80) return "good";
  if (score >= 72) return "watch";
  return "weak";
}
