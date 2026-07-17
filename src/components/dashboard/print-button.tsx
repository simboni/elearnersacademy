"use client";

import { Printer } from "lucide-react";

export function PrintButton({ label = "Print / Save as PDF" }: { label?: string }) {
  return (
    <button onClick={() => window.print()} className="btn-navy btn-md no-print">
      <Printer className="h-4 w-4" />
      {label}
    </button>
  );
}
