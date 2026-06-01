import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorised." }, { status: 401 });

  const { post_id } = await req.json();

  // Unset all featured, then set this one
  await supabaseAdmin.from("blog_posts").update({ featured: false }).eq("featured", true);

  if (post_id) {
    const { error } = await supabaseAdmin
      .from("blog_posts")
      .update({ featured: true })
      .eq("id", post_id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
