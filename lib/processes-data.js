/**
 * Jarayonlar reyestri.
 *
 * Sikl vaqti bu yerda qat'iy yozilmaydi — u bosqichlardagi ishlov vaqti va
 * kutish vaqtidan hisoblanadi. Shu sababli jadvaldagi raqam har doim bosqichlar
 * detali bilan mos tushadi.
 */

export const processCategories = [
  "Tasdiqlash",
  "Yuridik",
  "Moliyaviy",
  "Xodimlar",
  "Mijoz",
  "Marketing",
];

export const processes = [
  {
    id: "BP-1024",
    name: "Xaridlarni tasdiqlash",
    category: "Tasdiqlash",
    department: "Xaridlar",
    owner: "D. Rahimova",
    initials: "DR",
    status: "critical",
    efficiency: 61,
    slaTarget: 75,
    volume: 412,
    risk: 82,
    automation: 35,
    updated: "12 daqiqa oldin",
    trend: [72, 70, 69, 66, 65, 63, 62, 61],
    insight:
      "Ikkinchi tasdiqlash bosqichi umumiy kechikishning 68%ini beradi. Parallel tasdiqlash bu jarayonni SLA chegarasiga qaytaradi.",
    stages: [
      {
        name: "So‘rov yaratish",
        role: "Tashabbuskor",
        avg: 8,
        sla: 10,
        wait: 0,
        rework: 2,
      },
      {
        name: "Byudjet tekshiruvi",
        role: "Moliya",
        avg: 14,
        sla: 15,
        wait: 6,
        rework: 5,
      },
      {
        name: "Birinchi tasdiqlash",
        role: "Bo‘lim boshlig‘i",
        avg: 18,
        sla: 20,
        wait: 12,
        rework: 8,
      },
      {
        name: "Ikkinchi tasdiqlash",
        role: "Moliya direktori",
        avg: 46,
        sla: 20,
        wait: 22,
        rework: 14,
      },
      {
        name: "Yetkazib beruvchi tanlash",
        role: "Xaridlar",
        avg: 9,
        sla: 12,
        wait: 3,
        rework: 3,
      },
    ],
  },
  {
    id: "BP-1018",
    name: "Shartnoma kelishuvi",
    category: "Yuridik",
    department: "Yuridik",
    owner: "S. Xolmatov",
    initials: "SX",
    status: "critical",
    efficiency: 68,
    slaTarget: 80,
    volume: 96,
    risk: 71,
    automation: 20,
    updated: "48 daqiqa oldin",
    trend: [74, 73, 71, 72, 70, 69, 68, 68],
    insight:
      "Standart shartnomalarning 74%i to‘liq yuridik ko‘rikdan o‘tmoqda, ammo ularda o‘zgarish qayd etilmagan.",
    stages: [
      {
        name: "Loyiha tayyorlash",
        role: "Tashabbuskor",
        avg: 15,
        sla: 18,
        wait: 0,
        rework: 4,
      },
      {
        name: "Yuridik ko‘rik",
        role: "Yuridik",
        avg: 38,
        sla: 25,
        wait: 16,
        rework: 11,
      },
      {
        name: "Moliyaviy kelishuv",
        role: "Moliya",
        avg: 12,
        sla: 15,
        wait: 8,
        rework: 5,
      },
      {
        name: "Imzolash",
        role: "Rahbariyat",
        avg: 14,
        sla: 20,
        wait: 9,
        rework: 2,
      },
    ],
  },
  {
    id: "BP-1007",
    name: "Oylik moliyaviy yopilish",
    category: "Moliyaviy",
    department: "Moliya",
    owner: "M. Ergashev",
    initials: "ME",
    status: "warning",
    efficiency: 74,
    slaTarget: 82,
    volume: 12,
    risk: 58,
    automation: 45,
    updated: "2 soat oldin",
    trend: [70, 71, 73, 72, 74, 73, 75, 74],
    insight:
      "Qo‘lda solishtirish har oy o‘rtacha 96 soat vaqt oladi va xatolar oxirgi kunda aniqlanmoqda.",
    stages: [
      {
        name: "Ma’lumot yig‘ish",
        role: "Buxgalteriya",
        avg: 20,
        sla: 22,
        wait: 0,
        rework: 3,
      },
      {
        name: "Solishtirish",
        role: "Moliya",
        avg: 24,
        sla: 20,
        wait: 6,
        rework: 9,
      },
      {
        name: "Hisobot tayyorlash",
        role: "Moliya",
        avg: 16,
        sla: 18,
        wait: 4,
        rework: 4,
      },
      {
        name: "Rahbar tasdig‘i",
        role: "Rahbariyat",
        avg: 10,
        sla: 12,
        wait: 6,
        rework: 1,
      },
    ],
  },
  {
    id: "BP-1053",
    name: "Mijoz shikoyatlarini ko‘rib chiqish",
    category: "Mijoz",
    department: "Xizmat ko‘rsatish",
    owner: "L. Yusupova",
    initials: "LY",
    status: "warning",
    efficiency: 71,
    slaTarget: 85,
    volume: 218,
    risk: 62,
    automation: 40,
    updated: "3 soat oldin",
    trend: [76, 75, 74, 73, 72, 71, 72, 71],
    insight:
      "Sifat bo‘limidagi tekshiruv bosqichi SLA dan 33% oshib ketmoqda va takroriy murojaatlarni ko‘paytirmoqda.",
    stages: [
      {
        name: "Shikoyatni ro‘yxatga olish",
        role: "Xizmat ko‘rsatish",
        avg: 6,
        sla: 8,
        wait: 0,
        rework: 1,
      },
      {
        name: "Tasniflash",
        role: "Xizmat ko‘rsatish",
        avg: 9,
        sla: 10,
        wait: 4,
        rework: 5,
      },
      {
        name: "Tekshiruv",
        role: "Sifat nazorati",
        avg: 32,
        sla: 24,
        wait: 14,
        rework: 12,
      },
      {
        name: "Javob va yopish",
        role: "Xizmat ko‘rsatish",
        avg: 21,
        sla: 22,
        wait: 10,
        rework: 3,
      },
    ],
  },
  {
    id: "BP-1031",
    name: "Yangi xodim onboarding",
    category: "Xodimlar",
    department: "HR",
    owner: "N. Tursunova",
    initials: "NT",
    status: "stable",
    efficiency: 79,
    slaTarget: 80,
    volume: 34,
    risk: 43,
    automation: 55,
    updated: "5 soat oldin",
    trend: [71, 73, 74, 76, 75, 78, 78, 79],
    insight:
      "IT resurslarini berish bosqichi avtomatlashtirilgach, umumiy sikl 18% qisqardi.",
    stages: [
      {
        name: "Hujjatlarni qabul qilish",
        role: "HR",
        avg: 12,
        sla: 15,
        wait: 0,
        rework: 2,
      },
      {
        name: "IT resurslarini berish",
        role: "IT",
        avg: 18,
        sla: 20,
        wait: 8,
        rework: 4,
      },
      {
        name: "Kirish treningi",
        role: "HR",
        avg: 22,
        sla: 25,
        wait: 6,
        rework: 1,
      },
      {
        name: "Mentorga biriktirish",
        role: "Bo‘lim boshlig‘i",
        avg: 5,
        sla: 8,
        wait: 3,
        rework: 0,
      },
    ],
  },
  {
    id: "BP-1077",
    name: "Marketing kampaniyasini ishga tushirish",
    category: "Marketing",
    department: "Marketing",
    owner: "R. Qodirov",
    initials: "RQ",
    status: "stable",
    efficiency: 80,
    slaTarget: 130,
    volume: 18,
    risk: 38,
    automation: 30,
    updated: "1 kun oldin",
    trend: [77, 78, 79, 78, 80, 79, 81, 80],
    insight:
      "Kreativ ishlab chiqish bosqichi SLA dan biroz oshsa-da, umumiy sikl maqsad ichida qolmoqda.",
    stages: [
      {
        name: "Kampaniya brifi",
        role: "Marketing",
        avg: 18,
        sla: 20,
        wait: 0,
        rework: 3,
      },
      {
        name: "Kreativ ishlab chiqish",
        role: "Marketing",
        avg: 34,
        sla: 30,
        wait: 12,
        rework: 9,
      },
      {
        name: "Byudjet tasdig‘i",
        role: "Moliya",
        avg: 14,
        sla: 15,
        wait: 10,
        rework: 4,
      },
      {
        name: "Ishga tushirish",
        role: "Marketing",
        avg: 22,
        sla: 25,
        wait: 8,
        rework: 2,
      },
    ],
  },
  {
    id: "BP-1042",
    name: "Sotuv leadlarini qayta ishlash",
    category: "Mijoz",
    department: "Sotuv",
    owner: "J. Abdullayev",
    initials: "JA",
    status: "stable",
    efficiency: 83,
    slaTarget: 60,
    volume: 640,
    risk: 34,
    automation: 70,
    updated: "26 daqiqa oldin",
    trend: [78, 79, 80, 82, 81, 83, 82, 83],
    insight:
      "Kvalifikatsiya bosqichida takroriy tasdiqlash aniqlandi — avtomatik skoring uni bartaraf etadi.",
    stages: [
      {
        name: "Lead qabul qilish",
        role: "Sotuv",
        avg: 4,
        sla: 6,
        wait: 0,
        rework: 1,
      },
      {
        name: "Kvalifikatsiya",
        role: "Sotuv",
        avg: 14,
        sla: 15,
        wait: 5,
        rework: 6,
      },
      {
        name: "Taklif tayyorlash",
        role: "Sotuv",
        avg: 16,
        sla: 18,
        wait: 4,
        rework: 5,
      },
      { name: "Kuzatuv", role: "Sotuv", avg: 6, sla: 8, wait: 3, rework: 2 },
    ],
  },
  {
    id: "BP-1066",
    name: "To‘lovlarni tasdiqlash",
    category: "Moliyaviy",
    department: "Moliya",
    owner: "M. Ergashev",
    initials: "ME",
    status: "stable",
    efficiency: 88,
    slaTarget: 45,
    volume: 380,
    risk: 21,
    automation: 85,
    updated: "8 daqiqa oldin",
    trend: [84, 85, 85, 86, 87, 87, 88, 88],
    insight:
      "Jarayonning 85%i avtomatlashtirilgan — portfeldagi eng barqaror oqim.",
    stages: [
      {
        name: "To‘lov so‘rovi",
        role: "Buxgalteriya",
        avg: 5,
        sla: 6,
        wait: 0,
        rework: 1,
      },
      {
        name: "Hujjat tekshiruvi",
        role: "Moliya",
        avg: 11,
        sla: 12,
        wait: 4,
        rework: 3,
      },
      {
        name: "Tasdiqlash",
        role: "Moliya direktori",
        avg: 13,
        sla: 15,
        wait: 5,
        rework: 2,
      },
      {
        name: "Bank topshirig‘i",
        role: "Buxgalteriya",
        avg: 3,
        sla: 5,
        wait: 0,
        rework: 0,
      },
    ],
  },
];

