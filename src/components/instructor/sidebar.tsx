"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, Users, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/instructor", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/instructor/courses", label: "My Courses", icon: BookOpen },
  { href: "/instructor/students", label: "Students", icon: Users },
  { href: "/instructor/earnings", label: "Earnings", icon: Wallet },
];

export function InstructorSidebar() {
  const pathname = usePathname();
  return (
    <aside className="lg:sticky lg:top-24 lg:h-fit">
      <nav className="flex gap-2 overflow-x-auto rounded-2xl border border-navy-100 bg-white p-2 dark:border-navy-800 dark:bg-navy-900 lg:flex-col lg:gap-1">
        {LINKS.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex shrink-0 items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-navy-900 text-white shadow-sm dark:bg-gold-400 dark:text-navy-900"
                  : "text-navy-600 hover:bg-navy-50 dark:text-slate-300 dark:hover:bg-navy-800"
              )}
            >
              <Icon size={18} className={cn(active ? "" : "text-sky")} />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
