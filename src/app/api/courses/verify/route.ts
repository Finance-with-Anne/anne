import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

const FLW_SECRET = process.env.FLW_SECRET_KEY ?? "";

export async function POST(req: NextRequest) {
  if (!FLW_SECRET) return NextResponse.json({ error: "Payment not configured." }, { status: 503 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { course_id, transaction_id } = await req.json();

  const res = await fetch(
    `https://api.flutterwave.com/v3/transactions/${encodeURIComponent(transaction_id)}/verify`,
    { headers: { Authorization: `Bearer ${FLW_SECRET}` } }
  );
  const json = await res.json();

  if (json.status !== "success" || json.data?.status !== "successful") {
    return NextResponse.json({ error: "Payment not successful." }, { status: 400 });
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