/* --------------------------------------------------------------- helpers */

/** Bosqichdagi ishlov + kutish vaqti. */
export const stageTotal = (stage) => stage.avg + stage.wait;

/** Jarayonning to‘liq sikl vaqti (daqiqa). */
export const cycleTime = (process) =>
  process.stages.reduce((total, stage) => total + stageTotal(stage), 0);

/** SLA dan eng ko‘p oshgan bosqich; hech biri oshmasa — eng uzuni. */
export function bottleneckIndex(process) {
  let index = 0;
  let worst = -Infinity;

  process.stages.forEach((stage, position) => {
    const overrun = stage.avg - stage.sla;
    const score = overrun > 0 ? overrun * 1000 + stage.avg : stage.avg;
    if (score > worst) {
      worst = score;
      index = position;
    }
  });

  return index;
}

export function stageStatus(stage) {
  if (stage.avg > stage.sla) return "critical";
  if (stage.avg > stage.sla * 0.9) return "warning";
  return "stable";
}

export function formatDuration(minutes) {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours} s ${rest} min` : `${hours} s`;
}

export const statusLabels = {
  critical: "Kritik",
  warning: "Diqqatda",
  stable: "Barqaror",
};

export const departments = [
  ...new Set(processes.map((process) => process.department)),
].sort();
