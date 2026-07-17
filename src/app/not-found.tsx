import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-navy-900 px-4 text-center text-white">
      <div className="absolute inset-0 bg-hero-grid opacity-40" />
      <div className="relative">
        <Logo dark />
        <p className="mt-10 font-display text-8xl font-black text-gradient-gold">404</p>
        <h1 className="mt-4 font-display text-2xl font-bold">Page not found</h1>
        <p className="mt-2 max-w-md text-slate-400">
          The page you're looking for doesn't exist or has moved. Let's get you back on track.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn-primary btn-lg">
            <Home className="h-5 w-5" /> Back home
          </Link>
          <Link href="/courses" className="btn-outline btn-lg !border-white/20 !bg-white/5 !text-white">
            <Search className="h-5 w-5" /> Browse courses
          </Link>
        </div>
      </div>
    </div>
  );
}
