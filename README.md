# AI-BPM Monitor

AI yordamida biznes jarayonlarini monitoring, prognoz, iqtisodiy baholash va boshqaruv tavsiyalariga aylantiruvchi platformaning frontend UI'i. Hozirgi product fokus — premium Executive Dashboard.

## Stack

- pnpm
- Next.js App Router
- React
- Prisma ORM + Neon PostgreSQL
- Argon2id va DB-backed session auth
- PostgreSQL-backed background job queue
- Vitest
- Global CSS design system
- `next/font` orqali self-host qilingan Manrope va DM Sans

## Ishga tushirish

```bash
pnpm install
pnpm db:apply-import
pnpm db:generate
pnpm dev
```

Brauzerda [http://localhost:3000](http://localhost:3000) manzilini oching.

Asosiy app dashboard: [http://localhost:3000/dashboard](http://localhost:3000/dashboard)

## Tekshiruv

```bash
pnpm lint
pnpm format:check
pnpm test:coverage
pnpm db:validate
pnpm build
```

## Muhim fayllar

- `PROJECT_PLAN.md` — TZ asosidagi UI/UX va mahsulot yo'l xaritasi.
- `app/globals.css` — ranglar, tipografika, spacing, radius va responsive qoidalar.
- `components/landing/LandingPage.jsx` — server-render qilinadigan landing markup'i.
- `components/landing/LandingEnhancer.jsx` — kichik client-side progressive enhancement chegarasi.
- `app/(product)/layout.jsx` — barcha product modullari uchun umumiy app layout.
- `components/app/AppShell.jsx` — responsive sidebar, topbar va product navigation.
- `components/dashboard/ExecutiveDashboard.jsx` — live mock stream, BPEI trend, AI Decision Desk, process bullet chart, risk matrix va iqtisodiy bridge bilan decision-first dashboard.
- `lib/dashboard-data.js` — frontend demo dataset va navigation modeli.
- `lib/server/auth/` — password, session va role tekshiruvlari.
- `lib/server/jobs/import-jobs.js` — retry va stale-lock recovery bilan durable import queue.
- `tests/` — parser, mapping, deterministic analysis va auth unit testlari.

Product sahifalari login talab qiladi. Import yozuvlari sessiondagi
`organizationId` bo‘yicha ajratiladi; `VIEWER` importlarni ko‘radi, ammo upload,
mapping va analysis amallarini faqat `ADMIN` yoki `ANALYST` bajaradi.
