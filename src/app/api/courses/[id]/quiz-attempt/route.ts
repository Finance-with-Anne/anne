import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: courseId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { lesson_id, answers } = await req.json();
  if (!lesson_id || !answers) {
    return NextResponse.json({ error: "lesson_id and answers are required" }, { status: 400 });
  }

  const { data: quiz } = await supabaseAdmin
    .from("course_quizzes")
    .select("questions")
    .eq("course_id", courseId)
    .eq("lesson_id", lesson_id)
    .single();

  if (!quiz) return NextResponse.json({ error: "Quiz not found" }, { status: 404 });

  const questions: Array<{ question: string; options: string[]; correct: number }> = quiz.questions ?? [];
  let score = 0;
  for (let i = 0; i < questions.length; i++) {
    if (answers[String(i)] === questions[i].correct) score++;
  }

  const total = questions.length;
  const passed = total > 0 && score / total >= 0.7;

  const { data, error } = await supabaseAdmin
    .from("quiz_attempts")
    .insert({ user_id: user.id, course_id: courseId, lesson_id, answers, score, total, passed })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ score, total, passed, id: data.id });
}
