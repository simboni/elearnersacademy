import { Wallet, TrendingUp, Calendar, Info } from "lucide-react";
import { format, subMonths, startOfMonth } from "date-fns";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { formatCurrency, cn } from "@/lib/utils";
import { EarningsChart, type EarningsPoint } from "@/components/instructor/charts";

export const dynamic = "force-dynamic";

export default async function InstructorEarningsPage() {
  const user = (await getCurrentUser())!;

  const orderItems = await prisma.orderItem.findMany({
    where: { course: { instructorId: user.id } },
    include: {
      course: { select: { title: true, currency: true } },
      order: {
        select: {
          createdAt: true,
          status: true,
          reference: true,
          user: { select: { name: true, email: true } },
        },
      },
    },
    orderBy: { order: { createdAt: "desc" } },
  });

  const currency = orderItems[0]?.course.currency ?? "KES";

  const totalRevenue = orderItems.reduce((s, oi) => s + oi.price, 0);

  const now = new Date();
  const monthStart = startOfMonth(now);
  const thisMonthRevenue = orderItems
    .filter((oi) => oi.order.createdAt >= monthStart)
    .reduce((s, oi) => s + oi.price, 0);

  const lastMonthStart = startOfMonth(subMonths(now, 1));
  const lastMonthRevenue = orderItems
    .filter((oi) => oi.order.createdAt >= lastMonthStart && oi.order.createdAt < monthStart)
    .reduce((s, oi) => s + oi.price, 0);

  const momDelta =
    lastMonthRevenue > 0
      ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
      : thisMonthRevenue > 0
        ? 100
        : 0;

  // Monthly earnings, last 8 months
  const months: { key: string; label: string }[] = [];
  for (let i = 7; i >= 0; i--) {
    const d = startOfMonth(subMonths(now, i));
    months.push({ key: format(d, "yyyy-MM"), label: format(d, "MMM") });
  }
  const buckets = new Map(months.map((m) => [m.key, 0]));
  for (const oi of orderItems) {
    const key = format(oi.order.createdAt, "yyyy-MM");
    if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + oi.price);
  }
  const earningsData: EarningsPoint[] = months.map((m) => ({
    month: m.label,
    revenue: Math.round(buckets.get(m.key) ?? 0),
  }));

  const tiles = [
    {
      label: "All-time revenue",
      value: formatCurrency(totalRevenue, currency),
      icon: Wallet,
      tint: "text-emerald-600",
      bg: "bg-emerald-500/10",
    },
    {
      label: "This month",
      value: formatCurrency(thisMonthRevenue, currency),
      icon: Calendar,
      tint: "text-sky",
      bg: "bg-sky/10",
    },
    {
      label: "Last month",
      value: formatCurrency(lastMonthRevenue, currency),
      icon: TrendingUp,
      tint: "text-gold-500",
      bg: "bg-gold-400/15",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-semibold text-navy-900 dark:text-white">Earnings</h2>
        <p className="text-sm text-navy-500 dark:text-slate-400">
          Track sales across your trading courses.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {tiles.map((t) => (
          <div key={t.label} className="card p-5">
            <div className={cn("mb-3 inline-flex rounded-xl p-2.5", t.bg)}>
              <t.icon size={20} className={t.tint} />
            </div>
            <p className="text-2xl font-bold text-navy-900 dark:text-white">{t.value}</p>
            <p className="mt-0.5 flex items-center gap-1.5 text-sm text-navy-500 dark:text-slate-400">
              {t.label}
              {t.label === "This month" && momDelta !== 0 && (
                <span
                  className={cn(
                    "text-xs font-semibold",
                    momDelta >= 0 ? "text-emerald-600" : "text-rose-500"
                  )}
                >
                  {momDelta >= 0 ? "▲" : "▼"} {Math.abs(momDelta).toFixed(0)}%
                </span>
              )}
            </p>
          </div>
        ))}
      </div>

      {/* Payout note */}
      <div className="flex items-start gap-3 rounded-2xl border border-sky/30 bg-sky/5 p-4 text-sm text-navy-700 dark:text-slate-200">
        <Info size={18} className="mt-0.5 shrink-0 text-sky" />
        <p>
          Payouts are processed securely via <span className="font-semibold">IntaSend</span> to your
          registered M-Pesa or bank account, typically within 3–5 business days after a completed
          sale.
        </p>
      </div>

      {orderItems.length === 0 ? (
        <div className="card flex flex-col items-center justify-center gap-3 py-16 text-center">
          <span className="inline-flex rounded-2xl bg-navy-100 p-4 dark:bg-navy-800">
            <Wallet size={28} className="text-sky" />
          </span>
          <h3 className="font-display text-lg font-semibold text-navy-900 dark:text-white">
            No sales yet
          </h3>
          <p className="max-w-sm text-sm text-navy-500 dark:text-slate-400">
            When students purchase your courses, each transaction will appear here and count towards
            your next payout.
          </p>
        </div>
      ) : (
        <>
          <div className="card p-5">
            <div className="mb-4">
              <h3 className="font-display text-lg font-semibold text-navy-900 dark:text-white">
                Monthly revenue
              </h3>
              <p className="text-xs text-navy-500 dark:text-slate-400">Last 8 months</p>
            </div>
            <EarningsChart data={earningsData} currency={currency} />
          </div>

          <div className="card overflow-hidden p-0">
            <div className="border-b border-navy-100 p-5 dark:border-navy-800">
              <h3 className="font-display text-lg font-semibold text-navy-900 dark:text-white">
                Transactions
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-navy-100 text-left text-xs uppercase tracking-wide text-navy-400 dark:border-navy-800">
                    <th className="px-5 py-3 font-medium">Course</th>
                    <th className="px-5 py-3 font-medium">Buyer</th>
                    <th className="px-5 py-3 font-medium">Date</th>
                    <th className="px-5 py-3 text-right font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {orderItems.map((oi) => (
                    <tr
                      key={oi.id}
                      className="border-b border-navy-50 last:border-0 dark:border-navy-800/60"
                    >
                      <td className="px-5 py-3 font-medium text-navy-900 dark:text-white">
                        {oi.course.title}
                      </td>
                      <td className="px-5 py-3 text-navy-600 dark:text-slate-300">
                        {oi.order.user?.name ?? "—"}
                      </td>
                      <td className="px-5 py-3 whitespace-nowrap text-navy-500 dark:text-slate-400">
                        {format(oi.order.createdAt, "dd MMM yyyy")}
                      </td>
                      <td className="px-5 py-3 text-right font-semibold text-emerald-600">
                        {formatCurrency(oi.price, oi.course.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
