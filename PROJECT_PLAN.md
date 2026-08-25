# AI-BPM Monitor — UI/UX Implementation Plan

## 1. Mahsulotni tushunish

AI-BPM Monitor oddiy jarayon kuzatuv tizimi emas. Platforma tashkilot ma'lumotlarini yig'ib, biznes jarayonlarini kuzatadi, KPI va BPEI indeksini hisoblaydi, AI yordamida anomaliya, kechikish va risklarni oldindan aniqlaydi, iqtisodiy ta'sirni baholaydi va rahbar uchun amaliy tavsiya tayyorlaydi.

Asosiy qiymat zanjiri:

`Ma'lumot → Monitoring → AI tahlil → Prognoz → Iqtisodiy baholash → Tavsiya → Qaror → Qayta monitoring`

### Asosiy foydalanuvchilar

1. Rahbar — umumiy holat, kritik risklar, prognoz va qaror uchun tavsiyalar.
2. Tashkilot administratori — tuzilma, bo'lim, jarayon, KPI va monitoring sozlamalari.
3. Bo'lim boshlig'i — o'z bo'limining jarayonlari, xodimlari va samaradorligi.
4. Xodim — vazifa, muddat, KPI va ogohlantirishlar.
5. Analitik — ekonometrika, model aniqligi, prognoz va ma'lumot eksporti.
6. Super administrator — tashkilotlar, rollar, audit va umumiy boshqaruv.

## 2. UI/UX tamoyillari

- **Decision-first:** rahbar eng muhim muammo va keyingi harakatni bir qarashda tushunadi.
- **Progressive disclosure:** murakkab tahlillar avval xulosa, keyin detal shaklida ochiladi.
- **Calm intelligence:** AI vizual shovqin emas, ishonchli yordamchi sifatida ko'rinadi.
- **Status clarity:** normal, e'tibor va kritik holatlar faqat rang bilan emas, ikonka va matn bilan ham ajratiladi.
- **Role-aware:** har bir rol faqat o'z qaroriga kerakli ma'lumotlarni ko'radi.
- **Responsive by default:** desktop, planshet va mobil ekranlarda axborot ustuvorligi saqlanadi.
- **Accessible:** yetarli kontrast, keyboard navigation, focus state va reduced-motion qo'llab-quvvatlanadi.

## 3. Vizual yo'nalish

- Asosiy fon: iliq ivory va sof oq qatlamlar.
- Brand rang: kuygan olovrang (`ember`), agressiv bo'lmagan aksent sifatida.
- Tayanch ranglar: chuqur ko'mir rang va iliq jigarrang-qora.
- Holatlar: sage yashil, amber va crimson; har biri matn/ikonka bilan mustahkamlanadi.
- Tipografika: sarlavhalarda xarakterli display shrift, interfeysda yuqori o'qiluvchan sans-serif.
- Kartalar: yengil border, yumshoq soya, katta radius; ortiqcha glassmorphism ishlatilmaydi.

## 3.1. Tasdiqlangan frontend stack

- Package manager: **pnpm**.
- Framework: **Next.js (App Router)**.
- UI layer: **React**.
- Styling: markazlashtirilgan global design tokenlar va component-level classlar.
- Fontlar: `next/font` orqali self-host qilinadi; runtime Google Fonts so'rovi yo'q.
- Landing sahifa statik prerender qilinadi, faqat interaktiv qismlar client component bo'ladi.

## 4. Bosqichma-bosqich yo'l xaritasi

### Phase 1 — Landing page

- [x] TZni mahsulot konsepsiyasiga ajratish.
- [x] Global ranglar, spacing, radius, shadow va typography tokenlarini yaratish.
- [x] Responsive navigation va mobil menyu.
- [x] Kuchli hero: platforma va'dasi, CTA va jonli dashboard preview.
- [x] Platforma qiymatini tushuntiruvchi problem/solution blok.
- [x] Yopiq boshqaruv sikli (monitoringdan qarorgacha).
- [x] AI imkoniyatlari va iqtisodiy natijalarni vizual ko'rsatish.
- [x] Rollar va xavfsizlik haqida ishonch bloki.
- [x] Yakuniy CTA va professional footer.
- [x] Scroll reveal, counter va mayin micro-interactionlar.
- [x] Next.js build, accessibility va responsive QA.

