"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCw, Home } from "lucide-react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center dark:bg-navy-950">
      <p className="font-display text-6xl font-black text-navy-200">Oops</p>
      <h1 className="mt-4 font-display text-2xl font-bold text-navy-900 dark:text-white">Something went wrong</h1>
      <p className="mt-2 max-w-md text-navy-500 dark:text-slate-400">
        An unexpected error occurred. You can try again, or head back home.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button onClick={reset} className="btn-primary btn-lg">
          <RefreshCw className="h-5 w-5" /> Try again
        </button>
        <Link href="/" className="btn-outline btn-lg">
          <Home className="h-5 w-5" /> Back home
        </Link>
      </div>
    </div>
  );
}
