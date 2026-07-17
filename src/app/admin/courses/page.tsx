import Link from "next/link";
import Image from "next/image";
import { BookOpen } from "lucide-react";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { formatCurrency, cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const STATUSES = ["DRAFT", "PENDING", "PUBLISHED", "ARCHIVED"] as const;

function statusBadge(status: string) {
  switch (status) {
    case "PUBLISHED":
      return "badge-green";
    case "PENDING":
      return "badge-gold";
    case "DRAFT":
      return "badge-sky";
    case "ARCHIVED":
      return "badge-navy";
    default:
      return "badge-navy";
  }
}

export default async function AdminCoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const activeStatus = STATUSES.includes(status as (typeof STATUSES)[number])
    ? status
    : undefined;

  const where: Prisma.CourseWhereInput = {};
  if (activeStatus) where.status = activeStatus;

  const [courses, total, statusCounts] = await Promise.all([
    prisma.course.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        instructor: { select: { name: true } },
        category: { select: { name: true } },
        _count: { select: { enrollments: true, reviews: true } },
      },
    }),
    prisma.course.count(),
    prisma.course.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);

  const countFor = (s: string) =>
    statusCounts.find((c) => c.status === s)?._count._all ?? 0;

  const chips = [
    { label: "All", value: undefined as string | undefined, count: total },
    ...STATUSES.map((s) => ({
      label: s.charAt(0) + s.slice(1).toLowerCase(),
      value: s,
      count: countFor(s),
    })),
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Catalog</p>
        <h1 className="text-2xl font-bold text-navy-900 dark:text-white sm:text-3xl">Courses</h1>
        <p className="mt-1 text-sm text-navy-500 dark:text-slate-400">
          {total.toLocaleString()} courses in the catalog.
        </p>
      </div>

      {/* Status chips */}
      <div className="flex flex-wrap gap-2">
        {chips.map((c) => {
          const active = activeStatus === c.value;
          return (
            <Link
              key={c.label}
              href={c.value ? `/admin/courses?status=${c.value}` : "/admin/courses"}
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

      {courses.length === 0 ? (
        <div className="card flex flex-col items-center justify-center gap-2 py-16 text-navy-400">
          <BookOpen className="h-8 w-8" />
          <p className="text-sm">No courses match this filter.</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="card hidden overflow-hidden lg:block">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-navy-100 bg-navy-50/50 text-left text-xs uppercase tracking-wide text-navy-400 dark:border-navy-700 dark:bg-navy-800/50">
                    <th className="px-4 py-3 font-semibold">Course</th>
                    <th className="px-4 py-3 font-semibold">Instructor</th>
                    <th className="px-4 py-3 font-semibold">Category</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Price</th>
                    <th className="px-4 py-3 text-right font-semibold">Students</th>
                    <th className="px-4 py-3 text-right font-semibold">Reviews</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-50 dark:divide-navy-800">
                  {courses.map((c) => (
                    <tr key={c.id} className="hover:bg-navy-50/40 dark:hover:bg-navy-800/40">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Thumb src={c.image} title={c.title} />
                          <div className="min-w-0 max-w-xs">
                            <p className="truncate font-medium text-navy-900 dark:text-white">
                              {c.title}
                            </p>
                            <p className="text-xs text-navy-400">{c.level}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-navy-600 dark:text-slate-300">
                        {c.instructor.name}
                      </td>
                      <td className="px-4 py-3 text-navy-600 dark:text-slate-300">
                        {c.category?.name || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={statusBadge(c.status)}>{c.status}</span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-navy-900 dark:text-white">
                        {formatCurrency(c.discountPrice ?? c.price, c.currency)}
                      </td>
                      <td className="px-4 py-3 text-right text-navy-900 dark:text-white">
                        {c._count.enrollments}
                      </td>
                      <td className="px-4 py-3 text-right text-navy-900 dark:text-white">
                        {c._count.reviews}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="grid gap-3 lg:hidden">
            {courses.map((c) => (
              <div key={c.id} className="card p-4">
                <div className="flex gap-3">
                  <Thumb src={c.image} title={c.title} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-navy-900 dark:text-white">{c.title}</p>
                      <span className={statusBadge(c.status)}>{c.status}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-navy-400">
                      {c.instructor.name} · {c.category?.name || "Uncategorized"}
                    </p>
                    <div className="mt-2 flex items-center gap-4 text-xs text-navy-500 dark:text-slate-300">
                      <span className="font-semibold text-navy-900 dark:text-white">
                        {formatCurrency(c.discountPrice ?? c.price, c.currency)}
                      </span>
                      <span>{c._count.enrollments} students</span>
                      <span>{c._count.reviews} reviews</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function Thumb({ src, title }: { src: string | null; title: string }) {
  if (src) {
    return (
      <Image
        src={src}
        alt={title}
        width={56}
        height={40}
        className="h-10 w-14 shrink-0 rounded-lg object-cover"
      />
    );
  }
  return (
    <div className="flex h-10 w-14 shrink-0 items-center justify-center rounded-lg bg-navy-100 text-navy-400 dark:bg-navy-700">
      <BookOpen className="h-4 w-4" />
    </div>
  );
}
