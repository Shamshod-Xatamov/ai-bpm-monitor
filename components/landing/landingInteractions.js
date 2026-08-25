const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector(".menu-toggle");
const mobileMenu = document.querySelector("#mobile-menu");

const syncHeader = () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 18);
};

syncHeader();
window.addEventListener("scroll", syncHeader, { passive: true });

const closeMenu = () => {
  if (!menuToggle || !mobileMenu) return;
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Menyuni ochish");
  mobileMenu.hidden = true;
  document.body.classList.remove("menu-open");
};

menuToggle?.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isOpen));
  menuToggle.setAttribute(
    "aria-label",
    isOpen ? "Menyuni ochish" : "Menyuni yopish",
  );
  mobileMenu.hidden = isOpen;
  document.body.classList.toggle("menu-open", !isOpen);
});

mobileMenu
  ?.querySelectorAll("a")
  .forEach((link) => link.addEventListener("click", closeMenu));
window.addEventListener("resize", () => {
  if (window.innerWidth > 1024) closeMenu();
});

const revealItems = document.querySelectorAll("[data-reveal]");

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const delay = Number(entry.target.dataset.delay || 0);
        window.setTimeout(
          () => entry.target.classList.add("is-visible"),
          delay,
        );
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.14 },
  );
  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

const cycleData = {
  monitoring: {
    label: "REAL VAQT MONITORINGI",
    title: "Har bir jarayonning haqiqiy holatini bir ekranda ko'ring.",
    copy: "Vaqt, xarajat, ijrochi, KPI va statuslar reja bilan uzluksiz solishtiriladi. Og'ish boshlanishi bilan kerakli rahbar signal oladi.",
    statLabel: "Ma'lumot yangilanishi",
    stat: "Real vaqt",
    note: "Jarayon voqealari asosida",
  },
  analysis: {
    label: "AI ANOMALIYA TAHLILI",
    title: "Odatiy oqimdagi noodatiy o'zgarishni AI aniqlaydi.",
    copy: "Tizim vaqt, xarajat, xatolik va yuklamadagi normal xulqni o'rganib, yashirin og'ishlar sababini topadi va izohlaydi.",
    statLabel: "Tahlil qamrovi",
    stat: "7 omil",
    note: "Har bir jarayon uchun",
  },
  forecast: {
    label: "PREDICTIVE ANALYTICS",
    title: "Kechikish va xarajatni sodir bo'lishidan oldin biling.",
    copy: "Tarixiy ma'lumotlar asosida tugash muddati, kechikish ehtimoli, kelajak xarajati, KPI va resurs talabi prognoz qilinadi.",
    statLabel: "Prognoz ufqi",
    stat: "12 oy",
    note: "Senariylar kesimida",
  },
  economy: {
    label: "IQTISODIY SAMARADORLIK",
    title: "Har bir o'zgarishning biznes qiymatini raqamlarda ko'ring.",
    copy: "Before/After, ROI, NPV va qoplanish muddati orqali platforma joriy etilishining real iqtisodiy natijasi avtomatik baholanadi.",
    statLabel: "Asosiy modellar",
    stat: "ROI + NPV",
    note: "Reja va fakt asosida",
  },
  decision: {
    label: "AI DECISION SUPPORT",
    title: "Muammo bilan birga eng foydali harakatni ham oling.",
    copy: "AI aniqlangan sabab bo'yicha tavsiya va kutilayotgan samarani ko'rsatadi. Yakuniy boshqaruv qarori doim mas'ul rahbarda qoladi.",
    statLabel: "Qaror nazorati",
    stat: "100% inson",
    note: "AI faqat tavsiya beradi",
  },
};

const cycleButtons = [...document.querySelectorAll("[data-cycle]")];
const cycleFields = {
  label: document.querySelector("[data-cycle-label]"),
  title: document.querySelector("[data-cycle-title]"),
  copy: document.querySelector("[data-cycle-copy]"),
  statLabel: document.querySelector("[data-cycle-stat-label]"),
  stat: document.querySelector("[data-cycle-stat]"),
  note: document.querySelector("[data-cycle-stat-note]"),
};

cycleButtons.forEach((button, index) => {
  button.addEventListener("click", () => {
    const data = cycleData[button.dataset.cycle];
    if (!data) return;
    cycleButtons.forEach((item) => {
      const active = item === button;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-pressed", String(active));
    });
    Object.entries(cycleFields).forEach(([key, node]) => {
      if (node) node.textContent = data[key];
    });
    const line = document.querySelector(".cycle-line span");
    if (line) line.style.width = `${12 + index * 22}%`;
  });
});

