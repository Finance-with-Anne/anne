"use client";

import { useState } from "react";
import type { Course, CourseCategory } from "@/types";

type Currency = "NGN" | "USD" | "GBP";

interface Props {
  courses: Course[];
  categories: CourseCategory[];
  currency: Currency;
}

function formatPrice(course: Course, currency: Currency): string {
  if (currency === "GBP" && course.price_gbp != null) return `£${course.price_gbp.toLocaleString()}`;
  if (currency === "USD" && course.price_usd != null) return `$${course.price_usd.toLocaleString()}`;
  if (course.price_ngn != null) return `₦${course.price_ngn.toLocaleString()}`;
  if (course.price != null && course.price > 0) return `£${course.price.toLocaleString()}`;
  return "Free";
}

const LEVEL_COLORS: Record<string, string> = {
  beginner: "#10B981",
  intermediate: "#F59E0B",
  advanced: "#EF4444",
};

export default function CoursesShopClient({ courses, categories, currency }: Props) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filtered = courses.filter(c => {
    const matchCat = !activeCategory || c.category_id === activeCategory;
    const matchSearch = !search || c.title.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const activeLabel = activeCategory
    ? (categories.find(c => c.id === activeCategory)?.name ?? "All")
    : "All";

  return (
    <div className="bg-white dark:bg-[#05090f] min-h-screen">

      {/* Page header */}
      <div className="border-b border-gray-100 dark:border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
            Courses
          </h1>
          <p className="mt-2 text-gray-500 dark:text-white/40 text-sm max-w-xl">
            Practical financial education — learn at your own pace and take control of your money.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8 items-start">

          {/* Sidebar */}
          <aside className="hidden lg:flex flex-col w-48 shrink-0 sticky top-28">
            {/* Search */}
            <div className="relative mb-4">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 dark:text-white/30" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search courses..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full rounded-xl border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/5 pl-9 pr-3 py-2 text-xs text-gray-700 dark:text-white/60 placeholder-gray-400 dark:placeholder-white/20 focus:outline-none focus:border-[#0822C0]/40"
              />
            </div>

            <nav className="space-y-0.5">
              <button
                onClick={() => setActiveCategory(null)}
                className={`w-full text-left rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  activeCategory === null
                    ? "bg-[#0822C0]/10 text-[#0822C0] dark:bg-[#0822C0]/20 dark:text-blue-400"
                    : "text-gray-600 dark:text-white/40 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                All
                <span className={`ml-2 text-xs ${activeCategory === null ? "text-[#0822C0]/60 dark:text-blue-400/60" : "text-gray-400 dark:text-white/20"}`}>
                  {courses.length}
                </span>
              </button>

              {categories.map(cat => {
                const count = courses.filter(c => c.category_id === cat.id).length;
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(isActive ? null : cat.id)}
                    className={`w-full text-left flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-[#0822C0]/10 dark:bg-[#0822C0]/20"
                        : "text-gray-600 dark:text-white/40 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"
                    }`}
                    style={isActive ? { color: cat.color } : {}}
                  >
                    <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                    <span className="flex-1 truncate">{cat.name}</span>
                    <span className={`text-xs shrink-0 ${isActive ? "opacity-60" : "text-gray-400 dark:text-white/20"}`}>{count}</span>
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">

            {/* Mobile category scroll */}
            <div className="flex lg:hidden gap-2 mb-6 overflow-x-auto pb-1 scrollbar-hide">
              <button
                onClick={() => setActiveCategory(null)}
                className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                  activeCategory === null
                    ? "bg-[#0822C0] text-white"
                    : "bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-white/40"
                }`}
              >All</button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
                  className="shrink-0 flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition-colors"
                  style={activeCategory === cat.id
                    ? { backgroundColor: cat.color, color: "#fff" }
                    : { backgroundColor: "transparent", border: "1px solid #e5e7eb", color: "#6b7280" }
                  }
                >
                  {cat.name}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between mb-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-white/30">
                {activeLabel} <span className="normal-case font-normal">— {filtered.length} course{filtered.length !== 1 ? "s" : ""}</span>
              </p>
            </div>

            {filtered.length === 0 ? (
              <div className="py-24 text-center rounded-2xl border border-dashed border-gray-200 dark:border-white/5">
                <p className="text-sm text-gray-400 dark:text-white/20">No courses found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map(course => {
                  const priceStr = formatPrice(course, currency);
                  const lessonCount = (course as any).lesson_count ?? course.lessons?.length ?? 0;
                  const levelColor = LEVEL_COLORS[course.level] ?? "#6B7280";
                  const cat = course.category;
                  return (
                    <div
                      key={course.id}
                      className="group relative rounded-2xl overflow-hidden cursor-pointer"
                      style={{ aspectRatio: "4/3" }}
                    >
                      {/* Background */}
                      {course.thumbnail_url ? (
                        <img
                          src={course.thumbnail_url}
                          alt={course.title}
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div
                          className="absolute inset-0"
                          style={{ backgroundColor: cat?.color ? cat.color + "33" : "#0822C033" }}
                        />
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                      {/* Top badges */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                        {cat && (
                          <span
                            className="rounded-full px-2.5 py-1 text-[10px] font-bold text-white uppercase tracking-wide"
                            style={{ backgroundColor: cat.color + "cc" }}
                          >
                            {cat.name}
                          </span>
                        )}
                        <span
                          className="ml-auto rounded-full px-2.5 py-1 text-[10px] font-bold text-white capitalize"
                          style={{ backgroundColor: levelColor + "cc" }}
                        >
                          {course.level}
                        </span>
                      </div>

                      {/* Bottom info */}
                      <div className="absolute bottom-0 left-0 right-0 p-4 transition-transform duration-300 group-hover:-translate-y-12">
                        <p className="text-white font-bold text-base leading-tight line-clamp-2">{course.title}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-white/70 text-xs font-semibold">{priceStr}</span>
                          {lessonCount > 0 && (
                            <span className="text-white/40 text-xs">{lessonCount} lesson{lessonCount !== 1 ? "s" : ""}</span>
                          )}
                        </div>
                      </div>

                      {/* Hover CTA */}
                      <div className="absolute bottom-0 left-0 right-0 px-4 pb-4 flex gap-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <button className="flex-1 rounded-xl bg-white text-gray-900 text-xs font-bold py-2.5 hover:bg-gray-100 transition-colors">
                          Enroll Now
                        </button>
                        <button className="flex-1 rounded-xl bg-white/20 backdrop-blur text-white text-xs font-bold py-2.5 border border-white/30 hover:bg-white/30 transition-colors">
                          Preview
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
