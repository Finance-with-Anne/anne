"use client";

import { useState } from "react";
import Link from "next/link";

type Currency = "NGN" | "USD" | "GBP";

interface Lesson {
  id: string;
  title: string;
  type: "video" | "text" | "quiz";
  duration: number;
  order: number;
}

interface Section {
  id: string;
  title: string;
  sort_order: number;
  lessons: Lesson[];
}

interface Tag { id: string; name: string; slug: string }

interface Course {
  id: string;
  title: string;
  description: string;
  level: "beginner" | "intermediate" | "advanced";
  language: string;
  thumbnail_url: string | null;
  what_you_learn: string[] | null;
  requirements: string[] | null;
  certificate: boolean;
  price: number;
  price_ngn: number | null;
  price_usd: number | null;
  price_gbp: number | null;
  category: { id: string; name: string; color: string } | null;
  sections: Section[];
  tags: Tag[];
}

interface Props {
  course: Course;
  related: any[];
  currency: Currency;
  totalLessons: number;
  totalMinutes: number;
}

const LEVEL_COLORS: Record<string, string> = {
  beginner: "#10B981",
  intermediate: "#F59E0B",
  advanced: "#EF4444",
};

function formatPrice(course: Pick<Course, "price" | "price_ngn" | "price_usd" | "price_gbp">, currency: Currency): string {
  if (currency === "GBP" && course.price_gbp != null) return `£${course.price_gbp.toLocaleString()}`;
  if (currency === "USD" && course.price_usd != null) return `$${course.price_usd.toLocaleString()}`;
  if (course.price_ngn != null) return `₦${course.price_ngn.toLocaleString()}`;
  if (course.price != null && course.price > 0) return `£${course.price.toLocaleString()}`;
  return "Free";
}

