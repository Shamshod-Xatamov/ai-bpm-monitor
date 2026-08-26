/**
 * Prognoz ma'lumotlari.
 *
 * Har bir prognozda fakt qatori (`history`) va prognoz qatori (`path`) bir xil
 * o'lchov birligida beriladi, shuning uchun grafik uzluksiz o'qiladi. Ishonch
 * oralig'i `sigma` dan `sqrt(t)` qonuni bo'yicha kengayadi — gorizont uzoqlashgani
 * sari noaniqlik ortishi vizual ravishda ko'rinadi.
 *
 * Omillar `share` ulushi bilan beriladi va ulushlar yig'indisi doim 1 ga teng.
 * Shu sababli omillar hissasi hech qachon jami o'zgarishga zid bo'lmaydi.
 */

/** Ishonch oralig'i darajasi va unga mos z-koeffitsiyent. */
export const CONFIDENCE_LEVEL = 90;
const Z_SCORE = 1.645;

export const horizons = [
  { id: 4, label: "4 hafta" },
  { id: 8, label: "8 hafta" },
  { id: 12, label: "12 hafta" },
];

export const categories = [
  { id: "all", label: "Barchasi" },
  { id: "time", label: "Muddat" },
  { id: "cost", label: "Xarajat" },
  { id: "efficiency", label: "Samaradorlik" },
  { id: "resource", label: "Resurs" },
];

export const categoryLabels = {
  time: "Muddat",
  cost: "Xarajat",
  efficiency: "Samaradorlik",
  resource: "Resurs",
};

export const riskLabels = {
  critical: "Yuqori xavf",
  warning: "E’tiborda",
  positive: "Maqsad ichida",
};

