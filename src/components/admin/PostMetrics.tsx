"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useAdminTheme } from "@/lib/admin-theme";

type Post = {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  published_at: string | null;
  cover_image: string | null;
  views: number;
  likes: number;
  comments: number;
  pending_comments: number;
  avg_read_secs: number | null;
};

type SortKey = "views" | "likes" | "comments" | "avg_read_secs" | "published_at";

function fmtDuration(secs: number | null) {
  if (!secs) return "—";
  if (secs < 60) return `${secs}s`;
  return `${Math.floor(secs / 60)}m ${secs % 60}s`;
}

function fmtDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function PostMetricsClient({ posts }: { posts: Post[] }) {
  const { dark } = useAdminTheme();
  const [sort, setSort] = useState<SortKey>("views");
  const [dir, setDir] = useState<"desc" | "asc">("desc");

  const card = dark ? "bg-[#111318] border-white/5" : "bg-white border-gray-200";
  const heading = dark ? "text-white" : "text-gray-900";
  const sub = dark ? "text-white/40" : "text-gray-500";
  const divider = dark ? "border-white/5" : "border-gray-100";
  const rowHover = dark ? "hover:bg-white/3" : "hover:bg-gray-50/70";

  function toggleSort(key: SortKey) {
    if (sort === key) setDir(d => d === "desc" ? "asc" : "desc");
    else { setSort(key); setDir("desc"); }
  }

  const sorted = useMemo(() => {
    return [...posts].sort((a, b) => {
      const av = a[sort] ?? -1;
      const bv = b[sort] ?? -1;
      return dir === "desc" ? (bv > av ? 1 : -1) : (av > bv ? 1 : -1);
    });
  }, [posts, sort, dir]);

  const totalViews = posts.reduce((s, p) => s + p.views, 0);
  const totalLikes = posts.reduce((s, p) => s + p.likes, 0);
  const totalComments = posts.reduce((s, p) => s + p.comments, 0);
  const pendingComments = posts.reduce((s, p) => s + p.pending_comments, 0);
  const avgRead = posts.filter(p => p.avg_read_secs).length
    ? Math.round(posts.filter(p => p.avg_read_secs).reduce((s, p) => s + (p.avg_read_secs ?? 0), 0) / posts.filter(p => p.avg_read_secs).length)
    : null;

  const stats = [
    { label: "Total Views", value: totalViews.toLocaleString(), icon: "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z", color: "blue" },
    { label: "Total Likes", value: totalLikes.toLocaleString(), icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z", color: "red" },
    { label: "Comments", value: totalComments.toLocaleString(), icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z", color: "green" },
    { label: "Avg. Read Time", value: fmtDuration(avgRead), icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z", color: "purple" },
  ];

  const colorMap: Record<string, string> = {
    blue: dark ? "bg-blue-500/15 text-blue-400" : "bg-blue-50 text-blue-600",
    red: dark ? "bg-red-500/15 text-red-400" : "bg-red-50 text-red-500",
    green: dark ? "bg-green-500/15 text-green-400" : "bg-green-50 text-green-600",
    purple: dark ? "bg-purple-500/15 text-purple-400" : "bg-purple-50 text-purple-600",
  };

  function SortIcon({ k }: { k: SortKey }) {
    if (sort !== k) return (
      <svg className={`h-3 w-3 ml-1 opacity-30`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
      </svg>
    );
    return (
      <svg className={`h-3 w-3 ml-1 ${dark ? "text-white/60" : "text-gray-600"}`} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d={dir === "desc" ? "M19 9l-7 7-7-7" : "M5 15l7-7 7 7"} />
      </svg>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-xl font-bold ${heading}`}>Post Metrics</h1>
        <p className={`text-sm mt-0.5 ${sub}`}>{posts.length} posts · performance overview</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className={`rounded-2xl border p-4 ${card}`}>
            <div className={`h-9 w-9 rounded-xl flex items-center justify-center mb-3 ${colorMap[s.color]}`}>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d={s.icon} />
              </svg>
            </div>
            <p className={`text-2xl font-bold ${heading}`}>{s.value}</p>
            <p className={`text-xs mt-0.5 ${sub}`}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Pending comments alert */}
      {pendingComments > 0 && (
        <div className={`flex items-center justify-between rounded-xl border px-4 py-3 ${dark ? "bg-amber-500/8 border-amber-500/20" : "bg-amber-50 border-amber-100"}`}>
          <p className={`text-sm font-medium ${dark ? "text-amber-400" : "text-amber-700"}`}>
            {pendingComments} comment{pendingComments !== 1 ? "s" : ""} awaiting review
          </p>
          <Link href="/admin/blog/comments" className={`text-xs font-semibold underline ${dark ? "text-amber-400" : "text-amber-700"}`}>
            Review now →
          </Link>
        </div>
      )}

      {/* Table */}
      <div className={`rounded-2xl border overflow-hidden ${card}`}>
        <div className={`grid text-[11px] uppercase tracking-wide font-semibold px-5 py-3 border-b ${dark ? "text-white/30 border-white/5 bg-white/2" : "text-gray-400 border-gray-100 bg-gray-50"}`}
          style={{ gridTemplateColumns: "1fr 80px 70px 70px 80px 90px" }}>
          <div>Post</div>
          <button className="flex items-center" onClick={() => toggleSort("views")}>Views <SortIcon k="views" /></button>
          <button className="flex items-center" onClick={() => toggleSort("likes")}>Likes <SortIcon k="likes" /></button>
          <button className="flex items-center" onClick={() => toggleSort("comments")}>Cmts <SortIcon k="comments" /></button>
          <button className="flex items-center" onClick={() => toggleSort("avg_read_secs")}>Avg read <SortIcon k="avg_read_secs" /></button>
          <button className="flex items-center" onClick={() => toggleSort("published_at")}>Date <SortIcon k="published_at" /></button>
        </div>

        {sorted.length === 0 ? (
          <p className={`py-16 text-center text-sm ${sub}`}>No posts yet.</p>
        ) : sorted.map(post => (
          <div
            key={post.id}
            className={`grid items-center px-5 py-3.5 border-b last:border-0 transition-colors ${divider} ${rowHover}`}
            style={{ gridTemplateColumns: "1fr 80px 70px 70px 80px 90px" }}
          >
            {/* Title */}
            <div className="flex items-center gap-3 min-w-0 pr-4">
              <div className="h-8 w-12 shrink-0 rounded-md overflow-hidden bg-gray-100">
                {post.cover_image && (
                  <img src={post.cover_image} alt="" className="h-full w-full object-cover" />
                )}
              </div>
              <div className="min-w-0">
                <Link href={`/admin/blog/${post.id}`} className={`text-sm font-medium truncate block hover:underline ${heading}`}>
                  {post.title}
                </Link>
                <span className={`text-[10px] ${post.published ? "text-green-500" : sub}`}>
                  {post.published ? "Published" : "Draft"}
                </span>
              </div>
            </div>

            {/* Views */}
            <div className={`text-sm font-semibold ${heading}`}>{post.views.toLocaleString()}</div>

            {/* Likes */}
            <div className="flex items-center gap-1">
              <svg className="h-3.5 w-3.5 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span className={`text-sm font-medium ${heading}`}>{post.likes}</span>
            </div>

            {/* Comments */}
            <div className="flex items-center gap-1">
              <span className={`text-sm font-medium ${heading}`}>{post.comments}</span>
              {post.pending_comments > 0 && (
                <span className="text-[10px] font-bold text-amber-500">+{post.pending_comments}</span>
              )}
            </div>

            {/* Avg read */}
            <div className={`text-sm ${sub}`}>{fmtDuration(post.avg_read_secs)}</div>

            {/* Date */}
            <div className={`text-xs ${sub}`}>{fmtDate(post.published_at)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
