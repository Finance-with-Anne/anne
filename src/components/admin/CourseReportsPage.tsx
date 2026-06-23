"use client";

import { useState } from "react";
import { useAdminTheme } from "@/lib/admin-theme";

type LeaderboardRow = {
  rank: number; userId: string; name: string; avatarUrl: string | null;
  totalLessons: number; coursesEnrolled: number; coursesCompleted: number; lastActive: string | null;
};
type ActiveRow = { userId: string; name: string; avatarUrl: string | null; lessonsThisWeek: number; lastActive: string | null };
type CourseRow = {
  id: string; title: string; thumbnail_url: string | null;
  enrolled: number; completed: number; avgProgress: number; avgRating: number | null; totalLessons: number;
};
type Props = {
  leaderboard: LeaderboardRow[];
  activeThisWeek: ActiveRow[];
  courseStats: CourseRow[];
  totalLessonsWatched: number;
  totalStudents: number;
  avgCompletionRate: number;
  activeThisWeekCount: number;
};

function timeAgo(iso: string | null) {
  if (!iso) return "—";
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 604800) return `${Math.floor(s / 86400)}d ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function Avatar({ name, url, size = 8 }: { name: string; url: string | null; size?: number }) {
  if (url) return <img src={url} alt={name} className={`h-${size} w-${size} rounded-full object-cover shrink-0`} />;
  const initials = name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() || "?";
  return (
    <div className={`h-${size} w-${size} rounded-full bg-[#0822C0]/10 flex items-center justify-center text-xs font-bold text-[#0822C0] shrink-0`}>
      {initials}
    </div>
  );
}

const MEDALS = ["🥇", "🥈", "🥉"];

