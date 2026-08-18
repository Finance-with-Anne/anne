import { NextRequest, NextResponse } from "next/server";
import { fulfillInvestmentBlueprintOrder } from "@/app/api/products/investment-blueprint/verify/route";

const WEBHOOK_SECRET = process.env.FLW_WEBHOOK_SECRET ?? "";

/**
 * Server-to-server backstop for Flutterwave payments. The client-driven
 * /verify routes only fire if the customer's browser is still on the
 * redirect page — for bank transfers, the transfer can clear *after* that
 * redirect already happened (or after they abandoned the tab), so the
 * order is left "pending" forever with no delivery, even though
 * Flutterwave shows the charge as successful. This webhook catches that.
 *
 * Currently only wired up for the Investment Blueprint ("ib_" tx_ref
 * prefix). Other product flows (money-tracker, shop, LBN, bookings,
 * courses) have the same underlying gap and should be added here the
 * same way if/when they show the same failure.
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

  if (txRef.startsWith("ib_")) {
    const orderId = txRef.split("_")[1];
    const result = await fulfillInvestmentBlueprintOrder(orderId, transactionId).catch(err => {
      console.error("Webhook fulfillment error:", err);
      return null;
    });
    if (!result?.ok) {
      console.error("Webhook could not fulfill order", orderId, result);
    }
  }

  return NextResponse.json({ received: true });
}
