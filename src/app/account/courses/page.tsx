import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CoursesClient from "./CoursesClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "My Courses — Finance with Anne" };

export default async function AccountCoursesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const [{ data: enrollments }, { data: progressRows }] = await Promise.all([
    supabase
      .from("course_enrollments")
      .select(`
        enrolled_at, completed_at,
        course:courses(
          id, title, thumbnail_url, level, description,
          category:course_categories(name, color),
          curriculum
        )
      `)
      .eq("user_id", user.id)
      .order("enrolled_at", { ascending: false }),
    supabase
      .from("lesson_progress")
      .select("course_id, lesson_id")
      .eq("user_id", user.id),
  ]);

  // Convert to plain arrays for client serialization
  const completedByCourse: Record<string, string[]> = {};
  for (const row of progressRows ?? []) {
    if (!completedByCourse[row.course_id]) completedByCourse[row.course_id] = [];
    completedByCourse[row.course_id].push(row.lesson_id);
  }

  return (
    <CoursesClient
      enrollments={(enrollments ?? []) as Parameters<typeof CoursesClient>[0]["enrollments"]}
      completedByCourse={completedByCourse}
      totalDone={(progressRows ?? []).length}
    />
  );
}
