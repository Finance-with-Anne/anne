import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

const FLW_SECRET = process.env.FLW_SECRET_KEY ?? "";

export async function POST(req: NextRequest) {
  if (!FLW_SECRET) return NextResponse.json({ error: "Payment not configured." }, { status: 503 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { courseId, currency } = await req.json();

  const { data: course } = await supabaseAdmin
    .from("courses")
    .select("title, price, price_ngn, price_usd, price_gbp")
    .eq("id", courseId)
    .single();

  if (!course) return NextResponse.json({ error: "Course not found." }, { status: 404 });

  const cur = (currency ?? "NGN").toUpperCase();
  const priceMap: Record<string, number | null> = {
    NGN: course.price_ngn,
    USD: course.price_usd,
    GBP: course.price_gbp ?? course.price,
  };
  const price = priceMap[cur] ?? course.price;
  if (!price) return NextResponse.json({ error: "Price not set for this currency." }, { status: 400 });

  const tx_ref = `course_${courseId}_${user.id.slice(0, 8)}_${Date.now()}`;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const res = await fetch("https://api.flutterwave.com/v3/payments", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${FLW_SECRET}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      tx_ref,
      amount: price,
      currency: cur,
      redirect_url: `${siteUrl}/courses/verify?course_id=${courseId}`,
      customer: { email: user.email, name: user.email },
      meta: { course_id: courseId, user_id: user.id },
    }),
  });

  const json = await res.json();
  if (json.status !== "success") {
    return NextResponse.json({ error: json.message ?? "Payment init failed." }, { status: 500 });
  }

  return NextResponse.json({ payment_url: json.data.link });
}
