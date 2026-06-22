import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const metadata = { title: "Files & Materials — Finance with Anne" };

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

interface CourseRow {
  id: string;
  title: string;
  curriculum: Section[];
}

interface Enrollment {
  course: CourseRow | null;
}

interface FileItem {
  courseId: string;
  courseTitle: string;
  lessonId: string;
  lessonTitle: string;
  type: "video" | "document" | "text";
  url: string;
}

export default async function AccountFilesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await supabase
    .from("course_enrollments")
    .select("course:courses(id, title, curriculum)")
    .eq("user_id", user.id);

  const enrollments: Enrollment[] = (data as unknown as Enrollment[]) ?? [];

  const files: FileItem[] = [];
  for (const e of enrollments) {
    const course = e.course;
    if (!course) continue;
    const sections: Section[] = course.curriculum ?? [];
    for (const section of sections) {
      for (const lesson of section.lessons ?? []) {
        if (lesson.video_url) {
          files.push({
            courseId: course.id,
            courseTitle: course.title,
            lessonId: lesson.id,
            lessonTitle: lesson.title,
            type: "video",
            url: lesson.video_url,
          });
        } else if (lesson.type === "pdf" && lesson.content) {
          files.push({
            courseId: course.id,
            courseTitle: course.title,
            lessonId: lesson.id,
            lessonTitle: lesson.title,
            type: "document",
            url: lesson.content,
          });
        }
      }
    }
  }

  const grouped: Record<string, FileItem[]> = {};
  for (const f of files) {
    if (!grouped[f.courseId]) grouped[f.courseId] = [];
    grouped[f.courseId].push(f);
  }

  const iconFor = (type: string) => {
    if (type === "video") return (
      <svg className="h-5 w-5 text-[#0822C0]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
      </svg>
    );
    return (
      <svg className="h-5 w-5 text-orange-500" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    );
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Files &amp; Materials</h1>
        <p className="text-sm text-gray-400 mt-1">Download videos and documents from your enrolled courses.</p>
      </div>

      {files.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 py-24 text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="h-6 w-6 text-gray-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-500">No files yet</p>
          <p className="text-xs text-gray-400 mt-1">Files from your courses will appear here.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([, items]) => {
            const { courseTitle } = items[0];
            const courseId = items[0].courseId;
            return (
              <div key={courseId} className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
                <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50">
                  <p className="text-sm font-semibold text-gray-800">{courseTitle}</p>
                </div>
                <ul className="divide-y divide-gray-100">
                  {items.map((f) => (
                    <li key={f.lessonId} className="flex items-center gap-4 px-5 py-3.5">
                      <div className="h-9 w-9 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                        {iconFor(f.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{f.lessonTitle}</p>
                        <p className="text-xs text-gray-400 capitalize">{f.type}</p>
                      </div>
                      <a
                        href={f.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 text-xs font-semibold text-[#0822C0] hover:underline flex items-center gap-1"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Open
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
