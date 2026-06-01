import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

// GET /api/blog-comments?post_id=xxx — approved comments for a post (public)
// GET /api/blog-comments?admin=1 — all comments for admin
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const post_id = url.searchParams.get("post_id");
  const admin = url.searchParams.get("admin");

  if (admin) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorised." }, { status: 401 });

    const { data } = await supabaseAdmin
      .from("blog_comments")
      .select("*, blog_posts(title, slug)")
      .order("created_at", { ascending: false });
    return NextResponse.json(data ?? []);
  }

  if (!post_id) return NextResponse.json([]);

  const { data } = await supabaseAdmin
    .from("blog_comments")
    .select("id, author_name, content, admin_reply, replied_at, created_at")
    .eq("post_id", post_id)
    .eq("approved", true)
    .order("created_at", { ascending: true });

  return NextResponse.json(data ?? []);
}

// POST /api/blog-comments — submit a new comment (public)
export async function POST(req: NextRequest) {
  const { post_id, author_name, author_email, content } = await req.json();
  if (!post_id || !author_name?.trim() || !content?.trim()) {
    return NextResponse.json({ error: "post_id, author_name and content are required." }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("blog_comments")
    .insert({ post_id, author_name: author_name.trim(), author_email: author_email?.trim() ?? null, content: content.trim() })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, comment: data }, { status: 201 });
}
