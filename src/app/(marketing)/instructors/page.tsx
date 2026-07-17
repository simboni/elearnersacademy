import Link from "next/link";
import { ArrowRight, Sparkles, BookOpen, GraduationCap, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Avatar } from "@/components/ui/avatar";

export const metadata = { title: "Our Instructors — eLearners Academy" };
export const dynamic = "force-dynamic";

export default async function InstructorsPage() {
  const instructors = await prisma.user.findMany({
    where: { role: "INSTRUCTOR" },
    select: {
      id: true,
      name: true,
      image: true,
      headline: true,
      bio: true,
      country: true,
      _count: { select: { coursesTeaching: true } },
    },
    orderBy: { coursesTeaching: { _count: "desc" } },
  });

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-navy-900 text-white">
        <div className="absolute inset-0 bg-hero-grid" />
        <div className="absolute -right-40 top-0 h-96 w-96 rounded-full bg-sky/20 blur-3xl" />
        <div className="absolute -left-40 bottom-0 h-96 w-96 rounded-full bg-gold-400/10 blur-3xl" />
        <div className="container-page relative py-20 text-center lg:py-24">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold-400/30 bg-gold-400/10 px-4 py-1.5 text-sm font-semibold text-gold-300">
            <Sparkles className="h-4 w-4" /> Learn from practitioners
          </span>
          <h1 className="mt-6 font-display text-4xl font-black leading-[1.1] sm:text-5xl lg:text-6xl">
            Meet your <span className="text-gradient-gold">instructors</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-300">
            Real, funded traders and finance experts who teach what they actually do in live markets
            — from day-trading and crypto to psychology and personal finance.
          </p>
        </div>
      </section>

      {/* GRID */}
      <section className="container-page py-16">
        {instructors.length === 0 ? (
          <div className="mx-auto max-w-lg rounded-3xl border border-dashed border-navy-200 p-12 text-center dark:border-navy-700">
            <span className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-50 text-sky-dark dark:bg-navy-800">
              <GraduationCap className="h-7 w-7" />
            </span>
            <h2 className="font-display text-xl font-bold text-navy-900 dark:text-white">
              Instructor profiles coming soon
            </h2>
            <p className="mt-2 text-navy-500 dark:text-slate-400">
              We&apos;re onboarding our expert instructors. In the meantime, explore our courses to
              start learning today.
            </p>
            <Link href="/courses" className="btn-primary btn-md mt-6">
              Browse courses <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {instructors.map((ins) => (
              <div key={ins.id} className="card card-hover flex flex-col p-6 text-center">
                <div className="mx-auto">
                  <Avatar name={ins.name} src={ins.image} size={88} />
                </div>
                <h3 className="mt-4 font-display text-lg font-bold text-navy-900 dark:text-white">
                  {ins.name}
                </h3>
                {ins.headline && (
                  <p className="mt-1 text-sm font-medium text-sky-dark">{ins.headline}</p>
                )}
                {ins.bio && (
                  <p className="mt-3 line-clamp-3 text-sm text-navy-500 dark:text-slate-400">
                    {ins.bio}
                  </p>
                )}
                <div className="mt-5 flex items-center justify-center gap-4 border-t border-navy-100 pt-4 text-xs text-navy-500 dark:border-navy-800 dark:text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="h-4 w-4 text-gold-500" />
                    {ins._count.coursesTeaching}{" "}
                    {ins._count.coursesTeaching === 1 ? "course" : "courses"}
                  </span>
                  {ins.country && (
                    <span className="flex items-center gap-1.5">
                      <Users className="h-4 w-4 text-gold-500" /> {ins.country}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* BECOME AN INSTRUCTOR CTA */}
      <section className="container-page pb-20">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-navy-800 to-navy-900 px-6 py-14 text-center text-white sm:px-12">
          <span className="eyebrow !text-gold-300">Share your expertise</span>
          <h2 className="mt-2 font-display text-3xl font-black sm:text-4xl">
            Want to teach on eLearners Academy?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-300">
            Join our team of expert instructors and help learners across Kenya master skills that
            pay for a lifetime.
          </p>
          <Link href="/teach" className="btn-primary btn-lg mt-8">
            Become an instructor <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </>
  );
}
