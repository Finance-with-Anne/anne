import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = Math.min(Number(searchParams.get("limit")) || 10, 50);
  const supabase = await createClient();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("id, title, slug, excerpt, cover_image, published_at")
    .or(`published.eq.true,and(published.eq.false,published_at.lte.${now})`)
    .order("published_at", { ascending: false })
    .limit(limit);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorised." }, { status: 401 });

  const body = await req.json();
  const { title, slug, excerpt, content, cover_image, published, published_at, meta_title, meta_description, focus_keyword } = body;

  if (!title || !slug) return NextResponse.json({ error: "Title and slug are required." }, { status: 400 });

  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("blog_posts")
    .insert({ title, slug, excerpt, content, cover_image, published, published_at, meta_title, meta_description, focus_keyword, author_id: user?.id })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
