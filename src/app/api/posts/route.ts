import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { addPoints, awardBadge } from "@/lib/gamification";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { threadId, body } = await req.json();
  if (!threadId || !body?.trim())
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  const thread = await prisma.thread.findUnique({ where: { id: threadId } });
  if (!thread) return NextResponse.json({ error: "Thread not found" }, { status: 404 });

  const isInstructorAnswer = user.role === "INSTRUCTOR" || user.role === "ADMIN";
  const post = await prisma.post.create({
    data: { threadId, userId: user.id, body: body.trim(), isAnswer: isInstructorAnswer },
  });
  await addPoints(user.id, 10, "Replied in the community");
  await awardBadge(user.id, "helper");

  // notify thread author
  if (thread.userId !== user.id) {
    await prisma.notification.create({
      data: {
        userId: thread.userId,
        type: "info",
        title: "New reply to your question",
        body: `${user.name} replied to "${thread.title}"`,
        link: `/community/${threadId}`,
      },
    });
  }
  return NextResponse.json({ ok: true, postId: post.id });
}
