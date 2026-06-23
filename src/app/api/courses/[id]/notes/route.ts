import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lessonId = req.nextUrl.searchParams.get("lesson_id");
  if (!lessonId) return NextResponse.json({ error: "lesson_id required" }, { status: 400 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data } = await supabase
    .from("course_notes")
    .select("content")
    .eq("user_id", user.id)
    .eq("course_id", id)
    .eq("lesson_id", lessonId)
    .single();

  return NextResponse.json({ content: data?.content ?? "" });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { lesson_id, content } = await req.json();
  if (!lesson_id) return NextResponse.json({ error: "lesson_id required" }, { status: 400 });

  const { error } = await supabase
    .from("course_notes")
    .upsert({ user_id: user.id, course_id: id, lesson_id, content: content ?? "", updated_at: new Date().toISOString() });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
