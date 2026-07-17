"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Heart,
  Award,
  Trophy,
  Bell,
  Settings,
  GraduationCap,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = { href: string; label: string; icon: React.ElementType };

const MAIN: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/my-courses", label: "My Learning", icon: BookOpen },
  { href: "/dashboard/wishlist", label: "Wishlist", icon: Heart },
  { href: "/dashboard/certificates", label: "Certificates", icon: Award },
  { href: "/dashboard/achievements", label: "Achievements", icon: Trophy },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function DashboardSidebar({ role }: { role: string }) {
  const pathname = usePathname();

  const staff: NavItem[] = [];
  if (role === "INSTRUCTOR" || role === "ADMIN") {
    staff.push({ href: "/instructor", label: "Instructor Studio", icon: GraduationCap });
  }
  if (role === "ADMIN") {
    staff.push({ href: "/admin", label: "Admin Panel", icon: Shield });
  }

  return (
    <aside className="lg:sticky lg:top-20 lg:h-[calc(100vh-6rem)]">
      <nav
        className="scrollbar-thin -mx-1 flex gap-1 overflow-x-auto px-1 pb-1 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0"
        aria-label="Dashboard"
      >
        {MAIN.map((item) => {
          const active =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          return <SideLink key={item.href} item={item} active={active} />;
        })}

        {staff.length > 0 && (
          <>
            <div className="my-2 hidden border-t border-navy-100 dark:border-navy-800 lg:block" />
            {staff.map((item) => (
              <SideLink
                key={item.href}
                item={item}
                active={pathname.startsWith(item.href)}
                accent
              />
            ))}
          </>
        )}
      </nav>
    </aside>
  );
}

function SideLink({
  item,
  active,
  accent,
}: {
  item: NavItem;
  active: boolean;
  accent?: boolean;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={cn(
        "flex shrink-0 items-center gap-3 whitespace-nowrap rounded-xl px-3.5 py-2.5 text-sm font-medium transition",
        active
          ? "bg-navy-900 text-white shadow-sm dark:bg-gold-400 dark:text-navy-900"
          : "text-navy-600 hover:bg-navy-50 hover:text-navy-900 dark:text-slate-300 dark:hover:bg-navy-800 dark:hover:text-white",
        accent && !active && "text-gold-600 dark:text-gold-400"
      )}
    >
      <Icon className="h-4.5 w-4.5 shrink-0" style={{ width: 18, height: 18 }} />
      {item.label}
    </Link>
  );
}
