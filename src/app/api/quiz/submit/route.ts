import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { safeJson } from "@/lib/utils";
import { addPoints, awardBadge, touchStreak } from "@/lib/gamification";

type Opt = { id: string; text: string; correct: boolean };

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { quizId, answers } = await req.json() as {
    quizId: string;
    answers: Record<string, string[]>;
  };

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: { questions: { orderBy: { order: "asc" } }, lesson: { include: { section: true } } },
  });
  if (!quiz) return NextResponse.json({ error: "Quiz not found" }, { status: 404 });

  let earned = 0;
  let totalPoints = 0;
  const perQuestion: Record<string, { correct: boolean; correctIds: string[] }> = {};

  for (const q of quiz.questions) {
    totalPoints += q.points;
    const opts = safeJson<Opt[]>(q.options, []);
    const correctIds = opts.filter((o) => o.correct).map((o) => o.id).sort();
    const given = (answers[q.id] ?? []).slice().sort();
    const isCorrect =
      correctIds.length === given.length && correctIds.every((id, i) => id === given[i]);
    if (isCorrect) earned += q.points;
    perQuestion[q.id] = { correct: isCorrect, correctIds };
  }

  const score = totalPoints > 0 ? Math.round((earned / totalPoints) * 100) : 0;
  const passed = score >= quiz.passingScore;

  await prisma.quizAttempt.create({
    data: {
      quizId,
      userId: user.id,
      score,
      passed,
      answers: JSON.stringify(answers),
    },
  });

  if (passed) {
    await addPoints(user.id, 40, `Passed quiz: ${quiz.title}`);
    await touchStreak(user.id);
    // mark the quiz lesson complete
    await prisma.lessonProgress.upsert({
      where: { userId_lessonId: { userId: user.id, lessonId: quiz.lessonId } },
      create: { userId: user.id, lessonId: quiz.lessonId, completed: true },
      update: { completed: true },
    });
  }
  if (score === 100) await awardBadge(user.id, "quiz-ace");

  return NextResponse.json({ ok: true, score, passed, passingScore: quiz.passingScore, perQuestion });
}
