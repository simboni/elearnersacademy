import { redirect } from "next/navigation";
import { Navbar } from "@/components/site/navbar";
import { getCurrentUser } from "@/lib/session";
import { InstructorSidebar } from "@/components/instructor/sidebar";

export const dynamic = "force-dynamic";

export default async function InstructorLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "INSTRUCTOR" && user.role !== "ADMIN")) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col bg-navy-50/40 dark:bg-navy-950">
      <Navbar />
      <main className="flex-1 py-8">
        <div className="container-page">
          <header className="mb-6">
            <p className="eyebrow">Instructor Studio</p>
            <h1 className="section-title mt-1">Welcome back, {user.name.split(" ")[0]}</h1>
            <p className="mt-1 text-sm text-navy-500 dark:text-slate-400">
              Manage your trading courses, students and earnings in one place.
            </p>
          </header>
          <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
            <InstructorSidebar />
            <div className="min-w-0">{children}</div>
          </div>
        </div>
      </main>
    </div>
  );
}
