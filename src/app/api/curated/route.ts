import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  const { data } = await supabaseAdmin
    .from("blog_curated")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false });
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorised." }, { status: 401 });

  const body = await req.json();
  const { url, source_name, title, excerpt, cover_image } = body;
  if (!url || !title) return NextResponse.json({ error: "url and title are required." }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from("blog_curated")
    .insert({ url, source_name: source_name || "Source", title, excerpt: excerpt || null, cover_image: cover_image || null })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
