import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Sparkles,
  Rocket,
  Bitcoin,
  PiggyBank,
  PlayCircle,
  CheckCircle2,
} from "lucide-react";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Learning Paths — eLearners Academy" };
export const dynamic = "force-dynamic";

type PathDef = {
  key: string;
  icon: typeof Rocket;
  title: string;
  subtitle: string;
  accent: string;
  steps: { slug: string; note: string }[];
};

const PATHS: PathDef[] = [
  {
    key: "zero-to-funded",
    icon: Rocket,
    title: "Zero to Funded Trader",
    subtitle: "Go from complete beginner to passing a prop-firm challenge with a rule-based edge.",
    accent: "from-gold-400 to-gold-600",
    steps: [
      { slug: "smp-ts-day-trading-bootcamp", note: "Master the core SMP_TS price-action setup" },
      { slug: "trading-psychology-mindset", note: "Build the discipline to execute your plan" },
      { slug: "prop-firm-accelerator", note: "Pass challenges and manage funded capital" },
    ],
  },
  {
    key: "crypto-confident",
    icon: Bitcoin,
    title: "Crypto Confident",
    subtitle: "Understand crypto markets and trade them with structure instead of hype.",
    accent: "from-sky to-sky-dark",
    steps: [
      { slug: "crypto-trading-masterclass", note: "Learn crypto market structure & execution" },
      { slug: "trading-psychology-mindset", note: "Manage volatility and emotion" },
      { slug: "personal-finance-wealth-building", note: "Protect and grow your gains" },
    ],
  },
  {
    key: "financial-freedom",
    icon: PiggyBank,
    title: "Financial Freedom",
    subtitle: "Build a solid money foundation and a second income stream from the markets.",
    accent: "from-emerald-400 to-emerald-600",
    steps: [
      { slug: "personal-finance-wealth-building", note: "Budget, save, and build wealth" },
      { slug: "smp-ts-day-trading-bootcamp", note: "Learn a skill that pays for a lifetime" },
      { slug: "trading-psychology-mindset", note: "Stay consistent for the long run" },
    ],
  },
];

export default async function PathsPage() {
  const allSlugs = Array.from(new Set(PATHS.flatMap((p) => p.steps.map((s) => s.slug))));
  const courses = await prisma.course.findMany({
    where: { slug: { in: allSlugs } },
    select: { slug: true, title: true, image: true, durationLabel: true, level: true },
  });
  const bySlug = new Map(courses.map((c) => [c.slug, c]));

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-navy-900 text-white">
        <div className="absolute inset-0 bg-hero-grid" />
        <div className="absolute -right-40 top-0 h-96 w-96 rounded-full bg-sky/20 blur-3xl" />
        <div className="absolute -left-40 bottom-0 h-96 w-96 rounded-full bg-gold-400/10 blur-3xl" />
        <div className="container-page relative py-20 text-center lg:py-24">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold-400/30 bg-gold-400/10 px-4 py-1.5 text-sm font-semibold text-gold-300">
            <Sparkles className="h-4 w-4" /> Guided journeys
          </span>
          <h1 className="mt-6 font-display text-4xl font-black leading-[1.1] sm:text-5xl lg:text-6xl">
            Learning <span className="text-gradient-gold">paths</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-300">
            Curated, step-by-step roadmaps that take you from where you are to where you want to be —
            course by course, skill by skill.
          </p>
        </div>
      </section>

      {/* PATHS */}
      <section className="container-page space-y-16 py-16">
        {PATHS.map((path, pathIndex) => (
          <div key={path.key} className="grid gap-8 lg:grid-cols-[320px_1fr]">
            {/* Path intro */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              <span
                className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${path.accent} text-navy-900 shadow-lg`}
              >
                <path.icon className="h-7 w-7" />
              </span>
              <p className="mt-4 text-sm font-semibold text-sky-dark">
                Path {String(pathIndex + 1).padStart(2, "0")}
              </p>
              <h2 className="mt-1 font-display text-2xl font-black text-navy-900 dark:text-white">
                {path.title}
              </h2>
              <p className="mt-3 text-navy-500 dark:text-slate-400">{path.subtitle}</p>
              <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-navy-50 px-3 py-1.5 text-xs font-semibold text-navy-600 dark:bg-navy-800 dark:text-slate-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> {path.steps.length} steps
              </div>
            </div>

            {/* Roadmap */}
            <ol className="relative space-y-4 border-l-2 border-dashed border-navy-200 pl-6 dark:border-navy-700 sm:pl-8">
              {path.steps.map((step, i) => {
                const course = bySlug.get(step.slug);
                const title = course?.title ?? step.slug.replace(/-/g, " ");
                return (
                  <li key={step.slug} className="relative">
                    <span className="absolute -left-[35px] top-6 flex h-8 w-8 items-center justify-center rounded-full bg-navy-900 text-sm font-bold text-gold-400 ring-4 ring-white dark:ring-navy-950 sm:-left-[43px]">
                      {i + 1}
                    </span>
                    {course ? (
                      <Link
                        href={`/courses/${course.slug}`}
                        className="card card-hover group flex items-center gap-4 p-4"
                      >
                        <div className="relative hidden h-20 w-32 shrink-0 overflow-hidden rounded-xl bg-navy-100 sm:block">
                          {course.image ? (
                            <Image
                              src={course.image}
                              alt={title}
                              fill
                              sizes="128px"
                              className="object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center bg-gradient-to-br from-navy-700 to-navy-900 text-white">
                              <PlayCircle className="h-6 w-6 opacity-70" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2 text-xs text-navy-400">
                            {course.level && <span className="badge-navy">{course.level}</span>}
                            {course.durationLabel && <span>{course.durationLabel}</span>}
                          </div>
                          <h3 className="mt-1 font-display font-bold text-navy-900 transition group-hover:text-sky-dark dark:text-white">
                            {title}
                          </h3>
                          <p className="mt-0.5 line-clamp-1 text-sm text-navy-500 dark:text-slate-400">
                            {step.note}
                          </p>
                        </div>
                        <ArrowRight className="hidden h-5 w-5 shrink-0 text-navy-300 transition group-hover:translate-x-1 group-hover:text-sky-dark sm:block" />
                      </Link>
                    ) : (
                      <div className="card flex items-center gap-4 p-4 opacity-80">
                        <div className="min-w-0 flex-1">
                          <span className="badge-gold">Coming soon</span>
                          <h3 className="mt-1 font-display font-bold capitalize text-navy-900 dark:text-white">
                            {title}
                          </h3>
                          <p className="mt-0.5 text-sm text-navy-500 dark:text-slate-400">
                            {step.note}
                          </p>
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ol>
          </div>
        ))}
      </section>

      {/* CTA */}
      <section className="container-page pb-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gold-400 to-gold-600 px-6 py-16 text-center text-navy-900">
          <div className="relative mx-auto max-w-2xl">
            <h2 className="font-display text-3xl font-black sm:text-4xl">
              Not sure where to start?
            </h2>
            <p className="mt-4 text-lg text-navy-800">
              Browse the full catalogue or create a free account and let our AI tutor guide you.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/courses" className="btn-navy btn-lg">
                Explore all courses <ArrowRight className="h-5 w-5" />
              </Link>
              <Link href="/register" className="btn-outline btn-lg !border-navy-900/20 !bg-white/30">
                Start free
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
