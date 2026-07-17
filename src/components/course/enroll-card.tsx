"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
  ShoppingCart, Zap, PlayCircle, Infinity as InfinityIcon, Smartphone,
  Award, MessageSquare, Check, BarChart3,
} from "lucide-react";
import { useCart } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import { WishlistButton } from "./wishlist-button";

export function EnrollCard({
  course,
  enrolled,
  wishlisted,
  progressPct,
}: {
  course: {
    id: string;
    slug: string;
    title: string;
    image: string | null;
    price: number;
    discountPrice: number | null;
    currency: string;
    level: string;
    lessonCount: number;
    durationLabel: string | null;
  };
  enrolled: boolean;
  wishlisted: boolean;
  progressPct: number;
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const cart = useCart();
  const [loading, setLoading] = useState(false);
  const price = course.discountPrice ?? course.price;
  const isFree = price === 0;
  const inCart = cart.has(course.id);
  const discountPercent =
    course.discountPrice != null && course.price > 0
      ? Math.round((1 - course.discountPrice / course.price) * 100)
      : 0;

  async function enrollFree() {
    if (!session) return router.push(`/login?callbackUrl=/courses/${course.slug}`);
    setLoading(true);
    const res = await fetch("/api/enroll", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ courseId: course.id }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.ok) {
      toast.success("Enrolled! Redirecting to your course…");
      router.push(`/learn/${course.slug}`);
      router.refresh();
    } else {
      toast.error(data.error || "Could not enroll");
    }
  }

  function addToCart() {
    cart.add({ id: course.id, title: course.title, price, image: course.image, slug: course.slug });
    toast.success("Added to cart");
  }

  function buyNow() {
    if (!inCart) addToCart();
    router.push("/cart");
  }

  return (
    <div className="card overflow-hidden">
      <div className="p-5">
        {enrolled ? (
          <>
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">
              <Check className="h-4 w-4" /> You're enrolled · {Math.round(progressPct)}% complete
            </div>
            <button onClick={() => router.push(`/learn/${course.slug}`)} className="btn-primary btn-lg w-full">
              <PlayCircle className="h-5 w-5" />
              {progressPct > 0 ? "Continue Learning" : "Start Learning"}
            </button>
          </>
        ) : (
          <>
            <div className="mb-4 flex items-end gap-3">
              <span className="font-display text-3xl font-black text-navy-900 dark:text-white">
                {formatCurrency(price, course.currency)}
              </span>
              {discountPercent > 0 && (
                <>
                  <span className="text-lg text-navy-300 line-through">{formatCurrency(course.price, course.currency)}</span>
                  <span className="badge-red mb-1">{discountPercent}% off</span>
                </>
              )}
            </div>

            {isFree ? (
              <button onClick={enrollFree} disabled={loading} className="btn-primary btn-lg w-full">
                <Zap className="h-5 w-5" /> {loading ? "Enrolling…" : "Enroll Free"}
              </button>
            ) : (
              <div className="space-y-2">
                <button onClick={buyNow} className="btn-primary btn-lg w-full">
                  <Zap className="h-5 w-5" /> Buy Now
                </button>
                <button onClick={addToCart} disabled={inCart} className="btn-outline btn-lg w-full">
                  <ShoppingCart className="h-5 w-5" /> {inCart ? "In Cart" : "Add to Cart"}
                </button>
              </div>
            )}

            <div className="mt-2">
              <WishlistButton courseId={course.id} initial={wishlisted} withLabel />
            </div>
            <p className="mt-3 text-center text-xs text-navy-400">30-day money-back guarantee</p>
          </>
        )}

        <ul className="mt-5 space-y-2.5 border-t border-navy-100 pt-5 text-sm dark:border-navy-700">
          <Feature icon={PlayCircle} label={`${course.lessonCount} on-demand lessons`} />
          <Feature icon={BarChart3} label={`${course.level} level`} />
          <Feature icon={InfinityIcon} label="Full lifetime access" />
          <Feature icon={Smartphone} label="Access on mobile & desktop" />
          <Feature icon={Award} label="Certificate of completion" />
          <Feature icon={MessageSquare} label="Community & AI tutor support" />
        </ul>
      </div>
    </div>
  );
}

function Feature({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <li className="flex items-center gap-3 text-navy-600 dark:text-slate-300">
      <Icon className="h-4 w-4 shrink-0 text-sky-dark" /> {label}
    </li>
  );
}
