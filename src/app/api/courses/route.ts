import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorised." }, { status: 401 });

  const body = await req.json();
  const { lessons, ...courseData } = body;

  const { data: course, error } = await supabase.from("courses").insert(courseData).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (lessons?.length) {
    const lessonsToInsert = lessons.map((l: any, i: number) => ({ ...l, course_id: course.id, order: i }));
    await supabase.from("lessons").insert(lessonsToInsert);
  }

  return NextResponse.json(course, { status: 201 });
}
