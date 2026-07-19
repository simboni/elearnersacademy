import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fulfillOrder } from "@/lib/payments";

/**
 * IntaSend payment webhook.
 * Configure this URL in your IntaSend dashboard: https://your-domain.com/api/webhooks/intasend
 * On a COMPLETE payment we fulfil the matching order (enrol + notify).
 * Set INTASEND_WEBHOOK_CHALLENGE to have IntaSend echo a shared secret we verify.
 */
export async function POST(req: Request) {
  let payload: Record<string, unknown>;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const challenge = process.env.INTASEND_WEBHOOK_CHALLENGE;
  if (challenge && payload.challenge !== challenge) {
    return NextResponse.json({ error: "Invalid challenge" }, { status: 401 });
  }

  const state = (payload.state as string | undefined)?.toUpperCase();
  // api_ref is our order id; fall back to matching by stored invoice id (reference).
  const apiRef = payload.api_ref as string | undefined;
  const invoiceId = (payload.invoice_id as string | undefined) ?? (payload.id as string | undefined);

  if (state === "COMPLETE") {
    let orderId = apiRef;
    if (!orderId && invoiceId) {
      const order = await prisma.order.findFirst({ where: { reference: invoiceId } });
      orderId = order?.id;
    }
    if (orderId) await fulfillOrder(orderId);
  } else if (state === "FAILED" && apiRef) {
    await prisma.order.updateMany({ where: { id: apiRef, status: "PENDING" }, data: { status: "FAILED" } });
  }

  return NextResponse.json({ ok: true });
}
