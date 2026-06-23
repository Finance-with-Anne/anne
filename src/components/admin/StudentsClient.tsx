"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAdminTheme } from "@/lib/admin-theme";
import StudentDetailPanel from "./StudentDetailPanel";

type StudentRow = {
  id: string;
  user_id: string;
  course_id: string;
  enrolled_at: string;
  completed_at: string | null;
  email: string;
  profile: { full_name: string | null; avatar_url: string | null } | null;
  course: { id: string; title: string; thumbnail_url: string | null; category: { name: string } | null } | null;
  lessonsCompleted: number;
  totalLessons: number;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function Avatar({ name, url, dark }: { name: string; url: string | null; dark: boolean }) {
  if (url) return <img src={url} alt={name} className="h-8 w-8 rounded-full object-cover" />;
  const initials = name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() || "?";
  return (
    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${dark ? "bg-white/10 text-white/60" : "bg-gray-200 text-gray-600"}`}>
      {initials}
    </div>
  );
}

export default function StudentsClient({
  students,
  courses,
  allCourses,
}: {
  students: StudentRow[];
  courses: { id: string; title: string }[];
  allCourses: { id: string; title: string }[];
}) {
  const { dark } = useAdminTheme();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "completed" | "in_progress" | "not_started">("all");

  // Student detail panel
  const [selectedStudent, setSelectedStudent] = useState<{ userId: string; name: string } | null>(null);

  // Manual enroll modal state
  const [enrollOpen, setEnrollOpen] = useState(false);
  const [enrollEmail, setEnrollEmail] = useState("");
  const [enrollCourseId, setEnrollCourseId] = useState("");
  const [enrolling, setEnrolling] = useState(false);
  const [enrollError, setEnrollError] = useState("");
  const [enrollSuccess, setEnrollSuccess] = useState("");

  const card = dark ? "bg-[#111318] border-white/5" : "bg-white border-gray-200";
  const heading = dark ? "text-white" : "text-gray-900";
  const sub = dark ? "text-white/40" : "text-gray-400";
  const tText = dark ? "text-white/85" : "text-gray-800";
  const tSub = dark ? "text-white/35" : "text-gray-400";
  const rowHover = dark ? "hover:bg-white/[0.03]" : "hover:bg-gray-50";
  const divider = dark ? "border-white/5" : "border-gray-100";
  const inputBg = dark
    ? "bg-white/5 border-white/5 text-white/70 placeholder-white/20"
    : "bg-gray-50 border-gray-200 text-gray-700 placeholder-gray-400";
  const selectBg = dark
    ? "bg-white/5 border-white/5 text-white/60"
    : "bg-gray-50 border-gray-200 text-gray-700";
  const filterTab = (a: boolean) =>
    a
      ? dark ? "bg-white/10 text-white" : "bg-brand text-white"
      : dark ? "text-white/30 hover:text-white/60 hover:bg-white/5" : "text-gray-400 hover:text-gray-700 hover:bg-gray-100";

  const filtered = useMemo(() => {
    return students.filter(s => {
      const name = s.profile?.full_name ?? "";
      const matchSearch =
        !search ||
        name.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase());
      const matchCourse = courseFilter === "all" || s.course_id === courseFilter;
      const pct = s.totalLessons > 0 ? Math.round((s.lessonsCompleted / s.totalLessons) * 100) : 0;
      const isCompleted = !!s.completed_at || pct === 100;
      const isNotStarted = s.lessonsCompleted === 0;
      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "completed" && isCompleted) ||
        (statusFilter === "not_started" && isNotStarted) ||
        (statusFilter === "in_progress" && !isCompleted && !isNotStarted);
      return matchSearch && matchCourse && matchStatus;
    });
  }, [students, search, courseFilter, statusFilter]);

  // Stats
  const totalStudents = new Set(students.map(s => s.user_id)).size;
  const totalEnrollments = students.length;
  const avgPct =
    students.length > 0
      ? Math.round(
          students.reduce((acc, s) => {
            const pct = s.totalLessons > 0 ? (s.lessonsCompleted / s.totalLessons) * 100 : 0;
            return acc + pct;
          }, 0) / students.length
        )
      : 0;
  const completedCount = students.filter(s => !!s.completed_at || (s.totalLessons > 0 && s.lessonsCompleted >= s.totalLessons)).length;

  const stats = [
    { label: "Total Students", value: totalStudents },
    { label: "Enrollments", value: totalEnrollments },
    { label: "Completions", value: completedCount },
    { label: "Avg Progress", value: `${avgPct}%` },
  ];

  async function handleEnroll() {
    if (!enrollEmail.trim() || !enrollCourseId) return;
    setEnrolling(true);
    setEnrollError("");
    setEnrollSuccess("");
    const res = await fetch("/api/admin/enroll", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: enrollEmail.trim(), course_id: enrollCourseId }),
    });
    const data = await res.json();
    setEnrolling(false);
    if (!res.ok) { setEnrollError(data.error ?? "Enrollment failed"); return; }
    const enrolledName = data.name || enrollEmail.trim();
    setEnrollSuccess(`✓ ${enrolledName} enrolled successfully.`);
    setEnrollEmail("");
    setEnrollCourseId("");
    setTimeout(() => { setEnrollOpen(false); setEnrollSuccess(""); router.refresh(); }, 2000);
  }

  return (
    <>
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className={`text-xl font-bold ${heading}`}>Students</h1>
          <p className={`text-sm mt-0.5 ${sub}`}>{totalStudents} students · {totalEnrollments} enrollments</p>
        </div>
        <button
          onClick={() => { setEnrollOpen(true); setEnrollError(""); setEnrollSuccess(""); }}
          className="flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-hover transition-colors"
          style={{ boxShadow: "0 0 18px #0822C055, 0 0 40px #0822C025" }}
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-md bg-white/15">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </span>
          Enroll Student
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map(s => (
          <div key={s.label} className={`rounded-xl border px-4 py-3 ${card}`}>
            <p className={`text-xs ${tSub}`}>{s.label}</p>
            <p className={`text-2xl font-bold mt-0.5 ${tText}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className={`flex flex-wrap items-center gap-3 px-4 py-3 rounded-xl border ${card}`}>
        <div className="flex items-center gap-1">
          {(["all", "in_progress", "completed", "not_started"] as const).map(f => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${filterTab(statusFilter === f)}`}
            >
              {f.replace("_", " ")}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <select
            value={courseFilter}
            onChange={e => setCourseFilter(e.target.value)}
            className={`rounded-lg border px-3 py-1.5 text-xs focus:outline-none ${selectBg}`}
          >
            <option value="all">All courses</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={`rounded-lg border px-3 py-1.5 text-xs focus:outline-none w-52 ${inputBg}`}
          />
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className={`rounded-xl border py-16 text-center text-sm ${card} ${sub}`}>No students found.</div>
      ) : (
        <div className={`rounded-xl border overflow-hidden ${card}`}>
          {/* Header */}
          <div
            className={`grid items-center gap-4 px-4 py-2.5 border-b text-xs font-medium ${tSub} ${divider}`}
            style={{ gridTemplateColumns: "1fr 1fr 1fr 6rem 8rem" }}
          >
            <div>Student</div>
            <div>Email</div>
            <div>Course</div>
            <div className="text-center">Enrolled</div>
            <div>Progress</div>
          </div>

          {/* Rows */}
          {filtered.map(s => {
            const name = s.profile?.full_name ?? "Unknown";
            const pct = s.totalLessons > 0 ? Math.round((s.lessonsCompleted / s.totalLessons) * 100) : 0;
            const isCompleted = !!s.completed_at || pct === 100;
            const isNotStarted = s.lessonsCompleted === 0;

            return (
              <div
                key={s.id}
                onClick={() => setSelectedStudent({ userId: s.user_id, name })}
                className={`grid items-center gap-4 px-4 py-3 border-b last:border-b-0 transition-colors cursor-pointer ${rowHover} ${divider}`}
                style={{ gridTemplateColumns: "1fr 1fr 1fr 6rem 8rem" }}
              >
                {/* Student */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar name={name} url={s.profile?.avatar_url ?? null} dark={dark} />
                  <span className={`text-sm font-medium truncate ${tText}`}>{name}</span>
                </div>

                {/* Email */}
                <div className={`text-xs truncate ${tSub}`}>{s.email}</div>

                {/* Course */}
                <div className="min-w-0">
                  <p className={`text-xs font-medium truncate ${tText}`}>{s.course?.title ?? "—"}</p>
                  {s.course?.category?.name && (
                    <p className={`text-xs truncate mt-0.5 ${tSub}`}>{s.course.category.name}</p>
                  )}
                </div>

                {/* Enrolled date */}
                <div className={`text-center text-xs ${tSub}`}>{formatDate(s.enrolled_at)}</div>

                {/* Progress */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs ${isCompleted ? "text-green-500" : isNotStarted ? tSub : "text-blue-400"}`}>
                      {isCompleted ? "Completed" : isNotStarted ? "Not started" : `${pct}%`}
                    </span>
                    {!isNotStarted && !isCompleted && (
                      <span className={`text-xs ${tSub}`}>{s.lessonsCompleted}/{s.totalLessons}</span>
                    )}
                  </div>
                  <div className={`h-1 rounded-full overflow-hidden ${dark ? "bg-white/10" : "bg-gray-100"}`}>
                    <div
                      className={`h-full rounded-full transition-all ${isCompleted ? "bg-green-500" : "bg-blue-500"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>

    {/* Manual Enroll Modal */}
    {enrollOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !enrolling && setEnrollOpen(false)} />
        <div className={`relative w-full max-w-sm rounded-2xl border shadow-2xl p-6 ${dark ? "bg-[#111318] border-white/8" : "bg-white border-gray-200"}`}>
          <h3 className={`text-base font-semibold mb-1 ${dark ? "text-white" : "text-gray-900"}`}>Enroll Student</h3>
          <p className={`text-sm mb-5 ${dark ? "text-white/40" : "text-gray-500"}`}>
            Enter the student's registered email address and select a course.
          </p>

          <div className="space-y-3">
            <div>
              <label className={`block text-xs font-medium mb-1.5 ${dark ? "text-white/50" : "text-gray-600"}`}>Email address</label>
              <input
                type="email"
                value={enrollEmail}
                onChange={e => setEnrollEmail(e.target.value)}
                placeholder="student@example.com"
                className={`w-full rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 ${inputBg}`}
              />
            </div>
            <div>
              <label className={`block text-xs font-medium mb-1.5 ${dark ? "text-white/50" : "text-gray-600"}`}>Course</label>
              <select
                value={enrollCourseId}
                onChange={e => setEnrollCourseId(e.target.value)}
                className={`w-full rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 ${selectBg}`}
              >
                <option value="">Select a course…</option>
                {allCourses.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>
          </div>

          {enrollError && (
            <p className="mt-3 text-xs text-red-400 font-medium">{enrollError}</p>
          )}
          {enrollSuccess && (
            <p className="mt-3 text-xs text-green-400 font-medium">{enrollSuccess}</p>
          )}

          <div className="flex gap-3 mt-5">
            <button
              onClick={() => setEnrollOpen(false)}
              disabled={enrolling}
              className={`flex-1 rounded-xl py-2.5 text-sm font-medium transition-colors ${dark ? "bg-white/6 text-white/60 hover:bg-white/10" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              Cancel
            </button>
            <button
              onClick={handleEnroll}
              disabled={enrolling || !enrollEmail.trim() || !enrollCourseId}
              className="flex-1 rounded-xl py-2.5 text-sm font-medium bg-brand text-white hover:bg-brand-hover transition-colors disabled:opacity-50"
            >
              {enrolling ? "Enrolling…" : "Enroll"}
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Student detail panel */}
    {selectedStudent && (
      <StudentDetailPanel
        userId={selectedStudent.userId}
        studentName={selectedStudent.name}
        onClose={() => setSelectedStudent(null)}
        onDeenrolled={() => { setSelectedStudent(null); router.refresh(); }}
      />
    )}
    </>
  );
}
