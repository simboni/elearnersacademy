import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { addPoints, awardBadge, touchStreak } from "@/lib/gamification";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please log in to enroll" }, { status: 401 });

  const { courseId } = await req.json();
  if (!courseId) return NextResponse.json({ error: "Missing courseId" }, { status: 400 });

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });

  const existing = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: user.id, courseId } },
  });
  if (existing) return NextResponse.json({ ok: true, alreadyEnrolled: true });

  // Free courses enroll directly; paid must go through checkout
  const effectivePrice = course.discountPrice ?? course.price;
  if (effectivePrice > 0) {
    return NextResponse.json(
      { error: "This is a paid course. Please complete checkout.", requiresPayment: true },
      { status: 402 }
    );
  }

  await prisma.enrollment.create({ data: { userId: user.id, courseId } });
  await addPoints(user.id, 50, `Enrolled in ${course.title}`);
  await awardBadge(user.id, "first-course");
  await touchStreak(user.id);
  await prisma.notification.create({
    data: {
      userId: user.id,
      type: "success",
      title: `Enrolled in ${course.title}`,
      body: "Jump in and start your first lesson.",
      link: `/learn/${course.slug}`,
    },
  });

  return NextResponse.json({ ok: true });
}
