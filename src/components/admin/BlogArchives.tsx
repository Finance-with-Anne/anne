"use client";

import Link from "next/link";
import { useState } from "react";
import { useAdminTheme } from "@/lib/admin-theme";

type Post = { id: string; title: string; slug: string; published: boolean; published_at: string | null; created_at: string; excerpt?: string };

export default function BlogArchives({ posts }: { posts: Post[] }) {
  const { dark } = useAdminTheme();
  const [search, setSearch] = useState("");

  const heading = dark ? "text-white" : "text-gray-900";
  const sub     = dark ? "text-white/40" : "text-gray-400";
  const card    = dark ? "bg-[#111318] border-white/5" : "bg-white border-gray-200";
  const tRow    = dark ? "border-white/5 hover:bg-white/3" : "border-gray-100 hover:bg-gray-50";
  const tText   = dark ? "text-white/80" : "text-gray-800";
  const tSub    = dark ? "text-white/30" : "text-gray-400";
  const inputBg = dark ? "bg-white/5 border-white/5 text-white/70 placeholder-white/20 focus:border-white/20" : "bg-gray-50 border-gray-200 text-gray-700 placeholder-gray-400";
  const monthLabel = dark ? "text-white/20" : "text-gray-400";

  const filtered = posts.filter(p => !search || p.title.toLowerCase().includes(search.toLowerCase()));

  // Group by month
  const grouped: Record<string, Post[]> = {};
  filtered.forEach((p) => {
    const key = new Date(p.published_at ?? p.created_at).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(p);
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className={`text-xl font-bold ${heading}`}>Archives</h1>
          <p className={`text-sm mt-0.5 ${sub}`}>{posts.length} posts total</p>
        </div>
        <div className="relative w-52">
          <svg className={`absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 ${sub}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input type="text" placeholder="Search archives…" value={search} onChange={e => setSearch(e.target.value)}
            className={`w-full rounded-lg border pl-9 pr-3 py-2 text-xs focus:outline-none transition-colors ${inputBg}`} />
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Posts", value: posts.length },
          { label: "Published", value: posts.filter(p => p.published).length },
          { label: "Drafts", value: posts.filter(p => !p.published).length },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border p-4 ${card}`}>
            <p className={`text-xs font-medium ${sub}`}>{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${heading}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {Object.keys(grouped).length === 0 ? (
        <div className={`rounded-xl border py-16 text-center text-sm ${card} ${sub}`}>No posts found.</div>
      ) : (
        Object.entries(grouped).map(([month, monthPosts]) => (
          <div key={month}>
            <div className="flex items-center gap-3 mb-2">
              <p className={`text-xs font-semibold uppercase tracking-widest ${monthLabel}`}>{month}</p>
              <div className={`flex-1 h-px ${dark ? "bg-white/5" : "bg-gray-100"}`} />
              <p className={`text-xs ${monthLabel}`}>{monthPosts.length} post{monthPosts.length !== 1 ? "s" : ""}</p>
            </div>

            <div className={`rounded-xl border overflow-hidden ${card}`}>
              {monthPosts.map((p, i) => (
                <div key={p.id} className={`flex items-center justify-between px-5 py-4 transition-colors ${tRow} ${i > 0 ? `border-t ${dark ? "border-white/5" : "border-gray-100"}` : ""}`}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`font-medium text-sm truncate ${tText}`}>{p.title}</p>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        p.published
                          ? dark ? "bg-green-400/15 text-green-400" : "bg-green-50 text-green-600"
                          : dark ? "bg-white/5 text-white/30" : "bg-gray-100 text-gray-400"
                      }`}>
                        {p.published ? "Published" : "Draft"}
                      </span>
                    </div>
                    {p.excerpt && <p className={`text-xs mt-0.5 truncate ${tSub}`}>{p.excerpt}</p>}
                    <p className={`text-xs mt-0.5 ${tSub}`}>
                      {new Date(p.published_at ?? p.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 ml-4 shrink-0">
                    {p.published && (
                      <Link href={`/blog/${p.slug}`} target="_blank"
                        className={`h-7 w-7 rounded-lg flex items-center justify-center transition-colors ${dark ? "text-white/20 hover:text-white/60 hover:bg-white/5" : "text-gray-300 hover:text-gray-600 hover:bg-gray-100"}`}>
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </Link>
                    )}
                    <Link href={`/admin/blog/${p.id}`}
                      className={`h-7 w-7 rounded-lg flex items-center justify-center transition-colors ${dark ? "text-white/20 hover:text-white/60 hover:bg-white/5" : "text-gray-300 hover:text-gray-600 hover:bg-gray-100"}`}>
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
