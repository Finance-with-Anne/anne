import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { email, course_id } = await req.json();
  if (!email || !course_id) return NextResponse.json({ error: "Email and course_id are required" }, { status: 400 });

  // Find user by email
  const { data: { users } } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
  const target = users.find(u => u.email?.toLowerCase() === email.toLowerCase().trim());
  if (!target) return NextResponse.json({ error: "No account found with that email address" }, { status: 404 });

  // Check not already enrolled
  const { data: existing } = await supabaseAdmin
    .from("course_enrollments")
    .select("id")
    .eq("user_id", target.id)
    .eq("course_id", course_id)
    .single();

  if (existing) return NextResponse.json({ error: "Student is already enrolled in this course" }, { status: 409 });

  // Ensure profile exists (trigger may have missed on signup)
  const fullName = target.user_metadata?.full_name ?? target.email?.split("@")[0] ?? "";
  await supabaseAdmin
    .from("profiles")
    .upsert({ id: target.id, full_name: fullName, avatar_url: target.user_metadata?.avatar_url ?? null }, { onConflict: "id" });

  // Enroll
  const { error } = await supabaseAdmin
    .from("course_enrollments")
    .insert({ user_id: target.id, course_id });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, user_id: target.id, name: fullName });
}
