import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorised." }, { status: 401 });

  const { session_id } = await req.json();
  // Only delete unbooked future slots
  const today = new Date().toISOString().split("T")[0];
  const { error } = await supabaseAdmin
    .from("booking_slots")
    .delete()
    .eq("session_id", session_id)
    .eq("is_booked", false)
    .gte("date", today);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
