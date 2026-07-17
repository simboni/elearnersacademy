import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { Navbar } from "@/components/site/navbar";
import { DashboardSidebar } from "@/components/dashboard/sidebar";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-navy-50/40 dark:bg-navy-950">
      <Navbar />
      <div className="container-page grid gap-6 py-6 lg:grid-cols-[240px_1fr] lg:gap-8 lg:py-8">
        <DashboardSidebar role={user.role} />
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
