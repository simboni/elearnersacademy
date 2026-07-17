import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

async function ownerOfSection(userId: string, role: string, sectionId: string) {
  const section = await prisma.section.findUnique({
    where: { id: sectionId },
    include: { course: true },
  });
  if (!section) return { status: "not_found" as const };
  if (section.course.instructorId !== userId && role !== "ADMIN") return { status: "forbidden" as const };
  return { status: "ok" as const, section };
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { sectionId, title, type, durationSec, contentUrl, content, isPreview } = await req.json();
  const res = await ownerOfSection(user.id, user.role, sectionId);
  if (res.status !== "ok") return NextResponse.json({ error: res.status }, { status: 403 });

  const count = await prisma.lesson.count({ where: { sectionId } });
  const lesson = await prisma.lesson.create({
    data: {
      sectionId,
      title: title?.trim() || "New Lesson",
      type: type || "VIDEO",
      order: count,
      durationSec: Number(durationSec) || 300,
      contentUrl: contentUrl || null,
      content: content || null,
      isPreview: !!isPreview,
    },
  });
  return NextResponse.json({ ok: true, lesson });
}

export async function DELETE(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await req.json();
  const lesson = await prisma.lesson.findUnique({ where: { id }, include: { section: { include: { course: true } } } });
  if (!lesson) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (lesson.section.course.instructorId !== user.id && user.role !== "ADMIN")
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  await prisma.lesson.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
