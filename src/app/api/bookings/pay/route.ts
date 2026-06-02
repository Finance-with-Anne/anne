import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY ?? "";

export async function POST(req: NextRequest) {
  const { booking_id, currency } = await req.json();

  if (!PAYSTACK_SECRET) {
    return NextResponse.json({ error: "Payment not configured." }, { status: 503 });
  }

  const { data: booking, error } = await supabaseAdmin
    .from("bookings")
    .select("*, session:booking_sessions(title, price_ngn, price_usd, price_gbp)")
    .eq("id", booking_id)
    .single();

  if (error || !booking) return NextResponse.json({ error: "Booking not found." }, { status: 404 });

  const session = booking.session as { title: string; price_ngn: number | null; price_usd: number | null; price_gbp: number | null };

  const priceMap: Record<string, number | null> = {
    NGN: session.price_ngn,
    USD: session.price_usd,
    GBP: session.price_gbp,
  };
  const cur = (currency ?? "NGN").toUpperCase();
  const price = priceMap[cur];
  if (!price) return NextResponse.json({ error: "Price not set for this currency." }, { status: 400 });

  const amount = Math.round(price * 100); // Paystack uses kobo/cents
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const res = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: booking.client_email,
      amount,
      currency: cur,
      reference: `booking_${booking_id}_${Date.now()}`,
      callback_url: `${siteUrl}/booking/verify?booking_id=${booking_id}`,
      metadata: { booking_id, service: session.title },
    }),
  });

  const json = await res.json();
  if (!json.status) return NextResponse.json({ error: json.message ?? "Payment init failed." }, { status: 500 });

  // Save payment ref
  await supabaseAdmin
    .from("bookings")
    .update({ payment_ref: json.data.reference, currency: cur, amount_paid: price })
    .eq("id", booking_id);

  return NextResponse.json({ authorization_url: json.data.authorization_url });
}
