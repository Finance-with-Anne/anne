"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAdminTheme } from "@/lib/admin-theme";
import ActionButton from "./ActionButton";

export default function CourseList({ courses }: { courses: any[] }) {
  const { dark } = useAdminTheme();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");

  const card = dark ? "bg-[#111318] border-white/5" : "bg-white border-gray-200";
  const heading = dark ? "text-white" : "text-gray-900";
  const sub = dark ? "text-white/40" : "text-gray-400";
  const tText = dark ? "text-white/85" : "text-gray-800";
  const tSub = dark ? "text-white/35" : "text-gray-400";
  const rowHover = dark ? "hover:bg-white/[0.03]" : "hover:bg-gray-50";
  const divider = dark ? "border-white/5" : "border-gray-100";
  const filterTab = (a: boolean) =>
    a
      ? dark ? "bg-white/10 text-white" : "bg-brand text-white"
      : dark ? "text-white/30 hover:text-white/60 hover:bg-white/5" : "text-gray-400 hover:text-gray-700 hover:bg-gray-100";
  const inputBg = dark
    ? "bg-white/5 border-white/5 text-white/70 placeholder-white/20"
    : "bg-gray-50 border-gray-200 text-gray-700 placeholder-gray-400";

  const filtered = courses.filter(c => {
    const matchF = filter === "all" || (filter === "published" ? c.published : !c.published);
    const matchS = !search || c.title.toLowerCase().includes(search.toLowerCase());
    return matchF && matchS;
  });

  function price(course: any) {
    if (course.price_ngn != null) return `₦${Number(course.price_ngn).toLocaleString()}`;
    if (course.price_gbp != null) return `£${Number(course.price_gbp).toLocaleString()}`;
    if (course.price_usd != null) return `$${Number(course.price_usd).toLocaleString()}`;
    if (Number(course.price) > 0) return `£${Number(course.price).toFixed(2)}`;
    return "Free";
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this course and all its lessons?")) return;
    await fetch(`/api/courses/${id}`, { method: "DELETE" });
    router.refresh();
  }

  async function togglePublish(course: any) {
    await fetch(`/api/courses/${course.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !course.published }),
    });
    router.refresh();
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className={`text-xl font-bold ${heading}`}>Courses</h1>
          <p className={`text-sm mt-0.5 ${sub}`}>{courses.length} courses</p>
        </div>
        <ActionButton label="New Course" onClick={() => router.push("/admin/courses/new")} />
      </div>

      <div className={`flex items-center justify-between px-4 py-3 rounded-xl border ${card}`}>
        <div className="flex items-center gap-1">
          {(["all", "published", "draft"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${filterTab(filter === f)}`}>
              {f}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Search courses…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className={`rounded-lg border px-3 py-1.5 text-xs focus:outline-none w-44 ${inputBg}`}
        />
      </div>

      {filtered.length === 0 ? (
        <div className={`rounded-xl border py-16 text-center text-sm ${card} ${sub}`}>No courses found.</div>
      ) : (
        <div className={`rounded-xl border overflow-hidden ${card}`}>
          {/* Header row */}
          <div className={`grid items-center gap-4 px-4 py-2.5 border-b text-xs font-medium ${tSub} ${divider}`}
            style={{ gridTemplateColumns: "3rem 1fr 5rem 5rem 5.5rem 6rem 6rem" }}>
            <div />
            <div>Course</div>
            <div className="text-center">Status</div>
            <div className="text-center">Lessons</div>
            <div className="text-center">Enrolled</div>
            <div className="text-right">Price</div>
            <div />
          </div>

          {/* Course rows */}
          {filtered.map((course, i) => (
            <div
              key={course.id}
              className={`grid items-center gap-4 px-4 py-3 border-b last:border-b-0 transition-colors ${rowHover} ${divider}`}
              style={{ gridTemplateColumns: "3rem 1fr 5rem 5rem 5.5rem 6rem 6rem" }}
            >
              {/* Thumbnail */}
              <div className="w-12 h-8 shrink-0">
                {course.thumbnail_url ? (
                  <img src={course.thumbnail_url} alt="" className="w-full h-full rounded-lg object-cover" />
                ) : (
                  <div className={`w-full h-full rounded-lg flex items-center justify-center ${dark ? "bg-white/5" : "bg-gray-100"}`}>
                    <svg className={`h-4 w-4 ${tSub}`} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Title + category */}
              <div className="min-w-0">
                <p className={`text-sm font-semibold truncate leading-tight ${tText}`}>{course.title}</p>
                {course.category?.name && (
                  <p className={`text-xs truncate mt-0.5 ${tSub}`}>{course.category.name}</p>
                )}
              </div>

              {/* Status */}
              <div className="text-center">
                <button
                  onClick={() => togglePublish(course)}
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
                    course.published
                      ? dark ? "bg-green-400/15 text-green-400 hover:bg-green-400/25" : "bg-green-50 text-green-600 hover:bg-green-100"
                      : dark ? "bg-white/5 text-white/30 hover:bg-white/10 hover:text-white/50" : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                  }`}
                >
                  {course.published ? "Live" : "Draft"}
                </button>
              </div>

              {/* Lessons */}
              <div className={`text-center text-xs ${tSub}`}>
                {course.lessons?.[0]?.count ?? 0}
              </div>

              {/* Enrolled */}
              <div className={`text-center text-xs ${tSub}`}>
                {course.enrollments?.[0]?.count ?? 0}
              </div>

              {/* Price */}
              <div className={`text-right text-xs font-bold ${tText}`}>
                {price(course)}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5 justify-end">
                <Link
                  href={`/admin/courses/${course.id}`}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-brand text-white hover:bg-brand-hover transition-colors"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(course.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    dark
                      ? "bg-white/5 text-white/35 hover:bg-red-400/10 hover:text-red-400"
                      : "bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-500"
                  }`}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
