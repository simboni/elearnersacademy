import Link from "next/link";
import Image from "next/image";
import { Plus, BookOpen, Users, Layers, Star, PlusCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { formatCurrency, cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const STATUS_BADGE: Record<string, string> = {
  PUBLISHED: "badge-green",
  DRAFT: "badge-navy",
  PENDING: "badge-gold",
  ARCHIVED: "badge-red",
};

export default async function InstructorCoursesPage() {
  const user = (await getCurrentUser())!;

  const courses = await prisma.course.findMany({
    where: { instructorId: user.id },
    include: {
      _count: { select: { enrollments: true, reviews: true } },
      reviews: { select: { rating: true } },
      sections: { include: { _count: { select: { lessons: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  const rows = courses.map((c) => {
    const ratings = c.reviews.map((r) => r.rating);
    const lessons = c.sections.reduce((s, sec) => s + sec._count.lessons, 0);
    const price = c.discountPrice ?? c.price;
    return {
      id: c.id,
      slug: c.slug,
      title: c.title,
      subtitle: c.subtitle,
      image: c.image,
      status: c.status,
      level: c.level,
      currency: c.currency,
      price,
      students: c._count.enrollments,
      lessons,
      rating: ratings.length ? ratings.reduce((s, r) => s + r, 0) / ratings.length : 0,
    };
  });

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold text-navy-900 dark:text-white">
            My Courses
          </h2>
          <p className="text-sm text-navy-500 dark:text-slate-400">
            {rows.length} course{rows.length === 1 ? "" : "s"} in your trading academy
          </p>
        </div>
        <Link href="/instructor/courses/new" className="btn-primary btn-md inline-flex items-center gap-2">
          <Plus size={18} /> New Course
        </Link>
      </div>

      {/* Course builder callout */}
      <div className="card flex flex-col items-start gap-3 border-dashed p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="inline-flex rounded-xl bg-sky/10 p-2.5">
            <PlusCircle size={20} className="text-sky" />
          </span>
          <div>
            <h3 className="font-display font-semibold text-navy-900 dark:text-white">
              Course builder
            </h3>
            <p className="text-sm text-navy-500 dark:text-slate-400">
              Structure your curriculum into sections and lessons, upload videos and publish when
              ready.
            </p>
          </div>
        </div>
        <Link href="/instructor/courses/new" className="btn-outline btn-sm shrink-0">
          Open builder
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="card flex flex-col items-center justify-center gap-3 py-16 text-center">
          <span className="inline-flex rounded-2xl bg-navy-100 p-4 dark:bg-navy-800">
            <BookOpen size={28} className="text-sky" />
          </span>
          <h3 className="font-display text-lg font-semibold text-navy-900 dark:text-white">
            No courses yet
          </h3>
          <p className="max-w-sm text-sm text-navy-500 dark:text-slate-400">
            Share your trading expertise. Create your first course and start teaching students how to
            navigate the markets.
          </p>
          <Link href="/instructor/courses/new" className="btn-primary btn-md mt-2 inline-flex items-center gap-2">
            <Plus size={18} /> Create your first course
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map((c) => (
            <Link key={c.id} href={`/instructor/courses/${c.id}/edit`} className="card card-hover flex flex-col overflow-hidden p-0">
              <div className="relative aspect-video w-full bg-navy-100 dark:bg-navy-800">
                {c.image ? (
                  <Image src={c.image} alt={c.title} fill className="object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <BookOpen size={32} className="text-navy-300" />
                  </div>
                )}
                <span
                  className={cn(
                    "absolute left-3 top-3",
                    STATUS_BADGE[c.status] ?? "badge-navy"
                  )}
                >
                  {c.status}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-4">
                <div className="mb-2 flex items-center gap-2">
                  <span className="badge-sky">{c.level}</span>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-gold-500">
                    <Star size={13} className="fill-gold-400 text-gold-400" />
                    {c.rating ? c.rating.toFixed(1) : "New"}
                  </span>
                </div>
                <h3 className="font-display font-semibold leading-snug text-navy-900 dark:text-white">
                  {c.title}
                </h3>
                {c.subtitle && (
                  <p className="mt-1 line-clamp-2 text-sm text-navy-500 dark:text-slate-400">
                    {c.subtitle}
                  </p>
                )}
                <div className="mt-4 flex items-center gap-4 border-t border-navy-100 pt-3 text-xs text-navy-500 dark:border-navy-800 dark:text-slate-400">
                  <span className="inline-flex items-center gap-1">
                    <Users size={14} className="text-sky" /> {c.students}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Layers size={14} className="text-sky" /> {c.lessons} lesson
                    {c.lessons === 1 ? "" : "s"}
                  </span>
                  <span className="ml-auto font-semibold text-navy-900 dark:text-white">
                    {formatCurrency(c.price, c.currency)}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
