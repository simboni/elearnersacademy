"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { Mail, Lock, Loader2 } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const callbackUrl = search.get("callbackUrl") || "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      toast.error("Invalid email or password");
    } else {
      toast.success("Welcome back!");
      router.push(callbackUrl);
      router.refresh();
    }
  }

  function demo(role: "student" | "instructor" | "admin") {
    const creds = {
      student: "student@example.com",
      instructor: "peter@elearnersacademy.co.ke",
      admin: "admin@elearnersacademy.co.ke",
    };
    setEmail(creds[role]);
    setPassword("password123");
  }

  return (
    <>
      <h1 className="font-display text-3xl font-black text-navy-900 dark:text-white">Welcome back</h1>
      <p className="mt-2 text-navy-500 dark:text-slate-400">Log in to continue your learning journey.</p>

      <form onSubmit={submit} className="mt-8 space-y-4">
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
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="input pl-10" placeholder="••••••••" />
          </div>
        </div>
        <button disabled={loading} className="btn-primary btn-lg w-full">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Log in
        </button>
      </form>

      <div className="mt-6 rounded-xl border border-dashed border-navy-200 p-4 dark:border-navy-700">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-navy-400">Try a demo account</p>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => demo("student")} className="btn-outline btn-sm">Student</button>
          <button onClick={() => demo("instructor")} className="btn-outline btn-sm">Instructor</button>
          <button onClick={() => demo("admin")} className="btn-outline btn-sm">Admin</button>
        </div>
        <p className="mt-2 text-xs text-navy-400">Password: password123</p>
      </div>

      <p className="mt-6 text-center text-sm text-navy-500 dark:text-slate-400">
        Don't have an account?{" "}
        <Link href="/register" className="font-semibold text-sky-dark hover:underline">Sign up free</Link>
      </p>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
