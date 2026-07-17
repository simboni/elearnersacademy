import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { Facebook, Instagram, Twitter, Youtube, Phone, Mail, MapPin, Send } from "lucide-react";

const COLUMNS = [
  {
    title: "Learn",
    links: [
      { label: "All Courses", href: "/courses" },
      { label: "Learning Paths", href: "/paths" },
      { label: "Live Sessions", href: "/live" },
      { label: "Free Resources", href: "/courses?price=free" },
      { label: "Certificates", href: "/verify" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Instructors", href: "/instructors" },
      { label: "Become an Instructor", href: "/teach" },
      { label: "Contact", href: "/contact" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help Center", href: "/contact" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Refund Policy", href: "/terms" },
      { label: "Verify a Certificate", href: "/verify" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-24 border-t border-navy-800 bg-navy-900 text-slate-300">
      <div className="container-page grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-6">
        <div className="lg:col-span-2">
          <Logo dark />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-400">
            Master trading, finance, and in-demand skills with expert-led courses, live mentorship,
            and verifiable certificates. Build a lifetime skill that pays.
          </p>
          <div className="mt-5 space-y-2 text-sm text-slate-400">
            <p className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gold-400" /> Nairobi / Bungoma, Kenya
            </p>
            <p className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-gold-400" /> +254 706 289 514
            </p>
            <p className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gold-400" /> hello@elearnersacademy.co.ke
            </p>
          </div>
          <div className="mt-5 flex gap-2">
            {[Facebook, Instagram, Twitter, Youtube].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-800 text-slate-400 transition hover:bg-gold-400 hover:text-navy-900"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">{col.title}</h4>
            <ul className="space-y-2.5">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-slate-400 transition hover:text-gold-400">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">Newsletter</h4>
          <p className="mb-3 text-sm text-slate-400">Weekly trading insights and new course drops.</p>
          <form className="flex overflow-hidden rounded-xl bg-navy-800">
            <input
              placeholder="Your email"
              className="w-full bg-transparent px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none"
            />
            <button className="flex items-center bg-gold-400 px-3 text-navy-900 transition hover:bg-gold-300">
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>

      <div className="border-t border-navy-800">
        <div className="container-page flex flex-col items-center justify-between gap-3 py-5 text-xs text-slate-500 sm:flex-row">
          <p>© {new Date().getFullYear()} eLearners Academy. All rights reserved.</p>
          <p className="flex items-center gap-4">
            <span>Secure payments via IntaSend</span>
            <span className="hidden sm:inline">·</span>
            <span>M-Pesa · Card · Bank</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
