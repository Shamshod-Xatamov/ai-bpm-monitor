/**
 * AI tahlil ma'lumotlari.
 *
 * Har bir topilmada og'ishning sababi omillarga taqsimlanadi. Omillar
 * yig'indisi har doim umumiy og'ishga teng — shuning uchun grafik va sarlavhadagi
 * raqam hech qachon bir-biriga zid bo'lmaydi.
 */

export const findingTypes = [
  { id: "all", label: "Barchasi" },
  { id: "anomaly", label: "Anomaliya" },
  { id: "pattern", label: "Naqsh" },
  { id: "cause", label: "Sabab" },
];

export const typeLabels = {
  anomaly: "Anomaliya",
  pattern: "Naqsh",
  cause: "Sabab tahlili",
};

export const severityLabels = {
  critical: "Kritik",
  warning: "Diqqatda",
  positive: "Ijobiy",
};

export const findings = [
  {
    id: "F-01",
    type: "anomaly",
    severity: "critical",
    confidence: 96,
    title: "Ikkinchi tasdiqlash bosqichida tizimli kechikish",
    process: "BP-1024 · Xaridlarni tasdiqlash",
    metric: { label: "Sikl vaqti", actual: 46, expected: 20, unit: "min" },
    worseWhen: "up",
    summary:
      "Model 412 ta instansiyani tahlil qilib, kechikish tasodifiy emas, balki bitta tasdiqlovchiga bog‘liq tizimli to‘siq ekanini aniqladi. Og‘ishning yarmidan ko‘pi navbatda kutishdan kelib chiqmoqda.",
    drivers: [
      { label: "Tasdiqlovchi navbatida kutish", value: 14.2 },
      { label: "Hujjatlar to‘liqsizligi", value: 6.4 },
      { label: "Bir vaqtda kelgan so‘rovlar", value: 4.1 },
      { label: "Boshqa omillar", value: 3.1 },
      { label: "Avtomatik yo‘naltirish", value: -1.8 },
    ],
    evidence: ["412 ta instansiya", "so‘nggi 30 kun", "p < 0.01"],
    recommendation:
      "Ikkinchi tasdiqlovchini parallel oqimga o‘tkazing va 50 mln so‘mgacha bo‘lgan xaridlarni avtomatik yo‘naltiring.",
  },
  {
    id: "F-02",
    type: "anomaly",
    severity: "critical",
    confidence: 91,
    title: "Yuridik ko‘rik prognoz koridoridan chiqdi",
    process: "BP-1018 · Shartnoma kelishuvi",
    metric: { label: "Sikl vaqti", actual: 38, expected: 25, unit: "min" },
    worseWhen: "up",
    summary:
      "Shablondan chetlashgan shartnomalar to‘liq ko‘rikka tushmoqda. Model bu chetlashishlarning 74%ida hech qanday moddiy o‘zgarish yo‘qligini aniqladi.",
    drivers: [
      { label: "Shablondan chetlashish", value: 7.6 },
      { label: "Yurist bandligi", value: 4.2 },
      { label: "Takroriy kelishuv sikli", value: 2.9 },
      { label: "Standart shablon ulushi", value: -1.7 },
    ],
    evidence: ["96 ta shartnoma", "so‘nggi 60 kun", "ishonch 91%"],
    recommendation:
      "Shablonga mos shartnomalarni tezkor yo‘lakka o‘tkazing, faqat chetlashishlarni yuristga yo‘naltiring.",
  },
  {
    id: "F-03",
    type: "pattern",
    severity: "warning",
    confidence: 88,
    title: "Shikoyatlarda takroriy qayta ishlash naqshi",
    process: "BP-1053 · Mijoz shikoyatlari",
    metric: { label: "Qayta ishlash", actual: 12, expected: 5, unit: "%" },
    worseWhen: "up",
    summary:
      "Tasniflash bosqichida noto‘g‘ri belgilangan murojaatlar tekshiruvdan qaytmoqda. Naqsh haftaning birinchi ikki kunida kuchayadi.",
    drivers: [
      { label: "Noto‘g‘ri tasniflash", value: 3.8 },
      { label: "Sifat mezonlari noaniqligi", value: 2.4 },
      { label: "Yangi xodimlar ulushi", value: 1.6 },
      { label: "Avtomatik tekshiruv", value: -0.8 },
    ],
    evidence: ["218 ta murojaat", "so‘nggi 45 kun", "ishonch 88%"],
    recommendation:
      "Tasniflash uchun qaror daraxtini joriy eting va yangi xodimlarga birinchi 2 hafta uchun ikkilamchi tekshiruv qo‘shing.",
  },
  {
    id: "F-04",
    type: "cause",
    severity: "warning",
    confidence: 93,
    title: "Xaridlar bo‘limi BPEI pasayishining sababi",
    process: "Xaridlar bo‘limi",
    metric: { label: "BPEI", actual: 61, expected: 78, unit: "ball" },
    worseWhen: "down",
    summary:
      "Bo‘lim indeksining pasayishi bitta jarayonga bog‘liq: og‘ishning 78%i xaridlarni tasdiqlash oqimidan kelmoqda. Xarajat nazorati esa aksincha yaxshilangan.",
    drivers: [
      { label: "Vaqt samaradorligi tushishi", value: -8.4 },
      { label: "Birinchi urinishda tasdiqlash pasayishi", value: -5.1 },
      { label: "Avtomatlashtirish sekinligi", value: -3.9 },
      { label: "Boshqa omillar", value: -1.0 },
      { label: "Xarajat nazorati yaxshilanishi", value: 1.4 },
    ],
    evidence: ["6 oylik kesim", "5 ta jarayon", "ishonch 93%"],
    recommendation:
      "Bo‘lim rejasini BP-1024 jarayonini tiklashga qarating — qolgan to‘rt jarayon maqsad ichida.",
  },
  {
    id: "F-05",
    type: "pattern",
    severity: "positive",
    confidence: 94,
    title: "Avtomatik skoring sikl vaqtini barqaror qisqartirdi",
    process: "BP-1042 · Sotuv leadlari",
    metric: { label: "Sikl vaqti", actual: 52, expected: 68, unit: "min" },
    worseWhen: "up",
    summary:
      "Avtomatik skoring yoqilgandan keyin sikl vaqti barqaror pasaydi va hajm 18% o‘sganiga qaramay saqlanib qolmoqda. Bu naqsh boshqa oqimlarga ham ko‘chirilishi mumkin.",
    drivers: [
      { label: "Avtomatik skoring", value: -9.8 },
      { label: "Takroriy tasdiqlash olib tashlandi", value: -4.6 },
      { label: "Lead sifatining oshishi", value: -2.4 },
      { label: "Hajm o‘sishi", value: 0.8 },
    ],
    evidence: ["640 ta lead", "so‘nggi 90 kun", "ishonch 94%"],
    recommendation:
      "Xuddi shu skoring qoidalarini BP-1053 tasniflash bosqichiga ko‘chiring — o‘xshashlik darajasi 0.82.",
  },
  {
    id: "F-06",
    type: "anomaly",
    severity: "warning",
    confidence: 85,
    title: "Oylik yopilishda xarajat og‘ishi kutilganidan yuqori",
    process: "BP-1007 · Oylik moliyaviy yopilish",
    metric: { label: "Xarajat og‘ishi", actual: 8.6, expected: 3, unit: "%" },
    worseWhen: "up",
    summary:
      "Og‘ishning asosiy qismi qo‘lda solishtirishga sarflangan qo‘shimcha soatlardan iborat. Xatolar oxirgi kunda topilgani uchun tuzatish qimmatga tushmoqda.",
    drivers: [
      { label: "Qo‘lda solishtirish soatlari", value: 3.2 },
      { label: "Oxirgi kundagi tuzatishlar", value: 1.6 },
      { label: "Tashqi audit talablari", value: 1.1 },
      { label: "Avtomatik solishtirish", value: -0.3 },
    ],
    evidence: ["12 ta yopilish sikli", "so‘nggi 12 oy", "ishonch 85%"],
    recommendation:
      "Kunlik avtomatik solishtirishni yoqing va og‘ish 2% dan oshganda signal yuboring.",
  },
];

