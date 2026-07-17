import Link from "next/link";
import { Search, Users as UsersIcon } from "lucide-react";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { relativeTime, cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";

export const dynamic = "force-dynamic";

const ROLES = ["STUDENT", "INSTRUCTOR", "ADMIN"] as const;

function roleBadge(role: string) {
  switch (role) {
    case "ADMIN":
      return "badge-red";
    case "INSTRUCTOR":
      return "badge-gold";
    case "STUDENT":
      return "badge-sky";
    default:
      return "badge-navy";
  }
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; q?: string }>;
}) {
  const { role, q } = await searchParams;
  const activeRole = ROLES.includes(role as (typeof ROLES)[number]) ? role : undefined;
  const query = q?.trim() || "";

  const where: Prisma.UserWhereInput = {};
  if (activeRole) where.role = activeRole;
  if (query) {
    where.OR = [
      { name: { contains: query } },
      { email: { contains: query } },
    ];
  }

  const [users, total, roleCounts] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        country: true,
        createdAt: true,
        _count: { select: { enrollments: true } },
      },
    }),
    prisma.user.count(),
    prisma.user.groupBy({ by: ["role"], _count: { _all: true } }),
  ]);

  const countFor = (r: string) =>
    roleCounts.find((c) => c.role === r)?._count._all ?? 0;

  const chips = [
    { label: "All", value: undefined as string | undefined, count: total },
    ...ROLES.map((r) => ({ label: r.charAt(0) + r.slice(1).toLowerCase() + "s", value: r, count: countFor(r) })),
  ];

  function chipHref(value?: string) {
    const params = new URLSearchParams();
    if (value) params.set("role", value);
    if (query) params.set("q", query);
    const qs = params.toString();
    return qs ? `/admin/users?${qs}` : "/admin/users";
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">People</p>
        <h1 className="text-2xl font-bold text-navy-900 dark:text-white sm:text-3xl">Users</h1>
        <p className="mt-1 text-sm text-navy-500 dark:text-slate-400">
          {total.toLocaleString()} registered members.
        </p>
      </div>

      {/* Search + chips */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {chips.map((c) => {
            const active = activeRole === c.value;
            return (
              <Link
                key={c.label}
                href={chipHref(c.value)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-medium transition",
                  active
                    ? "bg-navy-900 text-white dark:bg-gold-400 dark:text-navy-900"
                    : "border border-navy-200 text-navy-600 hover:bg-navy-50 dark:border-navy-700 dark:text-slate-300 dark:hover:bg-navy-800"
                )}
              >
                {c.label}
                <span
                  className={cn(
                    "rounded-full px-1.5 text-xs",
                    active ? "bg-white/20" : "bg-navy-100 text-navy-500 dark:bg-navy-700 dark:text-slate-300"
                  )}
                >
                  {c.count}
                </span>
              </Link>
            );
          })}
        </div>

        <form method="GET" action="/admin/users" className="relative sm:w-64">
          {activeRole && <input type="hidden" name="role" value={activeRole} />}
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-300" />
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search name or email…"
            className="input pl-9"
          />
        </form>
      </div>

      {users.length === 0 ? (
        <div className="card flex flex-col items-center justify-center gap-2 py-16 text-navy-400">
          <UsersIcon className="h-8 w-8" />
          <p className="text-sm">No users match your filters.</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="card hidden overflow-hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-navy-100 bg-navy-50/50 text-left text-xs uppercase tracking-wide text-navy-400 dark:border-navy-700 dark:bg-navy-800/50">
                    <th className="px-4 py-3 font-semibold">User</th>
                    <th className="px-4 py-3 font-semibold">Role</th>
                    <th className="px-4 py-3 font-semibold">Country</th>
                    <th className="px-4 py-3 font-semibold">Joined</th>
                    <th className="px-4 py-3 text-right font-semibold">Enrollments</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-50 dark:divide-navy-800">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-navy-50/40 dark:hover:bg-navy-800/40">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={u.name} src={u.image} size={36} />
                          <div className="min-w-0">
                            <p className="font-medium text-navy-900 dark:text-white">{u.name}</p>
                            <p className="truncate text-xs text-navy-400">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={roleBadge(u.role)}>{u.role}</span>
                      </td>
                      <td className="px-4 py-3 text-navy-600 dark:text-slate-300">
                        {u.country || "—"}
                      </td>
                      <td className="px-4 py-3 text-navy-400">{relativeTime(u.createdAt)}</td>
                      <td className="px-4 py-3 text-right font-semibold text-navy-900 dark:text-white">
                        {u._count.enrollments}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="grid gap-3 md:hidden">
            {users.map((u) => (
              <div key={u.id} className="card p-4">
                <div className="flex items-center gap-3">
                  <Avatar name={u.name} src={u.image} size={40} />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-navy-900 dark:text-white">{u.name}</p>
                    <p className="truncate text-xs text-navy-400">{u.email}</p>
                  </div>
                  <span className={roleBadge(u.role)}>{u.role}</span>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-navy-400">
                  <span>{u.country || "—"}</span>
                  <span>{relativeTime(u.createdAt)}</span>
                  <span className="font-semibold text-navy-700 dark:text-slate-200">
                    {u._count.enrollments} enrolled
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
