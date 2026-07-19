import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { paymentsEnabled, createIntasendCheckout, fulfillOrder } from "@/lib/payments";

/**
 * Checkout.
 * - Builds a PENDING order from the cart, applying an optional coupon.
 * - If IntaSend keys are configured, returns a hosted-checkout redirect URL;
 *   the order is fulfilled by the /api/webhooks/intasend webhook.
 * - Otherwise (or when the total is 0), fulfils immediately in simulated mode.
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

  // Drop courses the user already owns.
  const already = await prisma.enrollment.findMany({
    where: { userId: user.id, courseId: { in: courseIds } },
    select: { courseId: true },
  });
  const alreadyIds = new Set(already.map((a) => a.courseId));
  const toBuy = courses.filter((c) => !alreadyIds.has(c.id));
  if (!toBuy.length) return NextResponse.json({ error: "You already own these courses" }, { status: 400 });

  const subtotal = toBuy.reduce((s, c) => s + (c.discountPrice ?? c.price), 0);
  let discount = 0;
  let appliedCoupon: string | undefined;

  if (couponCode) {
    const coupon = await prisma.coupon.findUnique({ where: { code: couponCode.toUpperCase() } });
    if (coupon && coupon.active) {
      if (coupon.percentOff) discount = Math.round((subtotal * coupon.percentOff) / 100);
      else if (coupon.amountOff) discount = Math.min(coupon.amountOff, subtotal);
      appliedCoupon = coupon.code;
      await prisma.coupon.update({ where: { id: coupon.id }, data: { timesUsed: { increment: 1 } } });
    }
  }

  const total = Math.max(0, subtotal - discount);
  const currency = toBuy[0]?.currency ?? "KES";

  const order = await prisma.order.create({
    data: {
      userId: user.id,
      total,
      currency,
      status: "PENDING",
      method: "intasend",
      reference: `ELA-${Date.now().toString(36).toUpperCase()}`,
      couponCode: appliedCoupon,
      items: { create: toBuy.map((c) => ({ courseId: c.id, price: c.discountPrice ?? c.price })) },
    },
  });

  // Free (or fully-discounted) orders need no payment.
  if (total === 0) {
    await fulfillOrder(order.id);
    return NextResponse.json({ ok: true, reference: order.reference, total, simulated: true });
  }

  // Real payment path.
  if (paymentsEnabled()) {
    try {
      const origin = process.env.NEXTAUTH_URL || new URL(req.url).origin;
      const [firstName, ...rest] = user.name.split(" ");
      const { url, invoiceId } = await createIntasendCheckout({
        amount: total,
        currency,
        email: user.email,
        firstName: firstName || user.name,
        lastName: rest.join(" "),
        apiRef: order.id,
        redirectUrl: `${origin}/checkout/success?ref=${order.reference}`,
      });
      if (invoiceId) {
        await prisma.order.update({ where: { id: order.id }, data: { reference: invoiceId } });
      }
      return NextResponse.json({ ok: true, redirectUrl: url });
    } catch (e) {
      console.error(e);
      return NextResponse.json({ error: "Could not start payment. Please try again." }, { status: 502 });
    }
  }

  // Simulated fallback (no payment keys configured).
  await fulfillOrder(order.id);
  return NextResponse.json({ ok: true, reference: order.reference, total, simulated: true });
}