function fmtDuration(minutes: number): string {
  if (!minutes) return "";
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function TypeIcon({ type }: { type: "video" | "text" | "quiz" }) {
  if (type === "video") return (
    <svg className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
    </svg>
  );
  if (type === "quiz") return (
    <svg className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
  return (
    <svg className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg className="h-3 w-3 shrink-0 opacity-30" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );
}

export default function CourseDetailClient({ course, related, currency, totalLessons, totalMinutes }: Props) {
  const [openSections, setOpenSections] = useState<Set<string>>(
    new Set(course.sections.slice(0, 1).map(s => s.id))
  );
  const priceStr = formatPrice(course, currency);
  const isFree = priceStr === "Free";
  const levelColor = LEVEL_COLORS[course.level] ?? "#6B7280";

  function toggleSection(id: string) {
    setOpenSections(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function expandAll() {
    setOpenSections(new Set(course.sections.map(s => s.id)));
  }

  function collapseAll() {
    setOpenSections(new Set());
  }

  const allOpen = openSections.size === course.sections.length;

  return (
    <div className="bg-white dark:bg-[#05090f] min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Grid: content left, card right */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px]">

          {/* ── Right card (order-1 on mobile, sticky on desktop) ── */}
          <div className="order-1 lg:order-2 lg:border-l border-gray-100 dark:border-white/5 py-8 lg:pl-8">
            <div className="lg:sticky lg:top-24">
              {/* Thumbnail */}
              {course.thumbnail_url ? (
                <img
                  src={course.thumbnail_url}
                  alt={course.title}
                  className="w-full rounded-2xl object-cover aspect-video mb-6"
                />
              ) : (
                <div
                  className="w-full rounded-2xl aspect-video mb-6 flex items-center justify-center"
                  style={{ backgroundColor: course.category?.color ? course.category.color + "22" : "#0822C022" }}
                >
                  <svg className="h-12 w-12 text-gray-300 dark:text-white/20" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                  </svg>
                </div>
              )}

              {/* Price */}
              <div className="mb-4">
                <span className="text-3xl font-black text-gray-900 dark:text-white">{priceStr}</span>
              </div>

              {/* CTA */}
              <button
                className="w-full rounded-2xl py-3.5 text-sm font-bold text-white transition-opacity hover:opacity-90 active:opacity-80 mb-3"
                style={{ backgroundColor: "#0822C0" }}
              >
                {isFree ? "Enroll for Free" : "Enroll Now"}
              </button>

              <p className="text-center text-xs text-gray-400 dark:text-white/30 mb-6">30-day money-back guarantee</p>

              {/* Meta */}
              <ul className="space-y-2.5 text-sm">
                {totalLessons > 0 && (
                  <li className="flex items-center gap-2.5 text-gray-600 dark:text-white/50">
                    <svg className="h-4 w-4 shrink-0 text-gray-400 dark:text-white/30" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    {totalLessons} lesson{totalLessons !== 1 ? "s" : ""}
                  </li>
                )}
                {totalMinutes > 0 && (
                  <li className="flex items-center gap-2.5 text-gray-600 dark:text-white/50">
                    <svg className="h-4 w-4 shrink-0 text-gray-400 dark:text-white/30" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {fmtDuration(totalMinutes)} of content
                  </li>
                )}
                <li className="flex items-center gap-2.5 text-gray-600 dark:text-white/50">
                  <svg className="h-4 w-4 shrink-0 text-gray-400 dark:text-white/30" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
                  </svg>
                  {course.language}
                </li>
                <li className="flex items-center gap-2.5 text-gray-600 dark:text-white/50 capitalize">
                  <svg className="h-4 w-4 shrink-0 text-gray-400 dark:text-white/30" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span style={{ color: levelColor }}>{course.level}</span>
                </li>
                {course.certificate && (
                  <li className="flex items-center gap-2.5 text-gray-600 dark:text-white/50">
                    <svg className="h-4 w-4 shrink-0 text-gray-400 dark:text-white/30" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                    Certificate of completion
                  </li>
                )}
              </ul>

              {/* Tags */}
              {course.tags.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-1.5">
                  {course.tags.map(tag => (
                    <span
                      key={tag.id}
                      className="rounded-full border border-gray-100 dark:border-white/10 px-2.5 py-1 text-[11px] text-gray-500 dark:text-white/40"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Left: main content ── */}
          <div className="order-2 lg:order-1 py-8 lg:pr-12">

            {/* Back link */}
            <Link
              href="/courses"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-400 dark:text-white/30 hover:text-gray-900 dark:hover:text-white transition-colors mb-6"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              All Courses
            </Link>

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {course.category && (
                <span
                  className="rounded-full px-3 py-1 text-xs font-bold text-white"
                  style={{ backgroundColor: course.category.color }}
                >
                  {course.category.name}
                </span>
              )}
              <span
                className="rounded-full px-3 py-1 text-xs font-bold text-white capitalize"
                style={{ backgroundColor: levelColor }}
              >
                {course.level}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white leading-tight tracking-tight mb-4">
              {course.title}
            </h1>

            {/* Description */}
            <p className="text-gray-500 dark:text-white/50 text-base leading-relaxed mb-6">
              {course.description}
            </p>

            {/* Quick meta row */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-gray-400 dark:text-white/30 mb-10 pb-10 border-b border-gray-100 dark:border-white/5">
              {totalLessons > 0 && <span>{totalLessons} lessons</span>}
              {totalMinutes > 0 && <span>{fmtDuration(totalMinutes)}</span>}
              <span className="capitalize">{course.language}</span>
              {course.certificate && <span>Certificate</span>}
            </div>

            {/* What you'll learn */}
            {course.what_you_learn && course.what_you_learn.length > 0 && (
              <section className="mb-10">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-5">What You'll Learn</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {course.what_you_learn.filter(Boolean).map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <svg className="h-4 w-4 mt-0.5 shrink-0 text-green-500" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm text-gray-600 dark:text-white/60 leading-snug">{item}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Requirements */}
            {course.requirements && course.requirements.filter(Boolean).length > 0 && (
              <section className="mb-10">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-5">Requirements</h2>
                <ul className="space-y-2.5">
                  {course.requirements.filter(Boolean).map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full shrink-0 bg-gray-400 dark:bg-white/30" />
                      <span className="text-sm text-gray-600 dark:text-white/60 leading-snug">{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Curriculum */}
            {course.sections.length > 0 && (
              <section className="mb-10">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Curriculum</h2>
                  <button
                    onClick={allOpen ? collapseAll : expandAll}
                    className="text-xs font-medium text-[#0822C0] dark:text-blue-400 hover:underline"
                  >
                    {allOpen ? "Collapse all" : "Expand all"}
                  </button>
                </div>

                <div className="divide-y divide-gray-100 dark:divide-white/5 rounded-2xl border border-gray-100 dark:border-white/5 overflow-hidden">
                  {course.sections.map((section) => {
                    const isOpen = openSections.has(section.id);
                    const sectionMinutes = section.lessons.reduce((sum, l) => sum + (l.duration ?? 0), 0);
                    return (
                      <div key={section.id}>
                        {/* Section header */}
                        <button
                          onClick={() => toggleSection(section.id)}
                          className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left bg-gray-50/80 dark:bg-white/3 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <svg
                              className={`h-4 w-4 shrink-0 text-gray-400 dark:text-white/30 transition-transform ${isOpen ? "rotate-90" : ""}`}
                              fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                            <span className="font-semibold text-sm text-gray-900 dark:text-white truncate">{section.title}</span>
                          </div>
                          <div className="flex items-center gap-3 shrink-0 text-xs text-gray-400 dark:text-white/30">
                            <span>{section.lessons.length} lesson{section.lessons.length !== 1 ? "s" : ""}</span>
                            {sectionMinutes > 0 && <span>{fmtDuration(sectionMinutes)}</span>}
                          </div>
                        </button>

                        {/* Lessons */}
                        {isOpen && (
                          <div className="divide-y divide-gray-50 dark:divide-white/3">
                            {section.lessons.map((lesson) => (
                              <div
                                key={lesson.id}
                                className="flex items-center gap-3 px-5 py-3.5 bg-white dark:bg-transparent"
                              >
                                <span className="text-gray-400 dark:text-white/30">
                                  <TypeIcon type={lesson.type} />
                                </span>
                                <span className="flex-1 text-sm text-gray-700 dark:text-white/60 leading-snug">{lesson.title}</span>
                                <div className="flex items-center gap-2.5 shrink-0">
                                  {lesson.duration > 0 && (
                                    <span className="text-xs text-gray-400 dark:text-white/25">{fmtDuration(lesson.duration)}</span>
                                  )}
                                  <LockIcon />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </div>
        </div>

        {/* Related courses */}
        {related.length > 0 && (
          <section className="py-10 border-t border-gray-100 dark:border-white/5">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">More Courses</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {related.map((c) => {
                const price = formatPrice(c, currency);
                const lvlColor = LEVEL_COLORS[c.level] ?? "#6B7280";
                return (
                  <Link
                    key={c.id}
                    href={`/courses/${c.id}`}
                    className="group relative rounded-2xl overflow-hidden"
                    style={{ aspectRatio: "4/3" }}
                  >
                    {c.thumbnail_url ? (
                      <img
                        src={c.thumbnail_url}
                        alt={c.title}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div
                        className="absolute inset-0"
                        style={{ backgroundColor: c.category?.color ? c.category.color + "33" : "#0822C033" }}
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute top-3 right-3">
                      <span
                        className="rounded-full px-2.5 py-1 text-[10px] font-bold text-white capitalize"
                        style={{ backgroundColor: lvlColor + "cc" }}
                      >
                        {c.level}
                      </span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <p className="text-white font-bold text-sm leading-tight line-clamp-2 mb-1">{c.title}</p>
                      <span className="text-white/70 text-xs font-semibold">{price}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
