import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { slugify } from "@/lib/utils";

function canManage(role: string) {
  return role === "INSTRUCTOR" || role === "ADMIN";
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || !canManage(user.role))
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });

  const body = await req.json();
  const { title, subtitle, description, categoryId, level, price, discountPrice, image, durationLabel, outcomes, requirements } = body;
  if (!title?.trim()) return NextResponse.json({ error: "Title is required" }, { status: 400 });

  let slug = slugify(title);
  const exists = await prisma.course.findUnique({ where: { slug } });
  if (exists) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;

  const course = await prisma.course.create({
    data: {
      title: title.trim(),
      slug,
      subtitle: subtitle ?? "",
      description: description ?? "",
      categoryId: categoryId || null,
      level: level ?? "Beginner",
      price: Number(price) || 0,
      discountPrice: discountPrice ? Number(discountPrice) : null,
      image: image || null,
      durationLabel: durationLabel || null,
      status: "DRAFT",
      instructorId: user.id,
      outcomes: outcomes ? JSON.stringify(outcomes) : null,
      requirements: requirements ? JSON.stringify(requirements) : null,
    },
  });
  return NextResponse.json({ ok: true, courseId: course.id, slug: course.slug });
}

export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user || !canManage(user.role))
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });

  const body = await req.json();
  const { id, ...fields } = body;
  const course = await prisma.course.findUnique({ where: { id } });
  if (!course) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (course.instructorId !== user.id && user.role !== "ADMIN")
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });

  const data: Record<string, unknown> = {};
  for (const key of ["title", "subtitle", "description", "categoryId", "level", "durationLabel", "image", "status", "promoVideoUrl"]) {
    if (fields[key] !== undefined) data[key] = fields[key] || null;
  }
  if (fields.price !== undefined) data.price = Number(fields.price) || 0;
  if (fields.discountPrice !== undefined) data.discountPrice = fields.discountPrice ? Number(fields.discountPrice) : null;
  if (fields.outcomes !== undefined) data.outcomes = JSON.stringify(fields.outcomes);
  if (fields.requirements !== undefined) data.requirements = JSON.stringify(fields.requirements);

  await prisma.course.update({ where: { id }, data });
  return NextResponse.json({ ok: true });
}
