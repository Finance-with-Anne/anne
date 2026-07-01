import { supabaseAdmin } from "@/lib/supabase/admin";
import CourseReportsPage from "@/components/admin/CourseReportsPage";

export const dynamic = "force-dynamic";
export const metadata = { title: "Course Reports | Admin" };

export default async function CourseReportsServerPage() {
  const [progressRes, enrollmentsRes, coursesRes, profilesRes, reviewsRes] = await Promise.all([
    supabaseAdmin
      .from("lesson_progress")
      .select("user_id, course_id, lesson_id, completed_at")
      .order("completed_at", { ascending: false }),

    supabaseAdmin
      .from("course_enrollments")
      .select("user_id, course_id, enrolled_at, completed_at"),

    supabaseAdmin
      .from("courses")
      .select("id, title, thumbnail_url, curriculum"),

    supabaseAdmin
      .from("profiles")
      .select("id, full_name, avatar_url"),

    supabaseAdmin
      .from("course_reviews")
      .select("course_id, rating, user_id"),
  ]);

  const progress = progressRes.data ?? [];
  const enrollments = enrollmentsRes.data ?? [];
  const courses = coursesRes.data ?? [];
  const profiles = profilesRes.data ?? [];
  const reviews = reviewsRes.data ?? [];

  const profileMap = Object.fromEntries(profiles.map(p => [p.id, p]));

  // ── Total lessons per course (from curriculum JSON) ──
  const courseTotalLessons: Record<string, number> = {};
  const courseMap: Record<string, { id: string; title: string; thumbnail_url: string | null }> = {};
  for (const c of courses) {
    courseMap[c.id] = { id: c.id, title: c.title, thumbnail_url: c.thumbnail_url };
    const curriculum: any[] = c.curriculum ?? [];
    courseTotalLessons[c.id] = curriculum.reduce(
      (s: number, sec: any) => s + (Array.isArray(sec.lessons) ? sec.lessons.length : 0), 0
    );
  }

  // ── Per-student aggregation ──
  const studentMap: Record<string, {
    userId: string;
    totalLessons: number;
    coursesEnrolled: number;
    coursesCompleted: number;
    lastActive: string | null;
    thisWeekLessons: number;
  }> = {};

  const weekAgo = new Date(Date.now() - 7 * 86400_000).toISOString();

  for (const p of progress) {
    if (!studentMap[p.user_id]) {
      studentMap[p.user_id] = {
        userId: p.user_id,
        totalLessons: 0,
        coursesEnrolled: 0,
        coursesCompleted: 0,
        lastActive: null,
        thisWeekLessons: 0,
      };
    }
    const s = studentMap[p.user_id];
    s.totalLessons++;
    if (!s.lastActive || p.completed_at > s.lastActive) s.lastActive = p.completed_at;
    if (p.completed_at >= weekAgo) s.thisWeekLessons++;
  }

  for (const e of enrollments) {
    if (!studentMap[e.user_id]) {
      studentMap[e.user_id] = {
        userId: e.user_id, totalLessons: 0, coursesEnrolled: 0,
        coursesCompleted: 0, lastActive: null, thisWeekLessons: 0,
      };
    }
    studentMap[e.user_id].coursesEnrolled++;
    if (e.completed_at) studentMap[e.user_id].coursesCompleted++;
  }

  // ── Leaderboard: top 20 by total lessons ──
  const leaderboard = Object.values(studentMap)
    .sort((a, b) => b.totalLessons - a.totalLessons)
    .slice(0, 20)
    .map((s, i) => ({
      rank: i + 1,
      userId: s.userId,
      name: profileMap[s.userId]?.full_name ?? "Unknown",
      avatarUrl: profileMap[s.userId]?.avatar_url ?? null,
      totalLessons: s.totalLessons,
      coursesEnrolled: s.coursesEnrolled,
      coursesCompleted: s.coursesCompleted,
      lastActive: s.lastActive,
    }));

  // ── Most active this week: top 5 ──
  const activeThisWeek = Object.values(studentMap)
    .filter(s => s.thisWeekLessons > 0)
    .sort((a, b) => b.thisWeekLessons - a.thisWeekLessons)
    .slice(0, 5)
    .map(s => ({
      userId: s.userId,
      name: profileMap[s.userId]?.full_name ?? "Unknown",
      avatarUrl: profileMap[s.userId]?.avatar_url ?? null,
      lessonsThisWeek: s.thisWeekLessons,
      lastActive: s.lastActive,
    }));

  // ── Per-course stats ──
  const courseEnrollCount: Record<string, number> = {};
  const courseCompletionCount: Record<string, number> = {};
  const courseLessonProgress: Record<string, number[]> = {};

  for (const e of enrollments) {
    courseEnrollCount[e.course_id] = (courseEnrollCount[e.course_id] ?? 0) + 1;
    if (e.completed_at) courseCompletionCount[e.course_id] = (courseCompletionCount[e.course_id] ?? 0) + 1;
  }

  // avg progress per course: for each enrolled student, compute their % and average
  const courseStudentProgress: Record<string, Record<string, number>> = {};
  for (const p of progress) {
    if (!courseStudentProgress[p.course_id]) courseStudentProgress[p.course_id] = {};
    courseStudentProgress[p.course_id][p.user_id] = (courseStudentProgress[p.course_id][p.user_id] ?? 0) + 1;
  }

  const courseRatingMap: Record<string, number[]> = {};
  for (const r of reviews) {
    if (!courseRatingMap[r.course_id]) courseRatingMap[r.course_id] = [];
    courseRatingMap[r.course_id].push(r.rating);
  }

  const courseStats = courses.map(c => {
    const enrolled = courseEnrollCount[c.id] ?? 0;
    const completed = courseCompletionCount[c.id] ?? 0;
    const total = courseTotalLessons[c.id] ?? 0;
    const studentProgresses = Object.values(courseStudentProgress[c.id] ?? {});
    const avgProgress = total > 0 && studentProgresses.length > 0
      ? Math.round(studentProgresses.reduce((s, n) => s + Math.min((n / total) * 100, 100), 0) / studentProgresses.length)
      : 0;
    const ratings = courseRatingMap[c.id] ?? [];
    const avgRating = ratings.length > 0
      ? ratings.reduce((s, r) => s + r, 0) / ratings.length
      : null;
    return {
      id: c.id,
      title: c.title,
      thumbnail_url: c.thumbnail_url,
      enrolled,
      completed,
      avgProgress,
      avgRating,
      totalLessons: total,
    };
  }).sort((a, b) => b.enrolled - a.enrolled);

  // ── Summary stats ──
  const totalLessonsWatched = progress.length;
  const totalStudents = new Set(enrollments.map(e => e.user_id)).size;
  const avgCompletionRate = courseStats.length > 0
    ? Math.round(courseStats.reduce((s, c) => s + (c.enrolled > 0 ? (c.completed / c.enrolled) * 100 : 0), 0) / courseStats.length)
    : 0;
  const activeThisWeekCount = Object.values(studentMap).filter(s => s.thisWeekLessons > 0).length;

  return (
    <CourseReportsPage
      leaderboard={leaderboard}
      activeThisWeek={activeThisWeek}
      courseStats={courseStats}
      totalLessonsWatched={totalLessonsWatched}
      totalStudents={totalStudents}
      avgCompletionRate={avgCompletionRate}
      activeThisWeekCount={activeThisWeekCount}
    />
  );
}
