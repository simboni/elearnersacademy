import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import {
  BookOpen,
  GraduationCap,
  Award,
  Sparkles,
  Flame,
  PlayCircle,
  ArrowRight,
  Calendar,
  Video,
  Trophy,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { getPoints } from "@/lib/gamification";
import { ProgressBar } from "@/components/ui/progress-bar";
import { relativeTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardOverviewPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [enrollments, certCount, points, streak, recentBadges, liveSessions] =
    await Promise.all([
      prisma.enrollment.findMany({
        where: { userId: user.id },
        include: { course: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.certificate.count({ where: { userId: user.id } }),
      getPoints(user.id),
      prisma.streak.findUnique({ where: { userId: user.id } }),
      prisma.userBadge.findMany({
        where: { userId: user.id },
        include: { badge: true },
        orderBy: { earnedAt: "desc" },
        take: 4,
      }),
      prisma.liveSession.findMany({
        where: { startAt: { gt: new Date() } },
        orderBy: { startAt: "asc" },
        take: 3,
      }),
    ]);

  const inProgress = enrollments.filter((e) => e.progressPct > 0 && e.progressPct < 100);
  const completed = enrollments.filter((e) => e.progressPct >= 100);
  const firstName = user.name?.split(" ")[0] ?? "there";

  const stats = [
    { label: "Courses enrolled", value: enrollments.length, icon: BookOpen, tint: "text-sky-dark" },
    { label: "Completed", value: completed.length, icon: GraduationCap, tint: "text-emerald-500" },
    { label: "Certificates", value: certCount, icon: Award, tint: "text-gold-500" },
    { label: "Total points", value: points.toLocaleString(), icon: Sparkles, tint: "text-gold-600" },
    { label: "Day streak", value: streak?.current ?? 0, icon: Flame, tint: "text-rose-500" },
  ];

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 p-6 text-white shadow-card sm:p-8">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gold-400/20 blur-3xl" />
        <p className="eyebrow text-gold-400">Trading floor</p>
        <h1 className="mt-1 font-display text-2xl font-extrabold sm:text-3xl">
          Welcome back, {firstName}
        </h1>
        <p className="mt-2 max-w-xl text-sm text-slate-300">
          Consistency compounds. Pick up where you left off, keep your streak alive, and move one
          step closer to trading with discipline and confidence.
        </p>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="card p-4">
              <Icon className={`h-5 w-5 ${s.tint}`} />
              <p className="mt-3 font-display text-2xl font-extrabold text-navy-900 dark:text-white">
                {s.value}
              </p>
              <p className="text-xs font-medium text-navy-500 dark:text-slate-400">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Continue learning */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-navy-900 dark:text-white">
            Continue learning
          </h2>
          <Link
            href="/dashboard/my-courses"
            className="flex items-center gap-1 text-sm font-semibold text-sky-dark hover:underline"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {inProgress.length === 0 ? (
          <EmptyState
            icon={PlayCircle}
            title="No lessons in progress"
            body="Start a course and it will show up here so you can resume in one click."
            ctaHref="/courses"
            ctaLabel="Browse courses"
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {inProgress.slice(0, 4).map((e) => (
              <div key={e.id} className="card card-hover flex gap-4 p-3">
                <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-xl bg-navy-100">
                  {e.course.image ? (
                    <Image
                      src={e.course.image}
                      alt={e.course.title}
                      fill
                      sizes="112px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-navy-700 to-navy-900 text-white">
                      <PlayCircle className="h-6 w-6 opacity-70" />
                    </div>
                  )}
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <h3 className="line-clamp-2 text-sm font-semibold text-navy-900 dark:text-white">
                    {e.course.title}
                  </h3>
                  <div className="mt-auto pt-2">
                    <ProgressBar value={e.progressPct} showLabel />
                    <Link
                      href={`/learn/${e.course.slug}`}
                      className="btn-primary btn-sm mt-2.5 w-full"
                    >
                      Resume
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent badges */}
        <section>
          <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-bold text-navy-900 dark:text-white">
            <Trophy className="h-5 w-5 text-gold-500" /> Recent badges
          </h2>
          {recentBadges.length === 0 ? (
            <EmptyState
              icon={Trophy}
              title="No badges yet"
              body="Complete lessons, keep streaks and ace quizzes to unlock badges."
              ctaHref="/dashboard/achievements"
              ctaLabel="See achievements"
            />
          ) : (
            <div className="card divide-y divide-navy-100 dark:divide-navy-800">
              {recentBadges.map((ub) => (
                <div key={ub.id} className="flex items-center gap-3 p-3.5">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold-50 text-2xl dark:bg-navy-800">
                    {ub.badge.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-navy-900 dark:text-white">
                      {ub.badge.name}
                    </p>
                    <p className="truncate text-xs text-navy-500 dark:text-slate-400">
                      {ub.badge.description}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-navy-400">
                    {relativeTime(ub.earnedAt)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Upcoming live sessions */}
        <section>
          <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-bold text-navy-900 dark:text-white">
            <Video className="h-5 w-5 text-sky-dark" /> Upcoming live sessions
          </h2>
          {liveSessions.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="No sessions scheduled"
              body="Live trading rooms and webinars will appear here when scheduled."
              ctaHref="/live"
              ctaLabel="Explore live sessions"
            />
          ) : (
            <div className="card divide-y divide-navy-100 dark:divide-navy-800">
              {liveSessions.map((s) => (
                <div key={s.id} className="flex items-center gap-3 p-3.5">
                  <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-navy-900 text-white dark:bg-navy-800">
                    <span className="text-[10px] font-semibold uppercase text-gold-400">
                      {format(s.startAt, "MMM")}
                    </span>
                    <span className="font-display text-lg font-bold leading-none">
                      {format(s.startAt, "d")}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-navy-900 dark:text-white">
                      {s.title}
                    </p>
                    <p className="text-xs text-navy-500 dark:text-slate-400">
                      {format(s.startAt, "EEE, MMM d · h:mm a")}
                      {s.hostName ? ` · ${s.hostName}` : ""}
                    </p>
                  </div>
                  {s.joinUrl && (
                    <a
                      href={s.joinUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-outline btn-sm shrink-0"
                    >
                      Join
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  body,
  ctaHref,
  ctaLabel,
}: {
  icon: React.ElementType;
  title: string;
  body: string;
  ctaHref: string;
  ctaLabel: string;
}) {
  return (
    <div className="card flex flex-col items-center justify-center px-6 py-10 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-navy-50 text-navy-400 dark:bg-navy-800">
        <Icon className="h-6 w-6" />
      </span>
      <p className="mt-3 font-semibold text-navy-900 dark:text-white">{title}</p>
      <p className="mt-1 max-w-xs text-sm text-navy-500 dark:text-slate-400">{body}</p>
      <Link href={ctaHref} className="btn-primary btn-sm mt-4">
        {ctaLabel}
      </Link>
    </div>
  );
}
