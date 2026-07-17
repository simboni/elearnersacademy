import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Pin,
  CheckCircle2,
  BookOpen,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { cn, relativeTime } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { ReplyForm } from "@/components/community/reply-form";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const thread = await prisma.thread.findUnique({
    where: { id },
    select: { title: true },
  });
  return {
    title: thread ? thread.title : "Discussion",
    description: thread
      ? `${thread.title} — eLearners Academy community discussion.`
      : "eLearners Academy community discussion.",
  };
}

function isStaff(role: string) {
  return role === "INSTRUCTOR" || role === "ADMIN";
}

export default async function ThreadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [user, thread] = await Promise.all([
    getCurrentUser(),
    prisma.thread.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, image: true, role: true } },
        course: { select: { title: true, slug: true } },
        posts: {
          orderBy: { createdAt: "asc" },
          include: { user: { select: { name: true, image: true, role: true } } },
        },
      },
    }),
  ]);

  if (!thread) notFound();

  const replyCount = thread.posts.length;

  return (
    <div className="bg-navy-50/40 dark:bg-navy-950">
      <div className="container-page max-w-4xl py-10">
        <Link
          href="/community"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-500 hover:text-sky dark:text-slate-400"
        >
          <ArrowLeft className="h-4 w-4" /> Back to community
        </Link>

        {/* ---------- QUESTION ---------- */}
        <article className="card mt-4 p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            {thread.pinned && (
              <span className="badge-gold inline-flex items-center gap-1">
                <Pin className="h-3 w-3" /> Pinned
              </span>
            )}
            {thread.resolved && (
              <span className="badge-green inline-flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Resolved
              </span>
            )}
            <Link
              href={`/community?course=${thread.course.slug}`}
              className="badge-sky inline-flex items-center gap-1 hover:opacity-80"
            >
              <BookOpen className="h-3 w-3" /> {thread.course.title}
            </Link>
          </div>

          <h1 className="mt-3 font-display text-2xl font-black leading-tight text-navy-900 dark:text-white sm:text-3xl">
            {thread.title}
          </h1>

          <div className="mt-4 flex items-center gap-3">
            <Avatar name={thread.user.name} src={thread.user.image} size={44} />
            <div>
              <div className="text-sm font-semibold text-navy-900 dark:text-white">
                {thread.user.name}
                {isStaff(thread.user.role) && (
                  <span className="ml-1.5 text-sky">· Instructor</span>
                )}
              </div>
              <div className="text-xs text-navy-500 dark:text-slate-400">
                Asked {relativeTime(thread.createdAt)}
              </div>
            </div>
          </div>

          <div className="prose-content mt-5 whitespace-pre-wrap text-navy-700 dark:text-slate-200">
            {thread.body}
          </div>
        </article>

        {/* ---------- ANSWERS ---------- */}
        <div className="mt-8">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold text-navy-900 dark:text-white">
            <MessageSquare className="h-5 w-5 text-sky" />
            {replyCount} {replyCount === 1 ? "Reply" : "Replies"}
          </h2>

          {replyCount === 0 ? (
            <div className="card mt-4 p-8 text-center text-navy-500 dark:text-slate-400">
              No replies yet. Be the first to help out!
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              {thread.posts.map((post) => (
                <article
                  key={post.id}
                  className={cn(
                    "card p-5 sm:p-6",
                    post.isAnswer &&
                      "border-l-4 !border-l-emerald-500 bg-emerald-500/[0.04] dark:bg-emerald-500/[0.08]"
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={post.user.name} src={post.user.image} size={40} />
                      <div>
                        <div className="text-sm font-semibold text-navy-900 dark:text-white">
                          {post.user.name}
                          {isStaff(post.user.role) && (
                            <span className="ml-1.5 text-sky">· Instructor</span>
                          )}
                        </div>
                        <div className="text-xs text-navy-500 dark:text-slate-400">
                          {relativeTime(post.createdAt)}
                        </div>
                      </div>
                    </div>
                    {post.isAnswer && (
                      <span className="badge-green inline-flex shrink-0 items-center gap-1">
                        <ShieldCheck className="h-3.5 w-3.5" /> Instructor Answer ✓
                      </span>
                    )}
                  </div>
                  <div className="prose-content mt-4 whitespace-pre-wrap text-navy-700 dark:text-slate-200">
                    {post.body}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {/* ---------- REPLY FORM ---------- */}
        <div className="mt-8">
          <ReplyForm threadId={thread.id} isLoggedIn={!!user} />
        </div>
      </div>
    </div>
  );
}
