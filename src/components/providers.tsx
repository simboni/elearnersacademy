"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            borderRadius: "12px",
            border: "1px solid #dbe0e9",
          },
        }}
        richColors
      />
    </SessionProvider>
  );
}
