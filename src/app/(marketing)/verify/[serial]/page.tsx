import Link from "next/link";
import { format } from "date-fns";
import {
  CheckCircle2,
  XCircle,
  ShieldCheck,
  GraduationCap,
  BookOpen,
  UserCheck,
  CalendarDays,
  Hash,
  ArrowLeft,
} from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ serial: string }>;
}) {
  const { serial } = await params;
  return {
    title: `Verify ${decodeURIComponent(serial)}`,
    description: `Verification result for eLearners Academy certificate ${decodeURIComponent(
      serial
    )}.`,
  };
}

export default async function VerifyResultPage({
  params,
}: {
  params: Promise<{ serial: string }>;
}) {
  const { serial: raw } = await params;
  const serial = decodeURIComponent(raw).trim().toUpperCase();

  const certificate = await prisma.certificate.findUnique({
    where: { serial },
    include: {
      user: { select: { name: true } },
      course: {
        select: {
          title: true,
          instructor: { select: { name: true } },
        },
      },
    },
  });

  if (!certificate) {
    return (
      <div className="bg-navy-50/40 dark:bg-navy-950">
        <div className="container-page flex min-h-[70vh] items-center justify-center py-16">
          <div className="w-full max-w-lg">
            <div className="overflow-hidden rounded-3xl border border-rose-500/30 bg-white shadow-xl dark:bg-navy-900">
              <div className="flex flex-col items-center bg-rose-500/10 px-8 py-10 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-500 text-white">
                  <XCircle className="h-9 w-9" />
                </div>
                <h1 className="mt-5 font-display text-2xl font-black text-rose-600 dark:text-rose-400">
                  Certificate not found
                </h1>
                <p className="mt-2 text-navy-600 dark:text-slate-300">
                  We couldn&apos;t find a certificate with the serial{" "}
                  <span className="font-mono font-semibold">{serial}</span>. Please double-check
                  the number and try again.
                </p>
              </div>
              <div className="px-8 py-6 text-center">
                <Link href="/verify" className="btn-primary btn-md">
                  <ArrowLeft className="h-4 w-4" /> Try another serial
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const details = [
    {
      icon: GraduationCap,
      label: "Awarded to",
      value: certificate.user.name,
    },
    {
      icon: BookOpen,
      label: "Course",
      value: certificate.course.title,
    },
    {
      icon: UserCheck,
      label: "Instructor",
      value: certificate.course.instructor.name,
    },
    {
      icon: CalendarDays,
      label: "Issued on",
      value: format(certificate.issuedAt, "MMMM d, yyyy"),
    },
    {
      icon: Hash,
      label: "Serial number",
      value: certificate.serial,
      mono: true,
    },
  ];

  return (
    <div className="bg-navy-50/40 dark:bg-navy-950">
      <div className="container-page flex min-h-[70vh] items-center justify-center py-16">
        <div className="w-full max-w-2xl">
          <div className="overflow-hidden rounded-3xl border border-emerald-500/30 bg-white shadow-2xl dark:bg-navy-900">
            {/* Verified banner */}
            <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-emerald-600 px-8 py-10 text-center text-white">
              <div className="absolute inset-0 bg-hero-grid opacity-20" />
              <div className="relative">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/20 ring-4 ring-white/30">
                  <CheckCircle2 className="h-9 w-9" />
                </div>
                <h1 className="mt-5 font-display text-3xl font-black">
                  ✓ Verified Certificate
                </h1>
                <p className="mt-2 text-emerald-50/90">
                  This is an authentic credential issued by eLearners Academy.
                </p>
              </div>
            </div>

            {/* Details */}
            <div className="px-8 py-8">
              <div className="mb-6 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="h-4 w-4" /> Certificate details
              </div>
              <dl className="divide-y divide-navy-100 dark:divide-navy-800">
                {details.map((d) => (
                  <div key={d.label} className="flex items-center gap-4 py-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy-50 text-navy-500 dark:bg-navy-800 dark:text-slate-300">
                      <d.icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <dt className="text-xs font-medium uppercase tracking-wide text-navy-400 dark:text-slate-500">
                        {d.label}
                      </dt>
                      <dd
                        className={`mt-0.5 text-lg font-bold text-navy-900 dark:text-white ${
                          d.mono ? "font-mono tracking-wide" : ""
                        }`}
                      >
                        {d.value}
                      </dd>
                    </div>
                  </div>
                ))}
              </dl>

              <div className="mt-6 flex flex-col items-center gap-3 border-t border-navy-100 pt-6 text-center dark:border-navy-800 sm:flex-row sm:justify-between sm:text-left">
                <p className="text-sm text-navy-500 dark:text-slate-400">
                  eLearners Academy — Kenya&apos;s trusted trading education.
                </p>
                <Link href="/verify" className="btn-outline btn-sm shrink-0">
                  Verify another
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
