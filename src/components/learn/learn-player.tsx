"use client";

import { useState, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  X, CheckCircle2, Circle, ChevronLeft, ChevronRight, PlayCircle, FileText,
  HelpCircle, ChevronDown, StickyNote, MessageSquare, Megaphone, Trash2,
  Check, Sparkles, BookOpen, Menu,
} from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { Avatar } from "@/components/ui/avatar";
import { AiTutorWidget } from "@/components/ai/ai-tutor-widget";
import { QuizRunner } from "./quiz-runner";
import { formatDuration, relativeTime, cn } from "@/lib/utils";

type Lesson = {
  id: string; title: string; type: string; durationSec: number;
  contentUrl: string | null; content: string | null; completed: boolean;
  quiz: { id: string; title: string; passingScore: number; questions: { id: string; type: string; prompt: string; options: { id: string; text: string }[] }[] } | null;
};
type Section = { id: string; title: string; lessons: Lesson[] };
type Note = { id: string; lessonId: string; body: string; createdAt: string };
type Thread = { id: string; title: string; body: string; pinned: boolean; resolved: boolean; author: string; authorImage: string | null; replies: number; createdAt: string };

const TYPE_ICON: Record<string, React.ElementType> = { VIDEO: PlayCircle, ARTICLE: FileText, QUIZ: HelpCircle };

