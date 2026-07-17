import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

async function assertOwner(userId: string, role: string, courseId: string) {
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) return "not_found";
  if (course.instructorId !== userId && role !== "ADMIN") return "forbidden";
  return "ok";
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { courseId, title } = await req.json();
  const check = await assertOwner(user.id, user.role, courseId);
  if (check !== "ok") return NextResponse.json({ error: check }, { status: 403 });

  const count = await prisma.section.count({ where: { courseId } });
  const section = await prisma.section.create({
    data: { courseId, title: title?.trim() || "New Section", order: count },
  });
  return NextResponse.json({ ok: true, section });
}

export async function DELETE(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await req.json();
  const section = await prisma.section.findUnique({ where: { id } });
  if (!section) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const check = await assertOwner(user.id, user.role, section.courseId);
  if (check !== "ok") return NextResponse.json({ error: check }, { status: 403 });
  await prisma.section.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