export const forecasts = [
  {
    id: "P-1024",
    category: "time",
    risk: "critical",
    title: "Tasdiqlash sikli chegaradan uzoqlashib bormoqda",
    target: "BP-1024 · Xaridlarni tasdiqlash",
    metric: "Sikl vaqti",
    unit: "min",
    precision: 0,
    worseWhen: "up",
    threshold: 50,
    thresholdLabel: "Reja chegarasi",
    history: [31, 33, 32, 35, 38, 37, 41, 43, 44, 46],
    path: [
      47.4, 48.6, 49.5, 50.2, 51.4, 52.3, 53.0, 53.9, 54.6, 55.2, 55.8, 56.3,
    ],
    sigma: 1.35,
    impactPerMonth: -42,
    summary:
      "Model oxirgi 10 haftalik trend va navbat uzunligiga tayanib, jarayon o‘z-o‘zidan barqarorlashmasligini ko‘rsatmoqda. Bugun ko‘rsatkich reja chegarasidan sal pastda, ammo to‘rtinchi haftadan boshlab uni barqaror ravishda buzadi.",
    drivers: [
      { label: "Tasdiqlovchi navbatida kutish", share: 0.52 },
      { label: "Hujjatlar to‘liqsizligi", share: 0.23 },
      { label: "So‘rovlar hajmining o‘sishi", share: 0.18 },
      { label: "Mavsumiy yuklama", share: 0.12 },
      { label: "Avtomatik yo‘naltirish", share: -0.05 },
    ],
    levers: [
      {
        id: "parallel",
        label: "Parallel tasdiqlash ulushi",
        unit: "%",
        min: 0,
        max: 80,
        step: 5,
        base: 0,
        effect: -0.28,
      },
      {
        id: "auto",
        label: "Avtomatik yo‘naltirish chegarasi",
        unit: "mln so‘m",
        min: 0,
        max: 100,
        step: 10,
        base: 0,
        effect: -0.11,
      },
      {
        id: "volume",
        label: "So‘rovlar hajmi o‘zgarishi",
        unit: "%",
        min: -20,
        max: 40,
        step: 5,
        base: 0,
        effect: 0.34,
      },
    ],
    recommendation:
      "Ikkinchi tasdiqlovchini parallel oqimga o‘tkazing va 50 mln so‘mgacha bo‘lgan xaridlarni avtomatik yo‘naltiring — simulyatsiya bo‘yicha bu prognozni chegara koridoriga qaytaradi.",
  },
  {
    id: "P-1007",
    category: "cost",
    risk: "warning",
    title: "Oylik yopilishda xarajat og‘ishi o‘sishda davom etadi",
    target: "BP-1007 · Oylik moliyaviy yopilish",
    metric: "Xarajat og‘ishi",
    unit: "%",
    precision: 1,
    worseWhen: "up",
    threshold: 9.5,
    thresholdLabel: "Byudjet chegarasi",
    history: [4.1, 3.8, 4.4, 5.0, 5.6, 6.1, 6.8, 7.4, 8.0, 8.6],
    path: [8.9, 9.2, 9.4, 9.7, 9.9, 10.2, 10.4, 10.7, 10.9, 11.1, 11.3, 11.5],
    sigma: 0.42,
    impactPerMonth: -28,
    summary:
      "Og‘ishning asosiy qismi qo‘lda solishtirishga sarflanadigan qo‘shimcha soatlardan iborat. Xatolar sikl oxirida topilgani uchun tuzatish narxi har oy oshib bormoqda.",
    drivers: [
      { label: "Qo‘lda solishtirish soatlari", share: 0.46 },
      { label: "Oxirgi kundagi tuzatishlar", share: 0.27 },
      { label: "Tashqi audit talablari", share: 0.19 },
      { label: "Boshqa omillar", share: 0.14 },
      { label: "Avtomatik solishtirish", share: -0.06 },
    ],
    levers: [
      {
        id: "reconcile",
        label: "Avtomatik solishtirish qamrovi",
        unit: "%",
        min: 0,
        max: 100,
        step: 10,
        base: 0,
        effect: -0.052,
      },
      {
        id: "analyst",
        label: "Qo‘shimcha analitik",
        unit: "kishi",
        min: 0,
        max: 4,
        step: 1,
        base: 0,
        effect: -0.35,
      },
      {
        id: "audit",
        label: "Audit talablarining o‘sishi",
        unit: "%",
        min: 0,
        max: 30,
        step: 5,
        base: 0,
        effect: 0.06,
      },
    ],
    recommendation:
      "Kunlik avtomatik solishtirishni yoqing va og‘ish 2% dan oshganda signal bering — xatolar sikl oxirida emas, yuzaga kelgan kunida tuziladi.",
  },
  {
    id: "P-DEP-01",
    category: "efficiency",
    risk: "warning",
    title: "Xaridlar bo‘limi BPEI maqsad koridoridan pastda qoladi",
    target: "Xaridlar bo‘limi",
    metric: "BPEI",
    unit: "ball",
    precision: 1,
    worseWhen: "down",
    threshold: 58,
    thresholdLabel: "Maqsad daraja",
    history: [72, 71, 70, 68, 67, 66, 64, 63, 62, 61],
    path: [
      60.2, 59.5, 58.9, 58.2, 57.6, 57.1, 56.5, 56.0, 55.6, 55.1, 54.7, 54.3,
    ],
    sigma: 1.1,
    impactPerMonth: -19,
    summary:
      "Indeks pasayishi bitta jarayonga bog‘liq — og‘ishning 78%i xaridlarni tasdiqlash oqimidan kelmoqda. BP-1024 tiklanmasa, bo‘lim indeksi beshinchi hafta atrofida maqsad darajasidan pastga tushadi.",
    drivers: [
      { label: "Vaqt samaradorligi tushishi", share: 0.49 },
      { label: "Birinchi urinishda tasdiqlash", share: 0.26 },
      { label: "Avtomatlashtirish sekinligi", share: 0.19 },
      { label: "Boshqa omillar", share: 0.12 },
      { label: "Xarajat nazorati yaxshilanishi", share: -0.06 },
    ],
    levers: [
      {
        id: "cycle",
        label: "BP-1024 sikl vaqtini qisqartirish",
        unit: "%",
        min: 0,
        max: 40,
        step: 5,
        base: 0,
        effect: 0.42,
      },
      {
        id: "automation",
        label: "Avtomatlashtirish qamrovi",
        unit: "%",
        min: 0,
        max: 50,
        step: 5,
        base: 0,
        effect: 0.24,
      },
      {
        id: "turnover",
        label: "Xodimlar almashinuvi",
        unit: "%",
        min: 0,
        max: 20,
        step: 2,
        base: 0,
        effect: -0.5,
      },
    ],
    recommendation:
      "Bo‘lim rejasini BP-1024 jarayonini tiklashga qarating — qolgan to‘rt jarayon prognozi maqsad ichida qolmoqda.",
  },
  {
    id: "P-1053",
    category: "efficiency",
    risk: "warning",
    title: "Shikoyatlarda qayta ishlash ulushi yuqori bo‘lib qoladi",
    target: "BP-1053 · Mijoz shikoyatlari",
    metric: "Qayta ishlash ulushi",
    unit: "%",
    precision: 1,
    worseWhen: "up",
    threshold: 13,
    thresholdLabel: "Sifat chegarasi",
    history: [8.4, 8.9, 9.3, 9.8, 10.2, 10.6, 11.1, 11.4, 11.8, 12.0],
    path: [
      12.3, 12.5, 12.8, 13.0, 13.2, 13.4, 13.6, 13.7, 13.9, 14.1, 14.2, 14.4,
    ],
    sigma: 0.5,
    impactPerMonth: -14,
    summary:
      "Tasniflash bosqichida noto‘g‘ri belgilangan murojaatlar tekshiruvdan qaytmoqda. Yangi xodimlar ulushi saqlanib qolsa, ko‘rsatkich to‘rtinchi haftada sifat chegarasini buzadi.",
    drivers: [
      { label: "Noto‘g‘ri tasniflash", share: 0.44 },
      { label: "Sifat mezonlari noaniqligi", share: 0.25 },
      { label: "Yangi xodimlar ulushi", share: 0.22 },
      { label: "Mavsumiy murojaat oqimi", share: 0.13 },
      { label: "Avtomatik tekshiruv", share: -0.04 },
    ],
    levers: [
      {
        id: "tree",
        label: "Qaror daraxti qamrovi",
        unit: "%",
        min: 0,
        max: 100,
        step: 10,
        base: 0,
        effect: -0.028,
      },
      {
        id: "review",
        label: "Ikkilamchi tekshiruv davri",
        unit: "hafta",
        min: 0,
        max: 4,
        step: 1,
        base: 0,
        effect: -0.42,
      },
      {
        id: "newcomers",
        label: "Yangi xodimlar ulushi",
        unit: "%",
        min: 0,
        max: 30,
        step: 5,
        base: 0,
        effect: 0.09,
      },
    ],
    recommendation:
      "Tasniflash uchun qaror daraxtini joriy eting va yangi xodimlarga birinchi ikki hafta uchun ikkilamchi tekshiruv qo‘shing.",
  },
  {
    id: "P-1042",
    category: "time",
    risk: "positive",
    title: "Sotuv leadlari sikli barqaror qisqarishda davom etadi",
    target: "BP-1042 · Sotuv leadlari",
    metric: "Sikl vaqti",
    unit: "min",
    precision: 0,
    worseWhen: "up",
    threshold: 60,
    thresholdLabel: "Xizmat chegarasi",
    history: [69, 67, 66, 64, 61, 59, 57, 55, 54, 52],
    path: [
      51.2, 50.5, 49.9, 49.4, 48.8, 48.4, 47.9, 47.6, 47.2, 46.9, 46.6, 46.3,
    ],
    sigma: 1.2,
    impactPerMonth: 23,
    summary:
      "Avtomatik skoring yoqilgandan keyingi pasayish trendi barqaror. Hajm 18% o‘sganiga qaramay prognoz koridori chegaradan uzoqlashmoqda — bu naqsh boshqa oqimlarga ko‘chirilishi mumkin.",
    drivers: [
      { label: "Avtomatik skoring", share: 0.55 },
      { label: "Takroriy tasdiqlash olib tashlandi", share: 0.28 },
      { label: "Lead sifatining oshishi", share: 0.23 },
      { label: "Hajm o‘sishi", share: -0.06 },
    ],
    levers: [
      {
        id: "coverage",
        label: "Skoring qoidalari qamrovi",
        unit: "%",
        min: 0,
        max: 100,
        step: 10,
        base: 0,
        effect: -0.06,
      },
      {
        id: "leadVolume",
        label: "Lead hajmi o‘zgarishi",
        unit: "%",
        min: -10,
        max: 50,
        step: 5,
        base: 0,
        effect: 0.12,
      },
    ],
    recommendation:
      "Shu skoring qoidalarini BP-1053 tasniflash bosqichiga ko‘chiring — jarayonlar o‘xshashligi 0.82, kutilayotgan samara oyiga 9 mln so‘m.",
  },
  {
    id: "P-RES-01",
    category: "resource",
    risk: "critical",
    title: "Yuridik bo‘lim yuklamasi sig‘imdan oshib ketadi",
    target: "Yuridik bo‘lim · Haftalik yuklama",
    metric: "Talab qilinadigan resurs",
    unit: "soat/hafta",
    precision: 0,
    worseWhen: "up",
    threshold: 320,
    thresholdLabel: "Bo‘lim sig‘imi",
    history: [268, 274, 279, 284, 289, 294, 299, 304, 309, 314],
    path: [316, 318, 321, 325, 329, 333, 337, 341, 345, 349, 353, 357],
    sigma: 6.5,
    impactPerMonth: -16,
    summary:
      "Shartnomalar oqimi va shablondan chetlashishlar birgalikda yuklamani sig‘imdan yuqoriga olib chiqmoqda. Prognoz bo‘yicha sig‘im uchinchi haftada buziladi — bu barcha kuzatuvdagi prognozlar ichida eng yaqin chegara buzilishi.",
    drivers: [
      { label: "Shartnomalar oqimining o‘sishi", share: 0.47 },
      { label: "Shablondan chetlashish", share: 0.29 },
      { label: "Takroriy kelishuv sikli", share: 0.18 },
      { label: "Boshqa omillar", share: 0.11 },
      { label: "Standart shablon ulushi", share: -0.05 },
    ],
    levers: [
      {
        id: "template",
        label: "Standart shablon ulushi",
        unit: "%",
        min: 0,
        max: 80,
        step: 5,
        base: 0,
        effect: -0.9,
      },
      {
        id: "fastlane",
        label: "Tezkor yo‘lak qamrovi",
        unit: "%",
        min: 0,
        max: 60,
        step: 5,
        base: 0,
        effect: -1.2,
      },
      {
        id: "contracts",
        label: "Shartnomalar hajmi o‘zgarishi",
        unit: "%",
        min: -10,
        max: 40,
        step: 5,
        base: 0,
        effect: 2.6,
      },
    ],
    recommendation:
      "Shablonga mos shartnomalarni tezkor yo‘lakka o‘tkazing — simulyatsiya bo‘yicha bu sig‘im buzilishini chorak oxiridan narigi tomonga suradi.",
  },
];

