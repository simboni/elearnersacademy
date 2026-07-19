import { prisma } from "./prisma";
import { addPoints, awardBadge, touchStreak } from "./gamification";

/**
 * IntaSend integration (M-Pesa / card / bank for Kenya).
 * When keys are configured we create a hosted checkout and fulfil the order
 * from the webhook. Without keys, the app runs in simulated mode so the whole
 * purchase flow still works locally and in demos.
 */

export function paymentsEnabled() {
  return Boolean(process.env.INTASEND_PUBLISHABLE_KEY && process.env.INTASEND_SECRET_KEY);
}

function apiBase() {
  return process.env.INTASEND_TEST_MODE === "false"
    ? "https://payment.intasend.com"
    : "https://sandbox.intasend.com";
}

export type CheckoutInput = {
  amount: number;
  currency: string;
  email: string;
  firstName: string;
  lastName?: string;
  apiRef: string;
  redirectUrl: string;
};

/** Create an IntaSend hosted checkout session. Returns the URL to redirect the buyer to. */
export async function createIntasendCheckout(input: CheckoutInput): Promise<{ url: string; invoiceId?: string }> {
  const res = await fetch(`${apiBase()}/api/v1/checkout/`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      public_key: process.env.INTASEND_PUBLISHABLE_KEY,
      amount: input.amount,
      currency: input.currency,
      email: input.email,
      first_name: input.firstName,
      last_name: input.lastName ?? "",
      redirect_url: input.redirectUrl,
      api_ref: input.apiRef,
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`IntaSend checkout failed (${res.status}): ${text}`);
  }
  const data = (await res.json()) as { url?: string; id?: string; invoice?: { invoice_id?: string } };
  if (!data.url) throw new Error("IntaSend did not return a checkout URL");
  return { url: data.url, invoiceId: data.id ?? data.invoice?.invoice_id };
}

/**
 * Fulfil a paid order: mark PAID, enrol the buyer in each course, award points,
 * and notify. Idempotent — safe to call more than once (e.g. webhook retries).
 */
export async function fulfillOrder(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { course: true } } },
  });
  if (!order) return;
  if (order.status === "PAID") return; // already fulfilled

  await prisma.order.update({ where: { id: orderId }, data: { status: "PAID" } });

  for (const item of order.items) {
    await prisma.enrollment.upsert({
      where: { userId_courseId: { userId: order.userId, courseId: item.courseId } },
      create: { userId: order.userId, courseId: item.courseId },
      update: {},
    });
    await prisma.notification.create({
      data: {
        userId: order.userId,
        type: "success",
        title: `Purchase confirmed: ${item.course.title}`,
        body: "You now have lifetime access. Start learning!",
        link: `/learn/${item.course.slug}`,
      },
    });
  }
  await addPoints(order.userId, 50, "Completed a purchase");
  await awardBadge(order.userId, "first-course");
  await touchStreak(order.userId);
}
