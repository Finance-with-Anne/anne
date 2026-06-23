"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  isLoggedIn: boolean;
  isEnrolled: boolean;
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
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const hh = String(h).padStart(2, "0");
  const mm = String(m).padStart(2, "0");
  return `${hh}:${mm}:00`;
}

function CheckIcon() {
  return (
    <svg className="h-4 w-4 shrink-0 text-green-500" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
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

type Tab = "description" | "curriculum";

export default function CourseDetailClient({ course, related, currency, totalLessons, totalMinutes, isLoggedIn, isEnrolled: initialEnrolled }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("description");
  const [enrolling, setEnrolling] = useState(false);
  const [enrolled, setEnrolled] = useState(initialEnrolled);
  const [openSections, setOpenSections] = useState<Set<string>>(
    new Set(course.sections.slice(0, 1).map(s => s.id))
  );

  const priceStr = formatPrice(course, currency);
  const isFree = priceStr === "Free";

  async function handleEnroll() {
    if (!isLoggedIn) {
      router.push(`/auth?next=/courses/${course.id}`);
      return;
    }
    if (enrolled) {
      router.push(`/learn/${course.id}`);
      return;
    }
    setEnrolling(true);
    try {
      const res = await fetch("/api/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: course.id }),
      });
      if (res.ok) {
        setEnrolled(true);
        router.push(`/learn/${course.id}`);
      }
    } finally {
      setEnrolling(false);
    }
  }
  const levelColor = LEVEL_COLORS[course.level] ?? "#6B7280";
  const allLessons = course.sections.flatMap(s => s.lessons);
  const videoCount = allLessons.filter(l => l.type === "video").length;
  const quizCount = allLessons.filter(l => l.type === "quiz").length;
  const allOpen = openSections.size === course.sections.length;

  function toggleSection(id: string) {
    setOpenSections(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "description", label: "Description" },
    { key: "curriculum", label: "Course content" },
  ];

  return (
    <div className="bg-gray-50 dark:bg-[#05090f] min-h-screen">

      {/* ── Hero ── */}
      <div className="relative overflow-hidden" style={{ minHeight: 300, backgroundColor: "#070F1E" }}>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
          <div className="flex items-start justify-between gap-10">

            {/* Left: text */}
            <div className="flex-1 min-w-0">
              {/* Breadcrumb */}
              <nav className="flex items-center gap-1.5 text-xs text-white/40 mb-5">
                <Link href="/" className="hover:text-white/70 transition-colors">Home</Link>
                <span>›</span>
                <Link href="/courses" className="hover:text-white/70 transition-colors">Courses</Link>
                <span>›</span>
                <span className="text-white/60 truncate max-w-[200px]">{course.title}</span>
              </nav>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight tracking-tight mb-3">
                {course.title}
              </h1>
              <p className="text-white/60 text-sm leading-relaxed max-w-xl mb-5">
                {course.description}
              </p>

              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2">
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
                <span className="rounded-full px-3 py-1 text-xs font-medium text-white/60 border border-white/20">
                  {course.language}
                </span>
              </div>
            </div>

            {/* Right: preview card */}
            <div className="hidden lg:block shrink-0 w-56">
              <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                <div className="relative" style={{ aspectRatio: "16/9" }}>
                  {course.thumbnail_url ? (
                    <img src={course.thumbnail_url} alt="" className="w-full h-full object-cover brightness-75" />
                  ) : (
                    <div className="w-full h-full" style={{ backgroundColor: "#0822C044" }} />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-12 w-12 rounded-full flex items-center justify-center border-2 border-white/70 backdrop-blur-sm bg-black/30">
                      <svg className="h-5 w-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="bg-[#0d1526] px-4 py-2.5">
                  <p className="text-white/50 text-xs font-medium">Overview</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tab bar ── */}
      <div className="bg-white dark:bg-[#070F1E] border-b border-gray-100 dark:border-white/5 sticky top-0 z-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6">
            {tabs.map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`py-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                  tab === t.key
                    ? "border-[#0822C0] text-[#0822C0] dark:text-blue-400 dark:border-blue-400"
                    : "border-transparent text-gray-400 dark:text-white/30 hover:text-gray-700 dark:hover:text-white/60"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 items-start">

          {/* Left: tab content */}
          <div className="min-w-0">

            {/* ── Description tab ── */}
            {tab === "description" && (
              <div className="space-y-8">
                {/* Course description */}
                <div className="bg-white dark:bg-[#0d1220] rounded-2xl p-6 border border-gray-100 dark:border-white/5">
                  <h2 className="text-base font-bold text-gray-900 dark:text-white mb-3">Course Description</h2>
                  <p className="text-sm text-gray-600 dark:text-white/50 leading-relaxed">{course.description}</p>
                </div>

                {/* What you'll learn */}
                {course.what_you_learn && course.what_you_learn.filter(Boolean).length > 0 && (
                  <div className="bg-white dark:bg-[#0d1220] rounded-2xl p-6 border border-gray-100 dark:border-white/5">
                    <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">What you will learn</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {course.what_you_learn.filter(Boolean).map((item, i) => (
                        <div key={i} className="flex items-start gap-2.5">
                          <CheckIcon />
                          <span className="text-sm text-gray-600 dark:text-white/60 leading-snug">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Requirements */}
                {course.requirements && course.requirements.filter(Boolean).length > 0 && (
                  <div className="bg-white dark:bg-[#0d1220] rounded-2xl p-6 border border-gray-100 dark:border-white/5">
                    <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">Requirements</h2>
                    <ul className="space-y-2.5">
                      {course.requirements.filter(Boolean).map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <span className="mt-2 h-1.5 w-1.5 rounded-full shrink-0 bg-gray-400 dark:bg-white/30" />
                          <span className="text-sm text-gray-600 dark:text-white/60 leading-snug">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* ── Curriculum tab ── */}
            {tab === "curriculum" && (
              <div className="bg-white dark:bg-[#0d1220] rounded-2xl border border-gray-100 dark:border-white/5 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/5">
                  <div>
                    <h2 className="text-base font-bold text-gray-900 dark:text-white">Course Content</h2>
                    <p className="text-xs text-gray-400 dark:text-white/30 mt-0.5">
                      {course.sections.length} section{course.sections.length !== 1 ? "s" : ""} · {totalLessons} lesson{totalLessons !== 1 ? "s" : ""}
                      {totalMinutes > 0 && ` · ${fmtDuration(totalMinutes)} total`}
                    </p>
                  </div>
                  <button
                    onClick={() => allOpen
                      ? setOpenSections(new Set())
                      : setOpenSections(new Set(course.sections.map(s => s.id)))
                    }
                    className="text-xs font-medium text-[#0822C0] dark:text-blue-400 hover:underline"
                  >
                    {allOpen ? "Collapse all" : "Expand all"}
                  </button>
                </div>

                <div className="divide-y divide-gray-50 dark:divide-white/3">
                  {course.sections.map(section => {
                    const isOpen = openSections.has(section.id);
                    const secMins = section.lessons.reduce((s, l) => s + (l.duration ?? 0), 0);
                    return (
                      <div key={section.id}>
                        <button
                          onClick={() => toggleSection(section.id)}
                          className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left bg-gray-50/60 dark:bg-white/2 hover:bg-gray-100 dark:hover:bg-white/4 transition-colors"
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
                            {secMins > 0 && <span>{secMins}m</span>}
                          </div>
                        </button>

                        {isOpen && (
                          <div className="divide-y divide-gray-50 dark:divide-white/3">
                            {section.lessons.map(lesson => (
                              <div key={lesson.id} className="flex items-center gap-3 px-5 py-3.5 bg-white dark:bg-transparent">
                                <span className="text-gray-400 dark:text-white/30">
                                  <TypeIcon type={lesson.type} />
                                </span>
                                <span className="flex-1 text-sm text-gray-700 dark:text-white/60 leading-snug">{lesson.title}</span>
                                {lesson.duration > 0 && (
                                  <span className="text-xs text-gray-400 dark:text-white/25 shrink-0">{lesson.duration}m</span>
                                )}
                                <svg className="h-3 w-3 shrink-0 text-gray-300 dark:text-white/15" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ── Right: sticky price card ── */}
          <div className="order-first lg:order-last">
            <div className="lg:sticky lg:top-20 bg-white dark:bg-[#0d1220] rounded-2xl border border-gray-100 dark:border-white/5 p-6 shadow-sm">
              <p className="text-xs font-semibold text-gray-400 dark:text-white/30 uppercase tracking-widest mb-1">
                Course Price
              </p>
              <p className="text-4xl font-black text-gray-900 dark:text-white mb-6">{priceStr}</p>

              <p className="text-xs font-bold text-gray-400 dark:text-white/30 uppercase tracking-widest mb-3">
                Course Format
              </p>
              <ul className="space-y-2.5 mb-6">
                {videoCount > 0 && (
                  <li className="flex items-center gap-2.5 text-sm text-gray-700 dark:text-white/60">
                    <CheckIcon />
                    {videoCount} video lesson{videoCount !== 1 ? "s" : ""}
                  </li>
                )}
                {quizCount > 0 && (
                  <li className="flex items-center gap-2.5 text-sm text-gray-700 dark:text-white/60">
                    <CheckIcon />
                    {quizCount} quiz{quizCount !== 1 ? "zes" : ""} for testing your knowledge
                  </li>
                )}
                {totalMinutes > 0 && (
                  <li className="flex items-center gap-2.5 text-sm text-gray-700 dark:text-white/60">
                    <CheckIcon />
                    Course Duration {fmtDuration(totalMinutes)}
                  </li>
                )}
                {course.certificate && (
                  <li className="flex items-center gap-2.5 text-sm text-gray-700 dark:text-white/60">
                    <CheckIcon />
                    Certificate of completion
                  </li>
                )}
                <li className="flex items-center gap-2.5 text-sm text-gray-700 dark:text-white/60">
                  <CheckIcon />
                  {course.language}
                </li>
              </ul>

              <button
                onClick={handleEnroll}
                disabled={enrolling}
                className="w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white transition-opacity hover:opacity-90 active:opacity-80 disabled:opacity-60"
                style={{ backgroundColor: "#0822C0" }}
              >
                {enrolling ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Enrolling…
                  </>
                ) : enrolled ? (
                  <>
                    Go to course
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                ) : (
                  <>
                    {isFree ? "Start for Free" : `Enroll — ${priceStr}`}
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </button>

              {!isLoggedIn && (
                <p className="text-center text-xs text-gray-400 dark:text-white/25 mt-3">
                  You&apos;ll be asked to sign in or create a free account.
                </p>
              )}
              {!isFree && isLoggedIn && !enrolled && (
                <p className="text-center text-xs text-gray-400 dark:text-white/25 mt-3">30-day money-back guarantee</p>
              )}

              {/* Tags */}
              {course.tags.length > 0 && (
                <div className="mt-5 pt-5 border-t border-gray-100 dark:border-white/5 flex flex-wrap gap-1.5">
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

        </div>
      </div>

      {/* ── Related courses ── */}
      {related.length > 0 && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-12">
          <div className="border-t border-gray-100 dark:border-white/5 pt-10">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">More Courses</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {related.map(c => {
                const price = formatPrice(c, currency);
                const lvlColor = LEVEL_COLORS[c.level] ?? "#6B7280";
                return (
                  <Link
                    key={c.id}
                    href={`/courses/${c.id}`}
                    className="group relative rounded-2xl overflow-hidden block"
                    style={{ aspectRatio: "4/3" }}
                  >
                    {c.thumbnail_url ? (
                      <img src={c.thumbnail_url} alt={c.title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="absolute inset-0" style={{ backgroundColor: c.category?.color ? c.category.color + "33" : "#0822C033" }} />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute top-3 right-3">
                      <span className="rounded-full px-2.5 py-1 text-[10px] font-bold text-white capitalize" style={{ backgroundColor: lvlColor + "cc" }}>
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
          </div>
        </div>
      )}
    </div>
  );
}
