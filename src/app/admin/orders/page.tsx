import { ShoppingBag, DollarSign, Receipt, TrendingUp } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatCurrency, relativeTime, cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";

export const dynamic = "force-dynamic";

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

export default async function AdminOrdersPage() {
  const [orders, orderCount, revenueAgg] = await Promise.all([
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        user: { select: { name: true, email: true, image: true } },
        _count: { select: { items: true } },
      },
    }),
    prisma.order.count(),
    prisma.order.aggregate({ where: { status: "PAID" }, _sum: { total: true }, _count: { _all: true } }),
  ]);

  const totalRevenue = revenueAgg._sum.total ?? 0;
  const paidCount = revenueAgg._count._all;
  const avgOrder = paidCount > 0 ? totalRevenue / paidCount : 0;

  const tiles = [
    { label: "Total revenue", value: formatCurrency(totalRevenue, "KES"), icon: DollarSign, accent: "text-gold-500" },
    { label: "Total orders", value: orderCount.toLocaleString(), icon: Receipt, accent: "text-sky" },
    { label: "Avg. order value", value: formatCurrency(Math.round(avgOrder), "KES"), icon: TrendingUp, accent: "text-emerald-500" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Commerce</p>
        <h1 className="text-2xl font-bold text-navy-900 dark:text-white sm:text-3xl">Orders</h1>
        <p className="mt-1 text-sm text-navy-500 dark:text-slate-400">
          Payments and enrollments revenue.
        </p>
      </div>

      {/* Summary tiles */}
      <div className="grid gap-3 sm:grid-cols-3">
        {tiles.map((t) => {
          const Icon = t.icon;
          return (
            <div key={t.label} className="card p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-50 dark:bg-navy-700">
                  <Icon className={cn("h-5 w-5", t.accent)} />
                </span>
                <div>
                  <p className="text-lg font-bold text-navy-900 dark:text-white">{t.value}</p>
                  <p className="text-xs font-medium text-navy-500 dark:text-slate-400">{t.label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {orders.length === 0 ? (
        <div className="card flex flex-col items-center justify-center gap-2 py-16 text-navy-400">
          <ShoppingBag className="h-8 w-8" />
          <p className="text-sm font-medium">No orders yet</p>
          <p className="text-xs">Orders will appear here once students start purchasing courses.</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="card hidden overflow-hidden lg:block">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-navy-100 bg-navy-50/50 text-left text-xs uppercase tracking-wide text-navy-400 dark:border-navy-700 dark:bg-navy-800/50">
                    <th className="px-4 py-3 font-semibold">Reference</th>
                    <th className="px-4 py-3 font-semibold">Buyer</th>
                    <th className="px-4 py-3 text-right font-semibold">Items</th>
                    <th className="px-4 py-3 font-semibold">Coupon</th>
                    <th className="px-4 py-3 text-right font-semibold">Total</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 text-right font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-50 dark:divide-navy-800">
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-navy-50/40 dark:hover:bg-navy-800/40">
                      <td className="px-4 py-3 font-mono text-xs text-navy-500 dark:text-slate-400">
                        {o.reference || o.id.slice(0, 10)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={o.user.name} src={o.user.image} size={30} />
                          <div className="min-w-0">
                            <p className="font-medium text-navy-900 dark:text-white">{o.user.name}</p>
                            <p className="truncate text-xs text-navy-400">{o.user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-navy-600 dark:text-slate-300">
                        {o._count.items}
                      </td>
                      <td className="px-4 py-3">
                        {o.couponCode ? (
                          <span className="badge-sky">{o.couponCode}</span>
                        ) : (
                          <span className="text-navy-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-navy-900 dark:text-white">
                        {formatCurrency(o.total, o.currency)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={statusBadge(o.status)}>{o.status}</span>
                      </td>
                      <td className="px-4 py-3 text-right text-navy-400">
                        {relativeTime(o.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="grid gap-3 lg:hidden">
            {orders.map((o) => (
              <div key={o.id} className="card p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <Avatar name={o.user.name} src={o.user.image} size={34} />
                    <div className="min-w-0">
                      <p className="font-medium text-navy-900 dark:text-white">{o.user.name}</p>
                      <p className="truncate text-xs text-navy-400">{o.user.email}</p>
                    </div>
                  </div>
                  <span className={statusBadge(o.status)}>{o.status}</span>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-navy-500 dark:text-slate-300">
                  <span className="font-mono">{o.reference || o.id.slice(0, 10)}</span>
                  <span>{o._count.items} items</span>
                  <span className="font-semibold text-navy-900 dark:text-white">
                    {formatCurrency(o.total, o.currency)}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-navy-400">
                  {o.couponCode ? <span className="badge-sky">{o.couponCode}</span> : <span>No coupon</span>}
                  <span>{relativeTime(o.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
