"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function VerifySearch({ defaultValue = "" }: { defaultValue?: string }) {
  const router = useRouter();
  const [serial, setSerial] = useState(defaultValue);
  const [loading, setLoading] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const value = serial.trim().toUpperCase();
    if (!value) {
      toast.error("Enter a certificate serial to verify.");
      return;
    }
    setLoading(true);
    router.push("/verify/" + encodeURIComponent(value));
  }

  return (
    <form onSubmit={submit} className="mx-auto w-full max-w-xl">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <ShieldCheck className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-sky" />
          <input
            className="input h-12 pl-11 uppercase tracking-wide"
            placeholder="ELA-SMP-1007"
            value={serial}
            onChange={(e) => setSerial(e.target.value)}
            aria-label="Certificate serial number"
          />
        </div>
        <button type="submit" disabled={loading} className="btn-primary btn-lg shrink-0">
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" /> Verifying…
            </>
          ) : (
            <>
              <Search className="h-5 w-5" /> Verify
            </>
          )}
        </button>
      </div>
      <p className="mt-3 text-center text-sm text-navy-500 dark:text-slate-400">
        Example format:{" "}
        <span className="font-mono font-semibold text-navy-700 dark:text-slate-200">
          ELA-SMP-1007
        </span>
      </p>
    </form>
  );
}
