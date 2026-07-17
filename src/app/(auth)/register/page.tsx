"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { User, Mail, Lock, Loader2, GraduationCap, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"STUDENT" | "INSTRUCTOR">("STUDENT");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, email, password, role }),
    });
    const data = await res.json();
    if (!data.ok) {
      setLoading(false);
      toast.error(data.error || "Could not create account");
      return;
    }
    await signIn("credentials", { email, password, redirect: false });
    toast.success("Account created! Welcome 🎉");
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <>
      <h1 className="font-display text-3xl font-black text-navy-900 dark:text-white">Create your account</h1>
      <p className="mt-2 text-navy-500 dark:text-slate-400">Start learning free — no card required.</p>

      <form onSubmit={submit} className="mt-8 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setRole("STUDENT")}
            className={cn("flex flex-col items-center gap-1 rounded-xl border-2 p-4 transition", role === "STUDENT" ? "border-sky bg-sky/5" : "border-navy-100 dark:border-navy-700")}
          >
            <BookOpen className={cn("h-6 w-6", role === "STUDENT" ? "text-sky-dark" : "text-navy-400")} />
            <span className="text-sm font-semibold text-navy-900 dark:text-white">Student</span>
          </button>
          <button
            type="button"
            onClick={() => setRole("INSTRUCTOR")}
            className={cn("flex flex-col items-center gap-1 rounded-xl border-2 p-4 transition", role === "INSTRUCTOR" ? "border-sky bg-sky/5" : "border-navy-100 dark:border-navy-700")}
          >
            <GraduationCap className={cn("h-6 w-6", role === "INSTRUCTOR" ? "text-sky-dark" : "text-navy-400")} />
            <span className="text-sm font-semibold text-navy-900 dark:text-white">Instructor</span>
          </button>
        </div>

        <div>
          <label className="label">Full name</label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-300" />
            <input required value={name} onChange={(e) => setName(e.target.value)} className="input pl-10" placeholder="Jane Doe" />
          </div>
        </div>
        <div>
          <label className="label">Email</label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-300" />
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input pl-10" placeholder="you@example.com" />
          </div>
        </div>
        <div>
          <label className="label">Password</label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-300" />
            <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="input pl-10" placeholder="At least 6 characters" />
          </div>
        </div>
        <button disabled={loading} className="btn-primary btn-lg w-full">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Create free account
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-navy-500 dark:text-slate-400">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-sky-dark hover:underline">Log in</Link>
      </p>
    </>
  );
}
