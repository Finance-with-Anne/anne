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
  const tText = dark ? "text-white/80" : "text-gray-800";
  const tSub = dark ? "text-white/30" : "text-gray-400";
  const filterTab = (a: boolean) => a ? dark ? "bg-white/10 text-white" : "bg-brand text-white" : dark ? "text-white/30 hover:text-white/60 hover:bg-white/5" : "text-gray-400 hover:text-gray-700 hover:bg-gray-100";
  const inputBg = dark ? "bg-white/5 border-white/5 text-white/70 placeholder-white/20" : "bg-gray-50 border-gray-200 text-gray-700 placeholder-gray-400";

  const filtered = courses.filter(c => {
    const matchF = filter === "all" || (filter === "published" ? c.published : !c.published);
    const matchS = !search || c.title.toLowerCase().includes(search.toLowerCase());
    return matchF && matchS;
  });

  async function handleDelete(id: string) {
    if (!confirm("Delete this course and all its lessons?")) return;
    await fetch(`/api/courses/${id}`, { method: "DELETE" });
    router.refresh();
  }

  async function togglePublish(course: any) {
    await fetch(`/api/courses/${course.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ published: !course.published }) });
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
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${filterTab(filter === f)}`}>{f}</button>
          ))}
        </div>
        <input type="text" placeholder="Search courses…" value={search} onChange={e => setSearch(e.target.value)} className={`rounded-lg border px-3 py-1.5 text-xs focus:outline-none w-44 ${inputBg}`} />
      </div>

      {filtered.length === 0 ? (
        <div className={`rounded-xl border py-16 text-center text-sm ${card} ${sub}`}>No courses found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(course => (
            <div key={course.id} className={`rounded-xl border overflow-hidden ${card}`}>
              {course.thumbnail_url ? (
                <img src={course.thumbnail_url} alt="" className="h-40 w-full object-cover" />
              ) : (
                <div className={`h-40 flex items-center justify-center ${dark ? "bg-white/3" : "bg-gray-50"}`}>
                  <svg className={`h-10 w-10 ${sub}`} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" /></svg>
                </div>
              )}
              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <p className={`font-semibold text-sm leading-snug ${tText}`}>{course.title}</p>
                  <button onClick={() => togglePublish(course)} className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${course.published ? dark ? "bg-green-400/15 text-green-400" : "bg-green-50 text-green-600" : dark ? "bg-white/5 text-white/30" : "bg-gray-100 text-gray-400"}`}>
                    {course.published ? "Live" : "Draft"}
                  </button>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className={tSub}>{course.lessons?.[0]?.count ?? 0} lessons</span>
                  <span className={`font-bold ${tText}`}>
                    {course.price_ngn != null ? `₦${Number(course.price_ngn).toLocaleString()}`
                      : course.price_gbp != null ? `£${Number(course.price_gbp).toLocaleString()}`
                      : course.price_usd != null ? `$${Number(course.price_usd).toLocaleString()}`
                      : Number(course.price) > 0 ? `£${Number(course.price).toFixed(2)}`
                      : "Free"}
                  </span>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <Link href={`/admin/courses/${course.id}`} className="flex-1 text-center rounded-lg py-1.5 text-xs font-medium bg-brand text-white hover:bg-brand-hover transition-colors">Edit</Link>
                  <button onClick={() => handleDelete(course.id)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${dark ? "bg-white/5 text-white/40 hover:bg-red-400/10 hover:text-red-400" : "bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-500"}`}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
