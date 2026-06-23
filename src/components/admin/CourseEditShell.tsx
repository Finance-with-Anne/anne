"use client";

import { useState } from "react";
import { useAdminTheme } from "@/lib/admin-theme";
import CourseWizard from "./CourseWizard";
import CourseResourcesTab from "./CourseResourcesTab";
import CourseAnnouncementsTab from "./CourseAnnouncementsTab";
import CourseReviewsTab from "./CourseReviewsTab";
import CourseSupportTab from "./CourseSupportTab";
import type { CourseCategory, CourseTag, Course } from "@/types";

type Tab = "edit" | "resources" | "announcements" | "reviews" | "support";

const TABS: { id: Tab; label: string }[] = [
  { id: "edit", label: "Edit" },
  { id: "resources", label: "Resources" },
  { id: "announcements", label: "Announcements" },
  { id: "reviews", label: "Reviews" },
  { id: "support", label: "Support" },
];

export default function CourseEditShell({
  courseId,
  courseTitle,
  categories,
  tags,
  initialData,
}: {
  courseId: string;
  courseTitle: string;
  categories: CourseCategory[];
  tags: CourseTag[];
  initialData: Course & { tag_ids?: string[] };
}) {
  const { dark } = useAdminTheme();
  const [tab, setTab] = useState<Tab>("edit");

  const tabBtn = (active: boolean) =>
    active
      ? dark ? "bg-white/10 text-white font-semibold" : "bg-white text-gray-900 font-semibold shadow-sm"
      : dark ? "text-white/40 hover:text-white/70 hover:bg-white/5" : "text-gray-500 hover:text-gray-800 hover:bg-white/60";

  return (
    <div className="space-y-4">
      {/* Tab bar */}
      <div className={`flex items-center gap-1 rounded-xl border px-2 py-1.5 ${dark ? "bg-[#111318] border-white/5" : "bg-gray-100/70 border-gray-200"}`}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-lg px-4 py-1.5 text-sm transition-colors ${tabBtn(tab === t.id)}`}
          >
            {t.label}
          </button>
        ))}
        <span className={`ml-auto text-xs truncate ${dark ? "text-white/25" : "text-gray-400"}`}>{courseTitle}</span>
      </div>

      {/* Tab content */}
      {tab === "edit" && (
        <CourseWizard categories={categories} tags={tags} initialData={initialData} />
      )}
      {tab === "resources" && <CourseResourcesTab courseId={courseId} />}
      {tab === "announcements" && <CourseAnnouncementsTab courseId={courseId} />}
      {tab === "reviews" && <CourseReviewsTab courseId={courseId} />}
      {tab === "support" && <CourseSupportTab courseId={courseId} />}
    </div>
  );
}
