import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { code } = await req.json();
  if (!code) return NextResponse.json({ error: "Enter a coupon code" }, { status: 400 });

  const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
  if (!coupon || !coupon.active)
    return NextResponse.json({ error: "Invalid or expired coupon" }, { status: 404 });
  if (coupon.expiresAt && coupon.expiresAt < new Date())
    return NextResponse.json({ error: "This coupon has expired" }, { status: 410 });
  if (coupon.maxRedemptions && coupon.timesUsed >= coupon.maxRedemptions)
    return NextResponse.json({ error: "This coupon has reached its limit" }, { status: 410 });

  return NextResponse.json({
    ok: true,
    coupon: {
      code: coupon.code,
      percentOff: coupon.percentOff,
      amountOff: coupon.amountOff,
      description: coupon.description,
    },
  });
}
