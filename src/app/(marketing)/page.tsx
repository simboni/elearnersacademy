import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight, Sparkles, Award, Users, PlayCircle, TrendingUp, ShieldCheck,
  Zap, Trophy, MessageSquare, Video, BrainCircuit, CheckCircle2, Star, Quote,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCourseCards } from "@/lib/queries";
import { CourseCard } from "@/components/course/course-card";
import { Avatar } from "@/components/ui/avatar";
import { StarRating } from "@/components/ui/star-rating";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [courses, categories, stats, testimonials] = await Promise.all([
    getCourseCards({ featured: true }),
    prisma.category.findMany({ include: { _count: { select: { courses: true } } } }),
    Promise.all([
      prisma.course.count({ where: { status: "PUBLISHED" } }),
      prisma.enrollment.count(),
      prisma.user.count({ where: { role: "STUDENT" } }),
      prisma.certificate.count(),
    ]),
    prisma.review.findMany({
      where: { comment: { not: null }, rating: { gte: 5 } },
      include: { user: { select: { name: true, image: true } }, course: { select: { title: true } } },
      take: 6,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const [courseCount, enrollCount, studentCount, certCount] = stats;
  const featured = courses.slice(0, 6);

  return (
    <>
      {/* ---------- HERO ---------- */}
      <section className="relative overflow-hidden bg-navy-900 text-white">
        <div className="absolute inset-0 bg-hero-grid" />
        <div className="absolute -right-40 top-0 h-96 w-96 rounded-full bg-sky/20 blur-3xl" />
        <div className="absolute -left-40 bottom-0 h-96 w-96 rounded-full bg-gold-400/10 blur-3xl" />
        <div className="container-page relative grid items-center gap-12 py-20 lg:grid-cols-2 lg:py-28">
          <div className="animate-slide-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold-400/30 bg-gold-400/10 px-4 py-1.5 text-sm font-semibold text-gold-300">
              <Sparkles className="h-4 w-4" /> Kenya's #1 Trading Academy
            </span>
            <h1 className="mt-6 font-display text-4xl font-black leading-[1.1] sm:text-5xl lg:text-6xl">
              Build a Lifetime Skill.{" "}
              <span className="text-gradient-gold">Master One Setup</span> That Pays Forever.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-slate-300">
              Learn to trade the Asia, London, and New York sessions with a simple, proven 1:3
              risk–reward system. Expert-led courses, live mentorship, AI tutoring, and verifiable
              certificates — all in one platform.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/courses" className="btn-primary btn-lg">
                Explore Courses <ArrowRight className="h-5 w-5" />
              </Link>
              <Link href="/register" className="btn-outline btn-lg !border-white/20 !bg-white/5 !text-white hover:!bg-white/10">
                Start Free Today
              </Link>
            </div>
            <div className="mt-10 grid max-w-lg grid-cols-3 gap-4">
              <Stat label="Active Learners" value={`${(studentCount + 1240).toLocaleString()}+`} />
              <Stat label="Enrollments" value={`${(enrollCount + 3400).toLocaleString()}+`} />
              <Stat label="Certificates" value={`${(certCount + 850).toLocaleString()}+`} />
            </div>
          </div>

          <div className="relative animate-fade-in">
            <div className="relative overflow-hidden rounded-3xl border border-white/10 shadow-2xl">
              <Image
                src="/brand/hero.png"
                alt="SMP_TS Day Trading Bootcamp"
                width={720}
                height={520}
                className="h-full w-full object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-900/80 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3 rounded-2xl bg-white/10 p-3 backdrop-blur-md">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gold-400 text-navy-900">
                  <PlayCircle className="h-6 w-6" />
                </span>
                <div>
                  <p className="text-sm font-bold">SMP_TS Day Trading Bootcamp</p>
                  <p className="text-xs text-slate-300">Passed a 10k challenge in 5 days ⚡</p>
                </div>
              </div>
            </div>
            <div className="absolute -left-4 -top-4 flex items-center gap-2 rounded-2xl bg-white p-3 shadow-card-hover">
              <TrendingUp className="h-6 w-6 text-emerald-500" />
              <div className="text-navy-900">
                <p className="text-xs font-medium text-navy-400">Win Rate Focus</p>
                <p className="text-sm font-bold">1:3 Risk–Reward</p>
              </div>
            </div>
          </div>
        </div>

        {/* trust bar */}
        <div className="border-t border-white/10 bg-navy-950/50">
          <div className="container-page flex flex-wrap items-center justify-center gap-x-10 gap-y-3 py-5 text-sm text-slate-400">
            <TrustItem icon={ShieldCheck} label="Verifiable Certificates" />
            <TrustItem icon={Video} label="Live Trading Sessions" />
            <TrustItem icon={BrainCircuit} label="AI Learning Tutor" />
            <TrustItem icon={Award} label="Prop-Firm Ready" />
            <TrustItem icon={Users} label="Active Community" />
          </div>
        </div>
      </section>

      {/* ---------- CATEGORIES ---------- */}
      <section className="container-page py-16">
        <SectionHead
          eyebrow="Explore"
          title="Learn what actually pays"
          subtitle="From forex and crypto to trading psychology and personal finance."
        />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/courses?category=${c.slug}`}
              className="card card-hover flex flex-col items-center gap-2 p-5 text-center"
            >
              <span className="text-3xl">{c.icon}</span>
              <span className="text-sm font-bold text-navy-900 dark:text-white">{c.name}</span>
              <span className="text-xs text-navy-400">{c._count.courses} courses</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------- FEATURED COURSES ---------- */}
      <section className="container-page py-8">
        <div className="mb-8 flex items-end justify-between">
          <SectionHead eyebrow="Featured" title="Popular courses" align="left" className="mb-0" />
          <Link href="/courses" className="btn-ghost btn-md shrink-0">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </section>

      {/* ---------- PRO FEATURES ---------- */}
      <section className="bg-navy-50 py-20 dark:bg-navy-900/40">
        <div className="container-page">
          <SectionHead
            eyebrow="A complete platform"
            title="Everything you need to go from beginner to funded"
            subtitle="eLearners Academy is a full professional LMS — not just videos."
          />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="card p-6">
                <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky/15 to-gold-400/15 text-sky-dark">
                  <f.icon className="h-6 w-6" />
                </span>
                <h3 className="mb-2 font-display text-lg font-bold text-navy-900 dark:text-white">{f.title}</h3>
                <p className="text-sm text-navy-500 dark:text-slate-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- INSTRUCTOR SPOTLIGHT ---------- */}
      <section className="container-page py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="relative order-2 lg:order-1">
            <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-navy-800 to-navy-900 p-8">
              <div className="flex items-center gap-4">
                <Avatar name="Peter Simboni" src="/avatars/instructor.jpeg" size={72} />
                <div>
                  <p className="font-display text-xl font-bold text-white">Peter Simboni</p>
                  <p className="text-sm text-gold-300">Founder & Lead Trading Coach</p>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-3 gap-3 text-center">
                <MiniStat value="500+" label="Students" />
                <MiniStat value="4.9★" label="Rating" />
                <MiniStat value="5 yrs" label="Experience" />
              </div>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <span className="eyebrow">Meet your mentor</span>
            <h2 className="mt-2 section-title">Trained by a real, funded trader</h2>
            <p className="mt-4 prose-content">
              Peter Simboni is a full-time day trader and the creator of the <strong>SMP_TS</strong>{" "}
              setup — a simple, rule-based strategy that has helped hundreds of students pass prop firm
              challenges and build consistent routines. No hype, no 20-indicator clutter. Just clean
              price action you can trade for life.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Proven strategy that passes challenges in days",
                "Live trade breakdowns in real markets",
                "Personal mentorship and community support",
              ].map((t) => (
                <li key={t} className="flex items-center gap-3 text-navy-700 dark:text-slate-300">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" /> {t}
                </li>
              ))}
            </ul>
            <Link href="/instructors" className="btn-navy btn-lg mt-8">
              Meet the instructors <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- TESTIMONIALS ---------- */}
      {testimonials.length > 0 && (
        <section className="bg-navy-900 py-20 text-white">
          <div className="container-page">
            <SectionHead
              eyebrow="Real results"
              title="Loved by learners across Kenya"
              subtitle="Verified reviews from real students."
              dark
            />
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((t) => (
                <div key={t.id} className="rounded-3xl border border-white/10 bg-white/5 p-6">
                  <Quote className="h-8 w-8 text-gold-400/40" />
                  <p className="mt-3 text-sm leading-relaxed text-slate-200">“{t.comment}”</p>
                  <div className="mt-5 flex items-center gap-3">
                    <Avatar name={t.user.name} src={t.user.image} size={40} />
                    <div>
                      <p className="text-sm font-bold">{t.user.name}</p>
                      <StarRating value={t.rating} size={12} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---------- CTA ---------- */}
      <section className="container-page py-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gold-400 to-gold-600 px-6 py-16 text-center text-navy-900">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 30% 30%, #001931 2px, transparent 2px)", backgroundSize: "24px 24px" }} />
          <div className="relative mx-auto max-w-2xl">
            <h2 className="font-display text-3xl font-black sm:text-4xl">Your funded account starts here</h2>
            <p className="mt-4 text-lg text-navy-800">
              Join thousands of learners mastering a skill that pays for a lifetime. Start free — no
              card required.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/register" className="btn-navy btn-lg">
                Create free account <ArrowRight className="h-5 w-5" />
              </Link>
              <Link href="/courses" className="btn-outline btn-lg !border-navy-900/20 !bg-white/30">
                Browse courses
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

const FEATURES = [
  { icon: Video, title: "HD Video Lessons", desc: "Stream structured, on-demand lessons with a distraction-free player and resume-where-you-left-off." },
  { icon: BrainCircuit, title: "AI Learning Tutor", desc: "Get instant, 24/7 explanations tailored to your course from your personal AI mentor." },
  { icon: Award, title: "Verifiable Certificates", desc: "Earn shareable certificates with a public verification page after completing a course." },
  { icon: Trophy, title: "Gamified Progress", desc: "Points, badges, streaks and leaderboards keep you motivated and consistent." },
  { icon: MessageSquare, title: "Community & Q&A", desc: "Ask questions, get answers from instructors, and learn alongside a driven community." },
  { icon: Zap, title: "Live Sessions", desc: "Join live trade-alongs and webinars, and trade the market in real time with your coach." },
];

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-display text-2xl font-black text-gold-400">{value}</p>
      <p className="text-xs text-slate-400">{label}</p>
    </div>
  );
}
function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/10 py-3">
      <p className="font-display text-lg font-bold text-gold-300">{value}</p>
      <p className="text-[11px] text-slate-300">{label}</p>
    </div>
  );
}
function TrustItem({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <span className="flex items-center gap-2">
      <Icon className="h-4 w-4 text-gold-400" /> {label}
    </span>
  );
}
function SectionHead({
  eyebrow, title, subtitle, align = "center", dark = false, className = "",
}: {
  eyebrow: string; title: string; subtitle?: string;
  align?: "center" | "left"; dark?: boolean; className?: string;
}) {
  return (
    <div className={`mb-10 ${align === "center" ? "mx-auto max-w-2xl text-center" : ""} ${className}`}>
      <span className="eyebrow">{eyebrow}</span>
      <h2 className={`mt-2 section-title ${dark ? "!text-white" : ""}`}>{title}</h2>
      {subtitle && <p className={`mt-3 text-lg ${dark ? "text-slate-300" : "text-navy-500 dark:text-slate-400"}`}>{subtitle}</p>}
    </div>
  );
}
