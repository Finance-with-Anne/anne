"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Lesson {
  id: string;
  title: string;
  type: string;
  video_url?: string;
  content?: string;
  duration?: number;
}

interface Section {
  id: string;
  title: string;
  lessons: Lesson[];
}

interface Props {
  courseId: string;
  courseTitle: string;
  curriculum: Section[];
  initialLessonId: string | null;
  completedLessonIds: string[];
  backHref?: string;
}

function getEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com") || u.hostname.includes("youtu.be")) {
      const vid =
        u.searchParams.get("v") ??
        (u.hostname === "youtu.be" ? u.pathname.slice(1) : null);
      return vid ? `https://www.youtube.com/embed/${vid}` : null;
    }
    if (u.hostname.includes("vimeo.com")) {
      const id = u.pathname.split("/").filter(Boolean).pop();
      return id ? `https://player.vimeo.com/video/${id}` : null;
    }
    return null;
  } catch {
    return null;
  }
}

function isDirectVideo(url: string) {
  return /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url);
}

export default function CoursePlayer({
  courseId,
  courseTitle,
  curriculum,
  initialLessonId,
  completedLessonIds: initial,
  backHref = "/account/courses",
}: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [isPending, startTransition] = useTransition();

  const allLessons = curriculum.flatMap((s) => s.lessons ?? []);
  const [activeLessonId, setActiveLessonId] = useState(initialLessonId ?? allLessons[0]?.id ?? null);
  const [completed, setCompleted] = useState<Set<string>>(new Set(initial));
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  const activeLesson = allLessons.find((l) => l.id === activeLessonId) ?? null;

  function selectLesson(lessonId: string) {
    setActiveLessonId(lessonId);
    router.replace(`/learn/${courseId}?lesson=${lessonId}`, { scroll: false });
  }

  function toggleSection(sectionId: string) {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      next.has(sectionId) ? next.delete(sectionId) : next.add(sectionId);
      return next;
    });
  }

  async function markComplete() {
    if (!activeLesson || completed.has(activeLesson.id)) return;
    startTransition(async () => {
      await supabase.from("lesson_progress").upsert({
        user_id: (await supabase.auth.getUser()).data.user?.id,
        course_id: courseId,
        lesson_id: activeLesson.id,
        completed_at: new Date().toISOString(),
      });
      setCompleted((prev) => new Set([...prev, activeLesson.id]));

      // Advance to next lesson
      const idx = allLessons.findIndex((l) => l.id === activeLesson.id);
      if (idx !== -1 && idx < allLessons.length - 1) {
        selectLesson(allLessons[idx + 1].id);
      }
    });
  }

  const totalLessons = allLessons.length;
  const doneCount = allLessons.filter((l) => completed.has(l.id)).length;
  const progress = totalLessons > 0 ? Math.round((doneCount / totalLessons) * 100) : 0;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white">
      {/* Top bar */}
      <header className="flex items-center gap-3 h-12 px-4 border-b border-gray-100 bg-white shrink-0 z-10">
        {/* Exit */}
        <a
          href={backHref}
          className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-gray-700 transition-colors shrink-0"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </a>

        {/* Logo */}
        <a href="/" className="shrink-0">
          <img src="/fwa-dark.svg" alt="Finance with Anne" className="h-6 w-auto" />
        </a>

        <div className="h-4 w-px bg-gray-200 shrink-0" />

        {/* Course title */}
        <span className="text-xs font-semibold text-gray-700 truncate flex-1">{courseTitle}</span>

        {/* Progress */}
        <div className="hidden sm:flex items-center gap-2.5 shrink-0">
          <div className="w-32 h-1.5 rounded-full bg-gray-100 overflow-hidden">
            <div className="h-full rounded-full bg-[#0822C0] transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          <span className="text-[10px] font-semibold text-gray-400">{doneCount}/{totalLessons}</span>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? "w-72" : "w-0"} shrink-0 border-r border-gray-200 bg-white flex flex-col transition-all duration-300 overflow-hidden`}
      >
        {/* Course title in sidebar */}
        <div className="px-4 py-4 border-b border-gray-100 space-y-1">
          <p className="text-xs text-gray-400 font-medium">Course</p>
          <p className="text-sm font-bold text-gray-900 line-clamp-2 leading-snug">{courseTitle}</p>
          {/* Progress bar */}
          <div className="pt-1 space-y-1">
            <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
              <div className="h-full rounded-full bg-[#0822C0] transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-[10px] text-gray-400">{doneCount}/{totalLessons} lessons · {progress}%</p>
          </div>
        </div>

        {/* Curriculum */}
        <nav className="flex-1 overflow-y-auto py-2">
          {curriculum.map((section, si) => {
            const isCollapsed = collapsedSections.has(section.id);
            return (
              <div key={section.id}>
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between px-4 py-2.5 text-left"
                >
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {si + 1}. {section.title}
                  </span>
                  <svg className={`h-3.5 w-3.5 text-gray-400 transition-transform shrink-0 ${isCollapsed ? "-rotate-90" : ""}`} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {!isCollapsed && (
                  <ul>
                    {(section.lessons ?? []).map((lesson, li) => {
                      const isActive = lesson.id === activeLessonId;
                      const isDone = completed.has(lesson.id);
                      return (
                        <li key={lesson.id}>
                          <button
                            onClick={() => selectLesson(lesson.id)}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                              isActive ? "bg-[#0822C0]/5 text-[#0822C0]" : "hover:bg-gray-50 text-gray-700"
                            }`}
                          >
                            <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                              isDone
                                ? "border-green-500 bg-green-500"
                                : isActive
                                ? "border-[#0822C0]"
                                : "border-gray-200"
                            }`}>
                              {isDone && (
                                <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                              {!isDone && isActive && (
                                <div className="h-1.5 w-1.5 rounded-full bg-[#0822C0]" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="text-xs font-medium leading-snug block truncate">
                                {si + 1}.{li + 1} {lesson.title}
                              </span>
                              {lesson.duration && (
                                <span className="text-[10px] text-gray-400">{lesson.duration} min</span>
                              )}
                            </div>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Lesson bar */}
        <div className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-100 bg-white shrink-0">
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors shrink-0"
            title="Toggle curriculum"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-sm font-semibold text-gray-700 truncate">
            {activeLesson?.title ?? courseTitle}
          </span>
        </div>

        {/* Lesson area */}
        <div className="flex-1 overflow-y-auto">
          {!activeLesson ? (
            <div className="flex h-full items-center justify-center text-gray-400 text-sm">
              Select a lesson to begin.
            </div>
          ) : (
            <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
              {/* Video / media */}
              {activeLesson.video_url && (() => {
                const embedUrl = getEmbedUrl(activeLesson.video_url);
                if (embedUrl) {
                  return (
                    <div className="relative w-full rounded-2xl overflow-hidden bg-black" style={{ paddingBottom: "56.25%" }}>
                      <iframe
                        src={embedUrl}
                        className="absolute inset-0 h-full w-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  );
                }
                if (isDirectVideo(activeLesson.video_url)) {
                  return (
                    <video
                      src={activeLesson.video_url}
                      controls
                      className="w-full rounded-2xl bg-black"
                    />
                  );
                }
                return (
                  <a href={activeLesson.video_url} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-[#0822C0] hover:underline">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Open video resource
                  </a>
                );
              })()}

              {/* Text / HTML content */}
              {activeLesson.content && activeLesson.type !== "pdf" && (
                <div
                  className="prose prose-sm max-w-none text-gray-700"
                  dangerouslySetInnerHTML={{ __html: activeLesson.content }}
                />
              )}

              {/* PDF download */}
              {activeLesson.type === "pdf" && activeLesson.content && (
                <a
                  href={activeLesson.content}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:border-[#0822C0]/30 hover:text-[#0822C0] transition-all"
                >
                  <svg className="h-5 w-5 text-orange-500" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  {activeLesson.title}.pdf
                  <svg className="h-4 w-4 ml-1 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </a>
              )}

              {/* Mark complete */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center gap-3">
                  {completed.has(activeLesson.id) ? (
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-green-600">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Lesson completed
                    </span>
                  ) : (
                    <button
                      onClick={markComplete}
                      disabled={isPending}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#0822C0] text-white text-sm font-semibold px-5 py-2.5 hover:bg-[#061aa0] transition-colors disabled:opacity-50"
                    >
                      {isPending ? "Saving…" : "Mark as complete"}
                    </button>
                  )}
                </div>

                {/* Prev / Next */}
                <div className="flex items-center gap-2">
                  {(() => {
                    const idx = allLessons.findIndex((l) => l.id === activeLessonId);
                    const prev = idx > 0 ? allLessons[idx - 1] : null;
                    const next = idx < allLessons.length - 1 ? allLessons[idx + 1] : null;
                    return (
                      <>
                        <button
                          onClick={() => prev && selectLesson(prev.id)}
                          disabled={!prev}
                          className="p-2 rounded-lg border border-gray-200 text-gray-400 hover:text-gray-700 hover:border-gray-300 transition-colors disabled:opacity-30"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        <button
                          onClick={() => next && selectLesson(next.id)}
                          disabled={!next}
                          className="p-2 rounded-lg border border-gray-200 text-gray-400 hover:text-gray-700 hover:border-gray-300 transition-colors disabled:opacity-30"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      </div> {/* end body */}
    </div>
  );
}
