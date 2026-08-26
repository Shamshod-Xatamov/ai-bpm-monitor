/**
 * Risk registri ma'lumotlari.
 *
 * Ikkita raqam saqlanadi — `inherentScore` (nazoratsiz risk) va har bir
 * mitigatsiyaning `effect` qiymati. Qolgani hisoblanadi: bajarilgan choralar
 * qoldiq riskni, barcha rejalashtirilganlari esa maqsad darajasini beradi.
 * Shu sababli jadval, treemap va mitigatsiya paneli hech qachon bir-biriga
 * zid raqam ko'rsatmaydi.
 */

export const categories = [
  { id: "all", label: "Barchasi" },
  { id: "operational", label: "Operatsion" },
  { id: "financial", label: "Moliyaviy" },
  { id: "compliance", label: "Muvofiqlik" },
  { id: "resource", label: "Resurs" },
  { id: "reputational", label: "Obro‘" },
];

export const categoryLabels = {
  operational: "Operatsion",
  financial: "Moliyaviy",
  compliance: "Muvofiqlik",
  resource: "Resurs",
  reputational: "Obro‘",
};

export const levelLabels = {
  critical: "Kritik",
  high: "Yuqori",
  medium: "O‘rta",
  low: "Past",
};

/** Qoldiq ballga qarab daraja — chegara bitta joyda belgilanadi. */
export const levelOf = (score) =>
  score >= 70
    ? "critical"
    : score >= 55
      ? "high"
      : score >= 35
        ? "medium"
        : "low";

export const levelStep = { low: 1, medium: 2, high: 3, critical: 4 };

export const statusLabels = {
  done: "Bajarilgan",
  active: "Jarayonda",
  planned: "Rejalashtirilgan",
};

export const trendMonths = ["Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust"];

