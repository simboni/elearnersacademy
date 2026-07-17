import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const staticRoutes = [
    "", "/courses", "/about", "/contact", "/pricing", "/instructors",
    "/paths", "/live", "/community", "/teach", "/verify", "/terms", "/privacy",
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  let courseRoutes: MetadataRoute.Sitemap = [];
  try {
    const courses = await prisma.course.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true },
    });
    courseRoutes = courses.map((c) => ({
      url: `${base}/courses/${c.slug}`,
      lastModified: c.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch {
    // db not reachable at build time — return static routes only
  }

  return [...staticRoutes, ...courseRoutes];
}