const roleData = {
  leader: {
    kicker: "EXECUTIVE DECISION SUPPORT",
    title: "Rahbar muammoni emas, qaror nuqtasini ko'radi.",
    copy: "Tashkilot samaradorligi, kritik risklar, iqtisodiy ta'sir va AI tavsiyalari bitta ixcham boshqaruv ekranida.",
    list: [
      "Umumiy samaradorlik va BPEI",
      "Kritik ogohlantirish va prognozlar",
      "ROI, iqtisodiy samara va reyting",
    ],
    summary: "Barqaror",
    summaryNote: "3 ta jarayon e'tibor talab qiladi",
    score: "87",
    alertTitle: "Xarid jarayoni",
    alertCopy: "Kechikish ehtimoli 78%",
  },
  manager: {
    kicker: "OPERATIONAL CONTROL",
    title: "Bo'lim boshlig'i har bir tor joyni vaqtida boshqaradi.",
    copy: "O'z bo'limidagi jarayon, xodim yuklamasi, muddat va KPI og'ishlari bitta operatsion ko'rinishda jamlanadi.",
    list: [
      "Jarayon va topshiriqlar holati",
      "Xodim yuklamasi va kechikishlar",
      "Bo'limga mos AI tavsiyalari",
    ],
    summary: "Diqqat talab",
    summaryNote: "2 ta topshiriq muddatga yaqin",
    score: "78",
    alertTitle: "Tasdiqlash bosqichi",
    alertCopy: "Normadan 42 daqiqa yuqori",
  },
  analyst: {
    kicker: "ECONOMETRIC ANALYTICS",
    title: "Analitik xulosadan modelning ichigacha kira oladi.",
    copy: "Korrelyatsiya, regressiya, vaqt qatorlari, model aniqligi va prognoz natijalari chuqur tahlil uchun tayyor.",
    list: [
      "Regression va korrelyatsion tahlil",
      "R², MAE, RMSE va model aniqligi",
      "Excel va CSV orqali eksport",
    ],
    summary: "Model aniq",
    summaryNote: "R² ko'rsatkichi 0.91",
    score: "91",
    alertTitle: "Yangi bog'liqlik",
    alertCopy: "Yuklama KPIga −0.64 ta'sir qilmoqda",
  },
  employee: {
    kicker: "PERSONAL PERFORMANCE",
    title: "Xodim o'z vazifasi va natijasini ortiqcha shovqinsiz ko'radi.",
    copy: "Bugungi vazifalar, muddat, bajarilish holati, shaxsiy KPI va muhim ogohlantirishlar sodda ko'rinishda beriladi.",
    list: [
      "Shaxsiy vazifa va muddatlar",
      "KPI va bajarilish dinamikasi",
      "Faqat kerakli ogohlantirishlar",
    ],
    summary: "Reja bo'yicha",
    summaryNote: "5 vazifadan 4 tasi bajarildi",
    score: "82",
    alertTitle: "Muddat yaqin",
    alertCopy: "BP-1024 uchun 4 soat qoldi",
  },
};

const roleTabs = [...document.querySelectorAll("[data-role]")];
const rolePanel = document.querySelector("#panel-role");

const activateRole = (tab) => {
  const data = roleData[tab.dataset.role];
  if (!data || !rolePanel) return;

  roleTabs.forEach((item) => {
    const active = item === tab;
    item.setAttribute("aria-selected", String(active));
    item.tabIndex = active ? 0 : -1;
  });

  rolePanel.setAttribute("aria-labelledby", tab.id);
  rolePanel.querySelector("[data-role-kicker]").textContent = data.kicker;
  rolePanel.querySelector("[data-role-title]").textContent = data.title;
  rolePanel.querySelector("[data-role-copy]").textContent = data.copy;
  rolePanel.querySelector("[data-role-list]").innerHTML = data.list
    .map((item) => `<li><i>✓</i>${item}</li>`)
    .join("");
  rolePanel.querySelector("[data-role-summary]").textContent = data.summary;
  rolePanel.querySelector("[data-role-summary-note]").textContent =
    data.summaryNote;
  rolePanel.querySelector("[data-role-score]").textContent = data.score;
  rolePanel.querySelector("[data-role-alert-title]").textContent =
    data.alertTitle;
  rolePanel.querySelector("[data-role-alert-copy]").textContent =
    data.alertCopy;
};

roleTabs.forEach((tab, index) => {
  tab.addEventListener("click", () => activateRole(tab));
  tab.addEventListener("keydown", (event) => {
    if (
      !["ArrowDown", "ArrowUp", "ArrowRight", "ArrowLeft"].includes(event.key)
    )
      return;
    event.preventDefault();
    const direction =
      event.key === "ArrowDown" || event.key === "ArrowRight" ? 1 : -1;
    const next =
      roleTabs[(index + direction + roleTabs.length) % roleTabs.length];
    next.focus();
    activateRole(next);
  });
});

const animateCounter = (node) => {
  const target = Number(node.dataset.count);
  const duration = 1100;
  const start = performance.now();

  const frame = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    node.textContent = Math.round(target * eased).toLocaleString("uz-UZ");
    if (progress < 1) requestAnimationFrame(frame);
  };

  requestAnimationFrame(frame);
};

const counters = document.querySelectorAll("[data-count]");
if ("IntersectionObserver" in window) {
  const counterObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.65 },
  );
  counters.forEach((counter) => counterObserver.observe(counter));
} else {
  counters.forEach((counter) => (counter.textContent = counter.dataset.count));
}

document.querySelector("[data-current-year]").textContent =
  new Date().getFullYear();
