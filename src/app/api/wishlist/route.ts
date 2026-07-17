import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { courseId } = await req.json();
  if (!courseId) return NextResponse.json({ error: "Missing courseId" }, { status: 400 });

  const existing = await prisma.wishlistItem.findUnique({
    where: { userId_courseId: { userId: user.id, courseId } },
  });
  if (existing) {
    await prisma.wishlistItem.delete({ where: { id: existing.id } });
    return NextResponse.json({ ok: true, wishlisted: false });
  }
  await prisma.wishlistItem.create({ data: { userId: user.id, courseId } });
  return NextResponse.json({ ok: true, wishlisted: true });
}