### Phase 2 — App foundation

- [x] Tanlangan frontend stackni sozlash.
- [x] Design systemni komponentlarga ajratish.
- [x] App shell: sidebar, topbar, breadcrumbs, command/search.
- [x] Rahbar roli uchun navigation foundation va holatlar.
- [x] Demo dataset va frontend data layer.

### Phase 3 — MVP ekranlari

- [x] Sodda email/parol login ekrani.
- [x] Executive Dashboard — premium UI redesign v1.
- [ ] Tashkilot va bo'limlar.
- [ ] Biznes jarayonlari ro'yxati va process detail.
- [ ] Jarayon bosqichlari uchun flow/BPMN ko'rinishi.
- [ ] KPI va BPEI monitoring.
- [ ] AI anomaliya, prognoz, risk score va tavsiyalar.
- [ ] Before/After va reja/fakt taqqoslash.
- [ ] ROI, NPV va iqtisodiy samaradorlik.
- [ ] Econometric Analytics.
- [ ] Hisobotlar va eksport holatlari.

### Hozirgi fokus — faqat Dashboard

- [x] Lokal iVision shell va typography tizimini audit qilish.
- [x] KidoAI chart composition va dashboard density patternlarini audit qilish.
- [x] Bulky qora sidebarni sokin, integratsiyalashgan product shell bilan almashtirish.
- [x] Bir xil 5 ta KPI card o‘rniga asymmetric executive composition qurish.
- [x] BPEI trend, process bullet chart, risk matrix, economic bridge va department lollipop chartlarini yaratish.
- [x] Client-side live mock stream, pause/refresh, 6/12 oy switch va CSV exportni ulash.
- [x] Topbar searchni olib tashlash va operational typography minimumini oshirish.
- [x] 1920px, 1440px va 390px ekranlarda browser QA.
- [ ] Dashboard vizual yo‘nalishini client bilan tasdiqlash.

Qolgan product sectionlari Dashboard tasdiqlanmaguncha ataylab pauzada turadi.

### Phase 4 — UX hardening

- [ ] Empty, loading, error va permission-denied holatlari.
- [ ] Form validation va destructive action confirmation.
- [ ] Table/filter/search/pagination patternlari.
- [ ] Notification center va smart alertlar.
- [ ] Mobile va tablet optimizatsiyasi.
- [ ] Accessibility audit va performance audit.

### Phase 5 — Backend integratsiyaga tayyorlash

- [ ] API contractlarni UI ehtiyojlari asosida belgilash.
- [ ] Authentication va role permission mapping.
- [ ] Real data, polling/realtime va cache strategiyasi.
- [ ] Audit log va export oqimlari.
- [ ] AI natijalari uchun confidence, explanation va human-decision patternlari.

## 5. Landing page qabul mezonlari

- Platformaning kim uchun va qanday muammoni hal qilishi 5–8 soniyada anglashiladi.
- Asosiy CTA har bir muhim nuqtada aniq va bir xil ma'noda ishlaydi.
- 360px dan katta barcha ekranlarda horizontal scroll yo'q.
- Keyboard orqali barcha interaktiv elementlarga yetib borish mumkin.
- Ranglar CSS custom property orqali markazdan boshqariladi.
- Animatsiyalar `prefers-reduced-motion` sozlamasiga hurmat qiladi.
- JavaScript o'chirilganda ham asosiy kontent o'qiladi.

## 6. Keyingi qarorlar

Landing tasdiqlangach quyidagilar birgalikda belgilanadi:

1. Frontend framework va build tool.
2. Chart va process visualization yechimi.
3. Yakuniy product nomi va logo.
4. Birinchi bo'lib dizayn qilinadigan rol — tavsiya: **Rahbar Dashboard**.
5. Demo ma'lumotlarning real tashkilotga qanchalik yaqin bo'lishi.
