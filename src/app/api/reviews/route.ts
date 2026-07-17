import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { addPoints, awardBadge } from "@/lib/gamification";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { courseId, rating, comment } = await req.json();
  if (!courseId || !rating) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const enrolled = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: user.id, courseId } },
  });
  if (!enrolled)
    return NextResponse.json({ error: "You can only review courses you're enrolled in" }, { status: 403 });

  const review = await prisma.review.upsert({
    where: { userId_courseId: { userId: user.id, courseId } },
    create: { userId: user.id, courseId, rating: Number(rating), comment },
    update: { rating: Number(rating), comment },
  });

  await addPoints(user.id, 15, "Left a course review");
  await awardBadge(user.id, "reviewer");

  return NextResponse.json({ ok: true, review });
}
