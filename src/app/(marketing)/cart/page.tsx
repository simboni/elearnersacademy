"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Trash2, ShoppingCart, Tag, ShieldCheck, Loader2, ArrowRight } from "lucide-react";
import { useCart } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";

export default function CartPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const cart = useCart();
  const [code, setCode] = useState("");
  const [coupon, setCoupon] = useState<{ code: string; percentOff?: number | null; amountOff?: number | null } | null>(null);
  const [loading, setLoading] = useState(false);

  const subtotal = cart.total();
  const discount = coupon
    ? coupon.percentOff
      ? Math.round((subtotal * coupon.percentOff) / 100)
      : Math.min(coupon.amountOff ?? 0, subtotal)
    : 0;
  const total = Math.max(0, subtotal - discount);

  async function applyCoupon() {
    if (!code.trim()) return;
    const res = await fetch("/api/coupon", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ code }),
    });
    const data = await res.json();
    if (data.ok) {
      setCoupon(data.coupon);
      toast.success(`Coupon applied: ${data.coupon.description ?? data.coupon.code}`);
    } else {
      toast.error(data.error || "Invalid coupon");
    }
  }

  async function checkout() {
    if (!session) return router.push("/login?callbackUrl=/cart");
    if (!cart.items.length) return;
    setLoading(true);
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ courseIds: cart.items.map((i) => i.id), couponCode: coupon?.code }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.ok) {
      cart.clear();
      router.push(`/checkout/success?ref=${data.reference}`);
    } else {
      toast.error(data.error || "Checkout failed");
    }
  }

  if (cart.items.length === 0) {
    return (
      <div className="container-page py-20">
        <div className="card mx-auto flex max-w-md flex-col items-center gap-4 py-16 text-center">
          <ShoppingCart className="h-12 w-12 text-navy-200" />
          <h1 className="font-display text-2xl font-bold text-navy-900 dark:text-white">Your cart is empty</h1>
          <p className="text-navy-500">Browse our courses and start building a lifetime skill.</p>
          <Link href="/courses" className="btn-primary btn-lg mt-2">Explore Courses</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-12">
      <h1 className="mb-8 font-display text-3xl font-black text-navy-900 dark:text-white">Shopping Cart</h1>
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {cart.items.map((item) => (
            <div key={item.id} className="card flex items-center gap-4 p-4">
              <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-xl bg-navy-100">
                {item.image && <Image src={item.image} alt={item.title} fill className="object-cover" />}
              </div>
              <div className="min-w-0 flex-1">
                <Link href={`/courses/${item.slug}`} className="font-semibold text-navy-900 hover:text-sky-dark dark:text-white">
                  {item.title}
                </Link>
                <p className="mt-1 font-display font-bold text-navy-900 dark:text-white">{formatCurrency(item.price)}</p>
              </div>
              <button onClick={() => cart.remove(item.id)} className="rounded-lg p-2 text-navy-400 hover:bg-rose-50 hover:text-rose-500" aria-label="Remove">
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="card p-5">
            <p className="mb-3 flex items-center gap-2 text-sm font-bold text-navy-900 dark:text-white">
              <Tag className="h-4 w-4" /> Coupon code
            </p>
            <div className="flex gap-2">
              <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="WELCOME10" className="input" />
              <button onClick={applyCoupon} className="btn-navy btn-md shrink-0">Apply</button>
            </div>
            <p className="mt-2 text-xs text-navy-400">Try: WELCOME10, SMP2026, FUNDED25</p>
          </div>

          <div className="card p-5">
            <p className="mb-4 font-display text-lg font-bold text-navy-900 dark:text-white">Order Summary</p>
            <div className="space-y-2 text-sm">
              <Row label={`Subtotal (${cart.items.length})`} value={formatCurrency(subtotal)} />
              {discount > 0 && <Row label={`Discount (${coupon?.code})`} value={`− ${formatCurrency(discount)}`} accent />}
              <div className="my-2 border-t border-navy-100 dark:border-navy-700" />
              <div className="flex items-center justify-between font-display text-lg font-black text-navy-900 dark:text-white">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
            <button onClick={checkout} disabled={loading} className="btn-primary btn-lg mt-4 w-full">
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowRight className="h-5 w-5" />}
              Checkout with IntaSend
            </button>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-navy-400">
              <ShieldCheck className="h-4 w-4 text-emerald-500" /> Secure · M-Pesa, Card & Bank
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-navy-500 dark:text-slate-400">{label}</span>
      <span className={accent ? "font-semibold text-emerald-600" : "text-navy-900 dark:text-white"}>{value}</span>
    </div>
  );
}
