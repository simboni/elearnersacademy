"use client";

import { useState } from "react";
import { ChevronDown, PlayCircle, FileText, HelpCircle, Lock, Eye } from "lucide-react";
import { formatDuration, cn } from "@/lib/utils";

type Lesson = { id: string; title: string; type: string; durationSec: number; isPreview: boolean };
type Section = { id: string; title: string; lessons: Lesson[] };

const ICONS: Record<string, React.ElementType> = {
  VIDEO: PlayCircle,
  ARTICLE: FileText,
  QUIZ: HelpCircle,
  ASSIGNMENT: FileText,
  LIVE: PlayCircle,
};

export function Curriculum({ sections, enrolled }: { sections: Section[]; enrolled: boolean }) {
  const [open, setOpen] = useState<Record<string, boolean>>({ [sections[0]?.id]: true });
  const totalLessons = sections.reduce((s, sec) => s + sec.lessons.length, 0);

  return (
    <div>
      <p className="mb-4 text-sm text-navy-500 dark:text-slate-400">
        {sections.length} sections · {totalLessons} lessons
      </p>
      <div className="divide-y divide-navy-100 overflow-hidden rounded-2xl border border-navy-100 dark:divide-navy-700 dark:border-navy-700">
        {sections.map((sec) => {
          const isOpen = open[sec.id];
          const secDuration = sec.lessons.reduce((s, l) => s + l.durationSec, 0);
          return (
            <div key={sec.id}>
              <button
                onClick={() => setOpen((o) => ({ ...o, [sec.id]: !o[sec.id] }))}
                className="flex w-full items-center justify-between gap-3 bg-navy-50 px-5 py-4 text-left transition hover:bg-navy-100 dark:bg-navy-800/60 dark:hover:bg-navy-800"
              >
                <span className="flex items-center gap-3">
                  <ChevronDown className={cn("h-5 w-5 text-navy-400 transition", isOpen && "rotate-180")} />
                  <span className="font-semibold text-navy-900 dark:text-white">{sec.title}</span>
                </span>
                <span className="shrink-0 text-xs text-navy-400">
                  {sec.lessons.length} lessons · {formatDuration(secDuration)}
                </span>
              </button>
              {isOpen && (
                <ul className="bg-white dark:bg-navy-900">
                  {sec.lessons.map((l) => {
                    const Icon = ICONS[l.type] ?? PlayCircle;
                    const canView = enrolled || l.isPreview;
                    return (
                      <li
                        key={l.id}
                        className="flex items-center justify-between gap-3 px-5 py-3 pl-12 text-sm hover:bg-navy-50/60 dark:hover:bg-navy-800/40"
                      >
                        <span className="flex items-center gap-3 text-navy-700 dark:text-slate-300">
                          <Icon className="h-4 w-4 shrink-0 text-sky-dark" />
                          <span>{l.title}</span>
                          {l.isPreview && (
                            <span className="badge-sky gap-1 !py-0 text-[10px]">
                              <Eye className="h-3 w-3" /> Preview
                            </span>
                          )}
                        </span>
                        <span className="flex shrink-0 items-center gap-2 text-xs text-navy-400">
                          {!canView && <Lock className="h-3.5 w-3.5" />}
                          {l.type === "QUIZ" ? "Quiz" : formatDuration(l.durationSec)}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
