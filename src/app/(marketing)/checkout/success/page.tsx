import Link from "next/link";
import { CheckCircle2, ArrowRight, BookOpen } from "lucide-react";

export const metadata = { title: "Payment Successful" };

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;
  return (
    <div className="container-page py-20">
      <div className="card mx-auto flex max-w-lg flex-col items-center gap-4 py-16 text-center">
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle2 className="h-11 w-11 text-emerald-600" />
        </span>
        <h1 className="font-display text-3xl font-black text-navy-900 dark:text-white">Payment successful! 🎉</h1>
        <p className="max-w-sm text-navy-500 dark:text-slate-400">
          Your enrollment is confirmed and you now have lifetime access. Time to start learning.
        </p>
        {ref && (
          <p className="rounded-lg bg-navy-50 px-4 py-2 text-sm font-mono text-navy-600 dark:bg-navy-800 dark:text-slate-300">
            Ref: {ref}
          </p>
        )}
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <Link href="/dashboard/my-courses" className="btn-primary btn-lg">
            <BookOpen className="h-5 w-5" /> Go to My Courses
          </Link>
          <Link href="/courses" className="btn-outline btn-lg">
            Browse more <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
