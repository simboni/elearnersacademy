import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { lessonId, body, timestampSec } = await req.json();
  if (!lessonId || !body?.trim())
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  const note = await prisma.note.create({
    data: { userId: user.id, lessonId, body: body.trim(), timestampSec: timestampSec ?? 0 },
  });
  return NextResponse.json({ ok: true, note });
}

export async function DELETE(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await req.json();
  await prisma.note.deleteMany({ where: { id, userId: user.id } });
  return NextResponse.json({ ok: true });
}
