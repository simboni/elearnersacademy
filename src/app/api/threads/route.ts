import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { addPoints } from "@/lib/gamification";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { courseId, title, body } = await req.json();
  if (!courseId || !title?.trim() || !body?.trim())
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  const thread = await prisma.thread.create({
    data: { courseId, userId: user.id, title: title.trim(), body: body.trim() },
  });
  await addPoints(user.id, 10, "Started a discussion");
  return NextResponse.json({ ok: true, threadId: thread.id });
}
