import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { AiTutorWidget } from "@/components/ai/ai-tutor-widget";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <AiTutorWidget />
    </div>
  );
}
