import {
  ShieldCheck,
  BadgeCheck,
  Award,
  Lock,
  Search,
  GraduationCap,
} from "lucide-react";
import { VerifySearch } from "@/components/verify/verify-search";

export const metadata = {
  title: "Verify a Certificate",
  description:
    "Confirm the authenticity of any eLearners Academy certificate. Enter the serial number to instantly verify a graduate's credential.",
};

const STEPS = [
  {
    icon: Search,
    title: "Enter the serial",
    body: "Type the certificate serial number printed on the credential, e.g. ELA-SMP-1007.",
  },
  {
    icon: ShieldCheck,
    title: "Instant lookup",
    body: "We check it against our secure records of every certificate issued by eLearners Academy.",
  },
  {
    icon: BadgeCheck,
    title: "Trusted result",
    body: "See the graduate's name, course, instructor, and issue date — proof the credential is real.",
  },
];

export default function VerifyLandingPage() {
  return (
    <div className="bg-navy-50/40 dark:bg-navy-950">
      {/* ---------- HERO ---------- */}
      <section className="relative overflow-hidden bg-navy-900 text-white">
        <div className="absolute inset-0 bg-hero-grid" />
        <div className="absolute -right-32 top-0 h-80 w-80 rounded-full bg-sky/20 blur-3xl" />
        <div className="absolute -left-32 bottom-0 h-80 w-80 rounded-full bg-gold-400/10 blur-3xl" />
        <div className="container-page relative py-20 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold-400/30 bg-gold-400/10 px-4 py-1.5 text-sm font-semibold text-gold-300">
            <ShieldCheck className="h-4 w-4" /> Certificate Verification
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl font-display text-4xl font-black leading-tight sm:text-5xl">
            Verify an <span className="text-gradient-gold">eLearners Academy</span> Certificate
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-300">
            Every certificate we issue carries a unique serial number. Enter it below to instantly
            confirm it is authentic and see the graduate&apos;s details.
          </p>
          <div className="mt-10">
            <VerifySearch />
          </div>
        </div>
      </section>

      {/* ---------- HOW IT WORKS ---------- */}
      <section className="container-page py-16">
        <div className="text-center">
          <p className="eyebrow">How it works</p>
          <h2 className="section-title mt-2">Trusted, tamper-proof credentials</h2>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.title} className="card p-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-sky/10 text-sky">
                <s.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-display text-lg font-bold text-navy-900 dark:text-white">
                {s.title}
              </h3>
              <p className="mt-2 text-sm text-navy-500 dark:text-slate-400">{s.body}</p>
            </div>
          ))}
        </div>

        {/* Trust band */}
        <div className="mt-12 grid gap-4 rounded-2xl bg-navy-900 p-8 text-white sm:grid-cols-3">
          <div className="flex items-center gap-3">
            <Lock className="h-8 w-8 text-gold-400" />
            <div>
              <div className="font-display font-bold">Secure records</div>
              <div className="text-sm text-slate-400">Backed by our official database</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Award className="h-8 w-8 text-gold-400" />
            <div>
              <div className="font-display font-bold">Instructor-signed</div>
              <div className="text-sm text-slate-400">Issued by expert mentors</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <GraduationCap className="h-8 w-8 text-gold-400" />
            <div>
              <div className="font-display font-bold">Real skills</div>
              <div className="text-sm text-slate-400">Earned through completion</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