/* -------------------------------------------------------------- helpers */

/** Prognozning tanlangan gorizontdagi markaziy qiymati. */
export const projectedAt = (forecast, weeks) =>
  forecast.path[Math.min(weeks, forecast.path.length) - 1];

/** Prognoz noaniqligi — standart og'ish sqrt(t) bo'yicha o'sadi. */
export const sigmaAt = (forecast, weeks) => forecast.sigma * Math.sqrt(weeks);

/** Ishonch oralig'ining yarim kengligi. */
export const bandAt = (forecast, step) => sigmaAt(forecast, step) * Z_SCORE;

/** Normal taqsimot zichligi — ridgeline egri chiziqlari shundan quriladi. */
export const normalPdf = (x, mu, sigma) =>
  Math.exp(-((x - mu) ** 2) / (2 * sigma * sigma)) /
  (sigma * Math.sqrt(2 * Math.PI));

/** Joriy (oxirgi fakt) qiymat. */
export const currentValue = (forecast) => forecast.history.at(-1);

/** Abramowitz–Stegun 7.1.26 yaqinlashuvi. */
function erf(x) {
  const sign = x < 0 ? -1 : 1;
  const absX = Math.abs(x);
  const t = 1 / (1 + 0.3275911 * absX);
  const y =
    1 -
    ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) *
      t +
      0.254829592) *
      t *
      Math.exp(-absX * absX);

  return sign * y;
}

