import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { Navbar } from "@/components/site/navbar";
import { AdminSidebar } from "@/components/admin/sidebar";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") redirect("/dashboard");

  return (
    <div className="min-h-screen bg-navy-50/40 dark:bg-navy-950">
      <Navbar />
      <div className="container-page grid gap-6 py-6 lg:grid-cols-[240px_1fr] lg:gap-8 lg:py-8">
        <div>
          <div className="mb-4 hidden lg:block">
            <p className="eyebrow">eLearners</p>
            <h2 className="text-lg font-bold text-navy-900 dark:text-white">Admin Console</h2>
          </div>
          <AdminSidebar />
        </div>
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
