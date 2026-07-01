import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const metadata = { title: "Dashboard | Finance with Anne" };

export default async function AccountDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const [profileRes, enrollmentsRes, bookingsRes, progressRes] = await Promise.all([
    supabase.from("profiles").select("full_name").eq("id", user.id).single(),
    supabase
      .from("course_enrollments")
      .select(`enrolled_at, completed_at, course:courses(id, title, thumbnail_url, level, curriculum, category:course_categories(name, color))`)
      .eq("user_id", user.id)
      .order("enrolled_at", { ascending: false }),
    supabase
      .from("bookings")
      .select(`id, status, notes, session:booking_sessions(title, duration_minutes, google_meet_link), slot:booking_slots(date, start_time)`)
      .eq("client_email", user.email!)
      .in("status", ["confirmed", "pending"])
      .order("created_at", { ascending: false }),
    supabase
      .from("lesson_progress")
      .select("lesson_id, course_id")
      .eq("user_id", user.id),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const enrollments: any[] = enrollmentsRes.data ?? [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allBookings: any[] = bookingsRes.data ?? [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lessonProgress: any[] = progressRes.data ?? [];

  // Next upcoming booking
  const nextBooking = allBookings
    .filter(b => b.slot?.date && new Date(b.slot.date) >= new Date(new Date().toDateString()))
    .sort((a, b) => new Date(a.slot.date).getTime() - new Date(b.slot.date).getTime())[0] ?? null;

  // Per-course progress map
  const progressByCourse: Record<string, number> = {};
  for (const p of lessonProgress) {
    progressByCourse[p.course_id] = (progressByCourse[p.course_id] ?? 0) + 1;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function totalLessons(curriculum: any[]): number {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (curriculum ?? []).reduce((s: number, sec: any) => s + (sec.lessons?.length ?? 0), 0);
  }

  const enrolledCount = enrollments.length;
  const completedCount = enrollments.filter(e => e.completed_at).length;
  const totalLessonsCompleted = lessonProgress.length;
  const inProgressCourses = enrollments.filter(e => !e.completed_at && (progressByCourse[e.course?.id] ?? 0) > 0);

  // Sort: in-progress first, then not started, then completed
  const sortedEnrollments = [
    ...inProgressCourses,
    ...enrollments.filter(e => !e.completed_at && !(progressByCourse[e.course?.id] ?? 0)),
    ...enrollments.filter(e => e.completed_at),
  ].slice(0, 4);

  const today = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });

  const stats = [
    {
      label: "Courses Enrolled",
      value: enrolledCount,
      sub: `${completedCount} completed`,
      icon: "M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z",
      iconBg: "bg-blue-50",
      iconColor: "text-[#0822C0]",
      href: "/account/courses",
    },
    {
      label: "Lessons Done",
      value: totalLessonsCompleted,
      sub: `${inProgressCourses.length} course${inProgressCourses.length !== 1 ? "s" : ""} in progress`,
      icon: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z",
      iconBg: "bg-green-50",
      iconColor: "text-green-600",
      href: "/account/courses",
    },
    {
      label: "Upcoming Sessions",
      value: allBookings.length,
      sub: nextBooking ? `Next: ${new Date(nextBooking.slot?.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}` : "No sessions booked",
      icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
      href: "/account/bookings",
    },
  ];

  return (
    <div className="space-y-6">

      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-0.5">{today}</p>
        </div>
        <Link
          href="/courses"
          className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-[#0822C0] text-white text-xs font-semibold px-4 py-2.5 hover:bg-[#061aa0] transition-colors"
        >
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Browse courses
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="group rounded-2xl border border-gray-200 bg-white p-5 flex items-center gap-4 hover:border-[#0822C0]/25 hover:shadow-sm transition-all"
          >
            <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${s.iconBg} ${s.iconColor} group-hover:scale-105 transition-transform`}>
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d={s.icon} />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs font-medium text-gray-500">{s.label}</p>
              <p className="text-[11px] text-gray-400 mt-0.5 truncate">{s.sub}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Continue learning — col-span-2 */}
        <div className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div>
              <h2 className="text-sm font-bold text-gray-900">Continue Learning</h2>
              <p className="text-xs text-gray-400 mt-0.5">Pick up where you left off</p>
            </div>
            <Link href="/account/courses" className="text-xs font-semibold text-[#0822C0] hover:underline">
              View all
            </Link>
          </div>

          {sortedEnrollments.length === 0 ? (
            <div className="py-16 text-center px-6">
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center">
                <svg className="h-6 w-6 text-[#0822C0]/40" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-500">No courses yet</p>
              <p className="text-xs text-gray-400 mt-1">Browse our library and start learning today.</p>
              <Link href="/courses" className="inline-block mt-4 text-xs font-semibold text-[#0822C0] hover:underline">
                Browse courses →
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {sortedEnrollments.map((e) => {
                const course = e.course;
                if (!course) return null;
                const total = totalLessons(course.curriculum);
                const done = progressByCourse[course.id] ?? 0;
                const pct = total > 0 ? Math.round((done / total) * 100) : 0;
                const isCompleted = !!e.completed_at;
                const catColor = course.category?.color ?? "#0822C0";

                return (
                  <li key={course.id}>
                    <Link
                      href={`/learn/${course.id}`}
                      className="group flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors"
                    >
                      {/* Thumbnail */}
                      {course.thumbnail_url ? (
                        <img src={course.thumbnail_url} alt={course.title} className="h-14 w-20 rounded-xl object-cover shrink-0" />
                      ) : (
                        <div className="h-14 w-20 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: catColor + "18" }}>
                          <svg className="h-6 w-6" style={{ color: catColor + "80" }} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                          </svg>
                        </div>
                      )}

                      {/* Info + progress */}
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-sm font-semibold text-gray-900 line-clamp-1 group-hover:text-[#0822C0] transition-colors">{course.title}</p>
                          {isCompleted ? (
                            <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full shrink-0">Completed</span>
                          ) : done > 0 ? (
                            <span className="text-[10px] font-semibold text-[#0822C0] bg-blue-50 px-2 py-0.5 rounded-full shrink-0">In progress</span>
                          ) : (
                            <span className="text-[10px] font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full shrink-0">Not started</span>
                          )}
                        </div>

                        {/* Progress bar */}
                        {total > 0 && (
                          <div className="space-y-1">
                            <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{ width: `${pct}%`, backgroundColor: isCompleted ? "#16a34a" : "#0822C0" }}
                              />
                            </div>
                            <p className="text-[11px] text-gray-400">{done}/{total} lessons · {pct}%</p>
                          </div>
                        )}
                      </div>

                      <svg className="h-4 w-4 text-gray-300 shrink-0 group-hover:text-[#0822C0] transition-colors" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-5">

          {/* Next session */}
          <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-bold text-gray-900">Next Session</h2>
              <Link href="/account/bookings" className="text-xs font-semibold text-[#0822C0] hover:underline">All bookings</Link>
            </div>

            {!nextBooking ? (
              <div className="px-5 py-8 text-center">
                <div className="mx-auto mb-3 h-10 w-10 rounded-full bg-purple-50 flex items-center justify-center">
                  <svg className="h-5 w-5 text-purple-400" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-xs font-medium text-gray-500">No upcoming sessions</p>
                <Link href="/booking" className="inline-block mt-3 text-xs font-semibold text-[#0822C0] hover:underline">Book with Anne →</Link>
              </div>
            ) : (
              <div className="px-5 py-4 space-y-4">
                {/* Date badge */}
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-[#0822C0] flex flex-col items-center justify-center shrink-0">
                    <span className="text-[10px] font-bold text-white/60 uppercase leading-none">
                      {new Date(nextBooking.slot?.date).toLocaleDateString("en-GB", { month: "short" })}
                    </span>
                    <span className="text-xl font-black text-white leading-tight">
                      {new Date(nextBooking.slot?.date).getDate()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 leading-snug">{nextBooking.session?.title ?? "Session"}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(nextBooking.slot?.date).toLocaleDateString("en-GB", { weekday: "long" })}
                      {nextBooking.slot?.start_time ? ` · ${nextBooking.slot.start_time}` : ""}
                    </p>
                    {nextBooking.session?.duration_minutes && (
                      <p className="text-xs text-gray-400">{nextBooking.session.duration_minutes} min</p>
                    )}
                  </div>
                </div>

                {/* Status + action */}
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${nextBooking.status === "confirmed" ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"}`}>
                    {nextBooking.status === "confirmed" ? "Confirmed" : "Pending"}
                  </span>
                  {(nextBooking.notes || nextBooking.session?.google_meet_link) && nextBooking.status === "confirmed" && (
                    <a
                      href={nextBooking.notes || nextBooking.session?.google_meet_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-[#0822C0] rounded-lg px-3 py-1.5 hover:bg-[#061aa0] transition-colors"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                      </svg>
                      Join
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Quick links */}
          <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-bold text-gray-900">Quick Links</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {[
                { label: "My Courses", href: "/account/courses", icon: "M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" },
                { label: "Communities", href: "/account/communities", icon: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 8 0 4 4 0 0 0-8 0M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" },
                { label: "My Bookings", href: "/account/bookings", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
                { label: "Files & Materials", href: "/account/files", icon: "M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" },
                { label: "My Profile", href: "/account/profile", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
                { label: "Book a Session", href: "/booking", icon: "M12 4v16m8-8H4" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors"
                >
                  <svg className="h-4 w-4 text-gray-400 group-hover:text-[#0822C0] transition-colors shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                  </svg>
                  <span className="flex-1 text-xs font-medium text-gray-600 group-hover:text-gray-900">{item.label}</span>
                  <svg className="h-3.5 w-3.5 text-gray-300 group-hover:text-[#0822C0] transition-colors" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
