"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Avatar } from "@/components/ui/avatar";

export type ProfileValues = {
  name: string;
  headline: string;
  bio: string;
  country: string;
  image: string | null;
  email: string;
};

export function ProfileForm({ initial }: { initial: ProfileValues }) {
  const router = useRouter();
  const [values, setValues] = useState({
    name: initial.name,
    headline: initial.headline,
    bio: initial.bio,
    country: initial.country,
  });
  const [saving, setSaving] = useState(false);

  function update<K extends keyof typeof values>(key: K, val: string) {
    setValues((v) => ({ ...v, [key]: val }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!values.name.trim()) {
      toast.error("Name is required");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error();
      toast.success("Profile updated");
      router.refresh();
    } catch {
      toast.error("Could not save your profile");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Avatar preview */}
      <div className="card flex items-center gap-4 p-5">
        <Avatar name={values.name || initial.name} src={initial.image} size={64} />
        <div className="min-w-0">
          <p className="truncate font-display text-lg font-bold text-navy-900 dark:text-white">
            {values.name || "Your name"}
          </p>
          <p className="truncate text-sm text-navy-500 dark:text-slate-400">
            {values.headline || "Add a headline to describe yourself"}
          </p>
          <p className="truncate text-xs text-navy-400">{initial.email}</p>
        </div>
      </div>

      <div className="card space-y-5 p-5 sm:p-6">
        <div>
          <label htmlFor="name" className="label">
            Full name
          </label>
          <input
            id="name"
            className="input mt-1.5"
            value={values.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="Jane Trader"
            maxLength={80}
          />
        </div>

        <div>
          <label htmlFor="headline" className="label">
            Headline
          </label>
          <input
            id="headline"
            className="input mt-1.5"
            value={values.headline}
            onChange={(e) => update("headline", e.target.value)}
            placeholder="Aspiring day trader · Forex &amp; indices"
            maxLength={120}
          />
          <p className="mt-1 text-xs text-navy-400">
            A short line shown next to your name across the academy.
          </p>
        </div>

        <div>
          <label htmlFor="bio" className="label">
            Bio
          </label>
          <textarea
            id="bio"
            rows={4}
            className="input mt-1.5 resize-y"
            value={values.bio}
            onChange={(e) => update("bio", e.target.value)}
            placeholder="Tell the community about your trading journey, goals and interests."
            maxLength={600}
          />
          <p className="mt-1 text-xs text-navy-400">{values.bio.length}/600</p>
        </div>

        <div>
          <label htmlFor="country" className="label">
            Country
          </label>
          <input
            id="country"
            className="input mt-1.5"
            value={values.country}
            onChange={(e) => update("country", e.target.value)}
            placeholder="Kenya"
            maxLength={60}
          />
        </div>

        <div className="flex justify-end pt-1">
          <button type="submit" disabled={saving} className="btn-primary btn-md disabled:opacity-60">
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </form>
  );
}
