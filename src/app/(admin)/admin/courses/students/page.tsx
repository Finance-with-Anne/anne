import { supabaseAdmin } from "@/lib/supabase/admin";
import StudentsClient from "@/components/admin/StudentsClient";

export const metadata = { title: "Students — Admin" };

export default async function StudentsPage() {
  const [enrollmentsResult, progressResult, usersResult] = await Promise.all([
    supabaseAdmin
      .from("course_enrollments")
      .select(`
        id, user_id, course_id, enrolled_at, completed_at,
        course:courses(id, title, thumbnail_url, curriculum, category:course_categories(name))
      `)
      .order("enrolled_at", { ascending: false }),

    supabaseAdmin
      .from("lesson_progress")
      .select("user_id, course_id"),

    supabaseAdmin.auth.admin.listUsers({ perPage: 1000 }),
  ]);

  const enrollments = enrollmentsResult.data ?? [];
  const progress = progressResult.data ?? [];
  const authUsers = usersResult.data?.users ?? [];

  // Fetch profiles separately (no direct FK from enrollments → profiles)
  const userIds = [...new Set(enrollments.map(e => e.user_id))];
  const { data: profiles } = userIds.length > 0
    ? await supabaseAdmin.from("profiles").select("id, full_name, avatar_url").in("id", userIds)
    : { data: [] };

  const profileMap: Record<string, { full_name: string | null; avatar_url: string | null }> =
    Object.fromEntries((profiles ?? []).map(p => [p.id, p]));
  const emailMap: Record<string, string> =
    Object.fromEntries(authUsers.map(u => [u.id, u.email ?? ""]));

  // progress map: "userId_courseId" → completed lesson count
  const progressMap: Record<string, number> = {};
  for (const p of progress) {
    const key = `${p.user_id}_${p.course_id}`;
    progressMap[key] = (progressMap[key] ?? 0) + 1;
  }

  const students = enrollments.map(e => {
    const curriculum: any[] = (e.course as any)?.curriculum ?? [];
    const totalLessons = curriculum.reduce(
      (sum: number, sec: any) => sum + (Array.isArray(sec.lessons) ? sec.lessons.length : 0),
      0
    );
    return {
      ...e,
      profile: profileMap[e.user_id] ?? null,
      email: emailMap[e.user_id] ?? "",
      lessonsCompleted: progressMap[`${e.user_id}_${e.course_id}`] ?? 0,
      totalLessons,
    };
  });

  // Unique courses for filter dropdown
  const seen = new Set<string>();
  const courses: { id: string; title: string }[] = [];
  for (const e of enrollments) {
    const c = e.course as any;
    if (c?.id && !seen.has(c.id)) {
      seen.add(c.id);
      courses.push({ id: c.id, title: c.title });
    }
  }

  // All courses for the manual-enroll dropdown
  const { data: allCourses } = await supabaseAdmin
    .from("courses")
    .select("id, title")
    .order("title");

  return <StudentsClient students={students as any} courses={courses} allCourses={allCourses ?? []} />;
}
