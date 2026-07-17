import Link from "next/link";
import { Search, SlidersHorizontal } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCourseCards } from "@/lib/queries";
import { getCurrentUser } from "@/lib/session";
import { CourseCard } from "@/components/course/course-card";

export const dynamic = "force-dynamic";

export const metadata = { title: "Courses" };

const SORTS: Record<string, string> = {
  newest: "Newest",
  popular: "Most popular",
  rating: "Top rated",
  price_low: "Price: Low to High",
  price_high: "Price: High to Low",
};

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; level?: string; price?: string; sort?: string }>;
}) {
  const sp = await searchParams;
  const { q, category, level, price, sort = "newest" } = sp;

  const [categories, user] = await Promise.all([
    prisma.category.findMany({ include: { _count: { select: { courses: true } } } }),
    getCurrentUser(),
  ]);

  const where: Record<string, unknown> = {};
  if (category) where.category = { slug: category };
  if (level) where.level = level;
  if (q) {
    where.OR = [
      { title: { contains: q } },
      { subtitle: { contains: q } },
      { description: { contains: q } },
    ];
  }

  let courses = await getCourseCards(where);
  if (price === "free") courses = courses.filter((c) => (c.discountPrice ?? c.price) === 0);
  if (price === "paid") courses = courses.filter((c) => (c.discountPrice ?? c.price) > 0);

  courses.sort((a, b) => {
    switch (sort) {
      case "popular": return b.enrollmentCount - a.enrollmentCount;
      case "rating": return b.rating - a.rating;
      case "price_low": return (a.discountPrice ?? a.price) - (b.discountPrice ?? b.price);
      case "price_high": return (b.discountPrice ?? b.price) - (a.discountPrice ?? a.price);
      default: return 0;
    }
  });

  const wishlist = user
    ? new Set((await prisma.wishlistItem.findMany({ where: { userId: user.id }, select: { courseId: true } })).map((w) => w.courseId))
    : new Set<string>();

  const levels = ["Beginner", "Intermediate", "Advanced", "All Levels"];

  function qs(overrides: Record<string, string | undefined>) {
    const params = new URLSearchParams();
    const merged = { q, category, level, price, sort, ...overrides };
    for (const [k, v] of Object.entries(merged)) if (v) params.set(k, v);
    return `/courses?${params.toString()}`;
  }

  return (
    <div className="bg-slate-50 dark:bg-navy-950">
      {/* header */}
      <div className="border-b border-navy-100 bg-white dark:border-navy-800 dark:bg-navy-900">
        <div className="container-page py-10">
          <h1 className="font-display text-3xl font-black text-navy-900 dark:text-white">
            {q ? `Results for “${q}”` : category ? categories.find((c) => c.slug === category)?.name ?? "Courses" : "All Courses"}
          </h1>
          <p className="mt-2 text-navy-500 dark:text-slate-400">
            {courses.length} course{courses.length !== 1 ? "s" : ""} to help you master a lifetime skill.
          </p>
          <form action="/courses" className="mt-6 max-w-xl">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-navy-300" />
              <input name="q" defaultValue={q} placeholder="Search courses, topics, instructors..." className="input py-3 pl-12 text-base" />
            </div>
          </form>
        </div>
      </div>

      <div className="container-page grid gap-8 py-10 lg:grid-cols-[260px_1fr]">
        {/* filters */}
        <aside className="space-y-6">
          <div className="card p-5">
            <p className="mb-3 flex items-center gap-2 text-sm font-bold text-navy-900 dark:text-white">
              <SlidersHorizontal className="h-4 w-4" /> Categories
            </p>
            <div className="space-y-1">
              <FilterLink href={qs({ category: undefined })} active={!category} label="All categories" />
              {categories.map((c) => (
                <FilterLink key={c.id} href={qs({ category: c.slug })} active={category === c.slug} label={`${c.icon} ${c.name}`} count={c._count.courses} />
              ))}
            </div>
          </div>
          <div className="card p-5">
            <p className="mb-3 text-sm font-bold text-navy-900 dark:text-white">Level</p>
            <div className="space-y-1">
              <FilterLink href={qs({ level: undefined })} active={!level} label="All levels" />
              {levels.map((l) => (
                <FilterLink key={l} href={qs({ level: l })} active={level === l} label={l} />
              ))}
            </div>
          </div>
          <div className="card p-5">
            <p className="mb-3 text-sm font-bold text-navy-900 dark:text-white">Price</p>
            <div className="space-y-1">
              <FilterLink href={qs({ price: undefined })} active={!price} label="All" />
              <FilterLink href={qs({ price: "free" })} active={price === "free"} label="Free" />
              <FilterLink href={qs({ price: "paid" })} active={price === "paid"} label="Paid" />
            </div>
          </div>
        </aside>

        {/* results */}
        <div>
          <div className="mb-5 flex items-center justify-between">
            <p className="text-sm text-navy-500 dark:text-slate-400">Showing {courses.length} results</p>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(SORTS).map(([key, label]) => (
                <Link
                  key={key}
                  href={qs({ sort: key })}
                  className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${sort === key ? "bg-navy-900 text-white dark:bg-gold-400 dark:text-navy-900" : "text-navy-500 hover:bg-navy-100 dark:hover:bg-navy-800"}`}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {courses.length === 0 ? (
            <div className="card flex flex-col items-center justify-center gap-3 py-20 text-center">
              <Search className="h-10 w-10 text-navy-200" />
              <p className="font-semibold text-navy-900 dark:text-white">No courses found</p>
              <p className="text-sm text-navy-500">Try adjusting your filters or search terms.</p>
              <Link href="/courses" className="btn-primary btn-md mt-2">Clear filters</Link>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} wishlisted={wishlist.has(course.id)} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterLink({ href, active, label, count }: { href: string; active: boolean; label: string; count?: number }) {
  return (
    <Link
      href={href}
      className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm transition ${active ? "bg-sky/10 font-semibold text-sky-dark" : "text-navy-600 hover:bg-navy-50 dark:text-slate-300 dark:hover:bg-navy-800"}`}
    >
      <span>{label}</span>
      {count != null && <span className="text-xs text-navy-400">{count}</span>}
    </Link>
  );
}
