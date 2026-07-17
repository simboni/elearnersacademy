"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function WishlistButton({
  courseId,
  initial,
  floating = false,
  withLabel = false,
}: {
  courseId: string;
  initial: boolean;
  floating?: boolean;
  withLabel?: boolean;
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const [on, setOn] = useState(initial);
  const [loading, setLoading] = useState(false);

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!session) {
      router.push("/login");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/wishlist", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ courseId }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.ok) {
      setOn(data.wishlisted);
      toast.success(data.wishlisted ? "Added to wishlist" : "Removed from wishlist");
    }
  }

  if (floating) {
    return (
      <button
        onClick={toggle}
        disabled={loading}
        aria-label="Toggle wishlist"
        className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow backdrop-blur transition hover:scale-110"
      >
        <Heart className={cn("h-4 w-4", on ? "fill-rose-500 text-rose-500" : "text-navy-500")} />
      </button>
    );
  }

  return (
    <button onClick={toggle} disabled={loading} className="btn-outline btn-md w-full">
      <Heart className={cn("h-4 w-4", on && "fill-rose-500 text-rose-500")} />
      {withLabel && (on ? "Wishlisted" : "Add to Wishlist")}
    </button>
  );
}
