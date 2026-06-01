import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/blog-post-categories?post_id=xxx — returns category_ids for a post
export async function GET(req: NextRequest) {
  const post_id = new URL(req.url).searchParams.get("post_id");
  if (!post_id) return NextResponse.json([]);

  const supabase = await createClient();
  const { data } = await supabase
    .from("blog_post_categories")
    .select("category_id")
    .eq("post_id", post_id);

  return NextResponse.json(data ?? []);
}

// PUT /api/blog-post-categories — replace all categories for a post
export async function PUT(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorised." }, { status: 401 });

  const { post_id, category_ids } = await req.json();
  if (!post_id) return NextResponse.json({ error: "post_id required" }, { status: 400 });

  // Delete existing
  await supabase.from("blog_post_categories").delete().eq("post_id", post_id);

  // Insert new
  if (category_ids?.length) {
    const rows = category_ids.map((category_id: string) => ({ post_id, category_id }));
    const { error } = await supabase.from("blog_post_categories").insert(rows);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
