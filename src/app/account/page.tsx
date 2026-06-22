import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const metadata = { title: "Dashboard — Finance with Anne" };

export default async function AccountDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [profileRes, enrollmentsRes, bookingsRes] = await Promise.all([
    supabase.from("profiles").select("full_name").eq("id", user.id).single(),
    supabase
      .from("course_enrollments")
      .select(`enrolled_at, completed_at, course:courses(id, title, thumbnail_url, level, curriculum)`)
      .eq("user_id", user.id)
      .order("enrolled_at", { ascending: false })
      .limit(3),
    supabase
      .from("bookings")
      .select(`id, date, status, notes, session:booking_sessions(title), slot:booking_slots(date, start_time)`)
      .eq("client_email", user.email!)
      .in("status", ["confirmed", "pending"])
      .order("created_at", { ascending: false })
      .limit(3),
  ]);

  const firstName = profileRes.data?.full_name?.split(" ")[0] ?? "there";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const enrollments: any[] = enrollmentsRes.data ?? [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bookings: any[] = bookingsRes.data ?? [];

  const enrolledCount = enrollments.length;
  const completedCount = enrollments.filter((e) => e.completed_at).length;

  function lessonCount(curriculum: unknown[]) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (curriculum ?? []).reduce((s: number, sec: any) => s + (sec.lessons?.length ?? 0), 0);
  }

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Good day, {firstName} 👋</h1>
        <p className="text-sm text-gray-400 mt-1">Here&apos;s what&apos;s happening in your learning journey.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: "Enrolled", value: enrolledCount, icon: "M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z", color: "blue" },
          { label: "Completed", value: completedCount, icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", color: "green" },
          { label: "Bookings", value: bookings.length, icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z", color: "purple" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-gray-200 bg-white p-5 flex items-center gap-4">
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
              stat.color === "blue" ? "bg-blue-50 text-[#0822C0]" :
              stat.color === "green" ? "bg-green-50 text-green-600" :
              "bg-purple-50 text-purple-600"
            }`}>
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d={stat.icon} />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-400">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Continue Learning */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">Continue Learning</h2>
            <Link href="/account/courses" className="text-xs text-[#0822C0] hover:underline">View all</Link>
          </div>

          {enrollments.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 py-12 text-center">
              <p className="text-sm text-gray-400">No courses enrolled yet.</p>
              <Link href="/courses" className="inline-block mt-3 text-xs font-semibold text-[#0822C0] hover:underline">Browse Courses →</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {enrollments.map((e) => {
                const course = e.course;
                if (!course) return null;
                const lessons = lessonCount(course.curriculum);
                return (
                  <Link
                    key={course.id}
                    href={`/account/courses/${course.id}`}
                    className="group flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 hover:border-[#0822C0]/30 hover:shadow-sm transition-all"
                  >
                    {course.thumbnail_url ? (
                      <img src={course.thumbnail_url} alt={course.title} className="h-14 w-20 rounded-lg object-cover shrink-0" />
                    ) : (
                      <div className="h-14 w-20 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                        <svg className="h-6 w-6 text-[#0822C0]/40" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                        </svg>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 line-clamp-1 group-hover:text-[#0822C0] transition-colors">{course.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{lessons} lesson{lessons !== 1 ? "s" : ""} · {course.level}</p>
                    </div>
                    {e.completed_at ? (
                      <span className="text-xs font-medium text-green-600 bg-green-50 px-2.5 py-1 rounded-full shrink-0">Done</span>
                    ) : (
                      <svg className="h-4 w-4 text-gray-300 shrink-0 group-hover:text-[#0822C0] transition-colors" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Upcoming Bookings */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">Upcoming Sessions</h2>
            <Link href="/account/bookings" className="text-xs text-[#0822C0] hover:underline">View all</Link>
          </div>

          {bookings.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 py-12 text-center">
              <p className="text-sm text-gray-400">No upcoming bookings.</p>
              <Link href="/booking" className="inline-block mt-3 text-xs font-semibold text-[#0822C0] hover:underline">Book a session →</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.map((b) => {
                const slotDate = b.slot?.date ?? b.date;
                const slotTime = b.slot?.start_time ?? "";
                const title = b.session?.title ?? "Session";
                const isPending = b.status === "pending";
                return (
                  <div key={b.id} className="rounded-2xl border border-gray-200 bg-white p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-gray-900 line-clamp-2">{title}</p>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${isPending ? "bg-yellow-50 text-yellow-700" : "bg-green-50 text-green-700"}`}>
                        {isPending ? "Pending" : "Confirmed"}
                      </span>
                    </div>
                    {slotDate && (
                      <p className="text-xs text-gray-400">
                        {new Date(slotDate).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}
                        {slotTime ? ` · ${slotTime}` : ""}
                      </p>
                    )}
                    {b.notes && (
                      <a href={b.notes} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-[#0822C0] hover:underline">
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                        </svg>
                        Join meeting
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
