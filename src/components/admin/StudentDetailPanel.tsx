"use client";

import { useEffect, useState } from "react";
import { useAdminTheme } from "@/lib/admin-theme";

type StudentDetail = {
  profile: { full_name: string | null; avatar_url: string | null; created_at: string } | null;
  email: string;
  enrollments: {
    id: string;
    course_id: string;
    enrolled_at: string;
    completed_at: string | null;
    course: { id: string; title: string; thumbnail_url: string | null } | null;
    totalLessons: number;
    lessonsCompleted: number;
    lastActivity: string | null;
  }[];
  totalLessonsCompleted: number;
  lastActive: string | null;
  activeDays: number;
  activityByDay: Record<string, number>;
};

function timeAgo(iso: string | null) {
  if (!iso) return "Never";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function Avatar({ name, url, dark, size = "md" }: { name: string; url: string | null; dark: boolean; size?: "md" | "lg" }) {
  const dim = size === "lg" ? "h-14 w-14 text-lg" : "h-9 w-9 text-sm";
  const initials = name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() || "?";
  if (url) return <img src={url} alt={name} className={`${dim} rounded-full object-cover shrink-0`} />;
  return (
    <div className={`${dim} rounded-full flex items-center justify-center font-bold shrink-0 ${dark ? "bg-white/10 text-white/60" : "bg-gray-200 text-gray-600"}`}>
      {initials}
    </div>
  );
}

function ActivityGrid({ activityByDay, dark }: { activityByDay: Record<string, number>; dark: boolean }) {
  const days = Object.entries(activityByDay);
  const max = Math.max(...Object.values(activityByDay), 1);

  function intensity(count: number) {
    if (count === 0) return dark ? "bg-white/5" : "bg-gray-100";
    const pct = count / max;
    if (pct < 0.25) return dark ? "bg-blue-400/25" : "bg-blue-100";
    if (pct < 0.5) return dark ? "bg-blue-400/45" : "bg-blue-200";
    if (pct < 0.75) return dark ? "bg-blue-400/65" : "bg-blue-400";
    return dark ? "bg-blue-400" : "bg-blue-500";
  }

  return (
    <div className="flex gap-1 flex-wrap">
      {days.map(([date, count]) => (
        <div
          key={date}
          title={`${date}: ${count} lesson${count !== 1 ? "s" : ""}`}
          className={`h-4 w-4 rounded-sm transition-colors ${intensity(count)}`}
        />
      ))}
    </div>
  );
}

export default function StudentDetailPanel({
  userId,
  studentName,
  onClose,
  onDeenrolled,
}: {
  userId: string;
  studentName: string;
  onClose: () => void;
  onDeenrolled: () => void;
}) {
  const { dark } = useAdminTheme();
  const [data, setData] = useState<StudentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [deenrolling, setDeenrolling] = useState<string | null>(null);
  const [confirmDe, setConfirmDe] = useState<{ courseId: string; courseTitle: string } | null>(null);

  const bg = dark ? "bg-[#0f1218]" : "bg-white";
  const border = dark ? "border-white/5" : "border-gray-200";
  const card = dark ? "bg-[#111318] border-white/5" : "bg-gray-50 border-gray-200";
  const tText = dark ? "text-white/85" : "text-gray-800";
  const tSub = dark ? "text-white/35" : "text-gray-500";
  const divider = dark ? "border-white/5" : "border-gray-100";

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/students/${userId}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [userId]);

  async function handleDeenroll(courseId: string) {
    setDeenrolling(courseId);
    await fetch(`/api/admin/students/${userId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ course_id: courseId }),
    });
    setDeenrolling(null);
    setConfirmDe(null);
    setData(prev => prev ? {
      ...prev,
      enrollments: prev.enrollments.filter(e => e.course_id !== courseId),
    } : prev);
    onDeenrolled();
  }

  const name = data?.profile?.full_name ?? studentName;

  const stats = data ? [
    { label: "Courses", value: data.enrollments.length },
    { label: "Lessons done", value: data.totalLessonsCompleted },
    { label: "Active days (30d)", value: `${data.activeDays}/30` },
    { label: "Last active", value: timeAgo(data.lastActive) },
  ] : [];

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className={`fixed right-0 top-0 z-50 h-full w-full max-w-[480px] flex flex-col border-l shadow-2xl ${bg} ${border}`}
        style={{ animation: "slideInRight 0.22s ease-out" }}>

        {/* Header */}
        <div className={`flex items-center justify-between px-5 py-4 border-b shrink-0 ${divider}`}>
          <h2 className={`text-sm font-semibold ${tText}`}>Student Profile</h2>
          <button
            onClick={onClose}
            className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${dark ? "text-white/30 hover:text-white/70 hover:bg-white/5" : "text-gray-400 hover:text-gray-700 hover:bg-gray-100"}`}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="space-y-4 p-5">
              {[...Array(4)].map((_, i) => (
                <div key={i} className={`h-16 rounded-xl animate-pulse ${dark ? "bg-white/5" : "bg-gray-100"}`} />
              ))}
            </div>
          ) : !data ? (
            <p className={`p-8 text-center text-sm ${tSub}`}>Failed to load student data.</p>
          ) : (
            <div className="space-y-5 p-5">
              {/* Identity */}
              <div className={`rounded-2xl border p-4 flex items-center gap-4 ${card}`}>
                <Avatar name={name} url={data.profile?.avatar_url ?? null} dark={dark} size="lg" />
                <div className="min-w-0">
                  <p className={`text-base font-bold truncate ${tText}`}>{name}</p>
                  <p className={`text-xs truncate mt-0.5 ${tSub}`}>{data.email}</p>
                  {data.profile?.created_at && (
                    <p className={`text-xs mt-1 ${tSub}`}>
                      Member since {new Date(data.profile.created_at).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}
                    </p>
                  )}
                </div>
                <a
                  href={`mailto:${data.email}`}
                  className="ml-auto shrink-0 flex items-center gap-1.5 rounded-xl bg-brand px-3 py-2 text-xs font-semibold text-white hover:bg-brand-hover transition-colors"
                >
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Email
                </a>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2">
                {stats.map(s => (
                  <div key={s.label} className={`rounded-xl border px-4 py-3 ${card}`}>
                    <p className={`text-[10px] uppercase tracking-wide font-medium ${tSub}`}>{s.label}</p>
                    <p className={`text-xl font-bold mt-0.5 ${tText}`}>{s.value}</p>
                  </div>
                ))}
              </div>

              {/* Activity heatmap (last 30 days) */}
              <div className={`rounded-2xl border p-4 ${card}`}>
                <div className="flex items-center justify-between mb-3">
                  <p className={`text-xs font-semibold ${tText}`}>Activity: last 30 days</p>
                  <p className={`text-xs ${tSub}`}>{data.activeDays} active day{data.activeDays !== 1 ? "s" : ""}</p>
                </div>
                <ActivityGrid activityByDay={data.activityByDay} dark={dark} />
                <div className={`flex items-center gap-1.5 mt-3 text-[10px] ${tSub}`}>
                  <div className={`h-3 w-3 rounded-sm ${dark ? "bg-white/5" : "bg-gray-100"}`} />
                  <span>No activity</span>
                  <div className={`ml-2 h-3 w-3 rounded-sm ${dark ? "bg-blue-400/25" : "bg-blue-100"}`} />
                  <div className={`h-3 w-3 rounded-sm ${dark ? "bg-blue-400/45" : "bg-blue-200"}`} />
                  <div className={`h-3 w-3 rounded-sm ${dark ? "bg-blue-400" : "bg-blue-500"}`} />
                  <span>More</span>
                </div>
              </div>

              {/* Enrolled courses */}
              <div>
                <p className={`text-xs font-semibold mb-2.5 ${tSub}`}>
                  ENROLLED COURSES ({data.enrollments.length})
                </p>

                {data.enrollments.length === 0 ? (
                  <div className={`rounded-2xl border py-8 text-center text-sm ${card} ${tSub}`}>Not enrolled in any course.</div>
                ) : (
                  <div className="space-y-2">
                    {data.enrollments.map(e => {
                      const pct = e.totalLessons > 0 ? Math.round((e.lessonsCompleted / e.totalLessons) * 100) : 0;
                      const isCompleted = !!e.completed_at || pct === 100;
                      const courseTitle = (e.course as any)?.title ?? "Unknown";

                      return (
                        <div key={e.id} className={`rounded-2xl border p-4 ${card}`}>
                          <div className="flex items-start gap-3">
                            {(e.course as any)?.thumbnail_url ? (
                              <img src={(e.course as any).thumbnail_url} alt="" className="h-10 w-16 rounded-lg object-cover shrink-0" />
                            ) : (
                              <div className={`h-10 w-16 rounded-lg shrink-0 flex items-center justify-center ${dark ? "bg-white/5" : "bg-gray-100"}`}>
                                <svg className={`h-4 w-4 ${tSub}`} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-semibold truncate ${tText}`}>{courseTitle}</p>
                              <div className="flex items-center gap-3 mt-1">
                                <span className={`text-xs ${tSub}`}>
                                  {e.lessonsCompleted}/{e.totalLessons} lessons
                                </span>
                                <span className={`text-xs ${isCompleted ? "text-green-400" : tSub}`}>
                                  {isCompleted ? "Completed" : `${pct}%`}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Progress bar */}
                          <div className={`mt-3 h-1.5 rounded-full overflow-hidden ${dark ? "bg-white/8" : "bg-gray-100"}`}>
                            <div
                              className={`h-full rounded-full ${isCompleted ? "bg-green-400" : "bg-blue-400"}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>

                          {/* Last activity + de-enroll */}
                          <div className="flex items-center justify-between mt-3">
                            <div>
                              <p className={`text-[10px] uppercase tracking-wide ${tSub}`}>Last watched</p>
                              <p className={`text-xs font-medium mt-0.5 ${e.lastActivity ? tText : tSub}`}>
                                {timeAgo(e.lastActivity)}
                              </p>
                            </div>
                            <div>
                              <p className={`text-[10px] uppercase tracking-wide ${tSub}`}>Enrolled</p>
                              <p className={`text-xs font-medium mt-0.5 ${tSub}`}>
                                {new Date(e.enrolled_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                              </p>
                            </div>
                            <button
                              onClick={() => setConfirmDe({ courseId: e.course_id, courseTitle })}
                              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${dark ? "text-red-400/70 hover:text-red-400 hover:bg-red-400/10 bg-white/5" : "text-red-400 hover:text-red-600 hover:bg-red-50 bg-gray-100"}`}
                            >
                              De-enroll
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* De-enroll confirmation */}
      {confirmDe && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setConfirmDe(null)} />
          <div className={`relative w-full max-w-xs rounded-2xl border shadow-2xl p-6 ${dark ? "bg-[#111318] border-white/8" : "bg-white border-gray-200"}`}>
            <div className={`mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full ${dark ? "bg-red-400/10" : "bg-red-50"}`}>
              <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6h7.5M21 12h-6m0 0l2-2m-2 2l2 2" />
              </svg>
            </div>
            <p className={`text-center text-sm font-semibold mb-1 ${tText}`}>De-enroll student?</p>
            <p className={`text-center text-xs mb-5 ${tSub}`}>
              Remove <span className={`font-medium ${dark ? "text-white/70" : "text-gray-700"}`}>{name}</span> from{" "}
              <span className={`font-medium ${dark ? "text-white/70" : "text-gray-700"}`}>"{confirmDe.courseTitle}"</span>?
              Their progress will be preserved.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDe(null)}
                className={`flex-1 rounded-xl py-2.5 text-sm font-medium ${dark ? "bg-white/6 text-white/60 hover:bg-white/10" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeenroll(confirmDe.courseId)}
                disabled={deenrolling === confirmDe.courseId}
                className="flex-1 rounded-xl py-2.5 text-sm font-medium bg-red-500 text-white hover:bg-red-600 disabled:opacity-60"
              >
                {deenrolling === confirmDe.courseId ? "Removing…" : "De-enroll"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0.5; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
    </>
  );
}
