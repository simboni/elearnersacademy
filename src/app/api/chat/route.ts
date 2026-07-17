import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

/**
 * AI Learning Companion.
 * If ANTHROPIC_API_KEY is set, streams a real answer from Claude with course context.
 * Otherwise falls back to a helpful rule-based tutor so the feature always works.
 */

const SYSTEM = `You are the eLearners Academy AI Tutor — a friendly, encouraging trading and finance mentor.
You help students understand day trading (especially the SMP_TS setup: a rule-based price-action strategy
targeting 1:3 risk-reward across the Asia, London and New York sessions), crypto, personal finance and trading psychology.
Keep answers concise, practical and beginner-friendly. Never give financial advice or specific buy/sell signals —
teach concepts and risk management. Encourage journaling and discipline.`;

function localTutor(message: string, courseTitle?: string): string {
  const m = message.toLowerCase();
  const ctx = courseTitle ? ` in **${courseTitle}**` : "";
  if (/risk|reward|1:3|stop|position siz/.test(m)) {
    return `Great risk question! The SMP_TS approach targets a **1:3 risk–reward** — you risk 1 unit to potentially make 3. Practically:\n\n1. Risk a small **fixed %** of your account per trade (many traders use 0.5–1%).\n2. Always place a **stop loss** before entering.\n3. Consider moving your stop to **breakeven at 1R** to protect capital.\n\nConsistency in *following the rules* matters far more than any single trade${ctx}. Want me to walk through position-size math with an example?`;
  }
  if (/session|asia|london|new york|time/.test(m)) {
    return `The three sessions each behave differently:\n\n- **Asia** — often ranges and builds liquidity.\n- **London** — the first big expansion; strong moves.\n- **New York** — volatility, continuation or reversal.\n\nThe SMP_TS setup teaches you to strike at the highest-probability moment in each session${ctx}. Which session would you like to focus on?`;
  }
  if (/psycholog|fear|greed|discipline|revenge|emotion/.test(m)) {
    return `Trading psychology is the real edge 💡. Most losses come from *emotion*, not strategy. Three anchors:\n\n1. **Patience** — wait for your setup, don't force trades.\n2. **Process focus** — score yourself on rule-following, not profit.\n3. **Detachment** — no single trade defines you.\n\nJournaling every trade${ctx} is the fastest way to build discipline. Want a simple journaling template?`;
  }
  if (/quiz|exam|test|assessment/.test(m)) {
    return `You've got this! For quizzes${ctx}, re-watch the lesson, take notes on the *rules*, and focus on the "why" behind each concept. Passing score is usually 70%. Remember — you can retake to reinforce learning. Anything specific you'd like me to explain?`;
  }
  if (/prop|funded|challenge/.test(m)) {
    return `Prop firm challenges test **consistency and risk discipline**, not how many trades you take${ctx}. Keys to passing:\n\n1. Know the rulebook (daily loss, max drawdown).\n2. Risk small and let 1:3 winners do the work.\n3. Don't chase the target — trade your plan.\n\nMany SMP_TS students pass in under a week by simply following the rules. Want a challenge game-plan?`;
  }
  if (/hello|hi|hey|start|help/.test(m)) {
    return `Hi! 👋 I'm your eLearners Academy AI Tutor. I can help you understand${ctx || " your courses"} — from the SMP_TS setup and risk management to trading psychology and getting funded. What would you like to learn today?`;
  }
  return `That's a thoughtful question${ctx}. Here's how I'd approach it: break the concept into the *rule* behind it and the *reason* it works, then test it on past charts before risking real money. Could you share a bit more detail so I can tailor the explanation? You can also ask me about risk management, the trading sessions, psychology, or passing a prop firm challenge.`;
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please log in to use the AI tutor" }, { status: 401 });

  const { message, courseTitle, history } = (await req.json()) as {
    message: string;
    courseTitle?: string;
    history?: { role: string; content: string }[];
  };
  if (!message?.trim()) return NextResponse.json({ error: "Empty message" }, { status: 400 });

  await prisma.chatMessage.create({
    data: { userId: user.id, role: "user", content: message, context: courseTitle },
  });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  let reply: string;

  if (apiKey) {
    try {
      const messages = [
        ...(history ?? []).slice(-8).map((h) => ({ role: h.role, content: h.content })),
        { role: "user", content: courseTitle ? `[Course: ${courseTitle}] ${message}` : message },
      ];
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-5",
          max_tokens: 800,
          system: SYSTEM,
          messages,
        }),
      });
      const data = await res.json();
      reply = data?.content?.[0]?.text ?? localTutor(message, courseTitle);
    } catch {
      reply = localTutor(message, courseTitle);
    }
  } else {
    reply = localTutor(message, courseTitle);
  }

  await prisma.chatMessage.create({
    data: { userId: user.id, role: "assistant", content: reply, context: courseTitle },
  });

  return NextResponse.json({ ok: true, reply });
}
