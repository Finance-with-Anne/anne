"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAdminTheme } from "@/lib/admin-theme";
import type { BlogPost, Category } from "@/types";

type Filter  = "all" | "published" | "draft" | "scheduled";
type PostStatus = "published" | "draft" | "scheduled";
type ViewCount = { post_id: string; views: number };
type PostCat   = { post_id: string; category_id: string };

function getStatus(post: BlogPost): PostStatus {
  if (post.published) return "published";
  if (post.published_at && new Date(post.published_at) > new Date()) return "scheduled";
  return "draft";
}

const STATUS_STYLE: Record<PostStatus, { dark: string; light: string; dot: string; label: string }> = {
  published: { dark: "bg-green-400/15 text-green-400",  light: "bg-green-50 text-green-700",  dot: "bg-green-400",       label: "Published" },
  scheduled: { dark: "bg-blue-400/15 text-blue-400",   light: "bg-blue-50 text-blue-700",    dot: "bg-blue-400",        label: "Scheduled" },
  draft:     { dark: "bg-white/5 text-white/30",        light: "bg-gray-100 text-gray-500",   dot: "bg-gray-400",        label: "Draft"     },
};

export default function BlogList({
  posts, categories = [], postCats = [], viewCounts = [],
}: {
  posts: BlogPost[];
  categories?: Category[];
  postCats?: PostCat[];
  viewCounts?: ViewCount[];
}) {
  const { dark } = useAdminTheme();
  const router   = useRouter();

  const [filter,     setFilter]     = useState<Filter>("all");
  const [catFilter,  setCatFilter]  = useState<string>("all");
  const [search,     setSearch]     = useState("");
  const [loading,    setLoading]    = useState<string | null>(null);
  const [featuredId, setFeaturedId] = useState<string | null>(
    posts.find(p => p.featured)?.id ?? null
  );

  async function setFeatured(postId: string) {
    const next = featuredId === postId ? null : postId;
    setFeaturedId(next);
    await fetch("/api/blog/set-featured", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ post_id: next }),
    });
    router.refresh();
  }

  // Status modal
  const [statusTarget, setStatusTarget] = useState<BlogPost | null>(null);
  const [scheduleDate, setScheduleDate] = useState("");
  const [statusAction, setStatusAction] = useState<PostStatus | null>(null);

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState<BlogPost | null>(null);

  // ── theme ──────────────────────────────────────────────────
  const card    = dark ? "bg-[#111318] border-white/5" : "bg-white border-gray-200";
  const modal   = dark ? "bg-[#1c1f27] border-white/10" : "bg-white border-gray-200";
  const heading = dark ? "text-white" : "text-gray-900";
  const sub     = dark ? "text-white/40" : "text-gray-500";
  const tHead   = dark ? "text-white/30 border-white/5 bg-white/2" : "text-gray-400 border-gray-100 bg-gray-50";
  const tRow    = dark ? "border-white/5 hover:bg-white/3" : "border-gray-100 hover:bg-gray-50";
  const tText   = dark ? "text-white/80" : "text-gray-800";
  const tSub    = dark ? "text-white/30" : "text-gray-400";
  const inputBg = dark ? "bg-white/5 border-white/5 text-white/70 placeholder-white/20 focus:border-white/20" : "bg-gray-50 border-gray-200 text-gray-700 placeholder-gray-400 focus:border-gray-300";
  const filterTab = (a: boolean) => a
    ? dark ? "bg-white/10 text-white" : "bg-brand text-white"
    : dark ? "text-white/30 hover:text-white/60 hover:bg-white/5" : "text-gray-400 hover:text-gray-700 hover:bg-gray-100";
  const divider = dark ? "border-white/5" : "border-gray-100";

  // ── derived ───────────────────────────────────────────────
  const counts = {
    all:       posts.length,
    published: posts.filter(p => getStatus(p) === "published").length,
    draft:     posts.filter(p => getStatus(p) === "draft").length,
    scheduled: posts.filter(p => getStatus(p) === "scheduled").length,
  };

  const viewMap  = Object.fromEntries(viewCounts.map(v => [v.post_id, v.views]));
  const catMap   = postCats.reduce<Record<string, string[]>>((acc, pc) => {
    (acc[pc.post_id] = acc[pc.post_id] ?? []).push(pc.category_id);
    return acc;
  }, {});
  const parentCats = categories.filter(c => !c.parent_id);

  const filtered = posts.filter(p => {
    const matchFilter = filter === "all" || getStatus(p) === filter;
    const matchSearch = !search || p.title?.toLowerCase().includes(search.toLowerCase());
    const matchCat    = catFilter === "all" || (catMap[p.id] ?? []).includes(catFilter);
    return matchFilter && matchSearch && matchCat;
  });

  // ── actions ───────────────────────────────────────────────
  async function applyStatus(post: BlogPost, next: PostStatus, date?: string) {
    setLoading(post.id);
    const body =
      next === "published" ? { published: true,  published_at: new Date().toISOString() } :
      next === "scheduled" ? { published: false, published_at: date ? new Date(date).toISOString() : null } :
      /* draft */            { published: false, published_at: null };

    await fetch(`/api/blog/${post.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    router.refresh();
    setLoading(null);
    setStatusTarget(null);
    setStatusAction(null);
    setScheduleDate("");
  }

  async function confirmDelete(post: BlogPost) {
    setLoading(post.id);
    await fetch(`/api/blog/${post.id}`, { method: "DELETE" });
    router.refresh();
    setLoading(null);
    setDeleteTarget(null);
  }

  // ── render ────────────────────────────────────────────────
  return (
    <>
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className={`text-xl font-bold ${heading}`}>Blog Posts</h1>
          <p className={`text-sm mt-0.5 ${sub}`}>{posts.length} posts total</p>
        </div>
        <Link href="/admin/blog/new"
          className={`flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 ${dark ? "bg-gradient-to-r from-blue-600 to-[#0F1F3D] border border-white/10" : "bg-gradient-to-r from-blue-600 to-brand"}`}>
          <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Post
        </Link>
      </div>

      <div className={`rounded-xl border ${card}`}>
        {/* Filters + search */}
        <div className={`flex items-center justify-between px-4 py-3 border-b ${divider}`}>
          <div className="flex items-center gap-1">
            {(["all", "published", "draft", "scheduled"] as Filter[]).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors capitalize ${filterTab(filter === f)}`}>
                {f}
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${filter === f ? "bg-white/20" : dark ? "bg-white/5" : "bg-gray-200"}`}>
                  {counts[f]}
                </span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            {/* Category filter */}
            {parentCats.length > 0 && (
              <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
                className={`rounded-lg border px-3 py-1.5 text-xs focus:outline-none transition-colors appearance-none pr-7 ${inputBg}`}
                style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' stroke='%236b7280' viewBox='0 0 24 24'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 8px center", backgroundSize: "14px" }}>
                <option value="all">All categories</option>
                {parentCats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            )}
            {/* Search */}
            <div className="relative w-44">
              <svg className={`absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 ${sub}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input type="text" placeholder="Search posts…" value={search} onChange={e => setSearch(e.target.value)}
                className={`w-full rounded-lg border pl-9 pr-3 py-1.5 text-xs focus:outline-none transition-colors ${inputBg}`} />
            </div>
          </div>
        </div>

        {/* Table */}
        {filtered.length === 0 ? (
          <div className={`py-16 text-center ${sub} text-sm`}>
            {search ? `No posts matching "${search}"` : filter !== "all" ? `No ${filter} posts yet.` : "No posts yet. Create your first one."}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className={`border-b text-xs uppercase tracking-wide ${tHead}`}>
                <th className="px-5 py-3 text-left font-medium">Title</th>
                <th className="px-5 py-3 text-left font-medium">Status</th>
                <th className="px-5 py-3 text-left font-medium">Views</th>
                <th className="px-5 py-3 text-left font-medium">Date</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(post => {
                const status = getStatus(post);
                const style  = STATUS_STYLE[status];
                return (
                  <tr key={post.id} className={`border-b last:border-0 transition-colors ${tRow}`}>
                    <td className="px-5 py-4">
                      <p className={`font-medium ${tText} line-clamp-1`}>{post.title}</p>
                      {post.excerpt && <p className={`text-xs mt-0.5 line-clamp-1 ${tSub}`}>{post.excerpt}</p>}
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => { setStatusTarget(post); setStatusAction(null); setScheduleDate(""); }}
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-all hover:opacity-80 cursor-pointer ${dark ? style.dark : style.light}`}>
                        <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${style.dot}`} />
                        {style.label}
                        <svg className="h-2.5 w-2.5 opacity-50 ml-0.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </td>
                    <td className={`px-5 py-4 ${tSub} text-xs`}>
                      {viewMap[post.id] ? (
                        <span className="flex items-center gap-1">
                          <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                          {viewMap[post.id].toLocaleString()}
                        </span>
                      ) : "—"}
                    </td>
                    <td className={`px-5 py-4 ${tSub} text-xs`}>
                      {status === "scheduled" && post.published_at
                        ? <>Scheduled for {new Date(post.published_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</>
                        : post.published_at
                        ? new Date(post.published_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
                        : new Date(post.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        {/* Feature toggle */}
                        <button
                          onClick={() => setFeatured(post.id)}
                          title={featuredId === post.id ? "Unset featured" : "Set as featured"}
                          className={`h-7 w-7 rounded-lg flex items-center justify-center transition-colors ${
                            featuredId === post.id
                              ? "text-amber-400 bg-amber-400/10"
                              : dark ? "text-white/20 hover:text-amber-400 hover:bg-amber-400/10" : "text-gray-300 hover:text-amber-500 hover:bg-amber-50"
                          }`}
                        >
                          <svg className="h-3.5 w-3.5" fill={featuredId === post.id ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                          </svg>
                        </button>
                        {post.published && (
                          <Link href={`/blog/${post.slug}`} target="_blank" title="View post"
                            className={`h-7 w-7 rounded-lg flex items-center justify-center transition-colors ${dark ? "text-white/20 hover:text-white/60 hover:bg-white/5" : "text-gray-300 hover:text-gray-600 hover:bg-gray-100"}`}>
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </Link>
                        )}
                        <Link href={`/admin/blog/${post.id}`} title="Edit post"
                          className={`h-7 w-7 rounded-lg flex items-center justify-center transition-colors ${dark ? "text-white/20 hover:text-white/60 hover:bg-white/5" : "text-gray-300 hover:text-gray-600 hover:bg-gray-100"}`}>
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Link>
                        <button onClick={() => setDeleteTarget(post)} disabled={loading === post.id} title="Delete post"
                          className={`h-7 w-7 rounded-lg flex items-center justify-center transition-colors ${dark ? "text-white/20 hover:text-red-400 hover:bg-red-400/10" : "text-gray-300 hover:text-red-500 hover:bg-red-50"}`}>
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>

    {/* ════ STATUS MODAL ════ */}
    {statusTarget && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={() => { setStatusTarget(null); setStatusAction(null); }}>
        <div className={`w-full max-w-sm rounded-2xl border shadow-2xl p-6 ${modal}`} onClick={e => e.stopPropagation()}>
          <div className="flex items-start justify-between mb-5">
            <div>
              <p className={`text-sm font-bold ${heading}`}>Change Status</p>
              <p className={`text-xs mt-0.5 line-clamp-1 ${sub}`}>{statusTarget.title}</p>
            </div>
            <button onClick={() => { setStatusTarget(null); setStatusAction(null); }} className={`text-sm ${sub} hover:opacity-70`}>✕</button>
          </div>

          {statusAction === null ? (
            // Step 1 – pick an action
            <div className="space-y-2">
              {/* Publish */}
              {getStatus(statusTarget) !== "published" && (
                <button onClick={() => setStatusAction("published")}
                  className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors ${dark ? "bg-green-500/10 hover:bg-green-500/20 border border-green-500/20" : "bg-green-50 hover:bg-green-100 border border-green-200"}`}>
                  <span className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center flex-none">
                    <svg className="h-4 w-4 text-green-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                    </svg>
                  </span>
                  <div>
                    <p className={`text-sm font-semibold ${dark ? "text-green-400" : "text-green-700"}`}>Publish</p>
                    <p className={`text-xs ${dark ? "text-green-400/60" : "text-green-600/70"}`}>Go live immediately on the site</p>
                  </div>
                </button>
              )}

              {/* Unpublish / Draft */}
              {getStatus(statusTarget) !== "draft" && (
                <button onClick={() => setStatusAction("draft")}
                  className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors ${dark ? "bg-white/5 hover:bg-white/8 border border-white/10" : "bg-gray-50 hover:bg-gray-100 border border-gray-200"}`}>
                  <span className={`h-8 w-8 rounded-full flex items-center justify-center flex-none ${dark ? "bg-white/10" : "bg-gray-200"}`}>
                    <svg className={`h-4 w-4 ${dark ? "text-white/60" : "text-gray-500"}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                    </svg>
                  </span>
                  <div>
                    <p className={`text-sm font-semibold ${dark ? "text-white/80" : "text-gray-700"}`}>
                      {getStatus(statusTarget) === "published" ? "Unpublish" : "Save as Draft"}
                    </p>
                    <p className={`text-xs ${sub}`}>Save privately, not visible on site</p>
                  </div>
                </button>
              )}

              {/* Schedule */}
              <button onClick={() => setStatusAction("scheduled")}
                className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors ${dark ? "bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20" : "bg-blue-50 hover:bg-blue-100 border border-blue-200"}`}>
                <span className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-none">
                  <svg className="h-4 w-4 text-blue-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                </span>
                <div>
                  <p className={`text-sm font-semibold ${dark ? "text-blue-400" : "text-blue-700"}`}>Schedule</p>
                  <p className={`text-xs ${dark ? "text-blue-400/60" : "text-blue-600/70"}`}>Set a future publish date and time</p>
                </div>
              </button>
            </div>
          ) : statusAction === "scheduled" ? (
            // Step 2a – schedule date picker
            <div className="space-y-4">
              <button onClick={() => setStatusAction(null)} className={`flex items-center gap-1.5 text-xs ${sub} hover:opacity-70`}>
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                Back
              </button>
              <div className="space-y-1.5">
                <p className={`text-xs font-medium ${sub}`}>Publish date & time</p>
                <input type="datetime-local" value={scheduleDate}
                  onChange={e => setScheduleDate(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none transition-colors ${dark ? "bg-white/5 border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"}`} />
              </div>
              <button
                disabled={!scheduleDate || loading === statusTarget.id}
                onClick={() => applyStatus(statusTarget, "scheduled", scheduleDate)}
                className="w-full py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-40">
                {loading === statusTarget.id ? "Scheduling…" : "Confirm Schedule"}
              </button>
            </div>
          ) : (
            // Step 2b – publish / draft confirmation
            <div className="space-y-4">
              <button onClick={() => setStatusAction(null)} className={`flex items-center gap-1.5 text-xs ${sub} hover:opacity-70`}>
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                Back
              </button>
              <div className={`rounded-xl p-4 text-sm ${dark ? "bg-white/5" : "bg-gray-50"}`}>
                <p className={heading}>
                  {statusAction === "published"
                    ? "Publish this post?"
                    : "Move to Draft?"}
                </p>
                <p className={`text-xs mt-1 ${sub}`}>
                  {statusAction === "published"
                    ? "It will go live immediately and be visible to all visitors."
                    : "It will be removed from the public site and saved privately."}
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setStatusAction(null)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors ${dark ? "border-white/10 text-white/60 hover:bg-white/5" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                  Cancel
                </button>
                <button onClick={() => applyStatus(statusTarget, statusAction)} disabled={loading === statusTarget.id}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-50 ${statusAction === "published" ? "bg-green-600 hover:bg-green-700" : "bg-brand hover:bg-brand-hover"}`}>
                  {loading === statusTarget.id ? "Saving…" : statusAction === "published" ? "Yes, Publish" : "Yes, Unpublish"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    )}

    {/* ════ DELETE MODAL ════ */}
    {deleteTarget && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={() => setDeleteTarget(null)}>
        <div className={`w-full max-w-sm rounded-2xl border shadow-2xl p-6 ${modal}`} onClick={e => e.stopPropagation()}>
          <div className="flex items-center gap-4 mb-5">
            <div className="h-11 w-11 rounded-full bg-red-500/15 flex items-center justify-center flex-none">
              <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className={`text-sm font-bold ${heading}`}>Delete Post</p>
              <p className={`text-xs mt-0.5 line-clamp-1 ${sub}`}>{deleteTarget.title}</p>
            </div>
          </div>

          <div className={`rounded-xl p-4 mb-4 ${dark ? "bg-red-500/5 border border-red-500/10" : "bg-red-50 border border-red-100"}`}>
            <p className={`text-sm ${dark ? "text-red-400" : "text-red-700"}`}>
              This will permanently delete the post and cannot be undone.
            </p>
          </div>

          <div className="flex gap-2">
            <button onClick={() => setDeleteTarget(null)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors ${dark ? "border-white/10 text-white/60 hover:bg-white/5" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
              Cancel
            </button>
            <button onClick={() => confirmDelete(deleteTarget)} disabled={loading === deleteTarget.id}
              className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors disabled:opacity-50">
              {loading === deleteTarget.id ? "Deleting…" : "Delete Post"}
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
