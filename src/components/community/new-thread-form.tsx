"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MessageSquarePlus, Loader2, LogIn, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type CourseOption = { id: string; title: string };

export function NewThreadForm({
  courses,
  isLoggedIn,
  defaultCourseId,
}: {
  courses: CourseOption[];
  isLoggedIn: boolean;
  defaultCourseId?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [courseId, setCourseId] = useState(defaultCourseId ?? courses[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isLoggedIn) {
    return (
      <div className="card p-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-sky/10 text-sky">
          <MessageSquarePlus className="h-6 w-6" />
        </div>
        <h3 className="mt-4 font-display text-lg font-bold text-navy-900 dark:text-white">
          Have a question?
        </h3>
        <p className="mt-1 text-sm text-navy-500 dark:text-slate-400">
          Log in to ask the eLearners community and get answers from instructors.
        </p>
        <Link href="/login" className="btn-primary btn-md mt-4 w-full">
          <LogIn className="h-4 w-4" /> Log in to ask
        </Link>
      </div>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn-primary btn-md w-full"
      >
        <MessageSquarePlus className="h-4 w-4" /> Ask a question
      </button>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!courseId || !title.trim() || !body.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/threads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, title, body }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      toast.success("Question posted!");
      router.push("/community/" + data.threadId);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to post question");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="card space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-bold text-navy-900 dark:text-white">
          Ask a question
        </h3>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg p-1 text-navy-400 hover:bg-navy-50 dark:hover:bg-navy-800"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div>
        <label className="label" htmlFor="nt-course">
          Course
        </label>
        <select
          id="nt-course"
          className="input"
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
        >
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label" htmlFor="nt-title">
          Title
        </label>
        <input
          id="nt-title"
          className="input"
          placeholder="e.g. How do I size my stop loss?"
          value={title}
          maxLength={140}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div>
        <label className="label" htmlFor="nt-body">
          Details
        </label>
        <textarea
          id="nt-body"
          className="input min-h-[120px] resize-y"
          placeholder="Share the context so instructors can help you better…"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
      </div>

      <button type="submit" disabled={loading} className={cn("btn-primary btn-md w-full")}>
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Posting…
          </>
        ) : (
          <>
            <MessageSquarePlus className="h-4 w-4" /> Post question
          </>
        )}
      </button>
    </form>
  );
}
