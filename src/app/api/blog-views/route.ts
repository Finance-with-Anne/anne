import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  const { post_id } = await req.json();
  if (!post_id) return NextResponse.json({ error: "post_id required" }, { status: 400 });

  // Best-effort — don't block the page load
  const country = req.headers.get("x-vercel-ip-country") ?? null;
  await supabaseAdmin.from("blog_post_views").insert({ post_id, country });

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
