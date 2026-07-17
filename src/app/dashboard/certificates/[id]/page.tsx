import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { PrintButton } from "@/components/dashboard/print-button";

export const dynamic = "force-dynamic";

export default async function CertificateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const cert = await prisma.certificate.findUnique({
    where: { id },
    include: {
      course: { include: { instructor: { select: { name: true } } } },
      user: { select: { name: true, id: true } },
    },
  });

  if (!cert) notFound();
  if (cert.userId !== user.id) redirect("/dashboard/certificates");

  const issued = format(cert.issuedAt, "MMMM d, yyyy");

  return (
    <div className="space-y-5">
      <style>{`
        @media print {
          header, aside, .no-print { display: none !important; }
          body { background: #ffffff !important; }
          main { margin: 0 !important; padding: 0 !important; }
          .cert-sheet { box-shadow: none !important; border: none !important; margin: 0 !important; width: 100% !important; }
          @page { size: A4 landscape; margin: 12mm; }
        }
      `}</style>

      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/dashboard/certificates"
          className="flex items-center gap-1.5 text-sm font-semibold text-navy-600 hover:text-navy-900 dark:text-slate-300 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Back to certificates
        </Link>
        <PrintButton />
      </div>

      {/* Certificate sheet — A4 landscape aspect */}
      <div className="cert-sheet mx-auto w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-card print:rounded-none dark:bg-white">
        <div className="aspect-[1.414/1] w-full p-2.5 sm:p-4">
          <div className="relative flex h-full w-full flex-col items-center justify-center rounded-lg border-[3px] border-gold-400 bg-white px-6 py-8 text-center sm:px-12">
            {/* inner hairline frame */}
            <div className="pointer-events-none absolute inset-2 rounded-md border border-gold-400/40" />
            {/* corner flourishes */}
            <span className="pointer-events-none absolute left-4 top-4 h-6 w-6 rounded-tl-md border-l-2 border-t-2 border-navy-900" />
            <span className="pointer-events-none absolute right-4 top-4 h-6 w-6 rounded-tr-md border-r-2 border-t-2 border-navy-900" />
            <span className="pointer-events-none absolute bottom-4 left-4 h-6 w-6 rounded-bl-md border-b-2 border-l-2 border-navy-900" />
            <span className="pointer-events-none absolute bottom-4 right-4 h-6 w-6 rounded-br-md border-b-2 border-r-2 border-navy-900" />

            {/* brand */}
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-gold-400 to-gold-600">
                <span className="font-display text-lg font-black text-navy-900">e</span>
              </span>
              <span className="flex flex-col items-start leading-none">
                <span className="font-display text-base font-extrabold tracking-tight text-navy-900">
                  eLearners Academy
                </span>
                <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-gold-600">
                  Trading &amp; Investing
                </span>
              </span>
            </div>

            <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.4em] text-gold-600 sm:text-xs">
              Certificate of Completion
            </p>
            <p className="mt-4 text-xs uppercase tracking-widest text-navy-400">
              This certifies that
            </p>
            <h1 className="mt-2 font-display text-2xl font-extrabold text-navy-900 sm:text-4xl">
              {cert.user.name}
            </h1>
            <div className="mx-auto mt-3 h-px w-40 bg-gold-400" />
            <p className="mt-4 max-w-xl text-xs text-navy-500 sm:text-sm">
              has successfully completed all requirements of the course
            </p>
            <h2 className="mt-1.5 font-display text-lg font-bold text-navy-800 sm:text-2xl">
              {cert.course.title}
            </h2>

            {/* footer row */}
            <div className="mt-auto flex w-full items-end justify-between pt-8 text-left">
              <div>
                <p className="border-t border-navy-300 pt-1 font-display text-sm font-semibold text-navy-900">
                  {cert.course.instructor.name}
                </p>
                <p className="text-[10px] uppercase tracking-wider text-navy-400">
                  Lead Instructor
                </p>
              </div>
              <div className="text-center">
                <p className="border-t border-navy-300 pt-1 font-display text-sm font-semibold text-navy-900">
                  {issued}
                </p>
                <p className="text-[10px] uppercase tracking-wider text-navy-400">Date Issued</p>
              </div>
            </div>

            <p className="mt-4 flex items-center gap-1.5 font-mono text-[10px] text-navy-400">
              <ShieldCheck className="h-3 w-3 text-emerald-500" />
              Serial {cert.serial} · verify at /verify/{cert.serial}
            </p>
          </div>
        </div>
      </div>

      <p className="no-print text-center text-xs text-navy-400">
        Anyone can confirm this certificate is authentic at{" "}
        <Link href={`/verify/${cert.serial}`} className="font-semibold text-sky-dark hover:underline">
          /verify/{cert.serial}
        </Link>
      </p>
    </div>
  );
}
