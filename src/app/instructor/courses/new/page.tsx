import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { NewCourseForm } from "@/components/builder/new-course-form";

export const dynamic = "force-dynamic";
export const metadata = { title: "Create Course" };

export default async function NewCoursePage() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "INSTRUCTOR" && user.role !== "ADMIN")) redirect("/dashboard");
  const categories = await prisma.category.findMany({ select: { id: true, name: true } });

  return (
    <div className="py-8">
      <div className="mb-6">
        <p className="eyebrow">Instructor Studio</p>
        <h1 className="section-title">Create a new course</h1>
        <p className="mt-2 text-navy-500 dark:text-slate-400">
          Start with the basics — you'll add sections and lessons next.
        </p>
      </div>
      <NewCourseForm categories={categories} />
    </div>
  );
}
