import { Flame, Sparkles, Lock, TrendingUp } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { getPoints, leaderboard, leagueForPoints } from "@/lib/gamification";
import { Avatar } from "@/components/ui/avatar";
import { cn, relativeTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AchievementsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [points, streak, userBadges, allBadges, pointLogs, leaders] = await Promise.all([
    getPoints(user.id),
    prisma.streak.findUnique({ where: { userId: user.id } }),
    prisma.userBadge.findMany({ where: { userId: user.id }, select: { badgeId: true } }),
    prisma.badge.findMany(),
    prisma.pointLog.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    leaderboard(10),
  ]);

  const earned = new Set(userBadges.map((b) => b.badgeId));
  const league = leagueForPoints(points);
  const nextTierAt = [400, 1000, 2500, 5000].find((t) => t > points);
  const toNext = nextTierAt ? nextTierAt - points : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-navy-900 dark:text-white sm:text-3xl">
          Achievements
        </h1>
        <p className="mt-1 text-sm text-navy-500 dark:text-slate-400">
          Discipline is a habit. Track your points, keep your streak alive, and climb the ranks of
          the eLearners trading community.
        </p>
      </div>

      {/* Top summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card flex flex-col justify-between p-5">
          <Sparkles className="h-5 w-5 text-gold-500" />
          <div className="mt-4">
            <p className="font-display text-3xl font-extrabold text-navy-900 dark:text-white">
              {points.toLocaleString()}
            </p>
            <p className="text-xs font-medium text-navy-500 dark:text-slate-400">Total points</p>
          </div>
        </div>

        <div
          className="card flex flex-col justify-between p-5"
          style={{ borderTop: `3px solid ${league.color}` }}
        >
          <span className="text-2xl">{league.icon}</span>
          <div className="mt-4">
            <p className="font-display text-2xl font-extrabold" style={{ color: league.color }}>
              {league.name} League
            </p>
            <p className="text-xs font-medium text-navy-500 dark:text-slate-400">
              {toNext > 0 ? `${toNext.toLocaleString()} pts to next tier` : "Top tier reached"}
            </p>
          </div>
        </div>

        <div className="card flex flex-col justify-between p-5">
          <Flame className="h-5 w-5 text-rose-500" />
          <div className="mt-4">
            <p className="font-display text-3xl font-extrabold text-navy-900 dark:text-white">
              {streak?.current ?? 0}
              <span className="ml-1 text-base font-semibold text-navy-400">days</span>
            </p>
            <p className="text-xs font-medium text-navy-500 dark:text-slate-400">Current streak</p>
          </div>
        </div>

        <div className="card flex flex-col justify-between p-5">
          <TrendingUp className="h-5 w-5 text-emerald-500" />
          <div className="mt-4">
            <p className="font-display text-3xl font-extrabold text-navy-900 dark:text-white">
              {streak?.longest ?? 0}
              <span className="ml-1 text-base font-semibold text-navy-400">days</span>
            </p>
            <p className="text-xs font-medium text-navy-500 dark:text-slate-400">Longest streak</p>
          </div>
        </div>
      </div>

      {/* Badges */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-navy-900 dark:text-white">Badges</h2>
          <span className="text-sm text-navy-400">
            {earned.size} / {allBadges.length} unlocked
          </span>
        </div>
        {allBadges.length === 0 ? (
          <p className="card p-6 text-sm text-navy-500 dark:text-slate-400">
            No badges configured yet.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {allBadges.map((badge) => {
              const has = earned.has(badge.id);
              return (
                <div
                  key={badge.id}
                  className={cn(
                    "card flex flex-col items-center p-4 text-center transition",
                    has
                      ? "border-gold-400/50 bg-gold-50/50 dark:bg-navy-800"
                      : "opacity-60 grayscale"
                  )}
                >
                  <span className="relative text-4xl">
                    {badge.icon}
                    {!has && (
                      <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-navy-200 text-navy-500 dark:bg-navy-700">
                        <Lock className="h-3 w-3" />
                      </span>
                    )}
                  </span>
                  <p className="mt-2.5 text-sm font-semibold text-navy-900 dark:text-white">
                    {badge.name}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-xs text-navy-500 dark:text-slate-400">
                    {badge.description}
                  </p>
                  <span
                    className={cn(
                      "mt-2 text-[10px] font-bold uppercase tracking-wider",
                      has ? "text-gold-600" : "text-navy-400"
                    )}
                  >
                    {has ? "Earned" : "Locked"}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Points breakdown */}
        <section>
          <h2 className="mb-4 font-display text-xl font-bold text-navy-900 dark:text-white">
            Recent points
          </h2>
          {pointLogs.length === 0 ? (
            <p className="card p-6 text-sm text-navy-500 dark:text-slate-400">
              No points earned yet. Complete a lesson to get started.
            </p>
          ) : (
            <div className="card divide-y divide-navy-100 dark:divide-navy-800">
              {pointLogs.map((log) => (
                <div key={log.id} className="flex items-center gap-3 p-3.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-navy-900 dark:text-white">
                      {log.reason}
                    </p>
                    <p className="text-xs text-navy-400">{relativeTime(log.createdAt)}</p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 font-display text-sm font-bold",
                      log.amount >= 0 ? "text-emerald-600" : "text-rose-600"
                    )}
                  >
                    {log.amount >= 0 ? "+" : ""}
                    {log.amount}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Leaderboard */}
        <section>
          <h2 className="mb-4 font-display text-xl font-bold text-navy-900 dark:text-white">
            Leaderboard
          </h2>
          {leaders.length === 0 ? (
            <p className="card p-6 text-sm text-navy-500 dark:text-slate-400">
              The leaderboard is warming up.
            </p>
          ) : (
            <div className="card divide-y divide-navy-100 dark:divide-navy-800">
              {leaders.map((row, i) => {
                const isMe = row.userId === user.id;
                const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : null;
                return (
                  <div
                    key={row.userId}
                    className={cn(
                      "flex items-center gap-3 p-3",
                      isMe && "bg-gold-50/70 dark:bg-navy-800"
                    )}
                  >
                    <span className="w-6 text-center font-display text-sm font-bold text-navy-500 dark:text-slate-400">
                      {medal ?? i + 1}
                    </span>
                    <Avatar name={row.name} src={row.image} size={34} />
                    <p className="min-w-0 flex-1 truncate text-sm font-medium text-navy-900 dark:text-white">
                      {row.name}
                      {isMe && (
                        <span className="ml-1.5 rounded-full bg-gold-400 px-1.5 py-0.5 text-[10px] font-bold text-navy-900">
                          You
                        </span>
                      )}
                    </p>
                    <span className="shrink-0 font-display text-sm font-bold text-gold-600">
                      {row.points.toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
