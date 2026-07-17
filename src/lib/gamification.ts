import { prisma } from "./prisma";

/** Add points to a user's ledger. */
export async function addPoints(userId: string, amount: number, reason: string) {
  await prisma.pointLog.create({ data: { userId, amount, reason } });
}

/** Total lifetime points for a user. */
export async function getPoints(userId: string) {
  const agg = await prisma.pointLog.aggregate({
    where: { userId },
    _sum: { amount: true },
  });
  return agg._sum.amount ?? 0;
}

/** Award a badge by key (idempotent). Notifies the user on first earn. */
export async function awardBadge(userId: string, badgeKey: string) {
  const badge = await prisma.badge.findUnique({ where: { key: badgeKey } });
  if (!badge) return;
  const existing = await prisma.userBadge.findUnique({
    where: { userId_badgeId: { userId, badgeId: badge.id } },
  });
  if (existing) return;
  await prisma.userBadge.create({ data: { userId, badgeId: badge.id } });
  await addPoints(userId, 100, `Earned badge: ${badge.name}`);
  await prisma.notification.create({
    data: {
      userId,
      type: "achievement",
      title: `New badge unlocked: ${badge.name} ${badge.icon}`,
      body: badge.description,
      link: "/dashboard/achievements",
    },
  });
}

/** Update the user's daily learning streak. Returns the new current streak. */
export async function touchStreak(userId: string) {
  const streak =
    (await prisma.streak.findUnique({ where: { userId } })) ??
    (await prisma.streak.create({ data: { userId } }));

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const last = streak.lastActive
    ? new Date(
        streak.lastActive.getFullYear(),
        streak.lastActive.getMonth(),
        streak.lastActive.getDate()
      )
    : null;

  let current = streak.current;
  if (!last) {
    current = 1;
  } else {
    const diffDays = Math.round((today.getTime() - last.getTime()) / 86400000);
    if (diffDays === 0) {
      // already counted today
      return current;
    } else if (diffDays === 1) {
      current += 1;
    } else {
      current = 1;
    }
  }
  const longest = Math.max(streak.longest, current);
  await prisma.streak.update({
    where: { userId },
    data: { current, longest, lastActive: now },
  });

  if (current === 7) await awardBadge(userId, "streak-7");
  if (current === 30) await awardBadge(userId, "streak-30");
  return current;
}

export type LeaderRow = {
  userId: string;
  name: string;
  image: string | null;
  points: number;
};

/** Compute a points leaderboard. */
export async function leaderboard(limit = 20): Promise<LeaderRow[]> {
  const grouped = await prisma.pointLog.groupBy({
    by: ["userId"],
    _sum: { amount: true },
    orderBy: { _sum: { amount: "desc" } },
    take: limit,
  });
  const users = await prisma.user.findMany({
    where: { id: { in: grouped.map((g) => g.userId) } },
    select: { id: true, name: true, image: true },
  });
  const byId = new Map(users.map((u) => [u.id, u]));
  return grouped.map((g) => ({
    userId: g.userId,
    name: byId.get(g.userId)?.name ?? "Learner",
    image: byId.get(g.userId)?.image ?? null,
    points: g._sum.amount ?? 0,
  }));
}

/** League tier based on points. */
export function leagueForPoints(points: number) {
  if (points >= 5000) return { name: "Diamond", color: "#48a7d4", icon: "💎" };
  if (points >= 2500) return { name: "Platinum", color: "#94a3b8", icon: "🏆" };
  if (points >= 1000) return { name: "Gold", color: "#eab830", icon: "🥇" };
  if (points >= 400) return { name: "Silver", color: "#cbd5e1", icon: "🥈" };
  return { name: "Bronze", color: "#b45309", icon: "🥉" };
}
