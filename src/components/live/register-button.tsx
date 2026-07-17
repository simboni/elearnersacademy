"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, CalendarPlus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function RegisterButton({
  sessionId,
  initial,
  className,
}: {
  sessionId: string;
  initial: boolean;
  className?: string;
}) {
  const router = useRouter();
  const [registered, setRegistered] = useState(initial);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    try {
      const res = await fetch("/api/live/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      if (data.ok) {
        setRegistered(data.registered);
        toast.success(
          data.registered ? "You're registered — see you live!" : "Registration cancelled"
        );
        router.refresh();
      } else {
        toast.error(data.error ?? "Something went wrong");
      }
    } catch {
      toast.error("Network error — please try again");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={cn(
        registered ? "btn-outline" : "btn-primary",
        "btn-md w-full",
        className
      )}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : registered ? (
        <>
          <Check className="h-4 w-4" /> Registered
        </>
      ) : (
        <>
          <CalendarPlus className="h-4 w-4" /> Register
        </>
      )}
    </button>
  );
}
