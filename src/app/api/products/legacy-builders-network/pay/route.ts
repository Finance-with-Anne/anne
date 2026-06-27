import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

const FLW_SECRET   = process.env.FLW_SECRET_KEY ?? "";
const SITE_URL     = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const PRODUCT_ID   = "legacy-builders-network";
const PRODUCT_NAME = "Legacy Builders Network — Annual Membership";
const PRICE        = 150000;
const CURRENCY     = "NGN";

function parseCoupons(): Record<string, number> {
  const raw = process.env.LBN_COUPONS ?? "";
  const map: Record<string, number> = {};
  for (const entry of raw.split(",")) {
    const [code, amount] = entry.trim().split(":");
    if (code && amount && !isNaN(Number(amount))) {
      map[code.toUpperCase()] = Number(amount);
    }
  }
  return map;
}

export async function POST(req: NextRequest) {
  if (!FLW_SECRET) return NextResponse.json({ error: "Payment not configured." }, { status: 503 });

  const { name, email, phone, coupon } = await req.json();
  if (!name || !email || !phone) {
    return NextResponse.json({ error: "Name, email, and phone are required." }, { status: 400 });
  }

  let finalPrice = PRICE;
  if (coupon) {
    const discount = parseCoupons()[String(coupon).toUpperCase()];
    if (discount) finalPrice = Math.max(0, PRICE - discount);
  }

  const { data: order, error: orderErr } = await supabaseAdmin
    .from("orders")
    .insert({
      user_id: null,
      email,
      name,
      items: [{ id: PRODUCT_ID, name: PRODUCT_NAME, price: finalPrice, qty: 1 }],
      total: finalPrice,
      currency: CURRENCY,
      status: "pending",
    })
    .select("id")
    .single();

  if (orderErr || !order) {
    console.error("Order insert error:", orderErr);
    return NextResponse.json({ error: "Could not create order." }, { status: 500 });
  }

  const tx_ref = `lbn_${order.id}_${Date.now()}`;

  const res = await fetch("https://api.flutterwave.com/v3/payments", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${FLW_SECRET}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      tx_ref,
      amount: finalPrice,
      currency: CURRENCY,
      redirect_url: `${SITE_URL}/legacy-builders-network/verify?order_id=${order.id}`,
      customer: { email, name, phone_number: phone },
      meta: { order_id: order.id, product: PRODUCT_ID },
      customizations: {
        title: "Finance with Anne",
        description: PRODUCT_NAME,
      },
    }),
  });

  const json = await res.json();
  if (json.status !== "success") {
    return NextResponse.json({ error: json.message ?? "Payment initialisation failed." }, { status: 500 });
  }

  await supabaseAdmin.from("orders").update({ tx_ref }).eq("id", order.id);

  return NextResponse.json({ payment_url: json.data.link, order_id: order.id });
}
