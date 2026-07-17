import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { awardBadge, addPoints } from "@/lib/gamification";

const schema = z.object({
  name: z.string().min(2, "Name is too short"),
  email: z.string().email(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["STUDENT", "INSTRUCTOR"]).optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }
    const { name, email, password, role } = parsed.data;
    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        passwordHash,
        role: role === "INSTRUCTOR" ? "INSTRUCTOR" : "STUDENT",
        streak: { create: {} },
      },
    });

    await addPoints(user.id, 50, "Welcome to eLearners Academy");
    await awardBadge(user.id, "welcome");
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: "success",
        title: "Welcome to eLearners Academy! 🎉",
        body: "Your learning journey begins now. Explore courses and earn your first certificate.",
        link: "/courses",
      },
    });

    return NextResponse.json({ ok: true, userId: user.id });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