export const risks = [
  {
    id: "R-01",
    process: "BP-1024",
    title: "Xaridlarni tasdiqlash oqimida to‘xtab qolish",
    department: "Xaridlar",
    category: "operational",
    probability: 84,
    impact: 148,
    inherentScore: 92,
    rank: [2, 2, 1, 1, 1, 1],
    owner: "A. Karimov · Xaridlar boshlig‘i",
    reviewed: "12 kun oldin",
    summary:
      "Tasdiqlash navbati bitta mas’ulga bog‘lanib qolgan. Navbat uzunligi o‘sishda davom etsa, jarayon to‘liq to‘xtab qolish ehtimoli chorak ichida yuqori bo‘ladi.",
    causes: [
      { label: "Tasdiqlovchi navbati", weight: 42 },
      { label: "Hujjatlar to‘liqsizligi", weight: 26 },
      { label: "So‘rovlar hajmi o‘sishi", weight: 19 },
      { label: "Qo‘lda yo‘naltirish", weight: 13 },
    ],
    consequences: [
      { label: "Yetkazib berish kechikishi", weight: 38 },
      { label: "Qo‘shimcha xarajat", weight: 27 },
      { label: "Byudjet siljishi", weight: 21 },
      { label: "Yetkazuvchi bilan munosabat", weight: 14 },
    ],
    preventive: ["Avtomatik yo‘naltirish", "Parallel tasdiqlash"],
    corrective: ["Eskalatsiya qoidasi", "Zaxira tasdiqlovchi"],
    mitigations: [
      {
        label: "Parallel tasdiqlash oqimini yoqish",
        owner: "Xaridlar",
        start: 1,
        end: 3,
        status: "done",
        effect: 9,
      },
      {
        label: "50 mln so‘mgacha avtomatik yo‘naltirish",
        owner: "IT",
        start: 1,
        end: 4,
        status: "done",
        effect: 5,
      },
      {
        label: "Tasdiqlovchilar navbatini qayta taqsimlash",
        owner: "Xaridlar",
        start: 3,
        end: 8,
        status: "active",
        effect: 12,
      },
      {
        label: "Hujjat to‘liqligi tekshiruvi",
        owner: "IT",
        start: 7,
        end: 12,
        status: "planned",
        effect: 8,
      },
    ],
    recommendation:
      "Navbatni qayta taqsimlashni tezlashtiring — u yakka o‘zi qoldiq riskni kritik zonadan chiqaradi.",
  },
  {
    id: "R-02",
    process: "BP-1018",
    title: "Shartnoma kelishuvida muddat buzilishi",
    department: "Yuridik",
    category: "compliance",
    probability: 73,
    impact: 96,
    inherentScore: 84,
    rank: [1, 1, 2, 2, 2, 2],
    owner: "D. Rahimova · Bosh yurist",
    reviewed: "5 kun oldin",
    summary:
      "Shablondan chetlashgan shartnomalar to‘liq ko‘rikka tushmoqda. Kelishuv muddatining buzilishi shartnoma jarimalariga va muvofiqlik talablarining bajarilmasligiga olib keladi.",
    causes: [
      { label: "Shablondan chetlashish", weight: 39 },
      { label: "Yurist bandligi", weight: 28 },
      { label: "Takroriy kelishuv sikli", weight: 21 },
      { label: "Kech boshlangan jarayon", weight: 12 },
    ],
    consequences: [
      { label: "Shartnoma jarimasi", weight: 34 },
      { label: "Muvofiqlik buzilishi", weight: 29 },
      { label: "Loyiha kechikishi", weight: 24 },
      { label: "Qayta muzokara", weight: 13 },
    ],
    preventive: ["Standart shablon kutubxonasi", "Kelishuv kalendari"],
    corrective: ["Tezkor ko‘rik", "Yuqori bo‘g‘in tasdig‘i"],
    mitigations: [
      {
        label: "Shablon kutubxonasini standartlashtirish",
        owner: "Yuridik",
        start: 1,
        end: 4,
        status: "done",
        effect: 8,
      },
      {
        label: "Chetlashishlar registrini yuritish",
        owner: "Yuridik",
        start: 2,
        end: 5,
        status: "done",
        effect: 5,
      },
      {
        label: "Standart shartnomalar uchun tezkor yo‘lak",
        owner: "Yuridik",
        start: 4,
        end: 9,
        status: "active",
        effect: 11,
      },
      {
        label: "Yurist yuklamasini muvozanatlash",
        owner: "HR",
        start: 8,
        end: 12,
        status: "planned",
        effect: 6,
      },
    ],
    recommendation:
      "Tezkor yo‘lakni to‘liq ishga tushiring — chetlashmagan shartnomalar umuman to‘liq ko‘rikka tushmasligi kerak.",
  },
  {
    id: "R-03",
    process: "BP-1007",
    title: "Oylik yopilishda xatolik va qayta hisoblash",
    department: "Moliya",
    category: "financial",
    probability: 62,
    impact: 74,
    inherentScore: 76,
    rank: [3, 4, 4, 3, 4, 4],
    owner: "S. Yusupov · Bosh buxgalter",
    reviewed: "8 kun oldin",
    summary:
      "Qo‘lda solishtirish sikl oxirida bajarilgani uchun xatolar kech aniqlanadi. Qayta hisoblash hisobot muddatini suradi va tashqi audit uchun qo‘shimcha savol tug‘diradi.",
    causes: [
      { label: "Qo‘lda solishtirish", weight: 44 },
      { label: "Kech aniqlangan xatolar", weight: 27 },
      { label: "Manba tizim nomuvofiqligi", weight: 18 },
      { label: "Xodim almashinuvi", weight: 11 },
    ],
    consequences: [
      { label: "Hisobot kechikishi", weight: 36 },
      { label: "Audit izohlari", weight: 28 },
      { label: "Qayta hisoblash xarajati", weight: 23 },
      { label: "Qaror uchun noto‘g‘ri baza", weight: 13 },
    ],
    preventive: ["Kunlik solishtirish", "Manba nazorati"],
    corrective: ["Tuzatish jurnali", "Qo‘shimcha ko‘rik"],
    mitigations: [
      {
        label: "Kunlik avtomatik solishtirish",
        owner: "Moliya",
        start: 1,
        end: 5,
        status: "done",
        effect: 11,
      },
      {
        label: "2% og‘ishda xatolik signali",
        owner: "IT",
        start: 2,
        end: 4,
        status: "done",
        effect: 7,
      },
      {
        label: "Yopilish nazorat ro‘yxati",
        owner: "Moliya",
        start: 5,
        end: 9,
        status: "active",
        effect: 9,
      },
      {
        label: "Audit talablarini oldindan yig‘ish",
        owner: "Moliya",
        start: 9,
        end: 12,
        status: "planned",
        effect: 6,
      },
    ],
    recommendation:
      "Nazorat ro‘yxatini yopilish kalendariga bog‘lang — xatolar oxirgi kunda emas, yuzaga kelgan kunida tuziladi.",
  },
  {
    id: "R-04",
    process: null,
    title: "Yuridik bo‘lim sig‘imining yetishmasligi",
    department: "Yuridik",
    category: "resource",
    probability: 68,
    impact: 58,
    inherentScore: 79,
    rank: [6, 5, 5, 4, 3, 3],
    owner: "D. Rahimova · Bosh yurist",
    reviewed: "3 kun oldin",
    summary:
      "Shartnomalar oqimi bo‘lim sig‘imidan tezroq o‘smoqda. Prognoz bo‘yicha sig‘im uchinchi haftada buziladi — bu registrdagi eng tez o‘sayotgan risk.",
    causes: [
      { label: "Shartnomalar oqimi o‘sishi", weight: 46 },
      { label: "Shablondan chetlashish", weight: 24 },
      { label: "Takroriy kelishuv", weight: 18 },
      { label: "Ta’til va band kunlar", weight: 12 },
    ],
    consequences: [
      { label: "Barcha yuridik jarayon kechikishi", weight: 41 },
      { label: "Tashqi maslahatchi xarajati", weight: 26 },
      { label: "Xodim zo‘riqishi", weight: 20 },
      { label: "Sifat pasayishi", weight: 13 },
    ],
    preventive: ["Yuklama monitoringi", "Tezkor yo‘lak"],
    corrective: ["Tashqi maslahatchi", "Prioritet navbat"],
    mitigations: [
      {
        label: "Haftalik yuklama monitoringi",
        owner: "Yuridik",
        start: 1,
        end: 3,
        status: "done",
        effect: 7,
      },
      {
        label: "Tezkor yo‘lak qamrovini kengaytirish",
        owner: "Yuridik",
        start: 3,
        end: 8,
        status: "active",
        effect: 13,
      },
      {
        label: "Qo‘shimcha yurist jalb qilish",
        owner: "HR",
        start: 8,
        end: 12,
        status: "planned",
        effect: 9,
      },
    ],
    recommendation:
      "Qo‘shimcha yuristni rejadan oldinroq jalb qiling — faqat tezkor yo‘lak sig‘im buzilishini to‘xtata olmaydi.",
  },
  {
    id: "R-05",
    process: "BP-1053",
    title: "Mijoz shikoyatlarini kech hal qilish",
    department: "Mijozlar bilan ishlash",
    category: "reputational",
    probability: 54,
    impact: 42,
    inherentScore: 64,
    rank: [4, 3, 3, 5, 5, 5],
    owner: "M. Tosheva · Xizmat sifati",
    reviewed: "16 kun oldin",
    summary:
      "Noto‘g‘ri tasniflangan murojaatlar tekshiruvdan qaytmoqda va javob muddati cho‘zilmoqda. Takroriy kechikish mijoz qoniqishiga va obro‘ga bevosita ta’sir qiladi.",
    causes: [
      { label: "Noto‘g‘ri tasniflash", weight: 40 },
      { label: "Sifat mezonlari noaniqligi", weight: 25 },
      { label: "Yangi xodimlar ulushi", weight: 22 },
      { label: "Mavsumiy oqim", weight: 13 },
    ],
    consequences: [
      { label: "Mijoz qoniqishining pasayishi", weight: 37 },
      { label: "Takroriy murojaat", weight: 28 },
      { label: "Ommaviy sharh xavfi", weight: 22 },
      { label: "Qo‘shimcha ish hajmi", weight: 13 },
    ],
    preventive: ["Tasniflash qaror daraxti", "Javob SLA"],
    corrective: ["Eskalatsiya liniyasi", "Kompensatsiya siyosati"],
    mitigations: [
      {
        label: "Tasniflash uchun qaror daraxti",
        owner: "Xizmat",
        start: 1,
        end: 4,
        status: "done",
        effect: 10,
      },
      {
        label: "Javob muddati bo‘yicha SLA",
        owner: "Xizmat",
        start: 2,
        end: 6,
        status: "done",
        effect: 6,
      },
      {
        label: "Yangi xodimlarga ikkilamchi tekshiruv",
        owner: "HR",
        start: 5,
        end: 10,
        status: "active",
        effect: 7,
      },
      {
        label: "Mijoz qoniqishi so‘rovnomasi",
        owner: "Xizmat",
        start: 9,
        end: 12,
        status: "planned",
        effect: 5,
      },
    ],
    recommendation:
      "Ikkilamchi tekshiruvni yangi xodimlarning birinchi ikki haftasiga qat’iy bog‘lang.",
  },
  {
    id: "R-06",
    process: "BP-1042",
    title: "Sotuv leadlari sifatining pasayishi",
    department: "Sotuv",
    category: "operational",
    probability: 41,
    impact: 31,
    inherentScore: 58,
    rank: [5, 6, 6, 6, 6, 7],
    owner: "R. Aliyev · Sotuv boshlig‘i",
    reviewed: "21 kun oldin",
    summary:
      "Avtomatik skoring joriy etilgandan keyin risk barqaror pasaymoqda. Qolgan ta’sir asosan manba sifatining tekshirilmasligidan kelib chiqadi.",
    causes: [
      { label: "Manba sifatining tekshirilmasligi", weight: 45 },
      { label: "Hajm o‘sishi", weight: 26 },
      { label: "Ma’lumot to‘liqsizligi", weight: 18 },
      { label: "Qo‘lda kiritish xatosi", weight: 11 },
    ],
    consequences: [
      { label: "Konversiya pasayishi", weight: 42 },
      { label: "Sotuv vaqtining isrofi", weight: 30 },
      { label: "Prognoz aniqligining tushishi", weight: 18 },
      { label: "Mijoz bazasi ifloslanishi", weight: 10 },
    ],
    preventive: ["Avtomatik skoring", "Manba filtri"],
    corrective: ["Baza tozalash sikli", "Qo‘lda ko‘rik"],
    mitigations: [
      {
        label: "Avtomatik lead skoring",
        owner: "Sotuv",
        start: 1,
        end: 4,
        status: "done",
        effect: 13,
      },
      {
        label: "Takroriy tasdiqlashni olib tashlash",
        owner: "Sotuv",
        start: 2,
        end: 5,
        status: "done",
        effect: 6,
      },
      {
        label: "Manba sifati bo‘yicha filtr",
        owner: "IT",
        start: 6,
        end: 11,
        status: "active",
        effect: 8,
      },
    ],
    recommendation:
      "Skoring qoidalarini shikoyatlarni tasniflash bosqichiga ham ko‘chiring — o‘xshashlik darajasi yuqori.",
  },
  {
    id: "R-07",
    process: "BP-1031",
    title: "Xodim onboardingining kechikishi",
    department: "HR",
    category: "resource",
    probability: 34,
    impact: 22,
    inherentScore: 46,
    rank: [8, 8, 8, 8, 8, 8],
    owner: "N. Sobirova · HR boshlig‘i",
    reviewed: "27 kun oldin",
    summary:
      "Hujjatlarni yig‘ish va tizimlarga kirish huquqini berish ketma-ket bajarilmoqda. Risk past, ammo yangi xodimning birinchi haftasi samarasiz o‘tmoqda.",
    causes: [
      { label: "Ketma-ket bajariladigan bosqichlar", weight: 43 },
      { label: "Hujjatlarning kech yig‘ilishi", weight: 29 },
      { label: "Kirish huquqi kechikishi", weight: 19 },
      { label: "Mentor bandligi", weight: 9 },
    ],
    consequences: [
      { label: "Birinchi hafta samarasizligi", weight: 44 },
      { label: "Jamoa yuklamasi", weight: 27 },
      { label: "Xodim taassurotining pasayishi", weight: 19 },
      { label: "Qayta o‘qitish ehtiyoji", weight: 10 },
    ],
    preventive: ["Onboarding kontrol ro‘yxati", "Oldindan hujjat yig‘ish"],
    corrective: ["Mentor tayinlash", "Qisqartirilgan dastur"],
    mitigations: [
      {
        label: "Onboarding kontrol ro‘yxati",
        owner: "HR",
        start: 1,
        end: 3,
        status: "done",
        effect: 11,
      },
      {
        label: "Hujjatlarni oldindan yig‘ish",
        owner: "HR",
        start: 2,
        end: 5,
        status: "done",
        effect: 7,
      },
      {
        label: "Har bir yangi xodimga mentor",
        owner: "HR",
        start: 7,
        end: 11,
        status: "planned",
        effect: 6,
      },
    ],
    recommendation:
      "Kirish huquqini hujjat yig‘ish bilan parallel bajaring — bu yakka o‘zi bir kunni tejaydi.",
  },
  {
    id: "R-08",
    process: null,
    title: "Integratsiya ma’lumotlarining to‘liq emasligi",
    department: "IT",
    category: "compliance",
    probability: 47,
    impact: 36,
    inherentScore: 61,
    rank: [7, 7, 7, 7, 7, 6],
    owner: "T. Ergashev · IT arxitektor",
    reviewed: "9 kun oldin",
    summary:
      "Manba tizimlardan kelayotgan yozuvlarning bir qismi to‘liq emas. Bu monitoring va KPI hisob-kitobiga bevosita ta’sir qiladi va audit izini uzadi.",
    causes: [
      { label: "Manba tizim sxemasi o‘zgarishi", weight: 38 },
      { label: "Xatolik holatlari qayta yuborilmasligi", weight: 30 },
      { label: "Vaqt zonasi nomuvofiqligi", weight: 20 },
      { label: "Kechikkan yozuvlar", weight: 12 },
    ],
    consequences: [
      { label: "KPI hisobining buzilishi", weight: 35 },
      { label: "Audit izining uzilishi", weight: 30 },
      { label: "Model aniqligining pasayishi", weight: 23 },
      { label: "Qo‘lda tuzatish ishi", weight: 12 },
    ],
    preventive: ["Sxema versiyalash", "To‘liqlik tekshiruvi"],
    corrective: ["Qayta yuborish navbati", "Qo‘lda to‘ldirish"],
    mitigations: [
      {
        label: "Integratsiya loglarini kuzatish",
        owner: "IT",
        start: 1,
        end: 4,
        status: "done",
        effect: 10,
      },
      {
        label: "Ma’lumot to‘liqligi tekshiruvi",
        owner: "IT",
        start: 3,
        end: 6,
        status: "done",
        effect: 7,
      },
      {
        label: "Xatolik holatlarini qayta yuborish",
        owner: "IT",
        start: 6,
        end: 10,
        status: "active",
        effect: 8,
      },
      {
        label: "Manba tizimlar bilan sxema kelishuvi",
        owner: "IT",
        start: 10,
        end: 12,
        status: "planned",
        effect: 5,
      },
    ],
    recommendation:
      "Sxema kelishuvini oldinga suring — qolgan choralar oqibat bilan, u esa sabab bilan ishlaydi.",
  },
];

/* -------------------------------------------------------------- helpers */

const sumEffect = (risk, predicate) =>
  risk.mitigations
    .filter(predicate)
    .reduce((sum, item) => sum + item.effect, 0);

/** Bugungi qoldiq risk — faqat bajarilgan choralar hisobga olinadi. */
export const residualScore = (risk) =>
  risk.inherentScore - sumEffect(risk, (item) => item.status === "done");

/** Reja to'liq bajarilsa yetiladigan daraja. */
export const targetScore = (risk) =>
  risk.inherentScore - sumEffect(risk, () => true);

/** Kutilayotgan yo'qotish — ehtimollik va ta'sir ko'paytmasi. */
export const exposure = (risk) => (risk.probability / 100) * risk.impact;

export const riskLevel = (risk) => levelOf(residualScore(risk));

/** Reytingdagi siljish: musbat qiymat — risk yuqoriga ko'tarilgan. */
export const rankShift = (risk) => risk.rank[0] - risk.rank.at(-1);

export const formatSigned = (value, digits = 0) =>
  `${value > 0 ? "+" : value < 0 ? "−" : ""}${Math.abs(value).toFixed(digits)}`;

export const MITIGATION_WEEKS = 12;
