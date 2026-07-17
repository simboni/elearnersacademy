"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const LEVELS = ["Beginner", "Intermediate", "Advanced", "All Levels"];

export function NewCourseForm({ categories }: { categories: { id: string; name: string }[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    description: "",
    categoryId: categories[0]?.id ?? "",
    level: "Beginner",
    price: "0",
    image: "",
    durationLabel: "",
  });

  function set(k: string, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return toast.error("Please add a title");
    setLoading(true);
    const res = await fetch("/api/courses", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (data.ok) {
      toast.success("Course created! Now build your curriculum.");
      router.push(`/instructor/courses/${data.courseId}/edit`);
    } else {
      toast.error(data.error || "Could not create course");
    }
  }

  return (
    <form onSubmit={submit} className="card max-w-2xl space-y-4 p-6">
      <div>
        <label className="label">Course title *</label>
        <input value={form.title} onChange={(e) => set("title", e.target.value)} className="input" placeholder="e.g. Advanced Forex Scalping" />
      </div>
      <div>
        <label className="label">Subtitle</label>
        <input value={form.subtitle} onChange={(e) => set("subtitle", e.target.value)} className="input" placeholder="A short, punchy tagline" />
      </div>
      <div>
        <label className="label">Description</label>
        <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={4} className="input resize-none" placeholder="What will students learn and achieve?" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Category</label>
          <select value={form.categoryId} onChange={(e) => set("categoryId", e.target.value)} className="input">
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Level</label>
          <select value={form.level} onChange={(e) => set("level", e.target.value)} className="input">
            {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Price (Ksh)</label>
          <input type="number" min="0" value={form.price} onChange={(e) => set("price", e.target.value)} className="input" />
        </div>
        <div>
          <label className="label">Duration label</label>
          <input value={form.durationLabel} onChange={(e) => set("durationLabel", e.target.value)} className="input" placeholder="e.g. 2 Weeks" />
        </div>
      </div>
      <div>
        <label className="label">Cover image URL</label>
        <input value={form.image} onChange={(e) => set("image", e.target.value)} className="input" placeholder="/courses/smp-bootcamp.jpg or https://…" />
      </div>
      <button disabled={loading} className="btn-primary btn-lg">
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        Create & Build Curriculum
      </button>
    </form>
  );
}
