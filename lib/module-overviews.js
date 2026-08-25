export const moduleOverviews = {
  processes: {
    title: "Biznes jarayonlari",
    description:
      "Tashkilotdagi barcha jarayonlar, ularning egasi, holati va samaradorligini boshqaring.",
    icon: "process",
    stats: [
      ["Jami jarayon", "28"],
      ["Faol", "24"],
      ["Kritik", "3"],
    ],
    features: [
      "Jarayonlar reyestri",
      "Bosqichlar va mas’ullar",
      "Reja / fakt nazorati",
    ],
  },
  monitoring: {
    title: "Monitoring markazi",
    description:
      "Jarayon hodisalari, kechikishlar va smart alertlarni real vaqt oqimida kuzating.",
    icon: "monitor",
    stats: [
      ["Bugungi hodisa", "1,248"],
      ["Alert", "7"],
      ["Normal holat", "91%"],
    ],
    features: ["Event stream", "Smart alertlar", "Bottleneck nazorati"],
  },
  kpi: {
    title: "KPI va BPEI",
    description:
      "Tashkilot, bo‘lim va jarayonlar kesimida samaradorlik indekslarini tahlil qiling.",
    icon: "kpi",
    stats: [
      ["BPEI", "84.6"],
      ["KPI", "87.2%"],
      ["Faol indikator", "15"],
    ],
    features: ["KPI konstruktor", "BPEI vaznlari", "Dinamik taqqoslash"],
  },
  "ai-analytics": {
    title: "AI Analytics",
    description:
      "Anomaliyalar, sabablar va model xulosalarini bitta intelligence markazida o‘rganing.",
    icon: "spark",
    stats: [
      ["Anomaliya", "12"],
      ["Model aniqligi", "92.8%"],
      ["Tahlil qilingan", "24"],
    ],
    features: ["Anomaly detection", "Root cause", "Model explanation"],
  },
  forecasts: {
    title: "Prognozlar",
    description:
      "Muddat, xarajat, KPI va resurs talabining kelajakdagi holatini oldindan ko‘ring.",
    icon: "forecast",
    stats: [
      ["Faol prognoz", "18"],
      ["Yuqori risk", "5"],
      ["Aniqlik", "89.4%"],
    ],
    features: ["Kechikish prognozi", "Xarajat prognozi", "What-if analysis"],
  },
  risks: {
    title: "Risklar",
    description:
      "AI Risk Score orqali ustuvor jarayonlarni aniqlang va risk drayverlarini boshqaring.",
    icon: "risk",
    stats: [
      ["Kritik", "3"],
      ["Yuqori", "5"],
      ["O‘rtacha score", "42"],
    ],
    features: ["Risk scoring", "Risk drayverlari", "Mitigatsiya nazorati"],
  },
  recommendations: {
    title: "AI tavsiyalar",
    description:
      "Aniqlangan muammolar bo‘yicha amaliy tavsiya va kutilayotgan iqtisodiy ta’sirni ko‘ring.",
    icon: "recommendation",
    stats: [
      ["Yangi tavsiya", "7"],
      ["Ko‘rib chiqilgan", "18"],
      ["Qabul qilingan", "71%"],
    ],
    features: ["Decision brief", "Kutilayotgan samara", "Human approval"],
  },
  economics: {
    title: "Iqtisodiy samaradorlik",
    description:
      "ROI, NPV, payback va monitoring natijasidagi iqtisodiy samarani hisoblang.",
    icon: "money",
    stats: [
      ["Yillik samara", "410 mln"],
      ["ROI", "64%"],
      ["Payback", "7.3 oy"],
    ],
    features: ["ROI va NPV", "Xarajat tejalishi", "Investitsiya modeli"],
  },
  comparison: {
    title: "Before / After",
    description:
      "AI monitoringdan oldingi va keyingi natijalarni bir xil mezonlarda solishtiring.",
    icon: "compare",
    stats: [
      ["Vaqt", "−21%"],
      ["Xarajat", "−12%"],
      ["Unumdorlik", "+16%"],
    ],
    features: ["Davr taqqoslash", "Reja / fakt", "Natija xulosasi"],
  },
  econometrics: {
    title: "Econometrics",
    description:
      "Korrelyatsiya, regressiya va vaqt qatorlari orqali omillar ta’sirini baholang.",
    icon: "econometrics",
    stats: [
      ["R²", "0.87"],
      ["MAPE", "8.4%"],
      ["Model", "6"],
    ],
    features: ["Regression", "Correlation matrix", "Time series"],
  },
  reports: {
    title: "Hisobotlar",
    description:
      "Monitoring, KPI, AI prognoz va iqtisodiy samaradorlik hisobotlarini shakllantiring.",
    icon: "report",
    stats: [
      ["Tayyor hisobot", "24"],
      ["Rejalashtirilgan", "8"],
      ["Eksport", "PDF · XLSX"],
    ],
    features: ["Hisobot generator", "Scheduled reports", "PDF / Excel / CSV"],
  },
  organization: {
    title: "Tashkilot va bo‘limlar",
    description:
      "Tashkilot strukturasi, bo‘limlar va monitoring mas’uliyatlarini sozlang.",
    icon: "building",
    stats: [
      ["Tashkilot", "1"],
      ["Bo‘lim", "5"],
      ["Xodim", "126"],
    ],
    features: ["Tashkiliy struktura", "Bo‘limlar", "Mas’uliyat xaritasi"],
  },
  users: {
    title: "Foydalanuvchilar",
    description:
      "Foydalanuvchilar, rollar va platformaga kirish huquqlarini boshqaring.",
    icon: "users",
    stats: [
      ["Faol user", "126"],
      ["Rol", "6"],
      ["Bugun online", "34"],
    ],
    features: ["User management", "Role permissions", "Faollik tarixi"],
  },
  settings: {
    title: "Sozlamalar",
    description:
      "Monitoring parametrlari, bildirishnomalar va platforma konfiguratsiyasini boshqaring.",
    icon: "settings",
    stats: [
      ["Integratsiya", "3"],
      ["Alert qoidasi", "12"],
      ["Audit", "Faol"],
    ],
    features: [
      "Monitoring qoidalari",
      "Integratsiyalar",
      "Xavfsizlik va audit",
    ],
  },
};
