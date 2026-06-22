import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const metadata = { title: "My Courses — Finance with Anne" };

function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const list: any[] = enrollments ?? [];

  // Group completed lesson IDs by course
  const completedByCourse: Record<string, Set<string>> = {};
  for (const row of progressRows ?? []) {
    if (!completedByCourse[row.course_id]) completedByCourse[row.course_id] = new Set();
    completedByCourse[row.course_id].add(row.lesson_id);
  }

  // Derive per-course stats
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function getCourseStats(e: any) {
    const course = e.course;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allLessons: any[] = (course.curriculum ?? []).flatMap((s: any) => s.lessons ?? []);
    const totalLessons = allLessons.length;
    const done = completedByCourse[course.id]?.size ?? 0;
    const pct = totalLessons > 0 ? Math.round((done / totalLessons) * 100) : 0;
    const totalMins = allLessons.reduce((s: number, l: any) => s + (l.duration ?? 0), 0);
    // First incomplete lesson for "Continue" deep link
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nextLesson = allLessons.find((l: any) => !(completedByCourse[course.id]?.has(l.id)));
    return { totalLessons, done, pct, totalMins, nextLesson };
  }

  const inProgress = list.filter((e) => {
    const { done, totalLessons } = getCourseStats(e);
    return done > 0 && done < totalLessons && !e.completed_at;
  });
  const notStarted = list.filter((e) => {
    const { done } = getCourseStats(e);
    return done === 0 && !e.completed_at;
  });
  const completed = list.filter((e) => {
    const { done, totalLessons } = getCourseStats(e);
    return e.completed_at || (totalLessons > 0 && done >= totalLessons);
  });

  const totalDone = (progressRows ?? []).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
          <p className="text-sm text-gray-400 mt-1">
            {list.length} enrolled · {totalDone} lesson{totalDone !== 1 ? "s" : ""} completed
          </p>
        </div>
        <Link
          href="/courses"
          className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3.5 py-2 text-xs font-semibold text-gray-600 hover:border-[#0822C0]/40 hover:text-[#0822C0] transition-colors"
        >
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Browse more
        </Link>
      </div>

      {list.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 py-24 text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="h-6 w-6 text-gray-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-500">No courses yet</p>
          <p className="text-xs text-gray-400 mt-1">Browse our courses and start learning today.</p>
          <Link href="/courses" className="inline-block mt-5 rounded-lg bg-[#0822C0] text-white text-xs font-semibold px-5 py-2.5 hover:bg-[#061aa0] transition-colors">
            Browse Courses
          </Link>
        </div>
      ) : (
        <div className="space-y-10">
          {/* In Progress */}
          {inProgress.length > 0 && (
            <Section title="Continue Learning" count={inProgress.length}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {inProgress.map((e) => <CourseCard key={e.course.id} e={e} stats={getCourseStats(e)} variant="progress" />)}
              </div>
            </Section>
          )}

          {/* Not Started */}
          {notStarted.length > 0 && (
            <Section title="Not Started" count={notStarted.length}>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {notStarted.map((e) => <CourseCard key={e.course.id} e={e} stats={getCourseStats(e)} variant="default" />)}
              </div>
            </Section>
          )}

          {/* Completed */}
          {completed.length > 0 && (
            <Section title="Completed" count={completed.length}>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {completed.map((e) => <CourseCard key={e.course.id} e={e} stats={getCourseStats(e)} variant="completed" />)}
              </div>
            </Section>
          )}
        </div>
      )}
    </div>
  );
}

function Section({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-semibold text-gray-700">{title}</h2>
        <span className="text-[11px] font-semibold text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">{count}</span>
      </div>
      {children}
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CourseCard({ e, stats, variant }: { e: any; stats: any; variant: "progress" | "default" | "completed" }) {
  const course = e.course;
  const { totalLessons, done, pct, totalMins, nextLesson } = stats;
  const catColor = course.category?.color ?? "#0822C0";
  const href = nextLesson
    ? `/account/courses/${course.id}?lesson=${nextLesson.id}`
    : `/account/courses/${course.id}`;

  const isProgress = variant === "progress";
  const isCompleted = variant === "completed";

  return (
    <div className={`group rounded-2xl border bg-white overflow-hidden transition-all hover:shadow-md ${isCompleted ? "border-green-100" : "border-gray-200 hover:border-[#0822C0]/30"}`}>
      {/* Thumbnail */}
      <div className="relative">
        {course.thumbnail_url ? (
          <img src={course.thumbnail_url} alt={course.title} className={`w-full object-cover ${isProgress ? "h-44" : "h-36"}`} />
        ) : (
          <div className={`flex items-center justify-center ${isProgress ? "h-44" : "h-36"}`} style={{ backgroundColor: catColor + "18" }}>
            <svg className="h-10 w-10" style={{ color: catColor + "80" }} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
            </svg>
          </div>
        )}

        {/* Status badge on image */}
        {isCompleted && (
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1 rounded-full bg-green-500 text-white text-[10px] font-semibold px-2 py-1 shadow">
            <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Completed
          </div>
        )}
        {isProgress && (
          <div className="absolute top-2.5 right-2.5 rounded-full bg-[#0822C0] text-white text-[10px] font-bold px-2 py-1 shadow">
            {pct}%
          </div>
        )}
      </div>

      {/* Progress bar (in-progress only) */}
      {isProgress && (
        <div className="h-1 bg-gray-100">
          <div className="h-full bg-[#0822C0] transition-all" style={{ width: `${pct}%` }} />
        </div>
      )}
      {isCompleted && <div className="h-1 bg-green-500" />}

      {/* Body */}
      <div className="p-4 space-y-3">
        {/* Category */}
        {course.category?.name && (
          <span className="inline-block text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full" style={{ backgroundColor: catColor + "18", color: catColor }}>
            {course.category.name}
          </span>
        )}

        <p className="font-semibold text-sm text-gray-900 leading-snug line-clamp-2 group-hover:text-[#0822C0] transition-colors">
          {course.title}
        </p>

        {/* Meta */}
        <div className="flex items-center gap-3 text-[11px] text-gray-400 flex-wrap">
          <span className="flex items-center gap-1">
            <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            {totalLessons} lesson{totalLessons !== 1 ? "s" : ""}
          </span>
          {totalMins > 0 && (
            <span className="flex items-center gap-1">
              <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {formatDuration(totalMins)}
            </span>
          )}
          <span className="capitalize">{course.level}</span>
        </div>

        {/* Progress text (in-progress) */}
        {isProgress && (
          <p className="text-[11px] text-gray-400">{done} of {totalLessons} lessons done</p>
        )}

        {/* CTA */}
        <Link
          href={href}
          className={`block w-full text-center rounded-xl text-xs font-semibold py-2.5 transition-colors ${
            isCompleted
              ? "bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"
              : isProgress
              ? "bg-[#0822C0] text-white hover:bg-[#061aa0]"
              : "bg-gray-50 text-gray-700 hover:bg-[#0822C0]/5 hover:text-[#0822C0] border border-gray-200"
          }`}
        >
          {isCompleted ? "Review course" : isProgress ? "Continue →" : "Start course →"}
        </Link>
      </div>
    </div>
  );
}
