import Link from "next/link";
import {
  MessageSquare,
  Pin,
  CheckCircle2,
  Users,
  MessagesSquare,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { cn, relativeTime } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { NewThreadForm } from "@/components/community/new-thread-form";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Community Q&A Forum",
  description:
    "Ask questions, share setups, and get answers from eLearners Academy instructors and fellow Kenyan traders.",
};

const FILTERS: { key: string; label: string }[] = [
  { key: "all", label: "All" },
  { key: "unanswered", label: "Unanswered" },
  { key: "resolved", label: "Resolved" },
];

function excerpt(text: string, len = 160) {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > len ? clean.slice(0, len).trimEnd() + "…" : clean;
}

export default async function CommunityPage({
  searchParams,
}: {
  searchParams: Promise<{ course?: string; filter?: string }>;
}) {
  const sp = await searchParams;
  const courseSlug = sp.course;
  const filter = FILTERS.some((f) => f.key === sp.filter) ? sp.filter! : "all";

  const where: Record<string, unknown> = {};
  if (courseSlug) where.course = { slug: courseSlug };
  if (filter === "unanswered") where.resolved = false;
  if (filter === "resolved") where.resolved = true;

  const [user, threads, totalThreads, answeredThreads, activeCourse, courses, instructors] =
    await Promise.all([
      getCurrentUser(),
      prisma.thread.findMany({
        where: { ...where },
        orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
        include: {
          user: { select: { name: true, image: true, role: true } },
          course: { select: { title: true, slug: true } },
          _count: { select: { posts: true } },
        },
        take: 50,
      }),
      prisma.thread.count(),
      prisma.thread.count({ where: { resolved: true } }),
      courseSlug
        ? prisma.course.findUnique({ where: { slug: courseSlug }, select: { title: true } })
        : Promise.resolve(null),
      prisma.course.findMany({
        where: { status: "PUBLISHED" },
        select: { id: true, title: true },
        orderBy: { title: "asc" },
      }),
      prisma.user.findMany({
        where: { role: "INSTRUCTOR" },
        select: { id: true, name: true, image: true, headline: true },
        take: 5,
      }),
    ]);

  return (
    <div className="bg-navy-50/40 dark:bg-navy-950">
      {/* ---------- HEADER ---------- */}
      <section className="border-b border-navy-100 bg-white dark:border-navy-800 dark:bg-navy-900">
        <div className="container-page py-12">
          <p className="eyebrow">
            <Sparkles className="mr-1.5 inline h-4 w-4" /> Community
          </p>
          <h1 className="section-title mt-2">
            {activeCourse ? (
              <>
                Discussions in{" "}
                <span className="text-gradient-gold">{activeCourse.title}</span>
              </>
            ) : (
              <>eLearners Q&amp;A Forum</>
            )}
          </h1>
          <p className="mt-3 max-w-2xl text-navy-600 dark:text-slate-300">
            Ask questions, share your trades, and learn together with instructors Peter Simboni,
            Grace Wanjiru, and the eLearners trading community.
          </p>
          {activeCourse && (
            <Link
              href="/community"
              className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-sky hover:underline"
            >
              ← View all discussions
            </Link>
          )}
        </div>
      </section>

      <div className="container-page grid gap-8 py-10 lg:grid-cols-[1fr_320px]">
        {/* ---------- THREAD LIST ---------- */}
        <div>
          {/* Filter tabs */}
          <div className="mb-6 flex flex-wrap items-center gap-2">
            {FILTERS.map((f) => {
              const params = new URLSearchParams();
              if (courseSlug) params.set("course", courseSlug);
              if (f.key !== "all") params.set("filter", f.key);
              const href = "/community" + (params.toString() ? `?${params}` : "");
              return (
                <Link
                  key={f.key}
                  href={href}
                  className={cn(
                    "rounded-full px-4 py-1.5 text-sm font-semibold transition",
                    filter === f.key
                      ? "bg-navy-900 text-white dark:bg-sky dark:text-navy-950"
                      : "bg-white text-navy-600 ring-1 ring-navy-200 hover:bg-navy-50 dark:bg-navy-800 dark:text-slate-300 dark:ring-navy-700"
                  )}
                >
                  {f.label}
                </Link>
              );
            })}
          </div>

          {threads.length === 0 ? (
            <div className="card flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-sky/10 text-sky">
                <MessagesSquare className="h-7 w-7" />
              </div>
              <h3 className="mt-4 font-display text-xl font-bold text-navy-900 dark:text-white">
                No discussions yet
              </h3>
              <p className="mt-2 max-w-sm text-navy-500 dark:text-slate-400">
                Be the first to start a conversation. Ask a question and an instructor or fellow
                trader will jump in.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {threads.map((t) => (
                <article
                  key={t.id}
                  className="card-hover group relative p-5 sm:p-6"
                >
                  <div className="flex items-start gap-4">
                    <Avatar name={t.user.name} src={t.user.image} size={44} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {t.pinned && (
                          <span className="badge-gold inline-flex items-center gap-1">
                            <Pin className="h-3 w-3" /> Pinned
                          </span>
                        )}
                        {t.resolved && (
                          <span className="badge-green inline-flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Resolved
                          </span>
                        )}
                      </div>
                      <h2 className="mt-1 font-display text-lg font-bold leading-snug text-navy-900 group-hover:text-sky dark:text-white">
                        <Link href={`/community/${t.id}`} className="after:absolute after:inset-0">
                          {t.title}
                        </Link>
                      </h2>
                      <p className="mt-1 text-sm text-navy-500 dark:text-slate-400">
                        {excerpt(t.body)}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-navy-500 dark:text-slate-400">
                        <span className="font-semibold text-navy-700 dark:text-slate-200">
                          {t.user.name}
                          {(t.user.role === "INSTRUCTOR" || t.user.role === "ADMIN") && (
                            <span className="ml-1 text-sky">· Instructor</span>
                          )}
                        </span>
                        <Link
                          href={`/community?course=${t.course.slug}`}
                          className="relative z-10 inline-flex items-center gap-1 rounded-full bg-navy-50 px-2 py-0.5 font-medium text-navy-600 hover:bg-navy-100 dark:bg-navy-800 dark:text-slate-300"
                        >
                          <BookOpen className="h-3 w-3" /> {t.course.title}
                        </Link>
                        <span className="inline-flex items-center gap-1">
                          <MessageSquare className="h-3.5 w-3.5" />
                          {t._count.posts} {t._count.posts === 1 ? "reply" : "replies"}
                        </span>
                        <span>{relativeTime(t.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {/* ---------- SIDEBAR ---------- */}
        <aside className="space-y-6">
          <NewThreadForm courses={courses} isLoggedIn={!!user} />

          {/* Stats */}
          <div className="card p-6">
            <h3 className="font-display text-sm font-bold uppercase tracking-wide text-navy-500 dark:text-slate-400">
              Community stats
            </h3>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-navy-50 p-4 text-center dark:bg-navy-800">
                <div className="font-display text-2xl font-black text-navy-900 dark:text-white">
                  {totalThreads}
                </div>
                <div className="mt-1 text-xs font-medium text-navy-500 dark:text-slate-400">
                  Discussions
                </div>
              </div>
              <div className="rounded-xl bg-emerald-500/10 p-4 text-center">
                <div className="font-display text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  {answeredThreads}
                </div>
                <div className="mt-1 text-xs font-medium text-navy-500 dark:text-slate-400">
                  Answered
                </div>
              </div>
            </div>
          </div>

          {/* Instructors */}
          {instructors.length > 0 && (
            <div className="card p-6">
              <h3 className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wide text-navy-500 dark:text-slate-400">
                <Users className="h-4 w-4" /> Meet the instructors
              </h3>
              <ul className="mt-4 space-y-4">
                {instructors.map((ins) => (
                  <li key={ins.id} className="flex items-center gap-3">
                    <Avatar name={ins.name} src={ins.image} size={40} />
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-navy-900 dark:text-white">
                        {ins.name}
                      </div>
                      <div className="truncate text-xs text-navy-500 dark:text-slate-400">
                        {ins.headline ?? "eLearners Instructor"}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
