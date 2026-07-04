import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { verifyFlutterwaveTransaction, transactionSucceeded } from "@/lib/flutterwave";
import { rateLimit, rateLimitResponse, getClientIp } from "@/lib/rate-limit";

const FLW_SECRET = process.env.FLW_SECRET_KEY ?? "";

export async function POST(req: NextRequest) {
  const { allowed, retryAfterSeconds } = rateLimit(`verify:course:${getClientIp(req)}`, 20, 10 * 60 * 1000);
  if (!allowed) return rateLimitResponse(retryAfterSeconds!);

  if (!FLW_SECRET) return NextResponse.json({ error: "Payment not configured." }, { status: 503 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { course_id, transaction_id } = await req.json();

  const json = await verifyFlutterwaveTransaction(transaction_id);

  if (!transactionSucceeded(json)) {
    return NextResponse.json({ error: "Payment not successful." }, { status: 400 });
  }

  // courses/pay doesn't persist an order row, so tie this transaction back to
  // this specific course + user via its tx_ref, and recompute the expected
  // price so a cheap/reused transaction_id can't unlock an unrelated course.
  const expectedTxRefPrefix = `course_${course_id}_${user.id.slice(0, 8)}_`;
  if (!json.data?.tx_ref?.startsWith(expectedTxRefPrefix)) {
    return NextResponse.json({ error: "This transaction does not match this course." }, { status: 400 });
  }

  const { data: course } = await supabaseAdmin
    .from("courses")
    .select("price, price_ngn, price_usd, price_gbp")
    .eq("id", course_id)
    .single();

  if (!course) return NextResponse.json({ error: "Course not found." }, { status: 404 });

  const cur = String(json.data.currency ?? "").toUpperCase();
  const priceMap: Record<string, number | null> = {
    NGN: course.price_ngn,
    USD: course.price_usd,
    GBP: course.price_gbp ?? course.price,
  };
  const expectedPrice = priceMap[cur] ?? course.price;
  const paidAmount = json.data.amount;

  if (!expectedPrice || typeof paidAmount !== "number" || Math.abs(paidAmount - expectedPrice) > 1) {
    return NextResponse.json({ error: "Payment amount does not match this course's price." }, { status: 400 });
  }

  // Idempotent: check if already enrolled
  const { data: existing } = await supabaseAdmin
    .from("course_enrollments")
    .select("enrolled_at")
    .eq("user_id", user.id)
    .eq("course_id", course_id)
    .maybeSingle();

  if (existing) return NextResponse.json({ success: true });

  const { error: enrollErr } = await supabaseAdmin
    .from("course_enrollments")
    .upsert(
      { user_id: user.id, course_id, enrolled_at: new Date().toISOString() },
      { onConflict: "user_id,course_id" }
    );

  if (enrollErr) {
    console.error("Enroll error:", enrollErr);
    return NextResponse.json({ error: "Enrollment failed." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
