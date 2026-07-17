import { prisma } from "./prisma";
import { safeJson, avgRating } from "./utils";

export type CourseCardData = Awaited<ReturnType<typeof getCourseCards>>[number];

export async function getCourseCards(where: Record<string, unknown> = {}) {
  const courses = await prisma.course.findMany({
    where: { status: "PUBLISHED", ...where },
    include: {
      instructor: { select: { name: true, image: true } },
      category: { select: { name: true, slug: true } },
      reviews: { select: { rating: true } },
      _count: { select: { enrollments: true, reviews: true } },
      sections: { include: { _count: { select: { lessons: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });
  return courses.map((c) => ({
    id: c.id,
    title: c.title,
    slug: c.slug,
    subtitle: c.subtitle,
    image: c.image,
    level: c.level,
    price: c.price,
    discountPrice: c.discountPrice,
    currency: c.currency,
    durationLabel: c.durationLabel,
    featured: c.featured,
    bestseller: c.bestseller,
    instructor: c.instructor,
    category: c.category,
    rating: avgRating(c.reviews),
    reviewCount: c._count.reviews,
    enrollmentCount: c._count.enrollments,
    lessonCount: c.sections.reduce((s, sec) => s + sec._count.lessons, 0),
    tags: safeJson<string[]>(c.tags, []),
  }));
}

export async function getCourseBySlug(slug: string) {
  const course = await prisma.course.findUnique({
    where: { slug },
    include: {
      instructor: {
        select: {
          id: true,
          name: true,
          image: true,
          headline: true,
          bio: true,
          _count: { select: { coursesTeaching: true } },
        },
      },
      category: true,
      sections: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
            orderBy: { order: "asc" },
            include: { quiz: { select: { id: true } } },
          },
        },
      },
      reviews: {
        include: { user: { select: { name: true, image: true } } },
        orderBy: { createdAt: "desc" },
      },
      _count: { select: { enrollments: true, reviews: true } },
    },
  });
  if (!course) return null;
  const lessonCount = course.sections.reduce((s, sec) => s + sec.lessons.length, 0);
  const totalSeconds = course.sections.reduce(
    (s, sec) => s + sec.lessons.reduce((t, l) => t + l.durationSec, 0),
    0
  );
  return {
    ...course,
    outcomes: safeJson<string[]>(course.outcomes, []),
    requirements: safeJson<string[]>(course.requirements, []),
    audience: safeJson<string[]>(course.targetAudience, []),
    tags: safeJson<string[]>(course.tags, []),
    rating: avgRating(course.reviews),
    lessonCount,
    totalSeconds,
  };
}

export async function getEnrollment(userId: string, courseId: string) {
  return prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });
}

export async function isEnrolled(userId: string, courseId: string) {
  const e = await getEnrollment(userId, courseId);
  return !!e;
}

/** Recompute a user's course progress from lesson completion. */
export async function recomputeProgress(userId: string, courseId: string) {
  const lessons = await prisma.lesson.findMany({
    where: { section: { courseId } },
    select: { id: true },
  });
  const total = lessons.length || 1;
  const done = await prisma.lessonProgress.count({
    where: { userId, completed: true, lessonId: { in: lessons.map((l) => l.id) } },
  });
  const pct = Math.round((done / total) * 100);
  const completedAt = pct >= 100 ? new Date() : null;
  await prisma.enrollment.update({
    where: { userId_courseId: { userId, courseId } },
    data: { progressPct: pct, completedAt },
  });
  return { pct, done, total };
}
