import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  // Verify the user is authenticated
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { courseId } = await request.json();
  if (!courseId) {
    return NextResponse.json({ error: "courseId required" }, { status: 400 });
  }

  // Use admin client to bypass RLS — auth is already verified above
  const { error } = await supabaseAdmin
    .from("course_enrollments")
    .upsert(
      { user_id: user.id, course_id: courseId, enrolled_at: new Date().toISOString() },
      { onConflict: "user_id,course_id" }
    );

  if (error) {
    console.error("Enroll error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
