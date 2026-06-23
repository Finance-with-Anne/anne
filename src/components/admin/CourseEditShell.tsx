"use client";

import { useState } from "react";
import { useAdminTheme } from "@/lib/admin-theme";
import CourseWizard from "./CourseWizard";
import CourseResourcesTab from "./CourseResourcesTab";
import CourseAnnouncementsTab from "./CourseAnnouncementsTab";
import CourseReviewsTab from "./CourseReviewsTab";
import CourseSupportTab from "./CourseSupportTab";
import CourseQuizzesTab from "./CourseQuizzesTab";
import type { CourseCategory, CourseTag, Course } from "@/types";

type Tab = "edit" | "resources" | "quizzes" | "announcements" | "reviews" | "support";

const TABS: { id: Tab; label: string }[] = [
  { id: "edit", label: "Edit" },
  { id: "resources", label: "Resources" },
  { id: "quizzes", label: "Quizzes" },
  { id: "announcements", label: "Announcements" },
  { id: "reviews", label: "Reviews" },
  { id: "support", label: "Support" },
];

function LockedTab({ label, dark }: { label: string; dark: boolean }) {
  return (
    <div className={`rounded-2xl border py-20 flex flex-col items-center gap-3 ${dark ? "bg-[#111318] border-white/5" : "bg-white border-gray-200"}`}>
      <div className={`flex h-12 w-12 items-center justify-center rounded-full ${dark ? "bg-white/5" : "bg-gray-100"}`}>
        <svg className={`h-6 w-6 ${dark ? "text-white/20" : "text-gray-300"}`} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
        </svg>
      </div>
      <p className={`text-sm font-medium ${dark ? "text-white/30" : "text-gray-400"}`}>
        Save the course first to unlock {label}
      </p>
    </div>
  );
}

export default function CourseEditShell({
  courseId,
  courseTitle,
  categories,
  tags,
  initialData,
}: {
  courseId?: string;
  courseTitle?: string;
  categories: CourseCategory[];
  tags: CourseTag[];
  initialData?: Course & { tag_ids?: string[] };
}) {
  const { dark } = useAdminTheme();
  const [tab, setTab] = useState<Tab>("edit");

  const isNew = !courseId;

  const tabBtn = (active: boolean, locked?: boolean) =>
    locked
      ? dark ? "text-white/20 cursor-not-allowed" : "text-gray-300 cursor-not-allowed"
      : active
      ? dark ? "bg-white/10 text-white font-semibold" : "bg-white text-gray-900 font-semibold shadow-sm"
      : dark ? "text-white/40 hover:text-white/70 hover:bg-white/5" : "text-gray-500 hover:text-gray-800 hover:bg-white/60";

  function handleTabClick(t: Tab) {
    if (isNew && t !== "edit") return; // locked on new course
    setTab(t);
  }

  return (
    <div className="space-y-4">
      {/* Tab bar */}
      <div className={`flex items-center gap-1 rounded-xl border px-2 py-1.5 ${dark ? "bg-[#111318] border-white/5" : "bg-gray-100/70 border-gray-200"}`}>
        {TABS.map(t => {
          const locked = isNew && t.id !== "edit";
          return (
            <button
              key={t.id}
              onClick={() => handleTabClick(t.id)}
              title={locked ? "Save the course first to unlock this tab" : undefined}
              className={`flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-sm transition-colors ${tabBtn(tab === t.id, locked)}`}
            >
              {locked && (
                <svg className="h-3 w-3 opacity-60" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              )}
              {t.label}
            </button>
          );
        })}
        <span className={`ml-auto text-xs truncate ${dark ? "text-white/25" : "text-gray-400"}`}>
          {isNew ? "New Course" : courseTitle}
        </span>
      </div>

      {/* Tab content */}
      {tab === "edit" && (
        <CourseWizard categories={categories} tags={tags} initialData={initialData} />
      )}
      {tab === "resources" && (courseId ? <CourseResourcesTab courseId={courseId} /> : <LockedTab label="Resources" dark={dark} />)}
      {tab === "quizzes" && (courseId ? <CourseQuizzesTab courseId={courseId} /> : <LockedTab label="Quizzes" dark={dark} />)}
      {tab === "announcements" && (courseId ? <CourseAnnouncementsTab courseId={courseId} /> : <LockedTab label="Announcements" dark={dark} />)}
      {tab === "reviews" && (courseId ? <CourseReviewsTab courseId={courseId} /> : <LockedTab label="Reviews" dark={dark} />)}
      {tab === "support" && (courseId ? <CourseSupportTab courseId={courseId} /> : <LockedTab label="Support" dark={dark} />)}
    </div>
  );
}
