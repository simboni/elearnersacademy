import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function j(v: unknown) {
  return JSON.stringify(v);
}

async function main() {
  console.log("🌱 Seeding eLearners Academy...");

  // ---- wipe (dev only) ----
  await prisma.$transaction([
    prisma.chatMessage.deleteMany(),
    prisma.note.deleteMany(),
    prisma.post.deleteMany(),
    prisma.thread.deleteMany(),
    prisma.liveRegistration.deleteMany(),
    prisma.liveSession.deleteMany(),
    prisma.assignmentSubmission.deleteMany(),
    prisma.assignment.deleteMany(),
    prisma.announcement.deleteMany(),
    prisma.notification.deleteMany(),
    prisma.userBadge.deleteMany(),
    prisma.pointLog.deleteMany(),
    prisma.streak.deleteMany(),
    prisma.certificate.deleteMany(),
    prisma.review.deleteMany(),
    prisma.wishlistItem.deleteMany(),
    prisma.quizAttempt.deleteMany(),
    prisma.question.deleteMany(),
    prisma.quiz.deleteMany(),
    prisma.lessonProgress.deleteMany(),
    prisma.lesson.deleteMany(),
    prisma.section.deleteMany(),
    prisma.orderItem.deleteMany(),
    prisma.order.deleteMany(),
    prisma.coupon.deleteMany(),
    prisma.enrollment.deleteMany(),
    prisma.course.deleteMany(),
    prisma.category.deleteMany(),
    prisma.badge.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  // ---- Badges ----
  const badges = [
    { key: "welcome", name: "First Steps", description: "Joined eLearners Academy", icon: "🎓", tier: "bronze" },
    { key: "first-course", name: "Enrolled", description: "Enrolled in your first course", icon: "📚", tier: "bronze" },
    { key: "first-lesson", name: "Getting Started", description: "Completed your first lesson", icon: "▶️", tier: "bronze" },
    { key: "quiz-ace", name: "Quiz Ace", description: "Scored 100% on a quiz", icon: "🎯", tier: "silver" },
    { key: "course-complete", name: "Finisher", description: "Completed a full course", icon: "🏁", tier: "gold" },
    { key: "certified", name: "Certified", description: "Earned a certificate", icon: "📜", tier: "gold" },
    { key: "streak-7", name: "On Fire", description: "7-day learning streak", icon: "🔥", tier: "silver" },
    { key: "streak-30", name: "Unstoppable", description: "30-day learning streak", icon: "⚡", tier: "platinum" },
    { key: "reviewer", name: "Critic", description: "Left your first course review", icon: "⭐", tier: "bronze" },
    { key: "helper", name: "Community Helper", description: "Answered a question in the forum", icon: "🤝", tier: "silver" },
  ];
  for (const b of badges) await prisma.badge.create({ data: b });

  // ---- Categories ----
  const catData = [
    { name: "Forex Trading", slug: "forex", icon: "💱", description: "Master the world's largest financial market." },
    { name: "Cryptocurrency", slug: "crypto", icon: "₿", description: "Trade digital assets with confidence." },
    { name: "Stocks & Indices", slug: "stocks", icon: "📈", description: "Equities, indices, and long-term investing." },
    { name: "Trading Psychology", slug: "psychology", icon: "🧠", description: "Build the mindset of a profitable trader." },
    { name: "Personal Finance", slug: "finance", icon: "💰", description: "Grow, manage, and protect your wealth." },
    { name: "Prop Firm & Funding", slug: "prop", icon: "🏦", description: "Pass challenges and trade funded capital." },
  ];
  const categories: Record<string, string> = {};
  for (const c of catData) {
    const cat = await prisma.category.create({ data: c });
    categories[c.slug] = cat.id;
  }

  // ---- Users ----
  const pw = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.create({
    data: {
      name: "Academy Admin",
      email: "admin@elearnersacademy.co.ke",
      passwordHash: pw,
      role: "ADMIN",
      country: "Kenya",
      headline: "Platform Administrator",
      streak: { create: { current: 12, longest: 40, lastActive: new Date() } },
    },
  });

  const peter = await prisma.user.create({
    data: {
      name: "Peter Simboni",
      email: "peter@elearnersacademy.co.ke",
      passwordHash: pw,
      role: "INSTRUCTOR",
      image: "/avatars/instructor.jpeg",
      country: "Kenya",
      headline: "Founder & Lead Trading Coach · SMP_TS Strategy",
      bio: "Peter Simboni is a full-time day trader and mentor who has helped hundreds of students pass prop firm challenges and build consistent trading routines. Creator of the SMP_TS setup — a simple, rule-based strategy that targets a 1:3 risk–reward across the Asia, London, and New York sessions.",
      streak: { create: { current: 30, longest: 120, lastActive: new Date() } },
    },
  });

  const grace = await prisma.user.create({
    data: {
      name: "Grace Wanjiru",
      email: "grace@elearnersacademy.co.ke",
      passwordHash: pw,
      role: "INSTRUCTOR",
      country: "Kenya",
      headline: "Crypto Analyst & Risk-Management Coach",
      bio: "Grace specializes in cryptocurrency markets and portfolio risk management, translating complex on-chain data into actionable strategies for everyday traders.",
      streak: { create: {} },
    },
  });

  const studentNames = [
    "Brian Otieno", "Aisha Mohamed", "Daniel Kipchoge", "Mercy Achieng",
    "Samuel Mwangi", "Faith Nekesa", "John Kamau", "Lydia Chebet",
  ];
  const students = [];
  for (let i = 0; i < studentNames.length; i++) {
    const s = await prisma.user.create({
      data: {
        name: studentNames[i],
        email: `student${i + 1}@example.com`,
        passwordHash: pw,
        role: "STUDENT",
        country: "Kenya",
        streak: { create: { current: (i * 3) % 15, longest: (i * 5) % 40 } },
      },
    });
    students.push(s);
  }
  // Named demo student for easy login
  const demo = await prisma.user.create({
    data: {
      name: "Demo Student",
      email: "student@example.com",
      passwordHash: pw,
      role: "STUDENT",
      country: "Kenya",
      headline: "Aspiring funded trader",
      streak: { create: { current: 5, longest: 9, lastActive: new Date() } },
    },
  });
  students.push(demo);

  // ---- Helper to build a course ----
  type LessonSpec = {
    title: string;
    type?: string;
    durationSec?: number;
    isPreview?: boolean;
    content?: string;
    contentUrl?: string;
    quiz?: {
      title: string;
      passingScore?: number;
      questions: {
        prompt: string;
        type?: string;
        explanation?: string;
        options: { text: string; correct: boolean }[];
      }[];
    };
  };
  type SectionSpec = { title: string; lessons: LessonSpec[] };

  async function createCourse(opts: {
    title: string;
    slug: string;
    subtitle: string;
    description: string;
    image: string;
    categorySlug: string;
    instructorId: string;
    level: string;
    price: number;
    discountPrice?: number;
    durationLabel: string;
    featured?: boolean;
    bestseller?: boolean;
    promoVideoUrl?: string;
    outcomes: string[];
    requirements: string[];
    audience: string[];
    tags: string[];
    sections: SectionSpec[];
  }) {
    const course = await prisma.course.create({
      data: {
        title: opts.title,
        slug: opts.slug,
        subtitle: opts.subtitle,
        description: opts.description,
        image: opts.image,
        promoVideoUrl: opts.promoVideoUrl,
        categoryId: categories[opts.categorySlug],
        instructorId: opts.instructorId,
        level: opts.level,
        price: opts.price,
        discountPrice: opts.discountPrice,
        durationLabel: opts.durationLabel,
        featured: opts.featured ?? false,
        bestseller: opts.bestseller ?? false,
        outcomes: j(opts.outcomes),
        requirements: j(opts.requirements),
        targetAudience: j(opts.audience),
        tags: j(opts.tags),
      },
    });
    for (let si = 0; si < opts.sections.length; si++) {
      const sec = opts.sections[si];
      const section = await prisma.section.create({
        data: { title: sec.title, order: si, courseId: course.id },
      });
      for (let li = 0; li < sec.lessons.length; li++) {
        const l = sec.lessons[li];
        const lesson = await prisma.lesson.create({
          data: {
            title: l.title,
            order: li,
            type: l.quiz ? "QUIZ" : l.type ?? "VIDEO",
            durationSec: l.durationSec ?? 480,
            isPreview: l.isPreview ?? false,
            content: l.content,
            contentUrl: l.contentUrl ?? "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            sectionId: section.id,
          },
        });
        if (l.quiz) {
          const quiz = await prisma.quiz.create({
            data: {
              lessonId: lesson.id,
              title: l.quiz.title,
              passingScore: l.quiz.passingScore ?? 70,
            },
          });
          for (let qi = 0; qi < l.quiz.questions.length; qi++) {
            const q = l.quiz.questions[qi];
            await prisma.question.create({
              data: {
                quizId: quiz.id,
                order: qi,
                type: q.type ?? "SINGLE",
                prompt: q.prompt,
                explanation: q.explanation,
                options: j(q.options.map((o, idx) => ({ id: `o${idx}`, text: o.text, correct: o.correct }))),
              },
            });
          }
        }
      }
    }
    return course;
  }

  // ---- Flagship course: SMP_TS Day Trading Bootcamp ----
  const bootcamp = await createCourse({
    title: "SMP_TS Day Trading Bootcamp",
    slug: "smp-ts-day-trading-bootcamp",
    subtitle: "Build a Lifetime Skill. Master One Setup That Pays Forever.",
    description:
      "The SMP_TS Day Trading Bootcamp is your gateway to mastering one simple yet powerful trading setup that works across all market sessions — Asia, London, and New York. You'll learn to read the market, manage risk with a 1:3 risk–reward, and build the discipline to pass prop firm challenges in days, not months. This is a complete, rule-based system with no indicators clutter — just clean price action you can trade for life.",
    image: "/courses/smp-bootcamp.jpg",
    categorySlug: "forex",
    instructorId: peter.id,
    level: "Intermediate",
    price: 5500,
    durationLabel: "One Week",
    featured: true,
    bestseller: true,
    promoVideoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    outcomes: [
      "Understand how the Asia, London, and New York sessions move the market",
      "Trade one high-probability setup that repeats every session",
      "Apply strict risk management targeting a 1:3 risk–reward on every trade",
      "Pass prop firm challenges (Phase 1 & 2) in under a week",
      "Build a repeatable daily trading routine and journal",
      "Master the psychology of patience, discipline, and consistency",
    ],
    requirements: [
      "A laptop or smartphone with internet access",
      "A free TradingView account (we'll set it up together)",
      "No prior trading experience required — we start from the ground up",
    ],
    audience: [
      "Complete beginners who want a proven, simple system",
      "Struggling traders looking for consistency",
      "Anyone aiming to get funded by a prop firm",
    ],
    tags: ["Forex", "Day Trading", "Price Action", "Prop Firm", "SMP_TS"],
    sections: [
      {
        title: "Welcome & Foundations",
        lessons: [
          { title: "Welcome to the Bootcamp", isPreview: true, durationSec: 240, type: "VIDEO" },
          {
            title: "How Financial Markets Really Work",
            type: "ARTICLE",
            durationSec: 420,
            content:
              "<h2>The market is an auction</h2><p>Every price you see is the result of buyers and sellers agreeing on value in real time. As a day trader, your job is not to predict the future — it is to <strong>react to imbalance</strong> when the odds favour you.</p><h3>The three sessions</h3><ul><li><strong>Asia</strong> — typically ranges and builds liquidity.</li><li><strong>London</strong> — the first big expansion of the day.</li><li><strong>New York</strong> — volatility and continuation or reversal.</li></ul><p>The SMP_TS setup teaches you to strike at the moments of highest probability in each session.</p>",
            isPreview: true,
          },
          { title: "Setting Up TradingView the Right Way", durationSec: 600 },
        ],
      },
      {
        title: "The SMP_TS Setup",
        lessons: [
          { title: "Anatomy of the Setup", durationSec: 720 },
          { title: "Identifying the Session High & Low", durationSec: 540 },
          { title: "The Entry Trigger — Step by Step", durationSec: 900 },
          { title: "Stop Loss & 1:3 Take Profit Placement", durationSec: 660 },
          {
            title: "Checkpoint: Setup Fundamentals Quiz",
            quiz: {
              title: "Setup Fundamentals Quiz",
              passingScore: 70,
              questions: [
                {
                  prompt: "What risk-to-reward ratio does the SMP_TS strategy target?",
                  explanation: "SMP_TS is built around a 1:3 risk–reward — risking 1 to make 3.",
                  options: [
                    { text: "1:1", correct: false },
                    { text: "1:2", correct: false },
                    { text: "1:3", correct: true },
                    { text: "1:5", correct: false },
                  ],
                },
                {
                  prompt: "Which session typically builds liquidity in a range?",
                  options: [
                    { text: "Asia", correct: true },
                    { text: "London", correct: false },
                    { text: "New York", correct: false },
                  ],
                },
                {
                  prompt: "The SMP_TS setup relies primarily on:",
                  explanation: "It is a clean price-action system, not an indicator-heavy one.",
                  options: [
                    { text: "Dozens of indicators", correct: false },
                    { text: "Clean price action and session levels", correct: true },
                    { text: "News trading only", correct: false },
                  ],
                },
                {
                  prompt: "Select all good risk-management habits.",
                  type: "MULTIPLE",
                  options: [
                    { text: "Risk a fixed small % per trade", correct: true },
                    { text: "Always use a stop loss", correct: true },
                    { text: "Move stop to breakeven after 1R", correct: true },
                    { text: "Add to losing trades to average down", correct: false },
                  ],
                },
              ],
            },
          },
        ],
      },
      {
        title: "Session Mastery",
        lessons: [
          { title: "Trading the London Session", durationSec: 840 },
          { title: "Trading the New York Session", durationSec: 810 },
          { title: "Live Trade Breakdown — 10k Challenge Day 1", durationSec: 1200 },
          { title: "Live Trade Breakdown — Passing Phase 2", durationSec: 1080 },
        ],
      },
      {
        title: "Risk, Psychology & Getting Funded",
        lessons: [
          { title: "Position Sizing & The Math of Consistency", durationSec: 720 },
          {
            title: "The Trader's Mindset",
            type: "ARTICLE",
            durationSec: 480,
            content:
              "<h2>Discipline beats prediction</h2><p>The difference between funded traders and blown accounts is rarely strategy — it is <strong>execution under pressure</strong>. In this lesson we cover the three psychological pillars: patience, process focus, and detachment from any single outcome.</p><p>Your homework: journal every trade for one week using the template provided, scoring yourself on rule-following, not profit.</p>",
          },
          { title: "Choosing a Prop Firm & Passing the Challenge", durationSec: 900 },
          {
            title: "Final Assessment",
            quiz: {
              title: "Bootcamp Final Assessment",
              passingScore: 80,
              questions: [
                {
                  prompt: "After reaching 1R in profit, a disciplined SMP_TS trader often:",
                  options: [
                    { text: "Closes the whole position immediately", correct: false },
                    { text: "Moves the stop toward breakeven", correct: true },
                    { text: "Removes the stop loss", correct: false },
                  ],
                },
                {
                  prompt: "Why journal every trade?",
                  options: [
                    { text: "To measure rule-following and improve", correct: true },
                    { text: "It is not necessary", correct: false },
                    { text: "Only to track profit", correct: false },
                  ],
                },
                {
                  prompt: "A prop firm challenge is primarily a test of:",
                  options: [
                    { text: "Luck", correct: false },
                    { text: "Consistency and risk discipline", correct: true },
                    { text: "How many trades you take", correct: false },
                  ],
                },
              ],
            },
          },
        ],
      },
    ],
  });

  // ---- More courses to fill the catalog ----
  const cryptoCourse = await createCourse({
    title: "Crypto Trading Masterclass: From Zero to Confident",
    slug: "crypto-trading-masterclass",
    subtitle: "Spot, futures, and risk management for the digital-asset era.",
    description:
      "A complete, beginner-friendly journey through cryptocurrency trading. Learn how blockchains and exchanges work, how to read crypto charts, manage volatile risk, and build a rules-based approach to spot and futures trading — without gambling your capital.",
    image: "/courses/smp-strategy.png",
    categorySlug: "crypto",
    instructorId: grace.id,
    level: "Beginner",
    price: 4500,
    discountPrice: 3200,
    durationLabel: "3 Weeks",
    featured: true,
    outcomes: [
      "Understand blockchain, wallets, and exchanges safely",
      "Read crypto charts and identify trends",
      "Manage risk in highly volatile markets",
      "Build a simple, repeatable crypto trading plan",
    ],
    requirements: ["No prior crypto knowledge needed", "A smartphone or computer"],
    audience: ["Beginners curious about crypto", "Traders diversifying from forex"],
    tags: ["Crypto", "Bitcoin", "Risk Management"],
    sections: [
      {
        title: "Crypto Foundations",
        lessons: [
          { title: "What Is a Blockchain, Really?", isPreview: true, durationSec: 480, type: "VIDEO" },
          { title: "Wallets, Keys & Staying Safe", durationSec: 540 },
          { title: "Choosing & Using an Exchange", durationSec: 600 },
        ],
      },
      {
        title: "Trading Crypto",
        lessons: [
          { title: "Reading Crypto Charts", durationSec: 720 },
          { title: "Spot vs Futures — Know the Difference", durationSec: 660 },
          { title: "Risk in Volatile Markets", durationSec: 600 },
          {
            title: "Crypto Knowledge Check",
            quiz: {
              title: "Crypto Basics Quiz",
              questions: [
                {
                  prompt: "Your private keys should be:",
                  options: [
                    { text: "Shared with support if asked", correct: false },
                    { text: "Kept secret and backed up offline", correct: true },
                    { text: "Posted publicly", correct: false },
                  ],
                },
                {
                  prompt: "Futures trading typically involves:",
                  options: [
                    { text: "Leverage and higher risk", correct: true },
                    { text: "No risk at all", correct: false },
                    { text: "Owning the asset outright only", correct: false },
                  ],
                },
              ],
            },
          },
        ],
      },
    ],
  });

  const psychologyCourse = await createCourse({
    title: "Trading Psychology: Master Your Mindset",
    slug: "trading-psychology-mindset",
    subtitle: "Turn discipline into your biggest edge.",
    description:
      "Strategy gets you to the door; psychology gets you through it. This course rewires how you handle fear, greed, and drawdowns so you can execute your plan flawlessly — the real skill behind every consistently profitable trader.",
    image: "/courses/session.jpeg",
    categorySlug: "psychology",
    instructorId: peter.id,
    level: "All Levels",
    price: 0,
    durationLabel: "1 Week",
    featured: false,
    outcomes: [
      "Recognize and manage fear and greed in real time",
      "Recover from losing streaks without revenge trading",
      "Build routines that make discipline automatic",
    ],
    requirements: ["An open mind and a trading journal"],
    audience: ["Any trader who struggles with consistency"],
    tags: ["Psychology", "Discipline", "Mindset", "Free"],
    sections: [
      {
        title: "The Inner Game",
        lessons: [
          { title: "Why Most Traders Fail", isPreview: true, durationSec: 420, type: "VIDEO" },
          { title: "Fear, Greed & The Amygdala", durationSec: 540 },
          { title: "Building an Unshakeable Routine", durationSec: 480 },
          {
            title: "Reflection Quiz",
            quiz: {
              title: "Mindset Reflection",
              questions: [
                {
                  prompt: "Revenge trading usually happens after:",
                  options: [
                    { text: "A win", correct: false },
                    { text: "A loss, driven by emotion", correct: true },
                    { text: "A break", correct: false },
                  ],
                },
              ],
            },
          },
        ],
      },
    ],
  });

  const financeCourse = await createCourse({
    title: "Personal Finance & Wealth Building for Africans",
    slug: "personal-finance-wealth-building",
    subtitle: "Budget, save, invest, and grow real wealth from any income.",
    description:
      "A practical, locally-relevant guide to taking control of your money. Learn budgeting that sticks, emergency funds, smart saving with SACCOs and money markets, and how to start investing responsibly — trading income included.",
    image: "/courses/results.png",
    categorySlug: "finance",
    instructorId: grace.id,
    level: "Beginner",
    price: 2500,
    discountPrice: 1500,
    durationLabel: "2 Weeks",
    outcomes: [
      "Build a budget you can actually keep",
      "Create an emergency fund and kill bad debt",
      "Understand SACCOs, money markets, and index funds",
      "Turn trading profits into long-term wealth",
    ],
    requirements: ["No finance background required"],
    audience: ["Anyone who wants control over their money"],
    tags: ["Finance", "Investing", "Budgeting"],
    sections: [
      {
        title: "Money Foundations",
        lessons: [
          { title: "The Wealth Equation", isPreview: true, durationSec: 420, type: "VIDEO" },
          { title: "Budgeting That Sticks", durationSec: 540 },
          { title: "Emergency Funds & Debt", durationSec: 480 },
          { title: "Intro to Investing", durationSec: 600 },
        ],
      },
    ],
  });

  const propCourse = await createCourse({
    title: "Prop Firm Accelerator: Get Funded Fast",
    slug: "prop-firm-accelerator",
    subtitle: "The exact playbook to pass challenges and keep your funded account.",
    description:
      "A focused program on the business of getting funded: choosing the right firm, understanding the rules, managing the challenge like a pro, and — most importantly — keeping the account once you pass. Includes the SMP_TS risk model.",
    image: "/courses/smp-bootcamp.jpg",
    categorySlug: "prop",
    instructorId: peter.id,
    level: "Advanced",
    price: 6500,
    durationLabel: "2 Weeks",
    bestseller: true,
    outcomes: [
      "Compare prop firms and pick the right one",
      "Master challenge rules and drawdown limits",
      "Apply a risk model that survives losing streaks",
      "Scale a funded account responsibly",
    ],
    requirements: ["A working trading strategy (SMP_TS recommended)"],
    audience: ["Traders ready to trade other people's capital"],
    tags: ["Prop Firm", "Funding", "Risk"],
    sections: [
      {
        title: "The Funding Game",
        lessons: [
          { title: "How Prop Firms Make Money", isPreview: true, durationSec: 480, type: "VIDEO" },
          { title: "Reading the Rulebook", durationSec: 540 },
          { title: "The Challenge Risk Model", durationSec: 720 },
          { title: "Keeping the Account After You Pass", durationSec: 660 },
        ],
      },
    ],
  });

  const allCourses = [bootcamp, cryptoCourse, psychologyCourse, financeCourse, propCourse];

  // ---- Enrollments, progress, reviews ----
  const reviewComments = [
    "This changed how I see the market. Peter explains everything simply.",
    "Passed my 10k challenge in 6 days using exactly this system. Incredible.",
    "Best trading course in Kenya, hands down. Worth every shilling.",
    "Finally a strategy I can actually follow without 20 indicators.",
    "The psychology section alone is worth the price.",
    "Clear, practical, and no hype. Highly recommend.",
    "I went from random trades to a real routine. Thank you!",
    "The live breakdowns are gold. You see the system in real markets.",
  ];

  for (let i = 0; i < students.length; i++) {
    const student = students[i];
    // enroll each student in 1-3 courses
    const enrollCount = 1 + (i % 3);
    for (let c = 0; c < enrollCount; c++) {
      const course = allCourses[(i + c) % allCourses.length];
      const progressPct = [15, 40, 65, 100, 80, 30, 55, 100, 90][(i + c) % 9];
      await prisma.enrollment.create({
        data: {
          userId: student.id,
          courseId: course.id,
          progressPct,
          completedAt: progressPct >= 100 ? new Date() : null,
        },
      });
      await prisma.pointLog.create({
        data: { userId: student.id, amount: 50, reason: `Enrolled in ${course.title}` },
      });
      // Paid courses generate a PAID order, spread across the last ~7 months
      const paid = course.discountPrice ?? course.price;
      if (paid > 0) {
        const monthsAgo = (i + c) % 7;
        const createdAt = new Date();
        createdAt.setMonth(createdAt.getMonth() - monthsAgo);
        createdAt.setDate(3 + ((i * 2 + c) % 24));
        await prisma.order.create({
          data: {
            userId: student.id,
            total: paid,
            currency: course.currency,
            status: "PAID",
            method: "intasend",
            reference: `ELA-${Date.now().toString(36).toUpperCase()}-${i}${c}`,
            createdAt,
            items: { create: [{ courseId: course.id, price: paid }] },
          },
        });
      }
      // review from ~70% of students
      if ((i + c) % 3 !== 0) {
        await prisma.review.create({
          data: {
            userId: student.id,
            courseId: course.id,
            rating: 4 + ((i + c) % 2),
            comment: reviewComments[(i + c) % reviewComments.length],
          },
        });
      }
      // certificate if completed
      if (progressPct >= 100) {
        await prisma.certificate.create({
          data: {
            serial: `ELA-${course.slug.slice(0, 4).toUpperCase()}-${1000 + i * 7 + c}`,
            userId: student.id,
            courseId: course.id,
          },
        });
        await prisma.pointLog.create({
          data: { userId: student.id, amount: 300, reason: `Completed ${course.title}` },
        });
      }
    }
  }

  // Demo student rich state
  const demoEnroll = await prisma.enrollment.findFirst({ where: { userId: demo.id } });
  if (demoEnroll) {
    await prisma.enrollment.update({
      where: { id: demoEnroll.id },
      data: { progressPct: 45 },
    });
  }

  // ---- Coupons ----
  await prisma.coupon.createMany({
    data: [
      { code: "WELCOME10", description: "10% off your first course", percentOff: 10, active: true },
      { code: "SMP2026", description: "Ksh 1000 off the Bootcamp", amountOff: 1000, active: true },
      { code: "FUNDED25", description: "25% off Prop Firm Accelerator", percentOff: 25, active: true },
    ],
  });

  // ---- Live sessions ----
  const now = Date.now();
  await prisma.liveSession.createMany({
    data: [
      {
        courseId: bootcamp.id,
        title: "Live: London Session Trade-Along",
        description: "Trade the London open with Peter in real time using the SMP_TS setup.",
        startAt: new Date(now + 2 * 86400000),
        durationMin: 90,
        hostName: "Peter Simboni",
        joinUrl: "https://meet.example.com/london-tradealong",
      },
      {
        courseId: cryptoCourse.id,
        title: "Live: Crypto Weekly Market Outlook",
        description: "Grace breaks down the week's key crypto levels and risk zones.",
        startAt: new Date(now + 4 * 86400000),
        durationMin: 60,
        hostName: "Grace Wanjiru",
        joinUrl: "https://meet.example.com/crypto-outlook",
      },
      {
        courseId: null,
        title: "Live: Prop Firm Q&A — Ask Me Anything",
        description: "Open session on passing and keeping funded accounts.",
        startAt: new Date(now + 7 * 86400000),
        durationMin: 75,
        hostName: "Peter Simboni",
        joinUrl: "https://meet.example.com/prop-ama",
      },
    ],
  });

  // ---- Forum threads ----
  const thread = await prisma.thread.create({
    data: {
      courseId: bootcamp.id,
      userId: students[0].id,
      title: "How strict should I be with the 1:3 target?",
      body: "Sometimes price reverses just before hitting my 3R. Should I take partials or hold for the full target?",
      resolved: true,
    },
  });
  await prisma.post.create({
    data: {
      threadId: thread.id,
      userId: peter.id,
      body: "Great question. Backtest both on 50 trades. Most students find that holding for full 3R while moving to breakeven at 1R gives the best expectancy. Consistency matters more than any single trade.",
      isAnswer: true,
    },
  });
  await prisma.post.create({
    data: {
      threadId: thread.id,
      userId: students[1].id,
      body: "This helped me a lot — holding full target changed my results.",
    },
  });

  await prisma.thread.create({
    data: {
      courseId: bootcamp.id,
      userId: students[2].id,
      title: "Best broker for Kenyan traders?",
      body: "Which brokers do you recommend for someone starting out in Kenya?",
    },
  });

  // ---- Announcements ----
  await prisma.announcement.create({
    data: {
      courseId: bootcamp.id,
      title: "New live trade breakdowns added! 📈",
      body: "We've added two fresh live breakdowns from last week's London session. Check the 'Session Mastery' module.",
    },
  });

  // ---- Notifications for demo student ----
  await prisma.notification.createMany({
    data: [
      { userId: demo.id, type: "info", title: "Welcome back! 👋", body: "Continue the SMP_TS Bootcamp where you left off.", link: "/dashboard/my-courses" },
      { userId: demo.id, type: "success", title: "You earned 50 points", body: "For enrolling in a new course.", link: "/dashboard/achievements" },
      { userId: demo.id, type: "event", title: "Live session in 2 days", body: "London Session Trade-Along with Peter.", link: "/live" },
    ],
  });

  console.log("✅ Seed complete.");
  console.log("   Admin:      admin@elearnersacademy.co.ke / password123");
  console.log("   Instructor: peter@elearnersacademy.co.ke / password123");
  console.log("   Student:    student@example.com / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
