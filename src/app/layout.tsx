import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: {
    default: "eLearners Academy — Master Skills That Pay for a Lifetime",
    template: "%s · eLearners Academy",
  },
  description:
    "eLearners Academy is a professional online learning platform. Master trading, finance, and in-demand skills with expert-led courses, live sessions, certificates, and an AI learning companion.",
  keywords: [
    "eLearners Academy",
    "online courses",
    "day trading course",
    "forex bootcamp",
    "SMP_TS",
    "LMS",
    "certificates",
  ],
  authors: [{ name: "eLearners Academy" }],
  openGraph: {
    title: "eLearners Academy",
    description: "Master skills that pay for a lifetime.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