const normalCdf = (z) => 0.5 * (1 + erf(z / Math.SQRT2));

/**
 * Berilgan gorizontda chegaradan chiqish ehtimoli.
 * Noaniqlik grafikdagi ishonch oralig'i bilan bir xil sigmadan hisoblanadi.
 */
export function breachProbability(forecast, value, weeks) {
  const z = (forecast.threshold - value) / sigmaAt(forecast, weeks);

  return Math.round(
    (forecast.worseWhen === "up" ? 1 - normalCdf(z) : normalCdf(z)) * 100,
  );
}

/** Qiymat chegaradan tashqaridami. */
export const isBreaching = (forecast, value) =>
  forecast.worseWhen === "up"
    ? value > forecast.threshold
    : value < forecast.threshold;

/**
 * Chegara hali buzilmagan bo'lsa — buzilishgacha necha hafta qolgani.
 * Chegara allaqachon buzilgan yoki prognoz unga yetmasa `null` qaytadi.
 */
export function weeksToBreach(forecast) {
  if (isBreaching(forecast, currentValue(forecast))) return null;

  const index = forecast.path.findIndex((value) =>
    isBreaching(forecast, value),
  );
  return index === -1 ? null : index + 1;
}

/** Omil hissasi: ulush × umumiy o'zgarish. */
export const contribution = (forecast, driver, weeks) =>
  driver.share * (projectedAt(forecast, weeks) - currentValue(forecast));

