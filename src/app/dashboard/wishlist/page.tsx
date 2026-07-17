import Link from "next/link";
import { Heart } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { getCourseCards } from "@/lib/queries";
import { CourseCard } from "@/components/course/course-card";

export const dynamic = "force-dynamic";

export default async function WishlistPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const items = await prisma.wishlistItem.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: { courseId: true },
  });

  const courseIds = items.map((i) => i.courseId);
  const cards = courseIds.length
    ? await getCourseCards({ id: { in: courseIds } })
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-navy-900 dark:text-white sm:text-3xl">
          Wishlist
        </h1>
        <p className="mt-1 text-sm text-navy-500 dark:text-slate-400">
          Courses you are eyeing. Save them here and enroll when the timing is right.
        </p>
      </div>

      {cards.length === 0 ? (
        <div className="card flex flex-col items-center justify-center px-6 py-16 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-400 dark:bg-navy-800">
            <Heart className="h-7 w-7" />
          </span>
          <p className="mt-4 font-display text-lg font-bold text-navy-900 dark:text-white">
            Your wishlist is empty
          </p>
          <p className="mt-1 max-w-sm text-sm text-navy-500 dark:text-slate-400">
            Tap the heart on any course to save it here for later.
          </p>
          <Link href="/courses" className="btn-primary btn-md mt-5">
            Discover courses
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {cards.map((course) => (
            <CourseCard key={course.id} course={course} wishlisted />
          ))}
        </div>
      )}
    </div>
  );
}
