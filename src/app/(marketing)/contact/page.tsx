import Link from "next/link";
import { MapPin, Phone, Mail, Clock, MessageSquare, ArrowRight } from "lucide-react";
import { ContactForm } from "@/components/site/contact-form";

export const metadata = { title: "Contact Us — eLearners Academy" };

const cards = [
  {
    icon: MapPin,
    title: "Visit us",
    lines: ["Nairobi & Bungoma", "Kenya"],
  },
  {
    icon: Phone,
    title: "Call or WhatsApp",
    lines: ["+254 706 289 514"],
    href: "tel:+254706289514",
  },
  {
    icon: Mail,
    title: "Email us",
    lines: ["hello@elearnersacademy.co.ke"],
    href: "mailto:hello@elearnersacademy.co.ke",
  },
  {
    icon: Clock,
    title: "Office hours",
    lines: ["Mon–Sat, 8:00–18:00", "EAT (GMT+3)"],
  },
];

export default function ContactPage() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-navy-900 text-white">
        <div className="absolute inset-0 bg-hero-grid" />
        <div className="absolute -right-40 top-0 h-96 w-96 rounded-full bg-sky/20 blur-3xl" />
        <div className="container-page relative py-20 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold-400/30 bg-gold-400/10 px-4 py-1.5 text-sm font-semibold text-gold-300">
            <MessageSquare className="h-4 w-4" /> We&apos;d love to hear from you
          </span>
          <h1 className="mt-6 font-display text-4xl font-black leading-[1.1] sm:text-5xl">
            Get in <span className="text-gradient-gold">touch</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-300">
            Questions about a course, mentorship, or prop-firm funding? Our team in Nairobi and
            Bungoma is ready to help — we reply within 24 hours.
          </p>
        </div>
      </section>

      {/* CONTACT CARDS */}
      <section className="container-page -mt-10 pb-4">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((c) => {
            const inner = (
              <>
                <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky/15 to-gold-400/15 text-sky-dark">
                  <c.icon className="h-6 w-6" />
                </span>
                <h3 className="font-display font-bold text-navy-900 dark:text-white">{c.title}</h3>
                {c.lines.map((l) => (
                  <p key={l} className="mt-1 text-sm text-navy-500 dark:text-slate-400">
                    {l}
                  </p>
                ))}
              </>
            );
            return c.href ? (
              <a key={c.title} href={c.href} className="card card-hover block p-6">
                {inner}
              </a>
            ) : (
              <div key={c.title} className="card p-6">
                {inner}
              </div>
            );
          })}
        </div>
      </section>

      {/* FORM + MAP */}
      <section className="container-page py-16">
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <span className="eyebrow">Send a message</span>
            <h2 className="mt-2 section-title">Let&apos;s talk</h2>
            <p className="mt-3 text-navy-500 dark:text-slate-400">
              Fill in the form and a member of our team will get back to you shortly.
            </p>
            <div className="mt-6">
              <ContactForm />
            </div>
          </div>

          <div className="flex flex-col">
            <span className="eyebrow">Find us</span>
            <h2 className="mt-2 section-title">Nairobi &amp; Bungoma</h2>
            <p className="mt-3 text-navy-500 dark:text-slate-400">
              We run online across Kenya, with in-person mentorship hubs in Nairobi and Bungoma.
            </p>
            <div className="relative mt-6 flex-1 overflow-hidden rounded-3xl border border-navy-100 bg-gradient-to-br from-navy-800 to-navy-900 dark:border-navy-800">
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(72,167,212,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(72,167,212,0.4) 1px, transparent 1px)",
                  backgroundSize: "40px 40px",
                }}
              />
              <div className="relative flex min-h-[320px] flex-col items-center justify-center p-8 text-center text-white">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gold-400 text-navy-900 shadow-lg">
                  <MapPin className="h-7 w-7" />
                </span>
                <p className="mt-4 font-display text-xl font-bold">eLearners Academy</p>
                <p className="mt-1 text-sm text-slate-300">Nairobi &amp; Bungoma, Kenya</p>
                <a
                  href="https://maps.google.com/?q=Nairobi,Kenya"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline btn-sm mt-5 !border-white/20 !bg-white/5 !text-white hover:!bg-white/10"
                >
                  Open in Maps <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HELP CTA */}
      <section className="container-page pb-20">
        <div className="rounded-3xl border border-navy-100 bg-navy-50 p-8 text-center dark:border-navy-800 dark:bg-navy-900/40">
          <h2 className="font-display text-2xl font-bold text-navy-900 dark:text-white">
            Prefer to browse first?
          </h2>
          <p className="mt-2 text-navy-500 dark:text-slate-400">
            Explore our courses and learning paths to find the right starting point.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/courses" className="btn-primary btn-md">
              Browse courses
            </Link>
            <Link href="/paths" className="btn-outline btn-md">
              Learning paths
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
