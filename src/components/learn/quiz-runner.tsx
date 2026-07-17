"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, XCircle, RotateCcw, Trophy, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type Question = {
  id: string;
  type: string;
  prompt: string;
  options: { id: string; text: string }[];
};
type Quiz = { id: string; title: string; passingScore: number; questions: Question[] };

type Result = {
  score: number;
  passed: boolean;
  passingScore: number;
  perQuestion: Record<string, { correct: boolean; correctIds: string[] }>;
};

export function QuizRunner({ quiz, onPassed }: { quiz: Quiz; onPassed: () => void }) {
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [result, setResult] = useState<Result | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function toggle(q: Question, optId: string) {
    if (result) return;
    setAnswers((prev) => {
      const current = prev[q.id] ?? [];
      if (q.type === "MULTIPLE") {
        return { ...prev, [q.id]: current.includes(optId) ? current.filter((id) => id !== optId) : [...current, optId] };
      }
      return { ...prev, [q.id]: [optId] };
    });
  }

  async function submit() {
    if (Object.keys(answers).length < quiz.questions.length) {
      toast.error("Please answer all questions");
      return;
    }
    setSubmitting(true);
    const res = await fetch("/api/quiz/submit", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ quizId: quiz.id, answers }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (data.ok) {
      setResult(data);
      if (data.passed) {
        toast.success(`Passed with ${data.score}%! 🎉`);
        onPassed();
      } else {
        toast.error(`Scored ${data.score}%. Try again to pass.`);
      }
    } else {
      toast.error(data.error || "Could not submit");
    }
  }

  function retry() {
    setAnswers({});
    setResult(null);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gold-100 text-gold-600">
          <HelpCircle className="h-6 w-6" />
        </span>
        <div>
          <h2 className="font-display text-xl font-bold text-navy-900 dark:text-white">{quiz.title}</h2>
          <p className="text-sm text-navy-400">
            {quiz.questions.length} questions · Pass mark {quiz.passingScore}%
          </p>
        </div>
      </div>

      {result && (
        <div
          className={cn(
            "mb-6 flex items-center gap-4 rounded-2xl p-5",
            result.passed ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800"
          )}
        >
          {result.passed ? <Trophy className="h-9 w-9" /> : <RotateCcw className="h-9 w-9" />}
          <div>
            <p className="font-display text-2xl font-black">{result.score}%</p>
            <p className="text-sm">
              {result.passed ? "Passed! This lesson is complete." : `You need ${result.passingScore}% to pass. Keep going!`}
            </p>
          </div>
        </div>
      )}

      <div className="space-y-5">
        {quiz.questions.map((q, i) => {
          const given = answers[q.id] ?? [];
          const qResult = result?.perQuestion[q.id];
          return (
            <div key={q.id} className="card p-5">
              <p className="mb-3 flex gap-2 font-semibold text-navy-900 dark:text-white">
                <span className="text-gold-500">{i + 1}.</span> {q.prompt}
                {q.type === "MULTIPLE" && <span className="badge-navy ml-auto shrink-0 text-[10px]">Select all</span>}
              </p>
              <div className="space-y-2">
                {q.options.map((opt) => {
                  const selected = given.includes(opt.id);
                  const isCorrect = qResult?.correctIds.includes(opt.id);
                  const showState = !!result;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => toggle(q, opt.id)}
                      disabled={!!result}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl border-2 px-4 py-3 text-left text-sm transition",
                        !showState && selected && "border-sky bg-sky/5",
                        !showState && !selected && "border-navy-100 hover:border-navy-300 dark:border-navy-700",
                        showState && isCorrect && "border-emerald-400 bg-emerald-50",
                        showState && selected && !isCorrect && "border-rose-400 bg-rose-50",
                        showState && !isCorrect && !selected && "border-navy-100 opacity-60 dark:border-navy-700"
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
                          selected ? "border-sky bg-sky text-white" : "border-navy-300",
                          showState && isCorrect && "border-emerald-500 bg-emerald-500 text-white"
                        )}
                      >
                        {showState && isCorrect && <CheckCircle2 className="h-4 w-4" />}
                        {showState && selected && !isCorrect && <XCircle className="h-4 w-4 text-rose-500" />}
                      </span>
                      <span className="text-navy-700 dark:text-slate-200">{opt.text}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex gap-3">
        {result ? (
          !result.passed && (
            <button onClick={retry} className="btn-primary btn-lg">
              <RotateCcw className="h-5 w-5" /> Retry Quiz
            </button>
          )
        ) : (
          <button onClick={submit} disabled={submitting} className="btn-primary btn-lg">
            {submitting ? "Grading…" : "Submit Answers"}
          </button>
        )}
      </div>
    </div>
  );
}
