import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

// GET /api/blog-likes?post_id=xxx[&fingerprint=xxx]
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const post_id = url.searchParams.get("post_id");
  const fingerprint = url.searchParams.get("fingerprint");
  if (!post_id) return NextResponse.json({ count: 0, liked: false });

  const [{ count }, { data: existing }] = await Promise.all([
    supabaseAdmin
      .from("blog_likes")
      .select("*", { count: "exact", head: true })
      .eq("post_id", post_id),
    fingerprint
      ? supabaseAdmin.from("blog_likes").select("id").eq("post_id", post_id).eq("fingerprint", fingerprint).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  return NextResponse.json({ count: count ?? 0, liked: !!existing });
}

// POST /api/blog-likes — toggle like
export async function POST(req: NextRequest) {
  const { post_id, fingerprint } = await req.json();
  if (!post_id || !fingerprint) return NextResponse.json({ error: "post_id and fingerprint required" }, { status: 400 });

  const { data: existing } = await supabaseAdmin
    .from("blog_likes")
    .select("id")
    .eq("post_id", post_id)
    .eq("fingerprint", fingerprint)
    .maybeSingle();

  if (existing) {
    await supabaseAdmin.from("blog_likes").delete().eq("id", existing.id);
    const { count } = await supabaseAdmin.from("blog_likes").select("*", { count: "exact", head: true }).eq("post_id", post_id);
    return NextResponse.json({ liked: false, count: count ?? 0 });
  } else {
    await supabaseAdmin.from("blog_likes").insert({ post_id, fingerprint });
    const { count } = await supabaseAdmin.from("blog_likes").select("*", { count: "exact", head: true }).eq("post_id", post_id);
    return NextResponse.json({ liked: true, count: count ?? 0 });
  }
}