export function LearnPlayer({
  course, sections: initialSections, startLessonId, initialNotes, threads, initialProgress,
}: {
  course: {
    id: string; title: string; slug: string;
    instructor: { id: string; name: string; image: string | null };
    announcements: { id: string; title: string; body: string; createdAt: string }[];
  };
  sections: Section[];
  startLessonId?: string;
  initialNotes: Note[];
  threads: Thread[];
  initialProgress: number;
}) {
  const router = useRouter();
  const [sections, setSections] = useState(initialSections);
  const [currentId, setCurrentId] = useState(startLessonId);
  const [notes, setNotes] = useState(initialNotes);
  const [tab, setTab] = useState<"overview" | "notes" | "qa" | "announcements">("overview");
  const [open, setOpen] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    initialSections.forEach((s) => { if (s.lessons.some((l) => l.id === startLessonId)) map[s.id] = true; });
    return map;
  });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [noteText, setNoteText] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);

  const allLessons = useMemo(() => sections.flatMap((s) => s.lessons), [sections]);
  const current = allLessons.find((l) => l.id === currentId) ?? allLessons[0];
  const currentIndex = allLessons.findIndex((l) => l.id === current?.id);
  const completedCount = allLessons.filter((l) => l.completed).length;
  const progressPct = Math.round((completedCount / (allLessons.length || 1)) * 100);
  const lessonNotes = notes.filter((n) => n.lessonId === current?.id);

  function selectLesson(id: string) {
    setCurrentId(id);
    setTab("overview");
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function markComplete(lessonId: string, completed = true) {
    setSections((prev) =>
      prev.map((s) => ({ ...s, lessons: s.lessons.map((l) => (l.id === lessonId ? { ...l, completed } : l)) }))
    );
    const res = await fetch("/api/progress", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ lessonId, completed }),
    });
    const data = await res.json();
    if (data.progress?.pct >= 100) {
      toast.success("Course complete! 🎓 Claim your certificate.");
    }
    router.refresh();
  }

  function goNext() {
    if (current && !current.completed && current.type !== "QUIZ") markComplete(current.id, true);
    const next = allLessons[currentIndex + 1];
    if (next) selectLesson(next.id);
    else toast.success("You've reached the end of the course! 🎉");
  }
  function goPrev() {
    const prev = allLessons[currentIndex - 1];
    if (prev) selectLesson(prev.id);
  }

  async function addNote() {
    if (!noteText.trim() || !current) return;
    const ts = Math.floor(videoRef.current?.currentTime ?? 0);
    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ lessonId: current.id, body: noteText, timestampSec: ts }),
    });
    const data = await res.json();
    if (data.ok) {
      setNotes((n) => [{ id: data.note.id, lessonId: current.id, body: noteText, createdAt: new Date().toISOString() }, ...n]);
      setNoteText("");
      toast.success("Note saved");
    }
  }
  async function deleteNote(id: string) {
    await fetch("/api/notes", { method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify({ id }) });
    setNotes((n) => n.filter((x) => x.id !== id));
  }

  return (
    <div className="flex h-screen flex-col bg-slate-50 dark:bg-navy-950">
      {/* Top bar */}
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-navy-100 bg-white px-4 dark:border-navy-800 dark:bg-navy-900">
        <Logo />
        <div className="ml-2 hidden min-w-0 md:block">
          <p className="truncate text-sm font-semibold text-navy-900 dark:text-white">{course.title}</p>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <div className="hidden items-center gap-2 sm:flex">
            <div className="h-2 w-32 overflow-hidden rounded-full bg-navy-100 dark:bg-navy-700">
              <div className="h-full rounded-full bg-gradient-to-r from-sky to-gold-400 transition-all" style={{ width: `${progressPct}%` }} />
            </div>
            <span className="text-xs font-semibold text-navy-500 dark:text-slate-400">{progressPct}%</span>
          </div>
          {progressPct >= 100 && (
            <Link href="/dashboard/certificates" className="btn-primary btn-sm">Get Certificate</Link>
          )}
          <button onClick={() => setSidebarOpen((o) => !o)} className="rounded-lg p-2 text-navy-500 hover:bg-navy-50 lg:hidden dark:hover:bg-navy-800">
            <Menu className="h-5 w-5" />
          </button>
          <Link href={`/courses/${course.slug}`} className="rounded-lg p-2 text-navy-500 hover:bg-navy-50 dark:hover:bg-navy-800" aria-label="Exit">
            <X className="h-5 w-5" />
          </Link>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* Main */}
        <div className="scrollbar-thin flex-1 overflow-y-auto">
          {current && (
            <div className="mx-auto max-w-4xl px-4 py-6 lg:px-8">
              {/* content */}
              {current.type === "QUIZ" && current.quiz ? (
                <QuizRunner quiz={current.quiz} onPassed={() => markComplete(current.id, true)} />
              ) : current.type === "ARTICLE" ? (
                <article>
                  <h1 className="mb-4 font-display text-2xl font-black text-navy-900 dark:text-white">{current.title}</h1>
                  <div className="prose-content" dangerouslySetInnerHTML={{ __html: current.content ?? "<p>No content.</p>" }} />
                </article>
              ) : (
                <>
                  <div className="overflow-hidden rounded-2xl bg-black shadow-card">
                    <video
                      ref={videoRef}
                      key={current.id}
                      controls
                      className="aspect-video w-full"
                      poster="/brand/hero.png"
                      onEnded={() => !current.completed && markComplete(current.id, true)}
                    >
                      {current.contentUrl && <source src={current.contentUrl} type="video/mp4" />}
                    </video>
                  </div>
                  <h1 className="mt-5 font-display text-2xl font-black text-navy-900 dark:text-white">{current.title}</h1>
                </>
              )}

              {/* action bar */}
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-y border-navy-100 py-4 dark:border-navy-800">
                <button onClick={goPrev} disabled={currentIndex === 0} className="btn-ghost btn-md">
                  <ChevronLeft className="h-4 w-4" /> Previous
                </button>
                <div className="flex items-center gap-2">
                  {current.type !== "QUIZ" && (
                    <button
                      onClick={() => markComplete(current.id, !current.completed)}
                      className={cn("btn-md", current.completed ? "btn-outline" : "btn-navy")}
                    >
                      {current.completed ? <><Check className="h-4 w-4" /> Completed</> : "Mark Complete"}
                    </button>
                  )}
                  <button onClick={goNext} className="btn-primary btn-md">
                    Next <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* tabs */}
              <div className="mt-6">
                <div className="flex gap-1 border-b border-navy-100 dark:border-navy-800">
                  <Tab active={tab === "overview"} onClick={() => setTab("overview")} icon={BookOpen} label="Overview" />
                  <Tab active={tab === "notes"} onClick={() => setTab("notes")} icon={StickyNote} label={`Notes (${notes.length})`} />
                  <Tab active={tab === "qa"} onClick={() => setTab("qa")} icon={MessageSquare} label={`Q&A (${threads.length})`} />
                  <Tab active={tab === "announcements"} onClick={() => setTab("announcements")} icon={Megaphone} label="News" />
                </div>

                <div className="py-6">
                  {tab === "overview" && (
                    <div className="space-y-4">
                      <div className="card flex items-center gap-4 p-5">
                        <Avatar name={course.instructor.name} src={course.instructor.image} size={48} />
                        <div>
                          <p className="text-sm text-navy-400">Instructor</p>
                          <p className="font-semibold text-navy-900 dark:text-white">{course.instructor.name}</p>
                        </div>
                        <span className="ml-auto flex items-center gap-1.5 rounded-full bg-sky/10 px-3 py-1.5 text-xs font-semibold text-sky-dark">
                          <Sparkles className="h-3.5 w-3.5" /> Ask the AI tutor →
                        </span>
                      </div>
                      <p className="text-sm text-navy-500 dark:text-slate-400">
                        Lesson {currentIndex + 1} of {allLessons.length} ·{" "}
                        {current.type === "QUIZ" ? "Quiz" : formatDuration(current.durationSec)}. Use the AI Tutor button (bottom-right) any time you're stuck.
                      </p>
                    </div>
                  )}

                  {tab === "notes" && (
                    <div className="space-y-4">
                      <div className="card p-4">
                        <textarea
                          value={noteText}
                          onChange={(e) => setNoteText(e.target.value)}
                          rows={2}
                          placeholder="Take a note for this lesson…"
                          className="input resize-none"
                        />
                        <button onClick={addNote} className="btn-primary btn-sm mt-2">Save note</button>
                      </div>
                      {lessonNotes.length === 0 && <p className="text-sm text-navy-400">No notes for this lesson yet.</p>}
                      {lessonNotes.map((n) => (
                        <div key={n.id} className="card flex items-start gap-3 p-4">
                          <StickyNote className="mt-0.5 h-4 w-4 shrink-0 text-gold-500" />
                          <p className="flex-1 text-sm text-navy-700 dark:text-slate-200">{n.body}</p>
                          <button onClick={() => deleteNote(n.id)} className="text-navy-300 hover:text-rose-500">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {tab === "qa" && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-navy-500 dark:text-slate-400">Course discussion</p>
                        <Link href={`/community?course=${course.slug}`} className="btn-outline btn-sm">Open community</Link>
                      </div>
                      {threads.length === 0 && <p className="text-sm text-navy-400">No questions yet. Be the first to ask!</p>}
                      {threads.map((t) => (
                        <Link key={t.id} href={`/community/${t.id}`} className="card card-hover block p-4">
                          <div className="flex items-center gap-2">
                            {t.resolved && <span className="badge-green text-[10px]">Resolved</span>}
                            {t.pinned && <span className="badge-gold text-[10px]">Pinned</span>}
                            <p className="font-semibold text-navy-900 dark:text-white">{t.title}</p>
                          </div>
                          <p className="mt-1 line-clamp-1 text-sm text-navy-500 dark:text-slate-400">{t.body}</p>
                          <p className="mt-2 text-xs text-navy-400">{t.author} · {t.replies} replies · {relativeTime(t.createdAt)}</p>
                        </Link>
                      ))}
                    </div>
                  )}

                  {tab === "announcements" && (
                    <div className="space-y-3">
                      {course.announcements.length === 0 && <p className="text-sm text-navy-400">No announcements yet.</p>}
                      {course.announcements.map((a) => (
                        <div key={a.id} className="card p-4">
                          <p className="font-semibold text-navy-900 dark:text-white">{a.title}</p>
                          <p className="mt-1 text-sm text-navy-600 dark:text-slate-300">{a.body}</p>
                          <p className="mt-2 text-xs text-navy-400">{relativeTime(a.createdAt)}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar: curriculum */}
        <aside
          className={cn(
            "w-80 shrink-0 overflow-y-auto border-l border-navy-100 bg-white transition-all dark:border-navy-800 dark:bg-navy-900",
            "scrollbar-thin",
            sidebarOpen ? "block" : "hidden",
            "fixed inset-y-0 right-0 top-14 z-30 lg:static lg:top-0 lg:block"
          )}
        >
          <div className="border-b border-navy-100 p-4 dark:border-navy-800">
            <p className="font-display font-bold text-navy-900 dark:text-white">Course content</p>
            <p className="mt-1 text-xs text-navy-400">{completedCount} / {allLessons.length} completed · {progressPct}%</p>
          </div>
          {sections.map((s) => {
            const isOpen = open[s.id] ?? false;
            const secDone = s.lessons.filter((l) => l.completed).length;
            return (
              <div key={s.id} className="border-b border-navy-100 dark:border-navy-800">
                <button
                  onClick={() => setOpen((o) => ({ ...o, [s.id]: !o[s.id] }))}
                  className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left hover:bg-navy-50 dark:hover:bg-navy-800"
                >
                  <span className="text-sm font-semibold text-navy-900 dark:text-white">{s.title}</span>
                  <span className="flex items-center gap-2 text-xs text-navy-400">
                    {secDone}/{s.lessons.length}
                    <ChevronDown className={cn("h-4 w-4 transition", isOpen && "rotate-180")} />
                  </span>
                </button>
                {isOpen && (
                  <ul>
                    {s.lessons.map((l) => {
                      const Icon = TYPE_ICON[l.type] ?? PlayCircle;
                      const active = l.id === current?.id;
                      return (
                        <li key={l.id}>
                          <button
                            onClick={() => selectLesson(l.id)}
                            className={cn(
                              "flex w-full items-start gap-3 px-4 py-3 pl-5 text-left text-sm transition",
                              active ? "bg-sky/10" : "hover:bg-navy-50 dark:hover:bg-navy-800"
                            )}
                          >
                            {l.completed ? (
                              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                            ) : (
                              <Circle className="mt-0.5 h-4 w-4 shrink-0 text-navy-300" />
                            )}
                            <span className="flex-1">
                              <span className={cn("block", active ? "font-semibold text-sky-dark" : "text-navy-700 dark:text-slate-300")}>
                                {l.title}
                              </span>
                              <span className="mt-0.5 flex items-center gap-1 text-xs text-navy-400">
                                <Icon className="h-3 w-3" />
                                {l.type === "QUIZ" ? "Quiz" : formatDuration(l.durationSec)}
                              </span>
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </aside>
      </div>

      <AiTutorWidget courseTitle={course.title} />
    </div>
  );
}

function Tab({ active, onClick, icon: Icon, label }: { active: boolean; onClick: () => void; icon: React.ElementType; label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition",
        active ? "border-gold-400 text-navy-900 dark:text-white" : "border-transparent text-navy-400 hover:text-navy-700"
      )}
    >
      <Icon className="h-4 w-4" /> {label}
    </button>
  );
}
