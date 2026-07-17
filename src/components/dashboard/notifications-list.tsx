"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  Award,
  Megaphone,
  MessageSquare,
  Video,
  CheckCircle2,
  CheckCheck,
} from "lucide-react";
import { toast } from "sonner";
import { cn, relativeTime } from "@/lib/utils";

export type NotificationItem = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  read: boolean;
  createdAt: string;
};

function iconFor(type: string) {
  switch (type) {
    case "achievement":
      return Award;
    case "announcement":
      return Megaphone;
    case "reply":
    case "message":
      return MessageSquare;
    case "live":
      return Video;
    default:
      return Bell;
  }
}

export function NotificationsList({ initial }: { initial: NotificationItem[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [busy, setBusy] = useState(false);
  const unread = items.filter((n) => !n.read).length;

  async function markOne(id: string) {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    try {
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      router.refresh();
    } catch {
      toast.error("Could not update notification");
    }
  }

  async function markAll() {
    if (unread === 0) return;
    setBusy(true);
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      if (!res.ok) throw new Error();
      toast.success("All notifications marked as read");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-navy-500 dark:text-slate-400">
          {unread > 0 ? (
            <span className="font-semibold text-navy-900 dark:text-white">{unread} unread</span>
          ) : (
            "You're all caught up"
          )}
        </p>
        <button
          onClick={markAll}
          disabled={unread === 0 || busy}
          className="btn-outline btn-sm disabled:cursor-not-allowed disabled:opacity-50"
        >
          <CheckCheck className="h-4 w-4" /> Mark all read
        </button>
      </div>

      <div className="card divide-y divide-navy-100 dark:divide-navy-800">
        {items.map((n) => {
          const Icon = iconFor(n.type);
          const inner = (
            <div
              className={cn(
                "flex items-start gap-3 p-4 transition",
                !n.read && "bg-sky/5 dark:bg-navy-800/60"
              )}
            >
              <span
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                  n.read
                    ? "bg-navy-50 text-navy-400 dark:bg-navy-800"
                    : "bg-sky/15 text-sky-dark"
                )}
              >
                <Icon className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p
                    className={cn(
                      "text-sm text-navy-900 dark:text-white",
                      !n.read && "font-semibold"
                    )}
                  >
                    {n.title}
                  </p>
                  {!n.read && (
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-sky" />
                  )}
                </div>
                {n.body && (
                  <p className="mt-0.5 text-sm text-navy-500 dark:text-slate-400">{n.body}</p>
                )}
                <p className="mt-1 text-xs text-navy-400">{relativeTime(n.createdAt)}</p>
              </div>
            </div>
          );

          return (
            <div key={n.id} className="group relative">
              {n.link ? (
                <Link href={n.link} onClick={() => !n.read && markOne(n.id)}>
                  {inner}
                </Link>
              ) : (
                inner
              )}
              {!n.read && (
                <button
                  onClick={() => markOne(n.id)}
                  className="absolute bottom-3 right-3 hidden items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-sky-dark hover:bg-sky/10 group-hover:flex"
                  aria-label="Mark as read"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" /> Mark read
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
