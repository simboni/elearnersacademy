"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Send, Loader2, LogIn } from "lucide-react";
import { toast } from "sonner";

export function ReplyForm({
  threadId,
  isLoggedIn,
}: {
  threadId: string;
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isLoggedIn) {
    return (
      <div className="card flex flex-col items-center gap-3 p-6 text-center sm:flex-row sm:justify-between sm:text-left">
        <p className="text-sm text-navy-600 dark:text-slate-300">
          Join the conversation to share your answer or ask a follow-up.
        </p>
        <Link href="/login" className="btn-primary btn-sm shrink-0">
          <LogIn className="h-4 w-4" /> Log in to reply
        </Link>
      </div>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) {
      toast.error("Write a reply first.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ threadId, body }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      toast.success("Reply posted!");
      setBody("");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to post reply");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="card space-y-3 p-6">
      <label className="label" htmlFor="reply-body">
        Your reply
      </label>
      <textarea
        id="reply-body"
        className="input min-h-[120px] resize-y"
        placeholder="Share your thoughts or an answer…"
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />
      <div className="flex justify-end">
        <button type="submit" disabled={loading} className="btn-primary btn-md">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Posting…
            </>
          ) : (
            <>
              <Send className="h-4 w-4" /> Post reply
            </>
          )}
        </button>
      </div>
    </form>
  );
}
