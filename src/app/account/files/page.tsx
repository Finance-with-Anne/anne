import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const metadata = { title: "Files & Templates — Finance with Anne" };

interface Purchase {
  id: string;
  name: string;
  download_url: string | null;
  purchased_at: string;
}

interface Lesson {
  id: string;
  title: string;
  type: string;
  content?: string;
  video_url?: string;
}

interface Section { id: string; lessons: Lesson[] }
interface CourseRow { id: string; title: string; curriculum: Section[] }
interface Enrollment { course: CourseRow | null }

interface FileItem {
  courseId: string;
  courseTitle: string;
  name: string;
  kind: "pdf" | "file" | "link";
  url: string;
  source: "lesson" | "resource";
}

export default async function AccountFilesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  // Purchased template products (orders linked to this user)
  const { data: ordersData } = await supabaseAdmin
    .from("orders")
    .select("id, items, created_at")
    .eq("user_id", user.id)
    .eq("status", "paid")
    .order("created_at", { ascending: false });

  const purchases: Purchase[] = [];
  for (const order of ordersData ?? []) {
    const items: { id: string; name: string }[] = order.items ?? [];
    for (const item of items) {
      const { data: product } = await supabaseAdmin
        .from("products")
        .select("download_url")
        .eq("id", item.id)
        .maybeSingle();
      purchases.push({
        id: `${order.id}-${item.id}`,
        name: item.name,
        download_url: product?.download_url ?? null,
        purchased_at: order.created_at,
      });
    }
  }

  // Get enrolled course IDs + curriculum
  const { data: enrollData } = await supabase
    .from("course_enrollments")
    .select("course:courses(id, title, curriculum)")
    .eq("user_id", user.id);

  const enrollments: Enrollment[] = (enrollData as unknown as Enrollment[]) ?? [];
  const enrolledIds = enrollments.map(e => e.course?.id).filter(Boolean) as string[];

  // Get admin-uploaded resources for enrolled courses (files and links only, not notes)
  const { data: resourceData } = enrolledIds.length
    ? await supabaseAdmin
        .from("course_resources")
        .select("id, course_id, title, type, url")
        .in("course_id", enrolledIds)
        .in("type", ["file", "link"])
        .order("created_at", { ascending: true })
    : { data: [] };

  const resources = resourceData ?? [];

  const files: FileItem[] = [];

  // 1 — PDF/document lessons (no videos)
  for (const e of enrollments) {
    const course = e.course;
    if (!course) continue;
    for (const section of course.curriculum ?? []) {
      for (const lesson of section.lessons ?? []) {
        if (lesson.type === "pdf" && lesson.content) {
          files.push({
            courseId: course.id,
            courseTitle: course.title,
            name: lesson.title,
            kind: "pdf",
            url: lesson.content,
            source: "lesson",
          });
        }
      }
    }
  }

  // 2 — Admin-uploaded course resources
  const courseMap = Object.fromEntries(enrollments.map(e => [e.course?.id, e.course?.title ?? ""]));
  for (const r of resources) {
    files.push({
      courseId: r.course_id,
      courseTitle: courseMap[r.course_id] ?? "Course",
      name: r.title,
      kind: r.type === "link" ? "link" : "file",
      url: r.url,
      source: "resource",
    });
  }

  // Group by course
  const grouped: Record<string, FileItem[]> = {};
  for (const f of files) {
    if (!grouped[f.courseId]) grouped[f.courseId] = [];
    grouped[f.courseId].push(f);
  }

  const kindMeta: Record<string, { icon: string; color: string; label: string }> = {
    pdf:  { icon: "M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z", color: "bg-orange-50 text-orange-500", label: "PDF" },
    file: { icon: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4",                                                   color: "bg-blue-50 text-[#0822C0]",   label: "File" },
    link: { icon: "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1", color: "bg-green-50 text-green-600", label: "Link" },
  };

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Files &amp; Templates</h1>
        <p className="text-sm text-gray-400 mt-1">Your purchased templates and course resources.</p>
      </div>

      {/* ── Purchased templates ── */}
      {purchases.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
            <svg className="h-4 w-4 text-violet-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Purchased Templates
          </h2>
          <div className="rounded-2xl border border-violet-100 bg-white overflow-hidden">
            <ul className="divide-y divide-gray-50">
              {purchases.map(p => (
                <li key={p.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50/60 transition-colors group">
                  <div className="h-10 w-10 rounded-xl bg-violet-50 flex items-center justify-center shrink-0">
                    <svg className="h-5 w-5 text-violet-500" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Purchased {new Date(p.purchased_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  {p.download_url ? (
                    <a
                      href={p.download_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 inline-flex items-center gap-1.5 rounded-xl border border-violet-200 text-xs font-semibold text-violet-600 px-3.5 py-2 hover:border-violet-400 hover:bg-violet-50 transition-colors"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Open
                    </a>
                  ) : (
                    <span className="shrink-0 text-xs text-gray-400 px-3.5 py-2">Coming soon</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* ── Course files ── */}
      {files.length === 0 && purchases.length === 0 ? (
        // empty state — no purchases AND no course files
        <div className="rounded-3xl border border-gray-100 bg-white overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-[#0822C0] via-blue-400 to-[#0822C0]/30" />
          <div className="px-8 py-16 text-center">
            <div className="mx-auto mb-5 h-16 w-16 rounded-2xl bg-[#0822C0]/8 flex items-center justify-center">
              <svg className="h-8 w-8 text-[#0822C0]/50" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-base font-semibold text-gray-900">No files yet</p>
            <p className="text-sm text-gray-400 mt-1.5 max-w-xs mx-auto leading-relaxed">
              PDFs and templates from your courses will appear here when added by Anne.
            </p>
          </div>
        </div>
      ) : files.length > 0 ? (
        <div className="space-y-4">
          {purchases.length > 0 && (
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <svg className="h-4 w-4 text-[#0822C0]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
              </svg>
              Course Resources
            </h2>
          )}
          {Object.entries(grouped).map(([courseId, items]) => (
            <div key={courseId} className="rounded-2xl border border-gray-100 bg-white overflow-hidden">
              {/* Course header */}
              <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100 bg-gray-50/60">
                <svg className="h-4 w-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                </svg>
                <p className="text-sm font-semibold text-gray-800">{items[0].courseTitle}</p>
                <span className="ml-auto text-[10px] font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                  {items.length} file{items.length !== 1 ? "s" : ""}
                </span>
              </div>

              {/* File list */}
              <ul className="divide-y divide-gray-50">
                {items.map((f, i) => {
                  const meta = kindMeta[f.kind];
                  return (
                    <li key={i} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50/60 transition-colors group">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${meta.color}`}>
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d={meta.icon} />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{f.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{meta.label}</p>
                      </div>
                      <a
                        href={f.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 inline-flex items-center gap-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 px-3.5 py-2 hover:border-[#0822C0]/40 hover:text-[#0822C0] transition-colors"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        {f.kind === "link" ? "Open" : "Download"}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
