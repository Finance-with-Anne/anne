import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data } = await supabaseAdmin
    .from("course_quizzes")
    .select("*")
    .eq("course_id", id);
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { lesson_id, questions } = await req.json();
  if (!lesson_id || !Array.isArray(questions)) {
    return NextResponse.json({ error: "lesson_id and questions are required" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("course_quizzes")
    .upsert(
      { course_id: id, lesson_id, questions, updated_at: new Date().toISOString() },
      { onConflict: "course_id,lesson_id" }
    )
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { lesson_id } = await req.json();
  const { error } = await supabaseAdmin
    .from("course_quizzes")
    .delete()
    .eq("course_id", id)
    .eq("lesson_id", lesson_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
