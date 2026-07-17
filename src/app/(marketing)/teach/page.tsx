import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  Users,
  Wallet,
  LayoutDashboard,
  Video,
  BarChart3,
  UserPlus,
  Upload,
  Rocket,
  CheckCircle2,
} from "lucide-react";

export const metadata = { title: "Become an Instructor — eLearners Academy" };

const benefits = [
  {
    icon: Users,
    title: "Reach engaged learners",
    desc: "Tap into a growing community of driven students across Kenya and beyond who are ready to learn.",
  },
  {
    icon: Wallet,
    title: "Earn doing what you love",
    desc: "Turn your expertise into recurring income with transparent revenue sharing on every enrollment.",
  },
  {
    icon: LayoutDashboard,
    title: "Powerful teaching tools",
    desc: "Build courses, upload lessons, run quizzes, and issue certificates from one clean dashboard.",
  },
  {
    icon: Video,
    title: "Host live sessions",
    desc: "Run live trade-alongs, webinars, and Q&As to connect with your students in real time.",
  },
  {
    icon: BarChart3,
    title: "Insightful analytics",
    desc: "Track enrollments, completion, ratings and revenue with clear, actionable reporting.",
  },
  {
    icon: Sparkles,
    title: "AI-assisted learning",
    desc: "Your students get 24/7 AI tutoring grounded in your course, so they stay engaged and finish.",
  },
];

const steps = [
  {
    icon: UserPlus,
    title: "Apply",
    desc: "Create your instructor account and tell us about your expertise and the topics you want to teach.",
  },
  {
    icon: Upload,
    title: "Build your course",
    desc: "Use our studio to structure sections, upload lessons, add quizzes, and set your pricing.",
  },
  {
    icon: Rocket,
    title: "Publish & earn",
    desc: "Launch to our community, run live sessions, and start earning as learners enroll.",
  },
];

export default function TeachPage() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-navy-900 text-white">
        <div className="absolute inset-0 bg-hero-grid" />
        <div className="absolute -right-40 top-0 h-96 w-96 rounded-full bg-sky/20 blur-3xl" />
        <div className="absolute -left-40 bottom-0 h-96 w-96 rounded-full bg-gold-400/10 blur-3xl" />
        <div className="container-page relative grid items-center gap-12 py-20 lg:grid-cols-2 lg:py-28">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-gold-400/30 bg-gold-400/10 px-4 py-1.5 text-sm font-semibold text-gold-300">
              <Sparkles className="h-4 w-4" /> Teach on eLearners Academy
            </span>
            <h1 className="mt-6 font-display text-4xl font-black leading-[1.1] sm:text-5xl lg:text-6xl">
              Share your skill. <span className="text-gradient-gold">Get paid</span> to teach.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-slate-300">
              Join eLearners Academy as an instructor and help learners across Kenya master trading,
              crypto, and personal finance — while building a rewarding income stream of your own.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/register" className="btn-primary btn-lg">
                Start teaching <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/instructors"
                className="btn-outline btn-lg !border-white/20 !bg-white/5 !text-white hover:!bg-white/10"
              >
                Meet our instructors
              </Link>
            </div>
          </div>

          {/* Earnings illustration */}
          <div className="relative">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-300">Estimated monthly earnings</p>
                <span className="badge-green">Live</span>
              </div>
              <p className="mt-2 font-display text-4xl font-black text-gold-400">Ksh 185,000</p>
              <p className="text-xs text-slate-400">Based on 74 enrollments this month</p>

              <div className="mt-6 space-y-4">
                {[
                  { label: "SMP_TS Bootcamp", value: "Ksh 120,000", pct: "85%" },
                  { label: "Crypto Masterclass", value: "Ksh 45,000", pct: "55%" },
                  { label: "Live mentorship", value: "Ksh 20,000", pct: "35%" },
                ].map((r) => (
                  <div key={r.label}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-300">{r.label}</span>
                      <span className="font-semibold text-white">{r.value}</span>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-sky to-gold-400"
                        style={{ width: r.pct }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute -bottom-4 -left-4 flex items-center gap-2 rounded-2xl bg-white p-3 shadow-card-hover">
              <Users className="h-6 w-6 text-sky-dark" />
              <div className="text-navy-900">
                <p className="text-xs font-medium text-navy-400">Your students</p>
                <p className="text-sm font-bold">Growing daily</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="container-page py-20">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <span className="eyebrow">Why teach with us</span>
          <h2 className="mt-2 section-title">Everything you need to teach and earn</h2>
          <p className="mt-3 text-lg text-navy-500 dark:text-slate-400">
            A complete platform that handles the tech, so you can focus on your students.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {benefits.map((b) => (
            <div key={b.title} className="card p-6">
              <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky/15 to-gold-400/15 text-sky-dark">
                <b.icon className="h-6 w-6" />
              </span>
              <h3 className="mb-2 font-display text-lg font-bold text-navy-900 dark:text-white">
                {b.title}
              </h3>
              <p className="text-sm text-navy-500 dark:text-slate-400">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-navy-50 py-20 dark:bg-navy-900/40">
        <div className="container-page">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <span className="eyebrow">How it works</span>
            <h2 className="mt-2 section-title">Launch in three simple steps</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {steps.map((s, i) => (
              <div key={s.title} className="card relative p-7">
                <span className="absolute right-6 top-6 font-display text-5xl font-black text-navy-100 dark:text-navy-800">
                  {i + 1}
                </span>
                <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-navy-900 text-gold-400">
                  <s.icon className="h-6 w-6" />
                </span>
                <h3 className="mb-2 font-display text-lg font-bold text-navy-900 dark:text-white">
                  {s.title}
                </h3>
                <p className="text-sm text-navy-500 dark:text-slate-400">{s.desc}</p>
              </div>
            ))}
          </div>

          <ul className="mx-auto mt-12 grid max-w-3xl gap-3 sm:grid-cols-2">
            {[
              "No upfront costs — you only share revenue when you earn",
              "Keep ownership of your content",
              "Dedicated instructor support team",
              "Payouts via M-Pesa and bank transfer",
            ].map((t) => (
              <li
                key={t}
                className="flex items-center gap-3 rounded-2xl bg-white p-4 text-sm text-navy-700 shadow-sm dark:bg-navy-900 dark:text-slate-300"
              >
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" /> {t}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="container-page py-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gold-400 to-gold-600 px-6 py-16 text-center text-navy-900">
          <div className="relative mx-auto max-w-2xl">
            <h2 className="font-display text-3xl font-black sm:text-4xl">
              Ready to inspire the next funded trader?
            </h2>
            <p className="mt-4 text-lg text-navy-800">
              Create your instructor account today and start building your first course.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/register" className="btn-navy btn-lg">
                Become an instructor <ArrowRight className="h-5 w-5" />
              </Link>
              <Link href="/contact" className="btn-outline btn-lg !border-navy-900/20 !bg-white/30">
                Talk to our team
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
