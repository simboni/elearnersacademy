import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please log in to register" }, { status: 401 });
  const { sessionId } = await req.json();
  if (!sessionId) return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });

  const existing = await prisma.liveRegistration.findUnique({
    where: { sessionId_userId: { sessionId, userId: user.id } },
  });
  if (existing) {
    await prisma.liveRegistration.delete({ where: { id: existing.id } });
    return NextResponse.json({ ok: true, registered: false });
  }
  await prisma.liveRegistration.create({ data: { sessionId, userId: user.id } });
  const session = await prisma.liveSession.findUnique({ where: { id: sessionId } });
  await prisma.notification.create({
    data: {
      userId: user.id,
      type: "event",
      title: "You're registered! 🎥",
      body: `We'll remind you before "${session?.title}" begins.`,
      link: "/live",
    },
  });
  return NextResponse.json({ ok: true, registered: true });
}
