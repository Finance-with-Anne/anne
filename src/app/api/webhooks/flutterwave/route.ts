import { NextRequest, NextResponse } from "next/server";
import { fulfillInvestmentBlueprintOrder } from "@/app/api/products/investment-blueprint/verify/route";
import { fulfillMoneyTrackerOrder } from "@/app/api/products/money-tracker/verify/route";
import { fulfillLbnOrder } from "@/app/api/products/legacy-builders-network/verify/route";
import { fulfillShopOrder } from "@/app/api/shop/verify/route";
import { fulfillBooking } from "@/app/api/bookings/verify/route";

const WEBHOOK_SECRET = process.env.FLW_WEBHOOK_SECRET ?? "";

/**
 * Server-to-server backstop for Flutterwave payments. The client-driven
 * /verify routes only fire if the customer's browser is still on the
 * redirect page — for bank transfers, the transfer can clear *after* that
 * redirect already happened (or after they abandoned the tab), so the
 * order is left "pending" forever with no delivery, even though
 * Flutterwave shows the charge as successful. This webhook catches that,
 * for every product flow that persists an order/booking row keyed by its
 * tx_ref (all of them except Courses — see note below).
 *
 * Courses is NOT wired up here: /api/courses/verify doesn't persist an
 * order row, it enrolls the *currently signed-in* user directly, and its
 * tx_ref only embeds the first 8 chars of the user id (not enough to
 * reliably resolve back to a specific account). A webhook has no session
 * to fall back on, so fixing this properly means giving Courses a real
 * order row first — same shape as everything else here — rather than
 * bolting a partial match onto the webhook.
 */
export async function POST(req: NextRequest) {
  if (!WEBHOOK_SECRET) {
    console.error("FLW_WEBHOOK_SECRET not configured — rejecting webhook.");
    return NextResponse.json({ error: "Webhook not configured." }, { status: 503 });
  }

  const signature = req.headers.get("verif-hash");
  if (!signature || signature !== WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  const payload = await req.json();
  const data = payload?.data;
  const txRef = data?.tx_ref as string | undefined;
  const transactionId = data?.id;

  if (payload?.event !== "charge.completed" || data?.status !== "successful" || !txRef || !transactionId) {
    return NextResponse.json({ received: true });
  }

  const id = txRef.split("_")[1];
  let result: { ok: boolean } | null = null;

  try {
    if (txRef.startsWith("ib_")) {
      result = await fulfillInvestmentBlueprintOrder(id, transactionId);
    } else if (txRef.startsWith("mt_")) {
      result = await fulfillMoneyTrackerOrder(id, transactionId);
    } else if (txRef.startsWith("lbn_")) {
      result = await fulfillLbnOrder(id, transactionId);
    } else if (txRef.startsWith("order_")) {
      result = await fulfillShopOrder(id, transactionId);
    } else if (txRef.startsWith("booking_")) {
      result = await fulfillBooking(id, transactionId);
    } else if (txRef.startsWith("course_")) {
      console.error("Webhook received a course tx_ref — not wired up, needs an order row first:", txRef);
    }
  } catch (err) {
    console.error("Webhook fulfillment error:", txRef, err);
  }

  if (result && !result.ok) {
    console.error("Webhook could not fulfill order", txRef, result);
  }

  return NextResponse.json({ received: true });
}
