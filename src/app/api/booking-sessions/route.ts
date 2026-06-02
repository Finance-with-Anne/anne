import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("booking_sessions")
    .select("*, questions:booking_questions(*), slots:booking_slots(*)")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorised." }, { status: 401 });

  const body = await req.json();
  const { questions, slots, ...sessionData } = body;

  // Auto-generate slug from title if not provided
  if (!sessionData.slug && sessionData.title) {
    sessionData.slug = sessionData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  const { data: session, error } = await supabaseAdmin
    .from("booking_sessions")
    .insert(sessionData)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Insert questions if provided
  if (questions?.length) {
    await supabaseAdmin.from("booking_questions").insert(
      questions.map((q: Record<string, unknown>, i: number) => ({ ...q, session_id: session.id, sort_order: i }))
    );
  }

  // Insert slots if provided
  if (slots?.length) {
    await supabaseAdmin.from("booking_slots").insert(
      slots.map((s: Record<string, unknown>) => ({ ...s, session_id: session.id }))
    );
  }

  return NextResponse.json(session, { status: 201 });
}
