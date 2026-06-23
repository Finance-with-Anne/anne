import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: reviews } = await supabaseAdmin
    .from("course_reviews")
    .select("*")
    .eq("course_id", id)
    .order("created_at", { ascending: false });

  if (!reviews?.length) return NextResponse.json([]);

  // Enrich with profile names
  const userIds = [...new Set(reviews.map(r => r.user_id))];
  const { data: profiles } = await supabaseAdmin
    .from("profiles")
    .select("id, full_name, avatar_url")
    .in("id", userIds);

  const profileMap = Object.fromEntries((profiles ?? []).map(p => [p.id, p]));
  const enriched = reviews.map(r => ({ ...r, profile: profileMap[r.user_id] ?? null }));

  return NextResponse.json(enriched);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { rating, comment } = await req.json();
  if (!rating || rating < 1 || rating > 5) return NextResponse.json({ error: "Rating must be 1–5" }, { status: 400 });

  const { data, error } = await supabase
    .from("course_reviews")
    .upsert({ course_id: id, user_id: user.id, rating, comment: comment ?? null }, { onConflict: "course_id,user_id" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
