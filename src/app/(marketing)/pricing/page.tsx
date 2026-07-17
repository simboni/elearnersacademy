import Link from "next/link";
import { Check, X, Sparkles, ArrowRight, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Faq } from "@/components/site/faq";

export const metadata = { title: "Pricing — eLearners Academy" };

type Tier = {
  name: string;
  price: string;
  period: string;
  tagline: string;
  cta: string;
  popular?: boolean;
  features: string[];
};

const tiers: Tier[] = [
  {
    name: "Free",
    price: "Ksh 0",
    period: "forever",
    tagline: "Start learning the fundamentals at no cost.",
    cta: "Get started free",
    features: [
      "Access to all free courses",
      "Community forum access",
      "AI tutor — basics",
      "Course previews & lessons",
      "Learning streak & badges",
    ],
  },
  {
    name: "Pro Learner",
    price: "Ksh 2,500",
    period: "per month",
    tagline: "Everything you need to go from beginner to funded.",
    cta: "Start Pro",
    popular: true,
    features: [
      "Everything in Free",
      "All premium courses unlocked",
      "Verifiable certificates",
      "Live sessions & webinars",
      "Priority AI tutor",
      "Downloadable resources",
    ],
  },
  {
    name: "Mentorship",
    price: "Ksh 9,900",
    period: "per month",
    tagline: "1:1 coaching and prop-firm support to fast-track your edge.",
    cta: "Apply for mentorship",
    features: [
      "Everything in Pro Learner",
      "1:1 coaching sessions",
      "Prop-firm challenge support",
      "Private mentorship group",
      "Personal trade reviews",
      "Direct chat with your mentor",
    ],
  },
];

const comparison: { label: string; free: boolean; pro: boolean; mentor: boolean }[] = [
  { label: "Free courses", free: true, pro: true, mentor: true },
  { label: "Community access", free: true, pro: true, mentor: true },
  { label: "AI tutor (basics)", free: true, pro: true, mentor: true },
  { label: "All premium courses", free: false, pro: true, mentor: true },
  { label: "Certificates", free: false, pro: true, mentor: true },
  { label: "Live sessions", free: false, pro: true, mentor: true },
  { label: "Priority AI tutor", free: false, pro: true, mentor: true },
  { label: "1:1 coaching", free: false, pro: false, mentor: true },
  { label: "Prop-firm support", free: false, pro: false, mentor: true },
  { label: "Private mentor group", free: false, pro: false, mentor: true },
];

const faqs = [
  {
    q: "Can I switch or cancel my plan anytime?",
    a: "Yes. Plans are month-to-month with no lock-in. You can upgrade, downgrade, or cancel at any time from your dashboard, and changes take effect at your next billing cycle.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept M-Pesa, card payments, and bank transfer for Kenyan learners. International learners can pay by card.",
  },
  {
    q: "Do I get a certificate?",
    a: "Pro Learner and Mentorship members earn verifiable certificates on course completion, each with a public verification page you can share with employers or prop firms.",
  },
  {
    q: "What is included in prop-firm support?",
    a: "Mentorship members get personalised guidance through prop-firm challenges — risk plans, session routines, and trade reviews built around the SMP_TS approach to help you stay within drawdown limits.",
  },
  {
    q: "Is there a free trial?",
    a: "The Free plan is effectively a permanent trial — you can explore free courses, the community, and the AI tutor basics with no card required, then upgrade whenever you're ready.",
  },
];

