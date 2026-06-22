import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorised." }, { status: 401 });

  const body = await req.json();
  const { sections, tag_ids, ...courseData } = body;

  const { data: course, error } = await supabase.from("courses").insert(courseData).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (sections?.length) {
    for (const section of sections) {
      const { lessons, ...sectionData } = section;
      const { data: sec, error: secErr } = await supabase
        .from("course_sections")
        .insert({ ...sectionData, id: undefined, course_id: course.id })
        .select()
        .single();
      if (secErr) continue;
      if (lessons?.length) {
        await supabase.from("lessons").insert(
          lessons.map((l: any) => ({ ...l, id: undefined, course_id: course.id, section_id: sec.id }))
        );
      }
    }
  }

  if (tag_ids?.length) {
    await supabase.from("course_tag_assignments").insert(
      tag_ids.map((tag_id: string) => ({ course_id: course.id, tag_id }))
    );
  }

  return NextResponse.json(course, { status: 201 });
}