/* -------------------------------------------------------------- helpers */

/** Og'ish omillar yig'indisidan hisoblanadi — sarlavha bilan doim mos. */
export const deviation = (finding) =>
  finding.drivers.reduce((sum, driver) => sum + driver.value, 0);

/** Omil ko'rsatkichni yomonlashtirayaptimi yoki yaxshilayaptimi. */
export const isAdverse = (finding, value) =>
  finding.worseWhen === "up" ? value > 0 : value < 0;

/** Umumiy og'ish ijobiy tomonga bo'lsa — bu yaxshilanish. */
export const isImprovement = (finding) => {
  const total = deviation(finding);
  return finding.worseWhen === "up" ? total < 0 : total > 0;
};

export const formatSigned = (value, digits = 1) =>
  `${value > 0 ? "+" : value < 0 ? "−" : ""}${Math.abs(value).toFixed(digits)}`;

/* ---------------------------------------------------------------- model */

export const model = {
  name: "BPM Anomaly Ensemble v4",
  method: "Gradient boosting + izolyatsiya o‘rmoni",
  accuracy: 94.2,
  baseline: 85,
  trainedAgo: "2 soat oldin",
  dataset: "18 240 ta jarayon instansiyasi",
  features: 42,
  accuracyTrend: [88.4, 89.1, 90.2, 90.8, 91.6, 92.3, 92.8, 94.2],
  reviewed: { confirmed: 34, dismissed: 5 },
};
