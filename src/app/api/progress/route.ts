import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { recomputeProgress } from "@/lib/queries";
import { addPoints, awardBadge, touchStreak } from "@/lib/gamification";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { lessonId, completed, positionSec } = await req.json();
  if (!lessonId) return NextResponse.json({ error: "Missing lessonId" }, { status: 400 });

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { section: { select: { courseId: true } } },
  });
  if (!lesson) return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
  const courseId = lesson.section.courseId;

  const prev = await prisma.lessonProgress.findUnique({
    where: { userId_lessonId: { userId: user.id, lessonId } },
  });
  const wasCompleted = prev?.completed ?? false;

  await prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId: user.id, lessonId } },
    create: {
      userId: user.id,
      lessonId,
      completed: !!completed,
      positionSec: positionSec ?? 0,
    },
    update: {
      completed: completed ?? prev?.completed ?? false,
      positionSec: positionSec ?? prev?.positionSec ?? 0,
    },
  });

  await prisma.enrollment.updateMany({
    where: { userId: user.id, courseId },
    data: { lastLessonId: lessonId },
  });

  let progress = null;
  if (completed && !wasCompleted) {
    await addPoints(user.id, 20, "Completed a lesson");
    await awardBadge(user.id, "first-lesson");
    await touchStreak(user.id);
    progress = await recomputeProgress(user.id, courseId);
    if (progress.pct >= 100) {
      await awardBadge(user.id, "course-complete");
      await addPoints(user.id, 300, "Completed a course");
    }
  }

  return NextResponse.json({ ok: true, progress });
}
