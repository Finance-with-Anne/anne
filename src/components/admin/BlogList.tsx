"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAdminTheme } from "@/lib/admin-theme";
import ActionButton from "./ActionButton";
import type { BlogPost } from "@/types";

type Filter = "all" | "published" | "draft";

export default function BlogList({ posts }: { posts: BlogPost[] }) {
  const { dark } = useAdminTheme();
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  const card    = dark ? "bg-[#111318] border-white/5" : "bg-white border-gray-200";
  const heading = dark ? "text-white" : "text-gray-900";
  const sub     = dark ? "text-white/40" : "text-gray-400";
  const tHead   = dark ? "text-white/30 border-white/5 bg-white/2" : "text-gray-400 border-gray-100 bg-gray-50";
  const tRow    = dark ? "border-white/5 hover:bg-white/3" : "border-gray-100 hover:bg-gray-50";
  const tText   = dark ? "text-white/80" : "text-gray-800";
  const tSub    = dark ? "text-white/30" : "text-gray-400";
  const inputBg = dark ? "bg-white/5 border-white/5 text-white/70 placeholder-white/20 focus:border-white/20" : "bg-gray-50 border-gray-200 text-gray-700 placeholder-gray-400 focus:border-gray-300";
  const filterTab = (active: boolean) => active
    ? dark ? "bg-white/10 text-white" : "bg-brand text-white"
    : dark ? "text-white/30 hover:text-white/60 hover:bg-white/5" : "text-gray-400 hover:text-gray-700 hover:bg-gray-100";

  const filtered = posts.filter((p) => {
    const matchesFilter = filter === "all" || (filter === "published" ? p.published : !p.published);
    const matchesSearch = !search || p.title?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const counts = {
    all: posts.length,
    published: posts.filter(p => p.published).length,
    draft: posts.filter(p => !p.published).length,
  };

  async function handleDelete(id: string) {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    setDeleting(id);
    await fetch(`/api/blog/${id}`, { method: "DELETE" });
    router.refresh();
    setDeleting(null);
  }

  async function handleTogglePublish(post: BlogPost) {
    await fetch(`/api/blog/${post.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        published: !post.published,
        published_at: !post.published ? new Date().toISOString() : null,
      }),
    });
    router.refresh();
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className={`text-xl font-bold ${heading}`}>Blog Posts</h1>
          <p className={`text-sm mt-0.5 ${sub}`}>{posts.length} posts total</p>
        </div>
        <ActionButton label="New Post" onClick={() => router.push("/admin/blog/new")} />
      </div>

      {/* Filters + Search */}
      <div className={`rounded-xl border ${card}`}>
        <div className={`flex items-center justify-between px-4 py-3 border-b ${dark ? "border-white/5" : "border-gray-100"}`}>
          {/* Filter tabs */}
          <div className="flex items-center gap-1">
            {(["all", "published", "draft"] as Filter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors capitalize ${filterTab(filter === f)}`}
              >
                {f}
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${filter === f ? "bg-white/20" : dark ? "bg-white/5" : "bg-gray-200"}`}>
                  {counts[f]}
                </span>
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-48">
            <svg className={`absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 ${sub}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search posts…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full rounded-lg border pl-9 pr-3 py-1.5 text-xs focus:outline-none transition-colors ${inputBg}`}
            />
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
                <th className="px-5 py-3 text-left font-medium">Date</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((post) => (
                <tr key={post.id} className={`border-b last:border-0 transition-colors ${tRow}`}>
                  <td className="px-5 py-4">
                    <p className={`font-medium ${tText} line-clamp-1`}>{post.title}</p>
                    {post.excerpt && <p className={`text-xs mt-0.5 line-clamp-1 ${tSub}`}>{post.excerpt}</p>}
                  </td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => handleTogglePublish(post)}
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                        post.published
                          ? dark ? "bg-green-400/15 text-green-400 hover:bg-green-400/25" : "bg-green-50 text-green-600 hover:bg-green-100"
                          : dark ? "bg-white/5 text-white/30 hover:bg-white/10" : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                      }`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${post.published ? "bg-green-400" : dark ? "bg-white/20" : "bg-gray-300"}`} />
                      {post.published ? "Published" : "Draft"}
                    </button>
                  </td>
                  <td className={`px-5 py-4 ${tSub} text-xs`}>
                    {post.published_at
                      ? new Date(post.published_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
                      : new Date(post.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        className={`h-7 w-7 rounded-lg flex items-center justify-center transition-colors ${dark ? "text-white/20 hover:text-white/60 hover:bg-white/5" : "text-gray-300 hover:text-gray-600 hover:bg-gray-100"}`}
                        title="View post"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </Link>
                      <Link
                        href={`/admin/blog/${post.id}`}
                        className={`h-7 w-7 rounded-lg flex items-center justify-center transition-colors ${dark ? "text-white/20 hover:text-white/60 hover:bg-white/5" : "text-gray-300 hover:text-gray-600 hover:bg-gray-100"}`}
                        title="Edit post"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </Link>
                      <button
                        onClick={() => handleDelete(post.id)}
                        disabled={deleting === post.id}
                        className={`h-7 w-7 rounded-lg flex items-center justify-center transition-colors ${dark ? "text-white/20 hover:text-red-400 hover:bg-red-400/10" : "text-gray-300 hover:text-red-500 hover:bg-red-50"}`}
                        title="Delete post"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
