import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  Star, Users, PlayCircle, Clock, Globe, BarChart3, CheckCircle2,
  Target, Award, ChevronRight,
} from "lucide-react";
import { getCourseBySlug, getEnrollment, getCourseCards } from "@/lib/queries";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatHours, relativeTime } from "@/lib/utils";
import { EnrollCard } from "@/components/course/enroll-card";
import { Curriculum } from "@/components/course/curriculum";
import { ReviewForm } from "@/components/course/review-form";
import { CourseCard } from "@/components/course/course-card";
import { Avatar } from "@/components/ui/avatar";
import { StarRating } from "@/components/ui/star-rating";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  return { title: course?.title ?? "Course", description: course?.subtitle ?? undefined };
}

export default async function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) notFound();

  const user = await getCurrentUser();
  const enrollment = user ? await getEnrollment(user.id, course.id) : null;
  const wishlisted = user
    ? !!(await prisma.wishlistItem.findUnique({ where: { userId_courseId: { userId: user.id, courseId: course.id } } }))
    : false;
  const myReview = user
    ? await prisma.review.findUnique({ where: { userId_courseId: { userId: user.id, courseId: course.id } } })
    : null;

  const related = (await getCourseCards({ categoryId: course.categoryId, id: { not: course.id } })).slice(0, 3);

  const ratingBuckets = [5, 4, 3, 2, 1].map((r) => ({
    r,
    count: course.reviews.filter((rev) => rev.rating === r).length,
  }));

  return (
    <div>
      {/* HERO */}
      <section className="relative bg-navy-900 text-white">
        <div className="absolute inset-0 bg-hero-grid opacity-60" />
        <div className="container-page relative grid gap-10 py-12 lg:grid-cols-[1fr_380px] lg:py-16">
          <div>
            <nav className="mb-4 flex items-center gap-1.5 text-sm text-slate-400">
              <Link href="/courses" className="hover:text-gold-400">Courses</Link>
              <ChevronRight className="h-4 w-4" />
              {course.category && (
                <>
                  <Link href={`/courses?category=${course.category.slug}`} className="hover:text-gold-400">
                    {course.category.name}
                  </Link>
                </>
              )}
            </nav>
            <div className="mb-3 flex flex-wrap gap-2">
              {course.bestseller && <span className="badge-gold">Bestseller</span>}
              {course.featured && <span className="badge-sky">Featured</span>}
              <span className="badge-navy !bg-white/10 !text-slate-200">{course.level}</span>
            </div>
            <h1 className="font-display text-3xl font-black leading-tight sm:text-4xl">{course.title}</h1>
            <p className="mt-3 max-w-2xl text-lg text-slate-300">{course.subtitle}</p>

            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
              <span className="flex items-center gap-1.5 font-semibold text-gold-300">
                <Star className="h-4 w-4 fill-gold-400 text-gold-400" />
                {course.rating > 0 ? course.rating.toFixed(1) : "New"}
                <span className="font-normal text-slate-400">({course._count.reviews} reviews)</span>
              </span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <Users className="h-4 w-4" /> {course._count.enrollments.toLocaleString()} learners
              </span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <Globe className="h-4 w-4" /> {course.language}
              </span>
            </div>

            <div className="mt-5 flex items-center gap-3">
              <Avatar name={course.instructor.name} src={course.instructor.image} size={44} />
              <div>
                <p className="text-sm text-slate-400">Created by</p>
                <Link href="/instructors" className="font-semibold text-white hover:text-gold-400">
                  {course.instructor.name}
                </Link>
              </div>
            </div>
          </div>

          {/* sticky enroll card (desktop shows in hero via translate) */}
          <div className="lg:row-span-2 lg:-mb-40 lg:self-start">
            <div className="overflow-hidden rounded-3xl">
              {course.image && (
                <div className="relative aspect-video">
                  <Image src={course.image} alt={course.title} fill className="object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center bg-navy-900/30">
                    <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 text-navy-900 shadow-lg transition hover:scale-110">
                      <PlayCircle className="h-9 w-9" />
                    </span>
                  </div>
                </div>
              )}
            </div>
            <div className="mt-4">
              <EnrollCard
                course={course}
                enrolled={!!enrollment}
                wishlisted={wishlisted}
                progressPct={enrollment?.progressPct ?? 0}
              />
            </div>
          </div>
        </div>
      </section>

      {/* BODY */}
      <div className="container-page grid gap-10 py-12 lg:grid-cols-[1fr_380px]">
        <div className="space-y-12">
          {/* highlights */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Highlight icon={PlayCircle} value={`${course.lessonCount}`} label="Lessons" />
            <Highlight icon={Clock} value={formatHours(course.totalSeconds)} label="Content" />
            <Highlight icon={BarChart3} value={course.level} label="Level" />
            <Highlight icon={Award} value="Yes" label="Certificate" />
          </div>

          {/* what you'll learn */}
          {course.outcomes.length > 0 && (
            <section>
              <h2 className="mb-5 font-display text-2xl font-bold text-navy-900 dark:text-white">What you'll learn</h2>
              <div className="card grid gap-3 p-6 sm:grid-cols-2">
                {course.outcomes.map((o) => (
                  <div key={o} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                    <span className="text-sm text-navy-700 dark:text-slate-300">{o}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* curriculum */}
          <section>
            <h2 className="mb-5 font-display text-2xl font-bold text-navy-900 dark:text-white">Course content</h2>
            <Curriculum sections={course.sections} enrolled={!!enrollment} />
          </section>

          {/* description */}
          <section>
            <h2 className="mb-5 font-display text-2xl font-bold text-navy-900 dark:text-white">Description</h2>
            <div className="prose-content">
              {course.description.split("\n").map((p, i) => <p key={i}>{p}</p>)}
            </div>
          </section>

          {/* requirements & audience */}
          <div className="grid gap-8 sm:grid-cols-2">
            {course.requirements.length > 0 && (
              <section>
                <h3 className="mb-3 font-display text-lg font-bold text-navy-900 dark:text-white">Requirements</h3>
                <ul className="space-y-2">
                  {course.requirements.map((r) => (
                    <li key={r} className="flex items-start gap-2 text-sm text-navy-600 dark:text-slate-300">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-400" /> {r}
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {course.audience.length > 0 && (
              <section>
                <h3 className="mb-3 font-display text-lg font-bold text-navy-900 dark:text-white">Who this is for</h3>
                <ul className="space-y-2">
                  {course.audience.map((a) => (
                    <li key={a} className="flex items-start gap-2 text-sm text-navy-600 dark:text-slate-300">
                      <Target className="mt-0.5 h-4 w-4 shrink-0 text-sky-dark" /> {a}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          {/* instructor */}
          <section>
            <h2 className="mb-5 font-display text-2xl font-bold text-navy-900 dark:text-white">Your instructor</h2>
            <div className="card p-6">
              <div className="flex items-center gap-4">
                <Avatar name={course.instructor.name} src={course.instructor.image} size={64} />
                <div>
                  <p className="font-display text-lg font-bold text-navy-900 dark:text-white">{course.instructor.name}</p>
                  <p className="text-sm text-sky-dark">{course.instructor.headline}</p>
                  <p className="mt-1 text-xs text-navy-400">
                    {course.instructor._count.coursesTeaching} courses
                  </p>
                </div>
              </div>
              {course.instructor.bio && (
                <p className="mt-4 text-sm leading-relaxed text-navy-600 dark:text-slate-300">{course.instructor.bio}</p>
              )}
            </div>
          </section>

          {/* reviews */}
          <section>
            <h2 className="mb-5 font-display text-2xl font-bold text-navy-900 dark:text-white">
              Student reviews
            </h2>
            <div className="mb-6 grid gap-6 sm:grid-cols-[200px_1fr]">
              <div className="card flex flex-col items-center justify-center p-6 text-center">
                <p className="font-display text-5xl font-black text-gold-500">
                  {course.rating > 0 ? course.rating.toFixed(1) : "—"}
                </p>
                <StarRating value={course.rating} size={18} className="mt-2" />
                <p className="mt-1 text-xs text-navy-400">{course._count.reviews} reviews</p>
              </div>
              <div className="card flex flex-col justify-center gap-1.5 p-6">
                {ratingBuckets.map((b) => {
                  const pct = course._count.reviews ? (b.count / course._count.reviews) * 100 : 0;
                  return (
                    <div key={b.r} className="flex items-center gap-2 text-xs">
                      <span className="flex w-8 items-center gap-0.5 text-navy-500">{b.r}<Star className="h-3 w-3 fill-gold-400 text-gold-400" /></span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-navy-100 dark:bg-navy-700">
                        <div className="h-full rounded-full bg-gold-400" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="w-8 text-right text-navy-400">{b.count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {enrollment && (
              <div className="mb-6">
                <ReviewForm courseId={course.id} existing={myReview} />
              </div>
            )}

            <div className="space-y-4">
              {course.reviews.length === 0 && (
                <p className="text-sm text-navy-400">No reviews yet. Be the first to review this course.</p>
              )}
              {course.reviews.map((rev) => (
                <div key={rev.id} className="card p-5">
                  <div className="flex items-center gap-3">
                    <Avatar name={rev.user.name} src={rev.user.image} size={40} />
                    <div>
                      <p className="text-sm font-semibold text-navy-900 dark:text-white">{rev.user.name}</p>
                      <div className="flex items-center gap-2">
                        <StarRating value={rev.rating} size={12} />
                        <span className="text-xs text-navy-400">{relativeTime(rev.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  {rev.comment && <p className="mt-3 text-sm text-navy-600 dark:text-slate-300">{rev.comment}</p>}
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="hidden lg:block" />
      </div>

      {/* related */}
      {related.length > 0 && (
        <section className="border-t border-navy-100 bg-navy-50 py-16 dark:border-navy-800 dark:bg-navy-900/40">
          <div className="container-page">
            <h2 className="mb-8 font-display text-2xl font-bold text-navy-900 dark:text-white">More in {course.category?.name}</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((c) => <CourseCard key={c.id} course={c} />)}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function Highlight({ icon: Icon, value, label }: { icon: React.ElementType; value: string; label: string }) {
  return (
    <div className="card flex items-center gap-3 p-4">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky/10 text-sky-dark">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="font-display text-sm font-bold text-navy-900 dark:text-white">{value}</p>
        <p className="text-xs text-navy-400">{label}</p>
      </div>
    </div>
  );
}
