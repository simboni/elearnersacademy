import Link from "next/link";
import { format } from "date-fns";
import {
  Sparkles,
  Video,
  Clock,
  Users,
  CalendarDays,
  ExternalLink,
  Radio,
  BookOpen,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { Avatar } from "@/components/ui/avatar";
import { RegisterButton } from "@/components/live/register-button";

export const metadata = { title: "Live Sessions — eLearners Academy" };
export const dynamic = "force-dynamic";

export default async function LivePage() {
  const now = new Date();
  const user = await getCurrentUser();

  const [upcoming, past, myRegs] = await Promise.all([
    prisma.liveSession.findMany({
      where: { startAt: { gte: now } },
      orderBy: { startAt: "asc" },
      include: {
        course: { select: { title: true, slug: true } },
        _count: { select: { registrations: true } },
      },
    }),
    prisma.liveSession.findMany({
      where: { startAt: { lt: now } },
      orderBy: { startAt: "desc" },
      take: 6,
      include: {
        course: { select: { title: true, slug: true } },
        _count: { select: { registrations: true } },
      },
    }),
    user
      ? prisma.liveRegistration.findMany({
          where: { userId: user.id },
          select: { sessionId: true },
        })
      : Promise.resolve([]),
  ]);

  const registeredIds = new Set(myRegs.map((r) => r.sessionId));

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-navy-900 text-white">
        <div className="absolute inset-0 bg-hero-grid" />
        <div className="absolute -right-40 top-0 h-96 w-96 rounded-full bg-sky/20 blur-3xl" />
        <div className="absolute -left-40 bottom-0 h-96 w-96 rounded-full bg-gold-400/10 blur-3xl" />
        <div className="container-page relative py-20 text-center lg:py-24">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold-400/30 bg-gold-400/10 px-4 py-1.5 text-sm font-semibold text-gold-300">
            <Radio className="h-4 w-4" /> Live &amp; interactive
          </span>
          <h1 className="mt-6 font-display text-4xl font-black leading-[1.1] sm:text-5xl lg:text-6xl">
            Live <span className="text-gradient-gold">trading sessions</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-300">
            Trade the market in real time with your coach. Join live trade-alongs, webinars, and Q&amp;As —
            register free and we&apos;ll remind you before we go live.
          </p>
        </div>
      </section>

      {/* UPCOMING */}
      <section className="container-page py-16">
        <div className="mb-8 flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky/15 to-gold-400/15 text-sky-dark">
            <CalendarDays className="h-5 w-5" />
          </span>
          <div>
            <h2 className="section-title !text-2xl">Upcoming sessions</h2>
            <p className="text-sm text-navy-400">
              {upcoming.length} {upcoming.length === 1 ? "session" : "sessions"} scheduled
            </p>
          </div>
        </div>

        {upcoming.length === 0 ? (
          <div className="mx-auto max-w-lg rounded-3xl border border-dashed border-navy-200 p-12 text-center dark:border-navy-700">
            <span className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-50 text-sky-dark dark:bg-navy-800">
              <Video className="h-7 w-7" />
            </span>
            <h3 className="font-display text-xl font-bold text-navy-900 dark:text-white">
              No live sessions scheduled yet
            </h3>
            <p className="mt-2 text-navy-500 dark:text-slate-400">
              New sessions are added regularly. Explore our courses in the meantime, or check back
              soon.
            </p>
            <Link href="/courses" className="btn-primary btn-md mt-6">
              Browse courses
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((s) => {
              const isRegistered = registeredIds.has(s.id);
              const host = s.hostName ?? "eLearners Academy";
              return (
                <div key={s.id} className="card flex flex-col p-6">
                  <div className="flex items-center justify-between">
                    <span className="badge-sky inline-flex items-center gap-1">
                      <Sparkles className="h-3 w-3" /> Upcoming
                    </span>
                    <span className="flex items-center gap-1 text-xs text-navy-400">
                      <Users className="h-3.5 w-3.5" /> {s._count.registrations} registered
                    </span>
                  </div>

                  <h3 className="mt-4 font-display text-lg font-bold leading-snug text-navy-900 dark:text-white">
                    {s.title}
                  </h3>
                  {s.description && (
                    <p className="mt-2 line-clamp-2 text-sm text-navy-500 dark:text-slate-400">
                      {s.description}
                    </p>
                  )}

                  {s.course && (
                    <Link
                      href={`/courses/${s.course.slug}`}
                      className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-sky-dark hover:underline"
                    >
                      <BookOpen className="h-3.5 w-3.5" /> {s.course.title}
                    </Link>
                  )}

                  <div className="mt-4 space-y-2 border-t border-navy-100 pt-4 text-sm dark:border-navy-800">
                    <p className="flex items-center gap-2 font-semibold text-navy-800 dark:text-slate-200">
                      <CalendarDays className="h-4 w-4 text-gold-500" />
                      {format(new Date(s.startAt), "EEE, MMM d · h:mm a")}
                    </p>
                    <p className="flex items-center gap-2 text-navy-500 dark:text-slate-400">
                      <Clock className="h-4 w-4 text-gold-500" /> {s.durationMin} minutes
                    </p>
                    <div className="flex items-center gap-2 text-navy-500 dark:text-slate-400">
                      <Avatar name={host} size={24} />
                      <span>Hosted by {host}</span>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-col gap-2">
                    <RegisterButton sessionId={s.id} initial={isRegistered} />
                    {isRegistered && s.joinUrl && (
                      <a
                        href={s.joinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-navy btn-md w-full"
                      >
                        <Video className="h-4 w-4" /> Join session
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* PAST */}
      {past.length > 0 && (
        <section className="bg-navy-50 py-16 dark:bg-navy-900/40">
          <div className="container-page">
            <div className="mb-8 flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-navy-100 text-navy-500 dark:bg-navy-800">
                <Radio className="h-5 w-5" />
              </span>
              <div>
                <h2 className="section-title !text-2xl">Past sessions</h2>
                <p className="text-sm text-navy-400">Recently completed live sessions</p>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {past.map((s) => (
                <div
                  key={s.id}
                  className="rounded-2xl border border-navy-100 bg-white p-5 opacity-90 dark:border-navy-800 dark:bg-navy-900"
                >
                  <div className="flex items-center justify-between">
                    <span className="badge-navy">Ended</span>
                    <span className="flex items-center gap-1 text-xs text-navy-400">
                      <Users className="h-3.5 w-3.5" /> {s._count.registrations}
                    </span>
                  </div>
                  <h3 className="mt-3 font-display font-bold text-navy-700 dark:text-slate-200">
                    {s.title}
                  </h3>
                  <p className="mt-2 flex items-center gap-2 text-xs text-navy-400">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {format(new Date(s.startAt), "EEE, MMM d · h:mm a")}
                  </p>
                  {s.course && (
                    <p className="mt-1 text-xs text-navy-400">{s.course.title}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="container-page py-20">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-navy-800 to-navy-900 px-6 py-14 text-center text-white sm:px-12">
          <span className="eyebrow !text-gold-300">Never miss a session</span>
          <h2 className="mt-2 font-display text-3xl font-black sm:text-4xl">
            Create a free account
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-300">
            Register for live sessions and get reminders, plus access to courses, the AI tutor, and
            our community.
          </p>
          <Link href="/register" className="btn-primary btn-lg mt-8">
            Get started free
          </Link>
        </div>
      </section>
    </>
  );
}
