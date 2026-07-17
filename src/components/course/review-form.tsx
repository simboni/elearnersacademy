"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { StarInput } from "@/components/ui/star-rating";

export function ReviewForm({
  courseId,
  existing,
}: {
  courseId: string;
  existing?: { rating: number; comment: string | null } | null;
}) {
  const router = useRouter();
  const [rating, setRating] = useState(existing?.rating ?? 0);
  const [comment, setComment] = useState(existing?.comment ?? "");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!rating) return toast.error("Please select a rating");
    setLoading(true);
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ courseId, rating, comment }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.ok) {
      toast.success("Thanks for your review!");
      router.refresh();
    } else {
      toast.error(data.error || "Could not submit review");
    }
  }

  return (
    <form onSubmit={submit} className="card p-5">
      <p className="mb-3 font-bold text-navy-900 dark:text-white">
        {existing ? "Update your review" : "Leave a review"}
      </p>
      <StarInput value={rating} onChange={setRating} />
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        placeholder="Share what you learned…"
        className="input mt-3 resize-none"
      />
      <button disabled={loading} className="btn-primary btn-md mt-3">
        {loading ? "Submitting…" : existing ? "Update Review" : "Submit Review"}
      </button>
    </form>
  );
}