export default function PricingPage() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-navy-900 text-white">
        <div className="absolute inset-0 bg-hero-grid" />
        <div className="absolute -left-40 top-0 h-96 w-96 rounded-full bg-gold-400/10 blur-3xl" />
        <div className="container-page relative py-20 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold-400/30 bg-gold-400/10 px-4 py-1.5 text-sm font-semibold text-gold-300">
            <Sparkles className="h-4 w-4" /> Simple, honest pricing
          </span>
          <h1 className="mt-6 font-display text-4xl font-black leading-[1.1] sm:text-5xl lg:text-6xl">
            Invest in a skill that <span className="text-gradient-gold">pays for a lifetime</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-300">
            Start free, upgrade when you&apos;re ready. No hidden fees, cancel anytime.
          </p>
        </div>
      </section>

      {/* TIERS */}
      <section className="container-page -mt-12 pb-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {tiers.map((t) => (
            <div
              key={t.name}
              className={cn(
                "card relative flex flex-col p-7",
                t.popular &&
                  "border-2 border-gold-400 shadow-card-hover lg:-mt-4 lg:mb-4 dark:border-gold-400"
              )}
            >
              {t.popular && (
                <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-gold-400 px-3 py-1 text-xs font-bold text-navy-900 shadow">
                  <Star className="h-3.5 w-3.5 fill-navy-900" /> Most popular
                </span>
              )}
              <h3 className="font-display text-xl font-bold text-navy-900 dark:text-white">
                {t.name}
              </h3>
              <p className="mt-1 text-sm text-navy-500 dark:text-slate-400">{t.tagline}</p>
              <div className="mt-5 flex items-baseline gap-1.5">
                <span className="font-display text-4xl font-black text-navy-900 dark:text-white">
                  {t.price}
                </span>
                <span className="text-sm text-navy-400">/ {t.period}</span>
              </div>
              <Link
                href="/register"
                className={cn(
                  t.popular ? "btn-primary" : "btn-outline",
                  "btn-lg mt-6 w-full"
                )}
              >
                {t.cta}
              </Link>
              <ul className="mt-7 space-y-3">
                {t.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-3 text-sm text-navy-700 dark:text-slate-300"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" /> {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* COMPARISON */}
      <section className="container-page py-16">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <span className="eyebrow">Compare</span>
          <h2 className="mt-2 section-title">Every plan, side by side</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-left">
            <thead>
              <tr className="border-b border-navy-100 dark:border-navy-800">
                <th className="py-4 pr-4 font-display text-sm font-bold text-navy-900 dark:text-white">
                  Features
                </th>
                <th className="px-4 py-4 text-center font-display text-sm font-bold text-navy-900 dark:text-white">
                  Free
                </th>
                <th className="px-4 py-4 text-center font-display text-sm font-bold text-gold-600">
                  Pro Learner
                </th>
                <th className="px-4 py-4 text-center font-display text-sm font-bold text-navy-900 dark:text-white">
                  Mentorship
                </th>
              </tr>
            </thead>
            <tbody>
              {comparison.map((row) => (
                <tr
                  key={row.label}
                  className="border-b border-navy-100 last:border-0 dark:border-navy-800"
                >
                  <td className="py-3.5 pr-4 text-sm text-navy-700 dark:text-slate-300">
                    {row.label}
                  </td>
                  {[row.free, row.pro, row.mentor].map((on, i) => (
                    <td key={i} className="px-4 py-3.5 text-center">
                      {on ? (
                        <Check className="mx-auto h-5 w-5 text-emerald-500" />
                      ) : (
                        <X className="mx-auto h-5 w-5 text-navy-200 dark:text-navy-700" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-navy-50 py-20 dark:bg-navy-900/40">
        <div className="container-page">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <span className="eyebrow">Questions</span>
            <h2 className="mt-2 section-title">Frequently asked</h2>
          </div>
          <Faq items={faqs} />
        </div>
      </section>

      {/* CTA */}
      <section className="container-page py-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gold-400 to-gold-600 px-6 py-16 text-center text-navy-900">
          <div className="relative mx-auto max-w-2xl">
            <h2 className="font-display text-3xl font-black sm:text-4xl">
              Start free. Grow into funded.
            </h2>
            <p className="mt-4 text-lg text-navy-800">
              Create your free account today — no card required.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/register" className="btn-navy btn-lg">
                Create free account <ArrowRight className="h-5 w-5" />
              </Link>
              <Link href="/courses" className="btn-outline btn-lg !border-navy-900/20 !bg-white/30">
                Browse courses
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
