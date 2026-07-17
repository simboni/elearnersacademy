"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Plus, Trash2, GripVertical, PlayCircle, FileText, HelpCircle, Eye,
  Save, Rocket, ExternalLink, ChevronDown, Loader2,
} from "lucide-react";
import { cn, formatDuration } from "@/lib/utils";

type Lesson = { id: string; title: string; type: string; durationSec: number; isPreview: boolean };
type Section = { id: string; title: string; lessons: Lesson[] };
type Course = {
  id: string; title: string; slug: string; subtitle: string; description: string;
  categoryId: string; level: string; price: number; discountPrice: number | null;
  image: string; durationLabel: string; status: string; outcomes: string[]; sections: Section[];
};

const TYPE_ICON: Record<string, React.ElementType> = { VIDEO: PlayCircle, ARTICLE: FileText, QUIZ: HelpCircle };

export function CourseBuilder({ course, categories }: { course: Course; categories: { id: string; name: string }[] }) {
  const router = useRouter();
  const [meta, setMeta] = useState(course);
  const [sections, setSections] = useState<Section[]>(course.sections);
  const [saving, setSaving] = useState(false);
  const [newLesson, setNewLesson] = useState<Record<string, { title: string; type: string; duration: string; preview: boolean }>>({});

  function setField(k: keyof Course, v: unknown) {
    setMeta((m) => ({ ...m, [k]: v }));
  }

  async function saveMeta() {
    setSaving(true);
    const res = await fetch("/api/courses", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        id: meta.id, title: meta.title, subtitle: meta.subtitle, description: meta.description,
        categoryId: meta.categoryId, level: meta.level, price: meta.price, discountPrice: meta.discountPrice,
        image: meta.image, durationLabel: meta.durationLabel,
      }),
    });
    setSaving(false);
    if ((await res.json()).ok) toast.success("Saved");
    else toast.error("Could not save");
  }

  async function togglePublish() {
    const next = meta.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    const res = await fetch("/api/courses", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id: meta.id, status: next }),
    });
    if ((await res.json()).ok) {
      setField("status", next);
      toast.success(next === "PUBLISHED" ? "Course published! 🚀" : "Moved to draft");
    }
  }

  async function addSection() {
    const res = await fetch("/api/sections", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ courseId: meta.id, title: "New Section" }),
    });
    const data = await res.json();
    if (data.ok) setSections((s) => [...s, { ...data.section, lessons: [] }]);
  }
  async function deleteSection(id: string) {
    await fetch("/api/sections", { method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify({ id }) });
    setSections((s) => s.filter((x) => x.id !== id));
  }

  async function addLesson(sectionId: string) {
    const nl = newLesson[sectionId] ?? { title: "", type: "VIDEO", duration: "5", preview: false };
    if (!nl.title.trim()) return toast.error("Lesson title required");
    const res = await fetch("/api/lessons", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ sectionId, title: nl.title, type: nl.type, durationSec: Number(nl.duration) * 60, isPreview: nl.preview }),
    });
    const data = await res.json();
    if (data.ok) {
      setSections((s) => s.map((sec) => (sec.id === sectionId ? { ...sec, lessons: [...sec.lessons, data.lesson] } : sec)));
      setNewLesson((n) => ({ ...n, [sectionId]: { title: "", type: "VIDEO", duration: "5", preview: false } }));
    }
  }
  async function deleteLesson(sectionId: string, id: string) {
    await fetch("/api/lessons", { method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify({ id }) });
    setSections((s) => s.map((sec) => (sec.id === sectionId ? { ...sec, lessons: sec.lessons.filter((l) => l.id !== id) } : sec)));
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="eyebrow">Course Builder</p>
          <h1 className="section-title">{meta.title}</h1>
          <span className={cn("mt-2 inline-block", meta.status === "PUBLISHED" ? "badge-green" : "badge-navy")}>
            {meta.status}
          </span>
        </div>
        <div className="flex gap-2">
          <Link href={`/courses/${meta.slug}`} target="_blank" className="btn-outline btn-md">
            <ExternalLink className="h-4 w-4" /> Preview
          </Link>
          <button onClick={togglePublish} className={meta.status === "PUBLISHED" ? "btn-navy btn-md" : "btn-primary btn-md"}>
            <Rocket className="h-4 w-4" /> {meta.status === "PUBLISHED" ? "Unpublish" : "Publish"}
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_minmax(0,380px)]">
        {/* Curriculum */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-navy-900 dark:text-white">Curriculum</h2>
            <button onClick={addSection} className="btn-outline btn-sm">
              <Plus className="h-4 w-4" /> Add Section
            </button>
          </div>

          {sections.length === 0 && (
            <div className="card p-8 text-center text-sm text-navy-400">
              No sections yet. Add your first section to start building.
            </div>
          )}

          <div className="space-y-4">
            {sections.map((sec, i) => (
              <div key={sec.id} className="card overflow-hidden">
                <div className="flex items-center gap-2 border-b border-navy-100 bg-navy-50 px-4 py-3 dark:border-navy-700 dark:bg-navy-800/60">
                  <GripVertical className="h-4 w-4 text-navy-300" />
                  <span className="text-xs font-bold uppercase tracking-wide text-navy-400">Section {i + 1}</span>
                  <span className="font-semibold text-navy-900 dark:text-white">{sec.title}</span>
                  <button onClick={() => deleteSection(sec.id)} className="ml-auto rounded p-1.5 text-navy-300 hover:bg-rose-50 hover:text-rose-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <ul className="divide-y divide-navy-100 dark:divide-navy-700">
                  {sec.lessons.map((l) => {
                    const Icon = TYPE_ICON[l.type] ?? PlayCircle;
                    return (
                      <li key={l.id} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                        <Icon className="h-4 w-4 text-sky-dark" />
                        <span className="text-navy-700 dark:text-slate-200">{l.title}</span>
                        {l.isPreview && <span className="badge-sky gap-1 !py-0 text-[10px]"><Eye className="h-3 w-3" /> Preview</span>}
                        <span className="ml-auto text-xs text-navy-400">
                          {l.type === "QUIZ" ? "Quiz" : formatDuration(l.durationSec)}
                        </span>
                        <button onClick={() => deleteLesson(sec.id, l.id)} className="rounded p-1 text-navy-300 hover:text-rose-500">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </li>
                    );
                  })}
                </ul>

                {/* add lesson */}
                <div className="flex flex-wrap items-center gap-2 border-t border-navy-100 p-3 dark:border-navy-700">
                  <input
                    placeholder="Lesson title"
                    value={newLesson[sec.id]?.title ?? ""}
                    onChange={(e) => setNewLesson((n) => ({ ...n, [sec.id]: { ...(n[sec.id] ?? { type: "VIDEO", duration: "5", preview: false }), title: e.target.value } }))}
                    className="input flex-1 py-2"
                  />
                  <select
                    value={newLesson[sec.id]?.type ?? "VIDEO"}
                    onChange={(e) => setNewLesson((n) => ({ ...n, [sec.id]: { ...(n[sec.id] ?? { title: "", duration: "5", preview: false }), type: e.target.value } }))}
                    className="input w-28 py-2"
                  >
                    <option value="VIDEO">Video</option>
                    <option value="ARTICLE">Article</option>
                    <option value="QUIZ">Quiz</option>
                  </select>
                  <input
                    type="number" min="1" placeholder="min"
                    value={newLesson[sec.id]?.duration ?? "5"}
                    onChange={(e) => setNewLesson((n) => ({ ...n, [sec.id]: { ...(n[sec.id] ?? { title: "", type: "VIDEO", preview: false }), duration: e.target.value } }))}
                    className="input w-20 py-2"
                  />
                  <button onClick={() => addLesson(sec.id)} className="btn-primary btn-sm">
                    <Plus className="h-4 w-4" /> Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Meta panel */}
        <div className="space-y-4">
          <div className="card space-y-4 p-5">
            <h2 className="font-display text-lg font-bold text-navy-900 dark:text-white">Course details</h2>
            <div>
              <label className="label">Title</label>
              <input value={meta.title} onChange={(e) => setField("title", e.target.value)} className="input" />
            </div>
            <div>
              <label className="label">Subtitle</label>
              <input value={meta.subtitle} onChange={(e) => setField("subtitle", e.target.value)} className="input" />
            </div>
            <div>
              <label className="label">Description</label>
              <textarea value={meta.description} onChange={(e) => setField("description", e.target.value)} rows={4} className="input resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Category</label>
                <select value={meta.categoryId} onChange={(e) => setField("categoryId", e.target.value)} className="input">
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Level</label>
                <select value={meta.level} onChange={(e) => setField("level", e.target.value)} className="input">
                  {["Beginner", "Intermediate", "Advanced", "All Levels"].map((l) => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Price (Ksh)</label>
                <input type="number" min="0" value={meta.price} onChange={(e) => setField("price", Number(e.target.value))} className="input" />
              </div>
              <div>
                <label className="label">Duration</label>
                <input value={meta.durationLabel} onChange={(e) => setField("durationLabel", e.target.value)} className="input" />
              </div>
            </div>
            <div>
              <label className="label">Cover image URL</label>
              <input value={meta.image} onChange={(e) => setField("image", e.target.value)} className="input" />
            </div>
            <button onClick={saveMeta} disabled={saving} className="btn-primary btn-md w-full">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
