# eLearners Academy — Complete LMS Platform

A **professional, full-stack Learning Management System** for eLearners Academy — a Kenya-based
trading & finance education brand (home of the *SMP_TS Day Trading Bootcamp*). Built with the modern
web stack and packed with the pro and trending features expected of a 2026-era LMS.

![Stack](https://img.shields.io/badge/Next.js-15-black) ![TS](https://img.shields.io/badge/TypeScript-strict-blue) ![Prisma](https://img.shields.io/badge/Prisma-SQLite-2D3748) ![Tailwind](https://img.shields.io/badge/TailwindCSS-3-38bdf8)

---

## ✨ Features

### Core LMS
- **Course catalog** with search, category / level / price filters, and sorting
- **Rich course detail** pages — curriculum accordion, outcomes, requirements, instructor bio, ratings breakdown, reviews
- **Distraction-free course player** — video + article lessons, resume-where-you-left-off, auto-advance, mark-complete
- **Quiz engine** — single / multiple / true-false questions, auto-grading, pass marks, instant feedback, retries
- **Progress tracking** — per-lesson completion drives course progress and certificates
- **Certificates** — auto-issued on completion, printable/PDF, with a **public verification page**
- **Reviews & ratings**, **wishlist**, **cart & checkout** with **coupon codes**

### Pro / Trending
- 🤖 **AI Learning Tutor** — a site-wide chat companion (Claude-powered, with a smart offline fallback) that knows the course context
- 🏆 **Gamification** — points, badges, daily streaks, leagues, and a leaderboard
- 💬 **Community Q&A forums** — per-course threads, instructor answers, resolved/pinned states
- 🎥 **Live sessions / webinars** — scheduling and one-click registration
- 🧭 **Learning paths** — curated multi-course journeys (e.g. *Zero to Funded Trader*)
- 🔔 **Notifications**, **announcements**, **in-lesson note-taking**
- 🌗 **Dark-mode-ready** design system, fully responsive

### Role-based dashboards
- **Student** — overview, my learning, wishlist, certificates, achievements, notifications, settings
- **Instructor Studio** — analytics (enrollments, revenue), courses, students, earnings
- **Admin Console** — platform analytics, users, courses, orders

---

## 🧱 Tech Stack

| Layer | Choice |
|------|--------|
| Framework | **Next.js 15** (App Router, Server Components) |
| Language | **TypeScript** (strict) |
| Styling | **Tailwind CSS** with a custom brand design system |
| Database | **Prisma ORM** + SQLite (swap `datasource` for Postgres in prod) |
| Auth | **NextAuth** (credentials, JWT sessions, RBAC) |
| Charts | **Recharts** · Icons **lucide-react** · Toasts **sonner** |

---

## 🚀 Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Set up the database (creates SQLite db + seeds demo data)
npm run setup        # = prisma db push && prisma db seed

# 3. Run the dev server
npm run dev
```

Open <http://localhost:3000>.

> A `.env` is included for local dev. For production, set a strong `NEXTAUTH_SECRET`,
> point `DATABASE_URL` at Postgres, and (optionally) add `ANTHROPIC_API_KEY` to power the
> AI tutor with live Claude responses. Without a key, the tutor uses a built-in domain-aware fallback.

### Demo accounts (password: `password123`)

| Role | Email |
|------|-------|
| Admin | `admin@elearnersacademy.co.ke` |
| Instructor | `peter@elearnersacademy.co.ke` |
| Student | `student@example.com` |

---

## 📜 Useful scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build (`prisma generate` + `next build`) |
| `npm run setup` | Push schema + seed data |
| `npm run db:seed` | Re-seed the database |
| `npm run db:reset` | Wipe + re-seed |

---

## 🗂️ Project structure

```
prisma/
  schema.prisma        # full data model (25+ models)
  seed.ts              # rich eLearners Academy demo content
src/
  app/
    (marketing)/       # public site (home, courses, about, live, community, verify, …)
    (auth)/            # login / register
    learn/[slug]/      # the course player
    dashboard/         # student area
    instructor/        # instructor studio
    admin/             # admin console
    api/               # route handlers (enroll, progress, quiz, checkout, chat, …)
  components/          # UI + feature components
  lib/                 # prisma, auth, session, queries, gamification, utils
```

---

## 💳 Payments

Checkout is wired as a simulated **IntaSend** flow (Kenya-friendly: M-Pesa, card, bank). To go live,
create the order as `PENDING`, redirect to IntaSend, and confirm enrollment via their webhook in
`src/app/api/checkout/route.ts`.

---

## 📄 License

Built for eLearners Academy. All brand assets © their respective owners.
