import Link from "next/link";
import Image from "next/image";
import { Logo } from "@/components/ui/logo";
import { Quote } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col justify-center px-6 py-10 sm:px-12 lg:px-20">
        <div className="mx-auto w-full max-w-sm">
          <Logo />
          <div className="mt-10">{children}</div>
        </div>
      </div>
      <div className="relative hidden overflow-hidden bg-navy-900 lg:block">
        <Image src="/brand/hero.png" alt="" fill className="object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-br from-navy-900/90 to-navy-900/70" />
        <div className="relative flex h-full flex-col justify-center p-16 text-white">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-gold-400/30 bg-gold-400/10 px-4 py-1.5 text-sm font-semibold text-gold-300">
            eLearners Academy
          </span>
          <h2 className="mt-6 font-display text-4xl font-black leading-tight">
            Master a skill that <span className="text-gradient-gold">pays for a lifetime.</span>
          </h2>
          <p className="mt-4 max-w-md text-lg text-slate-300">
            Join thousands of learners mastering trading, finance, and in-demand skills with expert
            mentorship and an AI tutor by your side.
          </p>
          <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <Quote className="h-7 w-7 text-gold-400/50" />
            <p className="mt-2 text-slate-200">
              “Passed my 10k prop firm challenge in 6 days using exactly this system. Best decision I
              ever made.”
            </p>
            <p className="mt-3 text-sm font-semibold text-gold-300">— Brian O., Funded Trader</p>
          </div>
        </div>
      </div>
    </div>
  );
}
