import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(_: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;

  const [enrollRes, progressRes, coursesRes] = await Promise.all([
    supabaseAdmin.from("course_enrollments").select("course_id, enrolled_at, completed_at").eq("user_id", userId),
    supabaseAdmin.from("lesson_progress").select("course_id, lesson_id, completed_at").eq("user_id", userId).order("completed_at", { ascending: false }),
    supabaseAdmin.from("courses").select("id, title, curriculum"),
  ]);

  const enrollments = enrollRes.data ?? [];
  const progress = progressRes.data ?? [];
  const courses = coursesRes.data ?? [];

  const courseMap = Object.fromEntries(courses.map(c => [c.id, c]));

  const courseProgress = enrollments.map(e => {
    const course = courseMap[e.course_id];
    const curriculum: any[] = course?.curriculum ?? [];
    const totalLessons = curriculum.reduce((s: number, sec: any) => s + (Array.isArray(sec.lessons) ? sec.lessons.length : 0), 0);
    const completedLessons = progress.filter(p => p.course_id === e.course_id);
    const lastActive = completedLessons[0]?.completed_at ?? null;
    return {
      courseId: e.course_id,
      courseTitle: course?.title ?? "Unknown Course",
      lessonsCompleted: completedLessons.length,
      totalLessons,
      lastActive,
    };
  }).sort((a, b) => (b.lessonsCompleted / Math.max(b.totalLessons, 1)) - (a.lessonsCompleted / Math.max(a.totalLessons, 1)));

  return NextResponse.json({ courses: courseProgress });
}
