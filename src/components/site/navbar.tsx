"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Search,
  ShoppingCart,
  Menu,
  X,
  LayoutDashboard,
  BookOpen,
  Award,
  LogOut,
  User as UserIcon,
  Bell,
  GraduationCap,
  ChevronDown,
} from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { Avatar } from "@/components/ui/avatar";
import { useCart } from "@/lib/store";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/courses", label: "Courses" },
  { href: "/paths", label: "Learning Paths" },
  { href: "/live", label: "Live Sessions" },
  { href: "/instructors", label: "Instructors" },
  { href: "/about", label: "About" },
];

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [q, setQ] = useState("");
  const cartCount = useCart((s) => s.items.length);

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(`/courses?q=${encodeURIComponent(q)}`);
  }

  const user = session?.user;
  const role = (user as { role?: string })?.role;

  return (
    <header className="sticky top-0 z-50 border-b border-navy-100 glass dark:border-navy-800">
      <div className="container-page flex h-16 items-center gap-4">
        <Logo />

        <nav className="ml-4 hidden items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium text-navy-600 transition hover:bg-navy-50 hover:text-navy-900 dark:text-slate-300 dark:hover:bg-navy-800",
                pathname.startsWith(item.href) && "text-navy-900 dark:text-white"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <form onSubmit={submitSearch} className="ml-auto hidden max-w-xs flex-1 md:block">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-300" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search courses..."
              className="input py-2 pl-9 text-sm"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-1 md:ml-0">
          <Link
            href="/cart"
            className="relative rounded-lg p-2 text-navy-600 hover:bg-navy-50 dark:text-slate-300 dark:hover:bg-navy-800"
            aria-label="Cart"
          >
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold-400 px-1 text-[10px] font-bold text-navy-900">
                {cartCount}
              </span>
            )}
          </Link>

          {user ? (
            <>
              <Link
                href="/dashboard/notifications"
                className="relative rounded-lg p-2 text-navy-600 hover:bg-navy-50 dark:text-slate-300 dark:hover:bg-navy-800"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
              </Link>
              <div className="relative">
                <button
                  onClick={() => setMenuOpen((o) => !o)}
                  className="flex items-center gap-1.5 rounded-lg p-1 hover:bg-navy-50 dark:hover:bg-navy-800"
                >
                  <Avatar name={user.name || "U"} src={user.image} size={32} />
                  <ChevronDown className="h-4 w-4 text-navy-400" />
                </button>
                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                    <div className="absolute right-0 z-20 mt-2 w-60 overflow-hidden rounded-2xl border border-navy-100 bg-white py-2 shadow-card-hover dark:border-navy-700 dark:bg-navy-800">
                      <div className="border-b border-navy-100 px-4 py-2 dark:border-navy-700">
                        <p className="truncate text-sm font-semibold text-navy-900 dark:text-white">
                          {user.name}
                        </p>
                        <p className="truncate text-xs text-navy-400">{user.email}</p>
                      </div>
                      <MenuLink href="/dashboard" icon={LayoutDashboard} label="Dashboard" onClick={() => setMenuOpen(false)} />
                      <MenuLink href="/dashboard/my-courses" icon={BookOpen} label="My Learning" onClick={() => setMenuOpen(false)} />
                      <MenuLink href="/dashboard/certificates" icon={Award} label="Certificates" onClick={() => setMenuOpen(false)} />
                      {(role === "INSTRUCTOR" || role === "ADMIN") && (
                        <MenuLink href="/instructor" icon={GraduationCap} label="Instructor Studio" onClick={() => setMenuOpen(false)} />
                      )}
                      {role === "ADMIN" && (
                        <MenuLink href="/admin" icon={UserIcon} label="Admin Panel" onClick={() => setMenuOpen(false)} />
                      )}
                      <MenuLink href="/dashboard/settings" icon={UserIcon} label="Profile & Settings" onClick={() => setMenuOpen(false)} />
                      <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-navy-700"
                      >
                        <LogOut className="h-4 w-4" /> Sign out
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link href="/login" className="btn-ghost btn-md">
                Log in
              </Link>
              <Link href="/register" className="btn-primary btn-md">
                Get started
              </Link>
            </div>
          )}

          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="rounded-lg p-2 text-navy-600 lg:hidden dark:text-slate-300"
            aria-label="Menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-navy-100 bg-white px-4 py-3 lg:hidden dark:border-navy-800 dark:bg-navy-900">
          <form onSubmit={submitSearch} className="mb-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-300" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search courses..."
                className="input pl-9"
              />
            </div>
          </form>
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="block rounded-lg px-3 py-2.5 text-sm font-medium text-navy-700 hover:bg-navy-50 dark:text-slate-200 dark:hover:bg-navy-800"
            >
              {item.label}
            </Link>
          ))}
          {!user && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Link href="/login" onClick={() => setMobileOpen(false)} className="btn-outline btn-md">
                Log in
              </Link>
              <Link href="/register" onClick={() => setMobileOpen(false)} className="btn-primary btn-md">
                Get started
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

function MenuLink({
  href,
  icon: Icon,
  label,
  onClick,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-2.5 text-sm text-navy-700 hover:bg-navy-50 dark:text-slate-200 dark:hover:bg-navy-700"
    >
      <Icon className="h-4 w-4 text-navy-400" /> {label}
    </Link>
  );
}
