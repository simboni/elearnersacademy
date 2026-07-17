import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { redirect, notFound } from "next/navigation";
import { safeJson } from "@/lib/utils";
import { CourseBuilder } from "@/components/builder/course-builder";

export const dynamic = "force-dynamic";
export const metadata = { title: "Edit Course" };

export default async function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user || (user.role !== "INSTRUCTOR" && user.role !== "ADMIN")) redirect("/dashboard");

  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      sections: {
        orderBy: { order: "asc" },
        include: { lessons: { orderBy: { order: "asc" } } },
      },
    },
  });
  if (!course) notFound();
  if (course.instructorId !== user.id && user.role !== "ADMIN") redirect("/instructor/courses");

  const categories = await prisma.category.findMany({ select: { id: true, name: true } });

  return (
    <div className="py-8">
      <CourseBuilder
        categories={categories}
        course={{
          id: course.id,
          title: course.title,
          slug: course.slug,
          subtitle: course.subtitle ?? "",
          description: course.description,
          categoryId: course.categoryId ?? "",
          level: course.level,
          price: course.price,
          discountPrice: course.discountPrice,
          image: course.image ?? "",
          durationLabel: course.durationLabel ?? "",
          status: course.status,
          outcomes: safeJson<string[]>(course.outcomes, []),
          sections: course.sections.map((s) => ({
            id: s.id,
            title: s.title,
            lessons: s.lessons.map((l) => ({
              id: l.id,
              title: l.title,
              type: l.type,
              durationSec: l.durationSec,
              isPreview: l.isPreview,
            })),
          })),
        }}
      />
    </div>
  );
}
