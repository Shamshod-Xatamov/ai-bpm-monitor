# AI-BPM Monitor

AI yordamida biznes jarayonlarini monitoring, prognoz, iqtisodiy baholash va boshqaruv tavsiyalariga aylantiruvchi platformaning landing page'i.

## Stack

- pnpm
- Next.js App Router
- React
- Global CSS design system
- `next/font` orqali self-host qilingan Manrope va DM Sans

## Ishga tushirish

```bash
pnpm install
pnpm dev
```

Brauzerda [http://localhost:3000](http://localhost:3000) manzilini oching.

## Tekshiruv

```bash
pnpm lint
pnpm format:check
pnpm build
```

## Muhim fayllar

- `PROJECT_PLAN.md` — TZ asosidagi UI/UX va mahsulot yo'l xaritasi.
- `app/globals.css` — ranglar, tipografika, spacing, radius va responsive qoidalar.
- `components/landing/LandingPage.jsx` — server-render qilinadigan landing markup'i.
- `components/landing/LandingEnhancer.jsx` — kichik client-side progressive enhancement chegarasi.
