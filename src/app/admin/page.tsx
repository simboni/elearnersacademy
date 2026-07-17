import Link from "next/link";
import {
  Users,
  GraduationCap,
  BookOpen,
  UserCheck,
  DollarSign,
  Award,
  TrendingUp,
  ShoppingBag,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatCurrency, relativeTime, cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import {
  SignupsLineChart,
  RevenueAreaChart,
  CategoryPieChart,
  type MonthCount,
  type MonthRevenue,
  type NameValue,
} from "@/components/admin/charts";

export const dynamic = "force-dynamic";

const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function lastNMonths(n: number) {
  const now = new Date();
  const buckets: { key: string; label: string; start: Date }[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: MONTH_LABELS[d.getMonth()],
      start: d,
    });
  }
  return buckets;
}

function statusBadge(status: string) {
  switch (status) {
    case "PAID":
      return "badge-green";
    case "PENDING":
      return "badge-gold";
    case "REFUNDED":
      return "badge-navy";
    case "FAILED":
      return "badge-red";
    default:
      return "badge-navy";
  }
}

export default async function AdminOverviewPage() {
  const months = lastNMonths(8);
  const since = months[0].start;

  const [
    totalUsers,
    students,
    instructors,
    courses,
    totalEnrollments,
    revenueAgg,
    certificates,
    recentUsersRaw,
    recentOrders,
    paidOrders,
    categories,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.user.count({ where: { role: "INSTRUCTOR" } }),
    prisma.course.count(),
    prisma.enrollment.count(),
    prisma.order.aggregate({ where: { status: "PAID" }, _sum: { total: true } }),
    prisma.certificate.count(),
    prisma.user.findMany({
      where: { createdAt: { gte: since } },
      orderBy: { createdAt: "asc" },
      select: { id: true, name: true, image: true, role: true, createdAt: true },
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { user: { select: { name: true, email: true, image: true } } },
    }),
    prisma.order.findMany({
      where: { status: "PAID", createdAt: { gte: since } },
      select: { total: true, createdAt: true },
    }),
    prisma.category.findMany({
      select: { name: true, _count: { select: { courses: true } } },
      orderBy: { courses: { _count: "desc" } },
    }),
  ]);

  const totalRevenue = revenueAgg._sum.total ?? 0;

  // Bucket signups per month
  const signupMap = new Map(months.map((m) => [m.key, 0]));
  for (const u of recentUsersRaw) {
    const key = `${u.createdAt.getFullYear()}-${u.createdAt.getMonth()}`;
    if (signupMap.has(key)) signupMap.set(key, (signupMap.get(key) ?? 0) + 1);
  }
  const signupData: MonthCount[] = months.map((m) => ({
    month: m.label,
    count: signupMap.get(m.key) ?? 0,
  }));

  // Bucket revenue per month
  const revenueMap = new Map(months.map((m) => [m.key, 0]));
  for (const o of paidOrders) {
    const key = `${o.createdAt.getFullYear()}-${o.createdAt.getMonth()}`;
    if (revenueMap.has(key)) revenueMap.set(key, (revenueMap.get(key) ?? 0) + o.total);
  }
  const revenueData: MonthRevenue[] = months.map((m) => ({
    month: m.label,
    revenue: Math.round(revenueMap.get(m.key) ?? 0),
  }));

  const categoryData: NameValue[] = categories
    .filter((c) => c._count.courses > 0)
    .map((c) => ({ name: c.name, value: c._count.courses }));

  const recentSignups = [...recentUsersRaw].reverse().slice(0, 6);

  const kpis = [
    { label: "Total Users", value: totalUsers.toLocaleString(), icon: Users, accent: "text-sky" },
    { label: "Students", value: students.toLocaleString(), icon: GraduationCap, accent: "text-emerald-500" },
    { label: "Instructors", value: instructors.toLocaleString(), icon: UserCheck, accent: "text-gold-500" },
    { label: "Courses", value: courses.toLocaleString(), icon: BookOpen, accent: "text-sky-dark" },
    { label: "Enrollments", value: totalEnrollments.toLocaleString(), icon: TrendingUp, accent: "text-emerald-500" },
    { label: "Revenue", value: formatCurrency(totalRevenue, "KES"), icon: DollarSign, accent: "text-gold-500" },
    { label: "Certificates", value: certificates.toLocaleString(), icon: Award, accent: "text-rose-500" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow">Platform analytics</p>
        <h1 className="text-2xl font-bold text-navy-900 dark:text-white sm:text-3xl">
          Admin Console
        </h1>
        <p className="mt-1 text-sm text-navy-500 dark:text-slate-400">
          A live snapshot of eLearners Academy performance.
        </p>
      </div>

      {/* KPI tiles */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="card p-4">
              <Icon className={cn("h-5 w-5", k.accent)} />
              <p className="mt-3 text-xl font-bold text-navy-900 dark:text-white">{k.value}</p>
              <p className="text-xs font-medium text-navy-500 dark:text-slate-400">{k.label}</p>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-5">
          <h3 className="mb-4 font-semibold text-navy-900 dark:text-white">
            New signups <span className="text-navy-400">· last 8 months</span>
          </h3>
          <SignupsLineChart data={signupData} />
        </div>
        <div className="card p-5">
          <h3 className="mb-4 font-semibold text-navy-900 dark:text-white">
            Revenue <span className="text-navy-400">· last 8 months</span>
          </h3>
          <RevenueAreaChart data={revenueData} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Category pie */}
        <div className="card p-5">
          <h3 className="mb-4 font-semibold text-navy-900 dark:text-white">Courses by category</h3>
          <CategoryPieChart data={categoryData} />
        </div>

        {/* Recent orders */}
        <div className="card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-navy-900 dark:text-white">Recent orders</h3>
            <Link href="/admin/orders" className="text-xs font-semibold text-sky-dark hover:underline">
              View all
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-navy-400">
              <ShoppingBag className="h-8 w-8" />
              <p className="text-sm">No orders yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-navy-100 text-left text-xs uppercase tracking-wide text-navy-400 dark:border-navy-700">
                    <th className="pb-2 font-semibold">Buyer</th>
                    <th className="pb-2 font-semibold">Total</th>
                    <th className="pb-2 font-semibold">Status</th>
                    <th className="pb-2 text-right font-semibold">When</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-50 dark:divide-navy-800">
                  {recentOrders.map((o) => (
                    <tr key={o.id}>
                      <td className="py-2.5">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={o.user.name} src={o.user.image} size={30} />
                          <span className="font-medium text-navy-900 dark:text-white">
                            {o.user.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 font-semibold text-navy-900 dark:text-white">
                        {formatCurrency(o.total, o.currency)}
                      </td>
                      <td className="py-2.5">
                        <span className={statusBadge(o.status)}>{o.status}</span>
                      </td>
                      <td className="py-2.5 text-right text-navy-400">
                        {relativeTime(o.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Recent signups */}
      <div className="card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-navy-900 dark:text-white">Recent signups</h3>
          <Link href="/admin/users" className="text-xs font-semibold text-sky-dark hover:underline">
            View all users
          </Link>
        </div>
        {recentSignups.length === 0 ? (
          <p className="py-8 text-center text-sm text-navy-400">No recent signups.</p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {recentSignups.map((u) => (
              <li
                key={u.id}
                className="flex items-center gap-3 rounded-xl border border-navy-100 p-3 dark:border-navy-700"
              >
                <Avatar name={u.name} src={u.image} size={38} />
                <div className="min-w-0">
                  <p className="truncate font-medium text-navy-900 dark:text-white">{u.name}</p>
                  <p className="text-xs text-navy-400">
                    {u.role} · {relativeTime(u.createdAt)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
