import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { safeJson } from "@/lib/utils";
import { LearnPlayer } from "@/components/learn/learn-player";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = await prisma.course.findUnique({ where: { slug }, select: { title: true } });
  return { title: course ? `Learn · ${course.title}` : "Learn" };
}

export default async function LearnPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/login?callbackUrl=/learn/${slug}`);

  const course = await prisma.course.findUnique({
    where: { slug },
    include: {
      instructor: { select: { id: true, name: true, image: true } },
      sections: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
            orderBy: { order: "asc" },
            include: {
              quiz: { include: { questions: { orderBy: { order: "asc" } } } },
            },
          },
        },
      },
      announcements: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!course) notFound();

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: user.id, courseId: course.id } },
  });
  const isOwner = course.instructorId === user.id || user.role === "ADMIN";
  if (!enrollment && !isOwner) redirect(`/courses/${slug}`);

  const [progress, notes, threads] = await Promise.all([
    prisma.lessonProgress.findMany({
      where: { userId: user.id, lesson: { section: { courseId: course.id } } },
    }),
    prisma.note.findMany({
      where: { userId: user.id, lesson: { section: { courseId: course.id } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.thread.findMany({
      where: { courseId: course.id },
      include: {
        user: { select: { name: true, image: true } },
        _count: { select: { posts: true } },
      },
      orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
      take: 20,
    }),
  ]);

  const completedIds = new Set(progress.filter((p) => p.completed).map((p) => p.lessonId));

  // Shape data for the client (strip heavy correct-answer flags from quiz for security-ish; keep for grading via API)
  const sections = course.sections.map((s) => ({
    id: s.id,
    title: s.title,
    lessons: s.lessons.map((l) => ({
      id: l.id,
      title: l.title,
      type: l.type,
      durationSec: l.durationSec,
      contentUrl: l.contentUrl,
      content: l.content,
      completed: completedIds.has(l.id),
      quiz: l.quiz
        ? {
            id: l.quiz.id,
            title: l.quiz.title,
            passingScore: l.quiz.passingScore,
            questions: l.quiz.questions.map((q) => ({
              id: q.id,
              type: q.type,
              prompt: q.prompt,
              options: safeJson<{ id: string; text: string; correct: boolean }[]>(q.options, []).map((o) => ({
                id: o.id,
                text: o.text,
              })),
            })),
          }
        : null,
    })),
  }));

  const allLessons = sections.flatMap((s) => s.lessons);
  const startLessonId =
    enrollment?.lastLessonId && allLessons.find((l) => l.id === enrollment.lastLessonId)
      ? enrollment.lastLessonId
      : allLessons.find((l) => !l.completed)?.id ?? allLessons[0]?.id;

  return (
    <LearnPlayer
      course={{
        id: course.id,
        title: course.title,
        slug: course.slug,
        instructor: course.instructor,
        announcements: course.announcements.map((a) => ({
          id: a.id,
          title: a.title,
          body: a.body,
          createdAt: a.createdAt.toISOString(),
        })),
      }}
      sections={sections}
      startLessonId={startLessonId}
      initialNotes={notes.map((n) => ({
        id: n.id,
        lessonId: n.lessonId,
        body: n.body,
        createdAt: n.createdAt.toISOString(),
      }))}
      threads={threads.map((t) => ({
        id: t.id,
        title: t.title,
        body: t.body,
        pinned: t.pinned,
        resolved: t.resolved,
        author: t.user.name,
        authorImage: t.user.image,
        replies: t._count.posts,
        createdAt: t.createdAt.toISOString(),
      }))}
      initialProgress={enrollment?.progressPct ?? 0}
    />
  );
}
