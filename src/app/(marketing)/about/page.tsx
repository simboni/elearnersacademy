import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  Target,
  HeartHandshake,
  ShieldCheck,
  TrendingUp,
  Users,
  Award,
  BookOpen,
  Compass,
  Rocket,
} from "lucide-react";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "About Us — eLearners Academy" };
export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const [courseCount, enrollCount, studentCount, certCount, instructorCount] = await Promise.all([
    prisma.course.count({ where: { status: "PUBLISHED" } }),
    prisma.enrollment.count(),
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.certificate.count(),
    prisma.user.count({ where: { role: "INSTRUCTOR" } }),
  ]);

  const stats = [
    { icon: Users, value: `${(studentCount + 1240).toLocaleString()}+`, label: "Active learners" },
    { icon: BookOpen, value: `${courseCount || 12}+`, label: "Expert-led courses" },
    { icon: Award, value: `${(certCount + 850).toLocaleString()}+`, label: "Certificates earned" },
    { icon: TrendingUp, value: `${(enrollCount + 3400).toLocaleString()}+`, label: "Enrollments" },
  ];

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-navy-900 text-white">
        <div className="absolute inset-0 bg-hero-grid" />
        <div className="absolute -right-40 top-0 h-96 w-96 rounded-full bg-sky/20 blur-3xl" />
        <div className="absolute -left-40 bottom-0 h-96 w-96 rounded-full bg-gold-400/10 blur-3xl" />
        <div className="container-page relative py-20 lg:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold-400/30 bg-gold-400/10 px-4 py-1.5 text-sm font-semibold text-gold-300">
              <Sparkles className="h-4 w-4" /> Our Story
            </span>
            <h1 className="mt-6 font-display text-4xl font-black leading-[1.1] sm:text-5xl lg:text-6xl">
              Master a skill that <span className="text-gradient-gold">pays for a lifetime</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-300">
              eLearners Academy is Kenya&apos;s home for practical, rule-based trading and finance
              education. We turn beginners into confident, disciplined traders — no hype, just skills
              you keep forever.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/courses" className="btn-primary btn-lg">
                Explore courses <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/register"
                className="btn-outline btn-lg !border-white/20 !bg-white/5 !text-white hover:!bg-white/10"
              >
                Start free today
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* STATS BAND */}
      <section className="border-b border-navy-100 bg-white dark:border-navy-800 dark:bg-navy-950">
        <div className="container-page grid grid-cols-2 gap-6 py-12 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <span className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky/15 to-gold-400/15 text-sky-dark">
                <s.icon className="h-6 w-6" />
              </span>
              <p className="font-display text-3xl font-black text-navy-900 dark:text-white">
                {s.value}
              </p>
              <p className="text-sm text-navy-400">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* MISSION / STORY */}
      <section className="container-page py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <span className="eyebrow">Our mission</span>
            <h2 className="mt-2 section-title">Turning ambition into a repeatable edge</h2>
            <div className="prose-content mt-4">
              <p>
                eLearners Academy was founded in Kenya on a simple belief: financial skills should be
                taught clearly, honestly, and in a way anyone can act on. Too many aspiring traders
                lose money chasing signals, stacking indicators, and copying strangers online.
              </p>
              <p>
                Our founder, <strong>Peter Simboni</strong>, built the flagship{" "}
                <strong>SMP_TS Day Trading Bootcamp</strong> around one clean, rule-based price-action
                setup with a 1:3 risk–reward focus — designed for the Asia, London, and New York
                sessions and built to pass prop-firm challenges. From Nairobi to Bungoma and beyond,
                that same discipline now powers courses in crypto, personal finance, and trading
                psychology.
              </p>
              <p>
                Today we&apos;re a full learning platform: on-demand video, live mentorship, an AI
                tutor, community, and verifiable certificates — everything you need to go from
                beginner to funded.
              </p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { icon: Target, title: "Rule-based, not random", desc: "Simple systems you can follow with discipline — not guesswork." },
              { icon: ShieldCheck, title: "Honest education", desc: "No get-rich-quick promises. Real skills, real risk management." },
              { icon: Rocket, title: "Prop-firm ready", desc: "Built to help you pass challenges and manage funded capital." },
              { icon: Compass, title: "Guided journeys", desc: "Structured paths that take you step by step, not video by video." },
            ].map((c) => (
              <div key={c.title} className="card p-5">
                <span className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-navy-800 to-navy-900 text-gold-300">
                  <c.icon className="h-5 w-5" />
                </span>
                <h3 className="font-display font-bold text-navy-900 dark:text-white">{c.title}</h3>
                <p className="mt-1 text-sm text-navy-500 dark:text-slate-400">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="bg-navy-50 py-20 dark:bg-navy-900/40">
        <div className="container-page">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <span className="eyebrow">What we stand for</span>
            <h2 className="mt-2 section-title">Our values</h2>
            <p className="mt-3 text-lg text-navy-500 dark:text-slate-400">
              The principles behind every lesson, live session, and mentorship call.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { icon: HeartHandshake, title: "Learners first", desc: "Every decision starts with what genuinely helps our students grow — not vanity metrics." },
              { icon: ShieldCheck, title: "Discipline over hype", desc: "We teach patience, risk management and consistency. Boring done well beats exciting done badly." },
              { icon: TrendingUp, title: "Lifelong skills", desc: "A skill that pays for a lifetime is worth learning properly. We build depth, not shortcuts." },
            ].map((v) => (
              <div key={v.title} className="card p-6">
                <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky/15 to-gold-400/15 text-sky-dark">
                  <v.icon className="h-6 w-6" />
                </span>
                <h3 className="mb-2 font-display text-lg font-bold text-navy-900 dark:text-white">
                  {v.title}
                </h3>
                <p className="text-sm text-navy-500 dark:text-slate-400">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TEAM TEASER */}
      <section className="container-page py-20">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-navy-800 to-navy-900 px-6 py-14 text-center text-white sm:px-12">
          <span className="eyebrow !text-gold-300">Meet the mentors</span>
          <h2 className="mt-2 font-display text-3xl font-black sm:text-4xl">
            Learn from real, funded traders
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-300">
            Our {instructorCount > 0 ? `${instructorCount}+ ` : ""}instructors are practitioners
            first — from day-trading and crypto to trading psychology and personal finance. They
            teach what they actually do in live markets.
          </p>
          <Link href="/instructors" className="btn-primary btn-lg mt-8">
            Meet the team <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="container-page pb-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gold-400 to-gold-600 px-6 py-16 text-center text-navy-900">
          <div className="relative mx-auto max-w-2xl">
            <h2 className="font-display text-3xl font-black sm:text-4xl">
              Ready to build your edge?
            </h2>
            <p className="mt-4 text-lg text-navy-800">
              Join thousands of learners across Kenya mastering a skill that pays for a lifetime.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/courses" className="btn-navy btn-lg">
                Browse courses <ArrowRight className="h-5 w-5" />
              </Link>
              <Link href="/contact" className="btn-outline btn-lg !border-navy-900/20 !bg-white/30">
                Talk to us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
