import Link from "next/link";
import Image from "next/image";
import { BookOpen, PlayCircle, CheckCircle2, Clock } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { ProgressBar } from "@/components/ui/progress-bar";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Filter = "all" | "in-progress" | "completed";

const TABS: { key: Filter; label: string }[] = [
  { key: "all", label: "All courses" },
  { key: "in-progress", label: "In progress" },
  { key: "completed", label: "Completed" },
];

export default async function MyCoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) return null;

  const { filter } = await searchParams;
  const active: Filter =
    filter === "in-progress" || filter === "completed" ? filter : "all";

  const enrollments = await prisma.enrollment.findMany({
    where: { userId: user.id },
    include: { course: true },
    orderBy: { createdAt: "desc" },
  });

  const filtered = enrollments.filter((e) => {
    if (active === "in-progress") return e.progressPct > 0 && e.progressPct < 100;
    if (active === "completed") return e.progressPct >= 100;
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-navy-900 dark:text-white sm:text-3xl">
          My Learning
        </h1>
        <p className="mt-1 text-sm text-navy-500 dark:text-slate-400">
          Every course in your portfolio. Keep building your trading edge, one lesson at a time.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-navy-100 pb-1 dark:border-navy-800">
        {TABS.map((tab) => {
          const count = enrollments.filter((e) => {
            if (tab.key === "in-progress") return e.progressPct > 0 && e.progressPct < 100;
            if (tab.key === "completed") return e.progressPct >= 100;
            return true;
          }).length;
          return (
            <Link
              key={tab.key}
              href={tab.key === "all" ? "/dashboard/my-courses" : `/dashboard/my-courses?filter=${tab.key}`}
              className={cn(
                "rounded-lg px-3.5 py-2 text-sm font-semibold transition",
                active === tab.key
                  ? "bg-navy-900 text-white dark:bg-gold-400 dark:text-navy-900"
                  : "text-navy-600 hover:bg-navy-50 dark:text-slate-300 dark:hover:bg-navy-800"
              )}
            >
              {tab.label}
              <span
                className={cn(
                  "ml-1.5 rounded-full px-1.5 text-xs",
                  active === tab.key
                    ? "bg-white/20"
                    : "bg-navy-100 text-navy-500 dark:bg-navy-800 dark:text-slate-400"
                )}
              >
                {count}
              </span>
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="card flex flex-col items-center justify-center px-6 py-16 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-50 text-navy-400 dark:bg-navy-800">
            <BookOpen className="h-7 w-7" />
          </span>
          <p className="mt-4 font-display text-lg font-bold text-navy-900 dark:text-white">
            {active === "completed"
              ? "No completed courses yet"
              : active === "in-progress"
                ? "Nothing in progress"
                : "Your learning journey starts here"}
          </p>
          <p className="mt-1 max-w-sm text-sm text-navy-500 dark:text-slate-400">
            Enroll in a course to unlock lessons, quizzes, live rooms and certificates.
          </p>
          <Link href="/courses" className="btn-primary btn-md mt-5">
            Browse the catalog
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((e) => {
            const done = e.progressPct >= 100;
            return (
              <div key={e.id} className="card card-hover flex flex-col overflow-hidden">
                <div className="relative aspect-[16/10] bg-navy-100">
                  {e.course.image ? (
                    <Image
                      src={e.course.image}
                      alt={e.course.title}
                      fill
                      sizes="(max-width:768px) 100vw, 33vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-navy-700 to-navy-900 text-white">
                      <PlayCircle className="h-9 w-9 opacity-70" />
                    </div>
                  )}
                  {done && (
                    <span className="badge-green absolute left-3 top-3 flex items-center gap-1 shadow">
                      <CheckCircle2 className="h-3 w-3" /> Completed
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <div className="mb-2 flex items-center gap-2 text-xs text-navy-400">
                    <span>{e.course.level}</span>
                    {e.course.durationLabel && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {e.course.durationLabel}
                      </span>
                    )}
                  </div>
                  <h3 className="line-clamp-2 font-display font-bold leading-snug text-navy-900 dark:text-white">
                    {e.course.title}
                  </h3>
                  <div className="mt-auto pt-4">
                    <ProgressBar value={e.progressPct} showLabel />
                    <Link
                      href={`/learn/${e.course.slug}`}
                      className={cn("btn-md mt-3 w-full", done ? "btn-outline" : "btn-primary")}
                    >
                      {done ? "Review course" : e.progressPct > 0 ? "Continue" : "Start learning"}
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
