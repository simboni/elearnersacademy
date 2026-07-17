import Link from "next/link";
import { format } from "date-fns";
import { Award, ShieldCheck, ArrowUpRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function CertificatesPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const certificates = await prisma.certificate.findMany({
    where: { userId: user.id },
    include: { course: true },
    orderBy: { issuedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-navy-900 dark:text-white sm:text-3xl">
          Certificates
        </h1>
        <p className="mt-1 text-sm text-navy-500 dark:text-slate-400">
          Proof of the work you have put in. Every certificate is independently verifiable at{" "}
          <span className="font-mono text-navy-700 dark:text-slate-300">/verify/&lt;serial&gt;</span>.
        </p>
      </div>

      {certificates.length === 0 ? (
        <div className="card flex flex-col items-center justify-center px-6 py-16 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-50 text-gold-500 dark:bg-navy-800">
            <Award className="h-7 w-7" />
          </span>
          <p className="mt-4 font-display text-lg font-bold text-navy-900 dark:text-white">
            No certificates yet
          </p>
          <p className="mt-1 max-w-sm text-sm text-navy-500 dark:text-slate-400">
            Complete a course to earn a shareable, verifiable certificate of completion.
          </p>
          <Link href="/dashboard/my-courses" className="btn-primary btn-md mt-5">
            Go to my courses
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {certificates.map((c) => (
            <div key={c.id} className="card card-hover flex flex-col overflow-hidden">
              <div className="relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-navy-900 to-navy-800 px-5 py-8 text-center">
                <div className="pointer-events-none absolute inset-3 rounded-xl border border-gold-400/40" />
                <div>
                  <Award className="mx-auto h-9 w-9 text-gold-400" />
                  <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.25em] text-gold-400">
                    Certificate of Completion
                  </p>
                </div>
              </div>
              <div className="flex flex-1 flex-col p-4">
                <h3 className="line-clamp-2 font-display font-bold leading-snug text-navy-900 dark:text-white">
                  {c.course.title}
                </h3>
                <div className="mt-2 space-y-1 text-xs text-navy-500 dark:text-slate-400">
                  <p>Issued {format(c.issuedAt, "MMMM d, yyyy")}</p>
                  <p className="flex items-center gap-1 font-mono">
                    <ShieldCheck className="h-3 w-3 text-emerald-500" /> {c.serial}
                  </p>
                </div>
                <div className="mt-auto flex gap-2 pt-4">
                  <Link href={`/dashboard/certificates/${c.id}`} className="btn-primary btn-sm flex-1">
                    View
                  </Link>
                  <Link
                    href={`/verify/${c.serial}`}
                    className="btn-outline btn-sm flex items-center gap-1"
                  >
                    Verify <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
