import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { addPoints, awardBadge, touchStreak } from "@/lib/gamification";

/**
 * Simulated checkout. In production, wire this to IntaSend / M-Pesa STK push:
 * create the order as PENDING, redirect to the payment page, then confirm via webhook.
 * Here we accept the cart, apply an optional coupon, create a PAID order and enroll.
 */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please log in to check out" }, { status: 401 });

  const { courseIds, couponCode } = (await req.json()) as {
    courseIds: string[];
    couponCode?: string;
  };
  if (!courseIds?.length) return NextResponse.json({ error: "Your cart is empty" }, { status: 400 });

  const courses = await prisma.course.findMany({ where: { id: { in: courseIds } } });
  if (!courses.length) return NextResponse.json({ error: "Courses not found" }, { status: 404 });

  // discard already-enrolled
  const already = await prisma.enrollment.findMany({
    where: { userId: user.id, courseId: { in: courseIds } },
    select: { courseId: true },
  });
  const alreadyIds = new Set(already.map((a) => a.courseId));
  const toBuy = courses.filter((c) => !alreadyIds.has(c.id));

  let subtotal = toBuy.reduce((s, c) => s + (c.discountPrice ?? c.price), 0);
  let discount = 0;
  let appliedCoupon: string | undefined;

  if (couponCode) {
    const coupon = await prisma.coupon.findUnique({ where: { code: couponCode.toUpperCase() } });
    if (coupon && coupon.active) {
      if (coupon.percentOff) discount = Math.round((subtotal * coupon.percentOff) / 100);
      else if (coupon.amountOff) discount = Math.min(coupon.amountOff, subtotal);
      appliedCoupon = coupon.code;
      await prisma.coupon.update({
        where: { id: coupon.id },
        data: { timesUsed: { increment: 1 } },
      });
    }
  }

  const total = Math.max(0, subtotal - discount);

  const order = await prisma.order.create({
    data: {
      userId: user.id,
      total,
      status: "PAID",
      method: "intasend",
      reference: `ELA-${Date.now().toString(36).toUpperCase()}`,
      couponCode: appliedCoupon,
      items: {
        create: toBuy.map((c) => ({ courseId: c.id, price: c.discountPrice ?? c.price })),
      },
    },
  });

  for (const c of toBuy) {
    await prisma.enrollment.upsert({
      where: { userId_courseId: { userId: user.id, courseId: c.id } },
      create: { userId: user.id, courseId: c.id },
      update: {},
    });
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: "success",
        title: `Purchase confirmed: ${c.title}`,
        body: "You now have lifetime access. Start learning!",
        link: `/learn/${c.slug}`,
      },
    });
  }
  await addPoints(user.id, 50, "Completed a purchase");
  await awardBadge(user.id, "first-course");
  await touchStreak(user.id);

  return NextResponse.json({ ok: true, orderId: order.id, reference: order.reference, total });
}
