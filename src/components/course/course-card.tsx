import Link from "next/link";
import Image from "next/image";
import { Star, Users, PlayCircle, Clock } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { CourseCardData } from "@/lib/queries";
import { WishlistButton } from "./wishlist-button";

export function CourseCard({ course, wishlisted }: { course: CourseCardData; wishlisted?: boolean }) {
  const price = course.discountPrice ?? course.price;
  return (
    <div className="card card-hover group flex flex-col overflow-hidden">
      <Link href={`/courses/${course.slug}`} className="relative block aspect-[16/10] overflow-hidden bg-navy-100">
        {course.image ? (
          <Image
            src={course.image}
            alt={course.title}
            fill
            sizes="(max-width:768px) 100vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-navy-700 to-navy-900 text-white">
            <PlayCircle className="h-10 w-10 opacity-70" />
          </div>
        )}
        <div className="absolute left-3 top-3 flex gap-1.5">
          {course.bestseller && <span className="badge-gold shadow">Bestseller</span>}
          {course.featured && !course.bestseller && <span className="badge-sky shadow">Featured</span>}
        </div>
        <div className="absolute right-3 top-3">
          <WishlistButton courseId={course.id} initial={!!wishlisted} floating />
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex items-center gap-2 text-xs">
          {course.category && <span className="badge-navy">{course.category.name}</span>}
          <span className="text-navy-400">{course.level}</span>
        </div>
        <Link href={`/courses/${course.slug}`}>
          <h3 className="line-clamp-2 font-display font-bold leading-snug text-navy-900 transition group-hover:text-sky-dark dark:text-white">
            {course.title}
          </h3>
        </Link>
        <p className="mt-1 line-clamp-2 text-sm text-navy-500 dark:text-slate-400">{course.subtitle}</p>

        <div className="mt-2 flex items-center gap-1 text-xs text-navy-500">
          by <span className="font-medium text-navy-700 dark:text-slate-300">{course.instructor.name}</span>
        </div>

        <div className="mt-3 flex items-center gap-3 text-xs text-navy-500 dark:text-slate-400">
          <span className="flex items-center gap-1 font-semibold text-gold-600">
            <Star className="h-3.5 w-3.5 fill-gold-400 text-gold-400" />
            {course.rating > 0 ? course.rating.toFixed(1) : "New"}
            {course.reviewCount > 0 && <span className="font-normal text-navy-400">({course.reviewCount})</span>}
          </span>
          <span className="flex items-center gap-1">
            <PlayCircle className="h-3.5 w-3.5" /> {course.lessonCount} lessons
          </span>
          {course.durationLabel && (
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> {course.durationLabel}
            </span>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-navy-100 pt-3 dark:border-navy-700">
          <div className="flex items-center gap-1.5 text-xs text-navy-400">
            <Users className="h-3.5 w-3.5" /> {course.enrollmentCount.toLocaleString()} learners
          </div>
          <div className="flex items-baseline gap-1.5">
            {course.discountPrice != null && course.price > 0 && (
              <span className="text-xs text-navy-300 line-through">
                {formatCurrency(course.price, course.currency)}
              </span>
            )}
            <span className="font-display text-base font-extrabold text-navy-900 dark:text-white">
              {formatCurrency(price, course.currency)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
