import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const FLW_SECRET = process.env.FLW_SECRET_KEY ?? "";

export async function POST(req: NextRequest) {
  const { items, currency, name, email } = await req.json();

  if (!FLW_SECRET) return NextResponse.json({ error: "Payment not configured." }, { status: 503 });
  if (!items?.length) return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
  if (!email) return NextResponse.json({ error: "Email required." }, { status: 400 });

  const total = items.reduce(
    (s: number, i: { price: number; qty: number }) => s + i.price * i.qty,
    0
  );

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: order, error: orderErr } = await supabaseAdmin
    .from("orders")
    .insert({
      user_id: user?.id ?? null,
      email,
      name: name || null,
      items,
      total,
      currency: currency ?? "NGN",
      status: "pending",
    })
    .select("id")
    .single();

  if (orderErr || !order) {
    console.error("Order insert error:", orderErr);
    return NextResponse.json({ error: "Could not create order." }, { status: 500 });
  }

  const tx_ref = `order_${order.id}_${Date.now()}`;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const res = await fetch("https://api.flutterwave.com/v3/payments", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${FLW_SECRET}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      tx_ref,
      amount: total,
      currency: currency ?? "NGN",
      redirect_url: `${siteUrl}/shop/verify?order_id=${order.id}`,
      customer: { email, name: name || email },
      meta: { order_id: order.id },
    }),
  });

  const json = await res.json();
  if (json.status !== "success") {
    return NextResponse.json({ error: json.message ?? "Payment init failed." }, { status: 500 });
  }

  await supabaseAdmin.from("orders").update({ tx_ref }).eq("id", order.id);

  return NextResponse.json({ payment_url: json.data.link, order_id: order.id });
}
