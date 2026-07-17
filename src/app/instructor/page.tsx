import Link from "next/link";
import { Users, BookOpen, Star, Wallet, TrendingUp } from "lucide-react";
import { format, subMonths, startOfMonth } from "date-fns";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { formatCurrency, relativeTime, cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { StarRating } from "@/components/ui/star-rating";
import {
  EnrollmentsAreaChart,
  RevenueBarChart,
  type EnrollmentPoint,
  type RevenuePoint,
} from "@/components/instructor/charts";

export const dynamic = "force-dynamic";

export default async function InstructorDashboardPage() {
  const user = (await getCurrentUser())!;

  const [courses, orderItems, recentReviews] = await Promise.all([
    prisma.course.findMany({
      where: { instructorId: user.id },
      include: {
        _count: { select: { enrollments: true, reviews: true } },
        reviews: { select: { rating: true } },
        enrollments: { select: { createdAt: true } },
      },
    }),
    prisma.orderItem.findMany({
      where: { course: { instructorId: user.id } },
      include: { course: { select: { title: true } } },
    }),
    prisma.review.findMany({
      where: { course: { instructorId: user.id } },
      include: { user: { select: { name: true, image: true } }, course: { select: { title: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const currency = courses[0]?.currency ?? "KES";

  const totalStudents = courses.reduce((s, c) => s + c._count.enrollments, 0);
  const totalCourses = courses.length;

  const allRatings = courses.flatMap((c) => c.reviews.map((r) => r.rating));
  const avgRating = allRatings.length
    ? allRatings.reduce((s, r) => s + r, 0) / allRatings.length
    : 0;

  const totalRevenue = orderItems.reduce((s, oi) => s + oi.price, 0);

  // Enrollments bucketed over the last 8 months
  const months: { key: string; label: string }[] = [];
  for (let i = 7; i >= 0; i--) {
    const d = startOfMonth(subMonths(new Date(), i));
    months.push({ key: format(d, "yyyy-MM"), label: format(d, "MMM") });
  }
  const enrollBuckets = new Map(months.map((m) => [m.key, 0]));
  for (const c of courses) {
    for (const e of c.enrollments) {
      const key = format(e.createdAt, "yyyy-MM");
      if (enrollBuckets.has(key)) enrollBuckets.set(key, (enrollBuckets.get(key) ?? 0) + 1);
    }
  }
  const enrollmentData: EnrollmentPoint[] = months.map((m) => ({
    month: m.label,
    count: enrollBuckets.get(m.key) ?? 0,
  }));

  // Revenue per course (top 6)
  const revenueByCourse = new Map<string, number>();
  for (const oi of orderItems) {
    revenueByCourse.set(oi.courseId, (revenueByCourse.get(oi.courseId) ?? 0) + oi.price);
  }
  const courseTitle = new Map(courses.map((c) => [c.id, c.title]));
  const revenueData: RevenuePoint[] = [...revenueByCourse.entries()]
    .map(([id, revenue]) => ({ name: courseTitle.get(id) ?? "Course", revenue }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 6);

  // Top courses table (by students)
  const topCourses = courses
    .map((c) => {
      const ratings = c.reviews.map((r) => r.rating);
      return {
        id: c.id,
        title: c.title,
        students: c._count.enrollments,
        rating: ratings.length ? ratings.reduce((s, r) => s + r, 0) / ratings.length : 0,
        reviews: ratings.length,
        revenue: revenueByCourse.get(c.id) ?? 0,
      };
    })
    .sort((a, b) => b.students - a.students)
    .slice(0, 6);

  const kpis = [
    {
      label: "Total students",
      value: totalStudents.toLocaleString(),
      icon: Users,
      tint: "text-sky",
      bg: "bg-sky/10",
    },
    {
      label: "Published courses",
      value: totalCourses.toString(),
      icon: BookOpen,
      tint: "text-navy-700 dark:text-slate-200",
      bg: "bg-navy-100 dark:bg-navy-800",
    },
    {
      label: "Average rating",
      value: avgRating ? avgRating.toFixed(1) : "—",
      icon: Star,
      tint: "text-gold-500",
      bg: "bg-gold-400/15",
    },
    {
      label: "Total revenue",
      value: formatCurrency(totalRevenue, currency),
      icon: Wallet,
      tint: "text-emerald-600",
      bg: "bg-emerald-500/10",
    },
  ];

  return (
    <div className="space-y-6">
      {/* KPI tiles */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="card p-5">
            <div className={cn("mb-3 inline-flex rounded-xl p-2.5", k.bg)}>
              <k.icon size={20} className={k.tint} />
            </div>
            <p className="text-2xl font-bold text-navy-900 dark:text-white">{k.value}</p>
            <p className="mt-0.5 text-sm text-navy-500 dark:text-slate-400">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-semibold text-navy-900 dark:text-white">
                Enrollments
              </h2>
              <p className="text-xs text-navy-500 dark:text-slate-400">Last 8 months</p>
            </div>
            <TrendingUp size={18} className="text-sky" />
          </div>
          <EnrollmentsAreaChart data={enrollmentData} />
        </div>
        <div className="card p-5">
          <div className="mb-4">
            <h2 className="font-display text-lg font-semibold text-navy-900 dark:text-white">
              Revenue by course
            </h2>
            <p className="text-xs text-navy-500 dark:text-slate-400">Top earning courses</p>
          </div>
          {revenueData.length ? (
            <RevenueBarChart data={revenueData} currency={currency} />
          ) : (
            <div className="flex h-[280px] items-center justify-center text-sm text-navy-400">
              No sales recorded yet.
            </div>
          )}
        </div>
      </div>

      {/* Top courses + recent reviews */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card overflow-hidden p-0 lg:col-span-2">
          <div className="border-b border-navy-100 p-5 dark:border-navy-800">
            <h2 className="font-display text-lg font-semibold text-navy-900 dark:text-white">
              Top courses
            </h2>
          </div>
          {topCourses.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-navy-100 text-left text-xs uppercase tracking-wide text-navy-400 dark:border-navy-800">
                    <th className="px-5 py-3 font-medium">Course</th>
                    <th className="px-5 py-3 font-medium">Students</th>
                    <th className="px-5 py-3 font-medium">Rating</th>
                    <th className="px-5 py-3 text-right font-medium">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {topCourses.map((c) => (
                    <tr
                      key={c.id}
                      className="border-b border-navy-50 last:border-0 dark:border-navy-800/60"
                    >
                      <td className="px-5 py-3 font-medium text-navy-900 dark:text-white">
                        {c.title}
                      </td>
                      <td className="px-5 py-3 text-navy-600 dark:text-slate-300">{c.students}</td>
                      <td className="px-5 py-3">
                        <span className="inline-flex items-center gap-1.5 text-navy-600 dark:text-slate-300">
                          <Star size={14} className="fill-gold-400 text-gold-400" />
                          {c.rating ? c.rating.toFixed(1) : "—"}
                          <span className="text-xs text-navy-400">({c.reviews})</span>
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right font-semibold text-emerald-600">
                        {formatCurrency(c.revenue, currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-sm text-navy-500 dark:text-slate-400">
              You have no courses yet.{" "}
              <Link href="/instructor/courses" className="font-semibold text-sky">
                Create your first course
              </Link>
              .
            </div>
          )}
        </div>

        <div className="card p-5">
          <h2 className="mb-4 font-display text-lg font-semibold text-navy-900 dark:text-white">
            Recent reviews
          </h2>
          {recentReviews.length ? (
            <ul className="space-y-4">
              {recentReviews.map((r) => (
                <li key={r.id} className="flex gap-3">
                  <Avatar name={r.user.name} src={r.user.image} size={36} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-semibold text-navy-900 dark:text-white">
                        {r.user.name}
                      </p>
                      <span className="shrink-0 text-xs text-navy-400">
                        {relativeTime(r.createdAt)}
                      </span>
                    </div>
                    <StarRating value={r.rating} size={13} />
                    {r.comment && (
                      <p className="mt-1 line-clamp-2 text-xs text-navy-600 dark:text-slate-300">
                        {r.comment}
                      </p>
                    )}
                    <p className="mt-1 truncate text-[11px] text-navy-400">on {r.course.title}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-navy-500 dark:text-slate-400">
              No reviews yet. Encourage your students to leave feedback once they complete a lesson.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
