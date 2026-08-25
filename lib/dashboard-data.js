export const currentUser = {
  name: "Aziz Karimov",
  initials: "AK",
  role: "Rahbar",
  organization: "Orient Business Group",
};

export const navigationGroups = [
  {
    label: "Ish maydoni",
    items: [
      { label: "Boshqaruv markazi", href: "/dashboard", icon: "dashboard" },
    ],
  },
  {
    label: "Operatsiyalar",
    items: [
      { label: "Biznes jarayonlari", href: "/processes", icon: "process" },
      { label: "Monitoring", href: "/monitoring", icon: "monitor" },
      { label: "KPI va BPEI", href: "/kpi", icon: "kpi" },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { label: "AI tahlil", href: "/ai-analytics", icon: "spark" },
      { label: "Prognozlar", href: "/forecasts", icon: "forecast" },
      { label: "Risklar", href: "/risks", icon: "risk", badge: 3 },
    ],
  },
];

export const dashboardMetrics = [
  {
    label: "Umumiy samaradorlik",
    value: "84.6",
    suffix: " BPEI",
    change: "+4.2%",
    direction: "up",
    note: "Barqaror daraja",
    icon: "dashboard",
    tone: "ember",
  },
  {
    label: "KPI bajarilishi",
    value: "87.2%",
    change: "+2.8%",
    direction: "up",
    note: "Rejadan 1.6% yuqori",
    icon: "kpi",
    tone: "sage",
  },
  {
    label: "Faol jarayonlar",
    value: "24",
    change: "+3",
    direction: "up",
    note: "5 ta bo‘limda",
    icon: "process",
    tone: "ink",
  },
  {
    label: "Kritik risklar",
    value: "3",
    change: "+1",
    direction: "down",
    note: "Bugun e’tibor kerak",
    icon: "risk",
    tone: "danger",
  },
  {
    label: "Iqtisodiy samara",
    value: "410",
    suffix: " mln",
    change: "+18.4%",
    direction: "up",
    note: "Yillik prognoz",
    icon: "money",
    tone: "amber",
  },
];

export const performanceSeries = {
  months: [
    "Sen",
    "Okt",
    "Noy",
    "Dek",
    "Yan",
    "Fev",
    "Mar",
    "Apr",
    "May",
    "Iyun",
    "Iyul",
    "Avg",
  ],
  actual: [68, 70, 72, 71, 75, 77, 79, 78, 82, 83, 85, 87],
  plan: [70, 71, 72, 74, 75, 77, 78, 80, 81, 83, 84, 86],
};

export const criticalProcesses = [
  {
    id: "BP-1024",
    name: "Xaridlarni tasdiqlash",
    department: "Xaridlar",
    owner: "D. Rahimova",
    efficiency: 61,
    risk: 82,
    forecast: "3.4 kun kechikish",
    status: "critical",
  },
  {
    id: "BP-1018",
    name: "Shartnoma kelishuvi",
    department: "Yuridik",
    owner: "S. Xolmatov",
    efficiency: 68,
    risk: 71,
    forecast: "2.1 kun kechikish",
    status: "critical",
  },
  {
    id: "BP-1007",
    name: "Oylik yopilish",
    department: "Moliya",
    owner: "M. Ergashev",
    efficiency: 74,
    risk: 58,
    forecast: "Xarajat +8.6%",
    status: "warning",
  },
  {
    id: "BP-1031",
    name: "Yangi xodim onboarding",
    department: "HR",
    owner: "N. Tursunova",
    efficiency: 79,
    risk: 43,
    forecast: "Barqarorlashmoqda",
    status: "stable",
  },
];

export const departmentPerformance = [
  { name: "Moliya", score: 91, trend: "+3.1%", tone: "sage" },
  { name: "Marketing", score: 86, trend: "+1.8%", tone: "sage" },
  { name: "Sotuv", score: 82, trend: "+2.4%", tone: "ember" },
  { name: "Xaridlar", score: 78, trend: "−4.7%", tone: "amber" },
  { name: "HR", score: 74, trend: "+0.9%", tone: "ember" },
];

export const smartAlerts = [
  {
    title: "Xarajat og‘ishi",
    process: "BP-1024 · Xaridlarni tasdiqlash",
    detail: "Rejadan 24% yuqori",
    time: "12 daqiqa oldin",
    tone: "critical",
  },
  {
    title: "KPI pasayishi",
    process: "BP-1018 · Shartnoma kelishuvi",
    detail: "Haftalik ko‘rsatkich −11%",
    time: "48 daqiqa oldin",
    tone: "warning",
  },
  {
    title: "Jarayon tiklandi",
    process: "BP-1031 · Xodim onboarding",
    detail: "Risk 52 dan 43 ga tushdi",
    time: "2 soat oldin",
    tone: "stable",
  },
];

export const decisionBrief = {
  process: "Xaridlarni tasdiqlash",
  processId: "BP-1024",
  confidence: 94,
  title: "Tasdiqlash bosqichini qayta taqsimlash kerak",
  reason:
    "Ushbu bosqich umumiy kechikishning 68%ini va qo‘shimcha xarajatning 41%ini keltirib chiqarmoqda.",
  recommendation:
    "Ikkinchi tasdiqlovchini parallel oqimga o‘tkazing va 50 mln so‘mgacha bo‘lgan xaridlarni avtomatik yo‘naltiring.",
  effects: [
    { label: "Vaqt", value: "−21%" },
    { label: "Xarajat", value: "−12%" },
    { label: "Unumdorlik", value: "+16%" },
  ],
};

export const economicSummary = [
  { label: "Tejalgan vaqt", value: "1,284 soat", change: "+22%" },
  { label: "Tejalgan xarajat", value: "186 mln so‘m", change: "+16%" },
  { label: "ROI", value: "64%", change: "+8 p.p." },
  { label: "Qoplanish muddati", value: "7.3 oy", change: "−1.2 oy" },
];
