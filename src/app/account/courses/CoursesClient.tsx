"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

type Lesson = { id: string; duration?: number };
type CourseStats = {
  totalLessons: number;
  done: number;
  pct: number;
  totalMins: number;
  nextLesson: Lesson | undefined;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Enrollment = { enrolled_at: string; completed_at: string | null; course: any };
type Tab = "all" | "active" | "not-started" | "completed";

function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

export default function CoursesClient({
  enrollments,
  completedByCourse,
  totalDone,
}: {
  enrollments: Enrollment[];
  completedByCourse: Record<string, string[]>;
  totalDone: number;
}) {
  const [tab, setTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");

  function getCourseStats(e: Enrollment): CourseStats {
    const course = e.course;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allLessons: Lesson[] = (course.curriculum ?? []).flatMap((s: any) => s.lessons ?? []);
    const totalLessons = allLessons.length;
    const completedSet = new Set(completedByCourse[course.id] ?? []);
    const done = completedSet.size;
    const pct = totalLessons > 0 ? Math.round((done / totalLessons) * 100) : 0;
    const totalMins = allLessons.reduce((s, l) => s + (l.duration ?? 0), 0);
    const nextLesson = allLessons.find((l) => !completedSet.has(l.id));
    return { totalLessons, done, pct, totalMins, nextLesson };
  }

  function getVariant(e: Enrollment, stats: CourseStats): "progress" | "completed" | "default" {
    if (e.completed_at || (stats.totalLessons > 0 && stats.done >= stats.totalLessons)) return "completed";
    if (stats.done > 0) return "progress";
    return "default";
  }

  const counts = useMemo(() => ({
    all: enrollments.length,
    active: enrollments.filter((e) => {
      const { done, totalLessons } = getCourseStats(e);
      return done > 0 && done < totalLessons && !e.completed_at;
    }).length,
    "not-started": enrollments.filter((e) => getCourseStats(e).done === 0 && !e.completed_at).length,
    completed: enrollments.filter((e) => {
      const { done, totalLessons } = getCourseStats(e);
      return e.completed_at || (totalLessons > 0 && done >= totalLessons);
    }).length,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [enrollments]);

  const filtered = useMemo(() => {
    let list = enrollments;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((e) => e.course.title.toLowerCase().includes(q));
    }
    if (tab === "active") {
      list = list.filter((e) => {
        const { done, totalLessons } = getCourseStats(e);
        return done > 0 && done < totalLessons && !e.completed_at;
      });
    } else if (tab === "not-started") {
      list = list.filter((e) => getCourseStats(e).done === 0 && !e.completed_at);
    } else if (tab === "completed") {
      list = list.filter((e) => {
        const { done, totalLessons } = getCourseStats(e);
        return e.completed_at || (totalLessons > 0 && done >= totalLessons);
      });
    }
    return list;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enrollments, tab, search]);

  const tabs: { id: Tab; label: string }[] = [
    { id: "all", label: "All" },
    { id: "active", label: "Active" },
    { id: "not-started", label: "Not Started" },
    { id: "completed", label: "Completed" },
  ];

  const showGrouped = tab === "all" && !search.trim();

  const inProgress = filtered.filter((e) => {
    const { done, totalLessons } = getCourseStats(e);
    return done > 0 && done < totalLessons && !e.completed_at;
  });
  const notStarted = filtered.filter((e) => getCourseStats(e).done === 0 && !e.completed_at);
  const completedList = filtered.filter((e) => {
    const { done, totalLessons } = getCourseStats(e);
    return e.completed_at || (totalLessons > 0 && done >= totalLessons);
  });

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
          <p className="text-sm text-gray-400 mt-1">
            {enrollments.length} enrolled · {totalDone} lesson{totalDone !== 1 ? "s" : ""} completed
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

      {enrollments.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* Tabs + Search */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-white/5 rounded-xl p-1">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                    tab === t.id
                      ? "bg-white dark:bg-white/12 text-gray-900 dark:text-white shadow-sm"
                      : "text-gray-400 dark:text-white/40 hover:text-gray-600 dark:hover:text-white/70"
                  }`}
                >
                  {t.label}
                  {counts[t.id] > 0 && (
                    <span
                      className={`text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center ${
                        tab === t.id
                          ? "bg-[#0822C0]/10 dark:bg-blue-400/20 text-[#0822C0] dark:text-blue-400"
                          : "bg-gray-200/80 dark:bg-white/8 text-gray-400 dark:text-white/35"
                      }`}
                    >
                      {counts[t.id]}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search courses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-4 py-2 text-xs rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-700 dark:text-white/80 placeholder-gray-400 dark:placeholder-white/30 focus:outline-none focus:border-[#0822C0]/40 dark:focus:border-blue-400/40 focus:ring-1 focus:ring-[#0822C0]/20 w-48 transition-all"
              />
            </div>
          </div>

          {/* Results */}
          {filtered.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-sm font-medium text-gray-500">No courses found</p>
              <p className="text-xs text-gray-400 mt-1">Try a different search or tab.</p>
            </div>
          ) : showGrouped ? (
            <div className="space-y-10">
              {inProgress.length > 0 && (
                <SectionGroup title="Continue Learning" count={inProgress.length}>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {inProgress.map((e) => (
                      <CourseCard key={e.course.id} e={e} stats={getCourseStats(e)} variant="progress" />
                    ))}
                  </div>
                </SectionGroup>
              )}
              {notStarted.length > 0 && (
                <SectionGroup title="Not Started" count={notStarted.length}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {notStarted.map((e) => (
                      <CourseCard key={e.course.id} e={e} stats={getCourseStats(e)} variant="default" />
                    ))}
                  </div>
                </SectionGroup>
              )}
              {completedList.length > 0 && (
                <SectionGroup title="Completed" count={completedList.length}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {completedList.map((e) => (
                      <CourseCard key={e.course.id} e={e} stats={getCourseStats(e)} variant="completed" />
                    ))}
                  </div>
                </SectionGroup>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((e) => {
                const stats = getCourseStats(e);
                return <CourseCard key={e.course.id} e={e} stats={stats} variant={getVariant(e, stats)} />;
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function SectionGroup({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
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

function EmptyState() {
  return (
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
  );
}

function CourseCard({ e, stats, variant }: { e: Enrollment; stats: CourseStats; variant: "progress" | "default" | "completed" }) {
  const course = e.course;
  const { totalLessons, done, pct, totalMins, nextLesson } = stats;
  const catColor = course.category?.color ?? "#0822C0";
  const href = nextLesson
    ? `/learn/${course.id}?lesson=${nextLesson.id}`
    : `/learn/${course.id}`;

  const isProgress = variant === "progress";
  const isCompleted = variant === "completed";

  return (
    <div className={`group rounded-xl border bg-white overflow-hidden transition-all hover:shadow-md ${isCompleted ? "border-green-100" : "border-gray-200 hover:border-[#0822C0]/30"}`}>
      <div className="relative">
        {course.thumbnail_url ? (
          <img src={course.thumbnail_url} alt={course.title} className="w-full aspect-square object-cover" />
        ) : (
          <div className="aspect-square flex items-center justify-center" style={{ backgroundColor: catColor + "18" }}>
            <svg className="h-10 w-10" style={{ color: catColor + "80" }} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
            </svg>
          </div>
        )}
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

      {isProgress && (
        <div className="h-1 bg-gray-100">
          <div className="h-full bg-[#0822C0] transition-all" style={{ width: `${pct}%` }} />
        </div>
      )}
      {isCompleted && <div className="h-1 bg-green-500" />}

      <div className="p-4 space-y-3">
        {course.category?.name && (
          <span className="inline-block text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full" style={{ backgroundColor: catColor + "18", color: catColor }}>
            {course.category.name}
          </span>
        )}
        <p className="font-semibold text-sm text-gray-900 leading-snug line-clamp-2 group-hover:text-[#0822C0] transition-colors">
          {course.title}
        </p>
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
        {isProgress && (
          <p className="text-[11px] text-gray-400">{done} of {totalLessons} lessons done</p>
        )}
        <Link
          href={href}
          className={`block w-full text-center rounded-lg text-xs font-semibold py-2.5 transition-colors ${
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
