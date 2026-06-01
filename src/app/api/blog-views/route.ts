import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  const { post_id, read_duration_seconds } = await req.json();
  if (!post_id) return NextResponse.json({ error: "post_id required" }, { status: 400 });

  const country = req.headers.get("x-vercel-ip-country") ?? null;
  await supabaseAdmin.from("blog_post_views").insert({
    post_id,
    country,
    ...(read_duration_seconds != null ? { read_duration_seconds } : {}),
  });

  return NextResponse.json({ ok: true });
}

// PATCH — update duration on existing view (called when reader leaves)
export async function PATCH(req: NextRequest) {
  const { post_id, read_duration_seconds } = await req.json();
  if (!post_id || read_duration_seconds == null) return NextResponse.json({ ok: true });

  // Update the most recent view for this post that has no duration yet
  await supabaseAdmin
    .from("blog_post_views")
    .update({ read_duration_seconds })
    .eq("post_id", post_id)
    .is("read_duration_seconds", null)
    .order("created_at", { ascending: false })
    .limit(1);

  return NextResponse.json({ ok: true });
}

export async function GET(req: NextRequest) {
  const postId = new URL(req.url).searchParams.get("post_id");

  if (postId) {
    const { count } = await supabaseAdmin
      .from("blog_post_views")
      .select("*", { count: "exact", head: true })
      .eq("post_id", postId);
    return NextResponse.json({ views: count ?? 0 });
  }

  // Return all counts grouped by post
  const { data } = await supabaseAdmin
    .from("blog_post_view_counts")
    .select("*");
  return NextResponse.json(data ?? []);
}
