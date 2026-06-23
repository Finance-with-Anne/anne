import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(_: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { userId } = await params;

  const [enrollmentsRes, progressRes, profileRes, authRes] = await Promise.all([
    supabaseAdmin
      .from("course_enrollments")
      .select("id, course_id, enrolled_at, completed_at, course:courses(id, title, thumbnail_url, curriculum)")
      .eq("user_id", userId)
      .order("enrolled_at", { ascending: false }),

    supabaseAdmin
      .from("lesson_progress")
      .select("course_id, lesson_id, completed_at")
      .eq("user_id", userId)
      .order("completed_at", { ascending: false }),

    supabaseAdmin
      .from("profiles")
      .select("full_name, avatar_url, created_at")
      .eq("id", userId)
      .single(),

    supabaseAdmin.auth.admin.getUserById(userId),
  ]);

  const enrollments = enrollmentsRes.data ?? [];
  const progress = progressRes.data ?? [];
  const profile = profileRes.data;
  const email = authRes.data?.user?.email ?? "";

  // Per-course stats
  const enriched = enrollments.map(e => {
    const curriculum: any[] = (e.course as any)?.curriculum ?? [];
    const totalLessons = curriculum.reduce(
      (s: number, sec: any) => s + (Array.isArray(sec.lessons) ? sec.lessons.length : 0), 0
    );
    const courseProgress = progress.filter(p => p.course_id === e.course_id);
    const lastActivity = courseProgress[0]?.completed_at ?? null; // already sorted desc
    return {
      ...e,
      totalLessons,
      lessonsCompleted: courseProgress.length,
      lastActivity,
    };
  });

  // Overall stats
  const lastActive = progress[0]?.completed_at ?? null;
  const totalLessonsCompleted = progress.length;

  // Activity per day (last 30 days)
  const today = new Date();
  const activityByDay: Record<string, number> = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    activityByDay[d.toISOString().slice(0, 10)] = 0;
  }
  for (const p of progress) {
    const day = p.completed_at.slice(0, 10);
    if (day in activityByDay) activityByDay[day]++;
  }

  const activeDays = Object.values(activityByDay).filter(v => v > 0).length;

  return NextResponse.json({
    profile,
    email,
    enrollments: enriched,
    totalLessonsCompleted,
    lastActive,
    activeDays,
    activityByDay,
  });
}

// De-enroll: DELETE with { course_id }
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { userId } = await params;
  const { course_id } = await req.json();

  const { error } = await supabaseAdmin
    .from("course_enrollments")
    .delete()
    .eq("user_id", userId)
    .eq("course_id", course_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
