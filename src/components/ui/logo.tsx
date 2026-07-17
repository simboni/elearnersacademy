import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function Logo({ className, dark = false }: { className?: string; dark?: boolean }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2.5 group", className)}>
      <span className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 shadow-gold">
        <span className="font-display text-lg font-black text-navy-900">e</span>
      </span>
      <span className="flex flex-col leading-none">
        <span className={cn("font-display text-base font-extrabold tracking-tight", dark ? "text-white" : "text-navy-900 dark:text-white")}>
          eLearners
        </span>
        <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold-500">
          Academy
        </span>
      </span>
    </Link>
  );
}