export default function CourseReportsPage({
  leaderboard, activeThisWeek, courseStats,
  totalLessonsWatched, totalStudents, avgCompletionRate, activeThisWeekCount,
}: Props) {
  const { dark } = useAdminTheme();
  const [courseSearch, setCourseSearch] = useState("");

  const card = dark ? "bg-[#111318] border-white/5" : "bg-white border-gray-200";
  const heading = dark ? "text-white" : "text-gray-900";
  const sub = dark ? "text-white/40" : "text-gray-400";
  const divider = dark ? "border-white/5" : "border-gray-100";
  const tRow = dark ? "border-white/5 hover:bg-white/[0.03]" : "border-gray-100 hover:bg-gray-50";
  const tText = dark ? "text-white/80" : "text-gray-700";
  const tSub = dark ? "text-white/35" : "text-gray-400";
  const inputBg = dark ? "bg-white/5 border-white/5 text-white/70 placeholder-white/20" : "bg-gray-50 border-gray-200 text-gray-700 placeholder-gray-400";

  const filteredCourses = courseStats.filter(c =>
    !courseSearch || c.title.toLowerCase().includes(courseSearch.toLowerCase())
  );

  const stats = [
    { label: "Lessons Watched", value: totalLessonsWatched.toLocaleString(), icon: <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />, color: "text-blue-400", bg: dark ? "bg-blue-400/10" : "bg-blue-50" },
    { label: "Total Students", value: totalStudents.toLocaleString(), icon: <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />, color: "text-green-400", bg: dark ? "bg-green-400/10" : "bg-green-50" },
    { label: "Avg Completion", value: `${avgCompletionRate}%`, icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />, color: "text-purple-400", bg: dark ? "bg-purple-400/10" : "bg-purple-50" },
    { label: "Active This Week", value: activeThisWeekCount.toLocaleString(), icon: <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />, color: "text-amber-400", bg: dark ? "bg-amber-400/10" : "bg-amber-50" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-xl font-bold ${heading}`}>Course Reports</h1>
        <p className={`text-sm mt-0.5 ${sub}`}>Student leaderboard, activity, and per-course analytics.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className={`rounded-2xl border p-5 ${card}`}>
            <div className={`h-9 w-9 rounded-xl flex items-center justify-center mb-3 ${s.bg}`}>
              <svg className={`h-4.5 w-4.5 ${s.color}`} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">{s.icon}</svg>
            </div>
            <p className={`text-2xl font-extrabold ${heading}`}>{s.value}</p>
            <p className={`text-xs mt-0.5 ${sub}`}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Leaderboard + Active This Week */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* ── Leaderboard ── */}
        <div className={`lg:col-span-2 rounded-2xl border ${card}`}>
          <div className={`flex items-center justify-between px-5 py-4 border-b ${divider}`}>
            <div>
              <p className={`text-sm font-semibold ${heading}`}>Student Leaderboard</p>
              <p className={`text-xs mt-0.5 ${sub}`}>Ranked by total lessons completed</p>
            </div>
            <div className="flex items-center gap-1.5">
              <svg className="h-4 w-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 1a1 1 0 00-.894.553L7.382 5H4a1 1 0 000 2h.382l1.276 2.553A5 5 0 0010 19a5 5 0 004.342-9.447L15.618 7H16a1 1 0 000-2h-3.382L10.894 1.553A1 1 0 0010 1z" clipRule="evenodd" />
              </svg>
              <span className={`text-xs font-medium ${sub}`}>Top {leaderboard.length}</span>
            </div>
          </div>

          {leaderboard.length === 0 ? (
            <div className={`py-16 text-center text-sm ${sub}`}>No student activity yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <div style={{ minWidth: 560 }}>
                {/* Header */}
                <div className={`grid items-center px-5 py-2.5 border-b text-[10px] font-semibold uppercase tracking-wider ${tSub} ${divider}`}
                  style={{ gridTemplateColumns: "2.5rem 1fr 5rem 5rem 5rem 5.5rem" }}>
                  <div>#</div>
                  <div>Student</div>
                  <div className="text-center">Lessons</div>
                  <div className="text-center">Courses</div>
                  <div className="text-center">Finished</div>
                  <div className="text-right">Last Active</div>
                </div>

                {leaderboard.map((s) => (
                  <div key={s.userId}
                    className={`grid items-center px-5 py-3 border-b last:border-0 transition-colors ${tRow} ${divider}`}
                    style={{ gridTemplateColumns: "2.5rem 1fr 5rem 5rem 5rem 5.5rem" }}>

                    {/* Rank */}
                    <div className="shrink-0">
                      {s.rank <= 3 ? (
                        <span className="text-base leading-none">{MEDALS[s.rank - 1]}</span>
                      ) : (
                        <span className={`text-xs font-bold ${tSub}`}>#{s.rank}</span>
                      )}
                    </div>

                    {/* Name */}
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Avatar name={s.name} url={s.avatarUrl} size={8} />
                      <span className={`text-sm font-medium truncate ${tText}`}>{s.name}</span>
                    </div>

                    {/* Lessons */}
                    <div className="text-center">
                      <span className={`text-sm font-bold ${s.rank <= 3 ? "text-amber-500" : heading}`}>{s.totalLessons}</span>
                    </div>

                    {/* Courses enrolled */}
                    <div className={`text-center text-sm ${tText}`}>{s.coursesEnrolled}</div>

                    {/* Courses completed */}
                    <div className="text-center">
                      {s.coursesCompleted > 0 ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-500">
                          <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          {s.coursesCompleted}
                        </span>
                      ) : <span className={`text-xs ${tSub}`}>—</span>}
                    </div>

                    {/* Last active */}
                    <div className={`text-right text-xs ${tSub}`}>{timeAgo(s.lastActive)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Active This Week ── */}
        <div className={`rounded-2xl border ${card}`}>
          <div className={`px-5 py-4 border-b ${divider}`}>
            <p className={`text-sm font-semibold ${heading}`}>🔥 Highest This Week</p>
            <p className={`text-xs mt-0.5 ${sub}`}>Most lessons watched in the last 7 days</p>
          </div>

          {activeThisWeek.length === 0 ? (
            <div className={`py-12 text-center text-sm ${sub}`}>No activity this week.</div>
          ) : (
            <div className="p-3 space-y-2">
              {activeThisWeek.map((s, i) => (
                <div key={s.userId} className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${dark ? "hover:bg-white/[0.03]" : "hover:bg-gray-50"}`}>
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 text-sm font-black ${
                    i === 0 ? "bg-amber-400/15 text-amber-500" :
                    i === 1 ? "bg-gray-300/20 text-gray-500" :
                    i === 2 ? "bg-orange-400/15 text-orange-500" :
                    dark ? "bg-white/5 text-white/40" : "bg-gray-100 text-gray-400"
                  }`}>
                    {i < 3 ? ["🥇","🥈","🥉"][i] : `#${i+1}`}
                  </div>
                  <Avatar name={s.name} url={s.avatarUrl} size={8} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-semibold truncate ${dark ? "text-white/80" : "text-gray-800"}`}>{s.name}</p>
                    <p className={`text-[10px] ${sub}`}>Last: {timeAgo(s.lastActive)}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-sm font-extrabold ${heading}`}>{s.lessonsThisWeek}</p>
                    <p className={`text-[10px] ${sub}`}>lessons</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Course breakdown ── */}
      <div className={`rounded-2xl border ${card}`}>
        <div className={`flex items-center justify-between px-5 py-4 border-b ${divider}`}>
          <div>
            <p className={`text-sm font-semibold ${heading}`}>Course Breakdown</p>
            <p className={`text-xs mt-0.5 ${sub}`}>Enrollment, average progress, and rating per course</p>
          </div>
          <input
            type="text"
            placeholder="Search courses…"
            value={courseSearch}
            onChange={e => setCourseSearch(e.target.value)}
            className={`rounded-lg border px-3 py-1.5 text-xs focus:outline-none w-44 ${inputBg}`}
          />
        </div>

        {filteredCourses.length === 0 ? (
          <div className={`py-12 text-center text-sm ${sub}`}>No courses found.</div>
        ) : (
          <div className="overflow-x-auto">
            <div style={{ minWidth: 680 }}>
              <div className={`grid items-center px-5 py-2.5 border-b text-[10px] font-semibold uppercase tracking-wider ${tSub} ${divider}`}
                style={{ gridTemplateColumns: "1fr 5rem 5rem 8rem 5rem 5rem" }}>
                <div>Course</div>
                <div className="text-center">Enrolled</div>
                <div className="text-center">Completed</div>
                <div>Avg Progress</div>
                <div className="text-center">Rating</div>
                <div className="text-center">Lessons</div>
              </div>

              {filteredCourses.map(c => (
                <div key={c.id}
                  className={`grid items-center px-5 py-3.5 border-b last:border-0 transition-colors ${tRow} ${divider}`}
                  style={{ gridTemplateColumns: "1fr 5rem 5rem 8rem 5rem 5rem" }}>

                  {/* Course */}
                  <div className="flex items-center gap-3 min-w-0">
                    {c.thumbnail_url ? (
                      <img src={c.thumbnail_url} alt={c.title} className="h-8 w-12 rounded-md object-cover shrink-0" />
                    ) : (
                      <div className={`h-8 w-12 rounded-md shrink-0 ${dark ? "bg-white/5" : "bg-gray-100"}`} />
                    )}
                    <span className={`text-sm font-medium truncate ${tText}`}>{c.title}</span>
                  </div>

                  {/* Enrolled */}
                  <div className={`text-center text-sm font-semibold ${heading}`}>{c.enrolled}</div>

                  {/* Completed */}
                  <div className="text-center">
                    <span className={`text-xs font-medium ${c.completed > 0 ? "text-green-500" : tSub}`}>{c.completed}</span>
                    {c.enrolled > 0 && <span className={`text-[10px] ml-1 ${tSub}`}>({Math.round((c.completed / c.enrolled) * 100)}%)</span>}
                  </div>

                  {/* Avg progress bar */}
                  <div className="space-y-1">
                    <div className={`h-1.5 rounded-full overflow-hidden ${dark ? "bg-white/8" : "bg-gray-100"}`}>
                      <div
                        className={`h-full rounded-full ${c.avgProgress >= 75 ? "bg-green-500" : c.avgProgress >= 40 ? "bg-blue-500" : "bg-gray-300"}`}
                        style={{ width: `${c.avgProgress}%` }}
                      />
                    </div>
                    <span className={`text-[10px] ${tSub}`}>{c.avgProgress}% avg</span>
                  </div>

                  {/* Rating */}
                  <div className="text-center">
                    {c.avgRating ? (
                      <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-amber-500">
                        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        {Number(c.avgRating).toFixed(1)}
                      </span>
                    ) : <span className={`text-xs ${tSub}`}>—</span>}
                  </div>

                  {/* Total lessons */}
                  <div className={`text-center text-xs ${tSub}`}>{c.totalLessons}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