/** O'zgarish ko'rsatkichni yomonlashtiryaptimi. */
export const isAdverse = (forecast, delta) =>
  forecast.worseWhen === "up" ? delta > 0 : delta < 0;

/** Richag ta'siri gorizontga mutanosib qo'llanadi — aralashuv bir zumda ishlamaydi. */
export const leverImpact = (lever, value, weeks) =>
  (value - lever.base) * lever.effect * (weeks / 12);

export const formatSigned = (value, digits = 1) =>
  `${value > 0 ? "+" : value < 0 ? "−" : ""}${Math.abs(value).toFixed(digits)}`;

/* ---------------------------------------------------------------- model */

export const model = {
  name: "BPM Forecast Ensemble v3",
  method: "Gradient boosting + mavsumiy dekompozitsiya",
  trainedAgo: "6 soat oldin",
  dataset: "18 240 ta jarayon instansiyasi",
  features: 38,
  mape: 8.4,
  mapeTrend: [12.6, 11.8, 11.1, 10.4, 9.7, 9.2, 8.8, 8.4],
  /** Faktlarning necha foizi 90% ishonch oralig'i ichiga tushgan. */
  coverage: 91,
  /**
   * Kalibratsiya: model shu ehtimollikni bergan hollarda hodisa aslida necha
   * foiz hollarda ro'y bergan. Diagonalga yaqinlik — model o'ziga to'g'ri baho
   * berayotganini bildiradi.
   */
  calibration: [
    { predicted: 10, observed: 8, n: 142 },
    { predicted: 30, observed: 26, n: 118 },
    { predicted: 50, observed: 52, n: 96 },
    { predicted: 70, observed: 74, n: 88 },
    { predicted: 90, observed: 88, n: 134 },
  ],
  horizonReliability: [
    { label: "1–4 hafta", mape: 5.2 },
    { label: "5–8 hafta", mape: 8.6 },
    { label: "9–12 hafta", mape: 13.4 },
  ],
};
