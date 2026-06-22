import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const metadata = { title: "My Courses — Finance with Anne" };

export default async function AccountCoursesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: enrollments } = await supabase
    .from("course_enrollments")
    .select(`
      enrolled_at, completed_at,
      course:courses(id, title, thumbnail_url, level, description,
        category:course_categories(name, color), curriculum)
    `)
    .eq("user_id", user.id)
    .order("enrolled_at", { ascending: false });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const list: any[] = enrollments ?? [];

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
        <p className="text-sm text-gray-400 mt-1">All courses you&apos;re enrolled in.</p>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {list.map((e) => {
            const course = e.course;
            if (!course) return null;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const lessons = (course.curriculum ?? []).reduce((s: number, sec: any) => s + (sec.lessons?.length ?? 0), 0);
            const catColor = course.category?.color ?? "#0822C0";
            return (
              <Link
                key={course.id}
                href={`/account/courses/${course.id}`}
                className="group rounded-2xl border border-gray-200 bg-white overflow-hidden hover:border-[#0822C0]/30 hover:shadow-md transition-all"
              >
                {course.thumbnail_url ? (
                  <img src={course.thumbnail_url} alt={course.title} className="h-40 w-full object-cover" />
                ) : (
                  <div className="h-40 flex items-center justify-center" style={{ backgroundColor: catColor + "22" }}>
                    <svg className="h-10 w-10" style={{ color: catColor + "99" }} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                    </svg>
                  </div>
                )}
                <div className="p-4 space-y-2.5">
                  {course.category?.name && (
                    <span className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full" style={{ backgroundColor: catColor + "22", color: catColor }}>
                      {course.category.name}
                    </span>
                  )}
                  <p className="font-semibold text-sm text-gray-900 leading-snug line-clamp-2 group-hover:text-[#0822C0] transition-colors">{course.title}</p>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>{lessons} lesson{lessons !== 1 ? "s" : ""}</span>
                    {e.completed_at ? (
                      <span className="text-green-600 font-semibold">Completed ✓</span>
                    ) : (
                      <span className="capitalize">{course.level}</span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
