"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, X, Send, Bot } from "lucide-react";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "Explain the 1:3 risk-reward",
  "How do I pass a prop firm challenge?",
  "Tips to control trading emotions",
];

export function AiTutorWidget({ courseTitle }: { courseTitle?: string }) {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "Hi! 👋 I'm your eLearners AI Tutor. Ask me anything about trading, risk management, psychology, or your courses.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function send(text: string) {
    if (!text.trim() || loading) return;
    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: text, courseTitle, history: messages.slice(-8) }),
      });
      const data = await res.json();
      if (data.reply) {
        setMessages([...next, { role: "assistant", content: data.reply }]);
      } else {
        setMessages([...next, { role: "assistant", content: data.error || "Please log in to chat with the tutor." }]);
      }
    } catch {
      setMessages([...next, { role: "assistant", content: "Sorry, I had trouble responding. Try again." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-gradient-to-r from-sky to-navy-700 px-4 py-3 font-semibold text-white shadow-glow transition hover:scale-105"
        >
          <Sparkles className="h-5 w-5 text-gold-300" />
          <span className="hidden sm:inline">AI Tutor</span>
        </button>
      )}

      {open && (
        <div className="fixed bottom-5 right-5 z-40 flex h-[32rem] w-[calc(100vw-2.5rem)] max-w-sm flex-col overflow-hidden rounded-3xl border border-navy-100 bg-white shadow-card-hover dark:border-navy-700 dark:bg-navy-800">
          <div className="flex items-center justify-between bg-gradient-to-r from-navy-900 to-navy-700 px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold-400 text-navy-900">
                <Bot className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-bold leading-tight">AI Learning Tutor</p>
                <p className="text-[11px] text-slate-300">{courseTitle ? courseTitle : "Always here to help"}</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="rounded-lg p-1 hover:bg-white/10">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div ref={scrollRef} className="scrollbar-thin flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((m, i) => (
              <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                    m.role === "user"
                      ? "rounded-br-sm bg-sky text-white"
                      : "rounded-bl-sm bg-navy-50 text-navy-800 dark:bg-navy-900 dark:text-slate-200"
                  )}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="flex gap-1 rounded-2xl rounded-bl-sm bg-navy-50 px-4 py-3 dark:bg-navy-900">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="h-2 w-2 animate-bounce rounded-full bg-navy-300"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {messages.length <= 1 && (
            <div className="flex flex-wrap gap-1.5 px-4 pb-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-full border border-navy-200 px-2.5 py-1 text-xs text-navy-600 transition hover:border-sky hover:text-sky-dark dark:border-navy-600 dark:text-slate-300"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-center gap-2 border-t border-navy-100 p-3 dark:border-navy-700"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={session ? "Ask your tutor..." : "Log in to chat..."}
              className="input py-2 text-sm"
            />
            <button type="submit" disabled={loading} className="btn-primary btn-md shrink-0 !px-3">
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
