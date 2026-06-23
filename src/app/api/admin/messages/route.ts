import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data } = await supabaseAdmin
    .from("bookings")
    .select("id, client_name, client_email, service, date, time, status, answers, created_at")
    .order("created_at", { ascending: false })
    .limit(15);

  return NextResponse.json(data ?? []);
}
