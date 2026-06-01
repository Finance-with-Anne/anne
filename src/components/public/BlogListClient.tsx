"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import type { BlogPost, Category } from "@/types";

type PostCat = { post_id: string; category_id: string };

function readTime(content: string) {
  const words = content.replace(/<[^>]*>/g, "").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

function fmtDate(d: string | null) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function BlogListClient({
  posts,
  categories,
  postCats,
}: {
  posts: BlogPost[];
  categories: Category[];
  postCats: PostCat[];
}) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [heroTab, setHeroTab] = useState<"latest" | "trending">("latest");
  const [viewCounts, setViewCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    fetch("/api/blog-views")
      .then((r) => r.json())
      .then((data: { post_id: string; count: number }[]) => {
        const map: Record<string, number> = {};
        for (const row of data) map[row.post_id] = row.count;
        setViewCounts(map);
      })
      .catch(() => {});
  }, []);

  const parentCats = categories.filter((c) => !c.parent_id);

  const postCatMap = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const pc of postCats) {
      (map[pc.post_id] = map[pc.post_id] ?? []).push(pc.category_id);
    }
    return map;
  }, [postCats]);

  const subIdsByParent = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const cat of parentCats) {
      map[cat.id] = categories.filter((c) => c.parent_id === cat.id).map((c) => c.id);
    }
    return map;
  }, [categories, parentCats]);

  const filtered = useMemo(() => {
    let result = posts;
    if (activeCategory) {
      const subIds = subIdsByParent[activeCategory] ?? [];
      const valid = new Set([activeCategory, ...subIds]);
      result = result.filter((p) => (postCatMap[p.id] ?? []).some((c) => valid.has(c)));
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) => p.title.toLowerCase().includes(q) || p.excerpt?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [posts, activeCategory, search, postCatMap, subIdsByParent]);

  const heroPosts = useMemo(() => {
    if (heroTab === "trending") {
      return [...posts]
        .sort((a, b) => (viewCounts[b.id] ?? 0) - (viewCounts[a.id] ?? 0))
        .slice(0, 3);
    }
    return [...posts]
      .sort((a, b) => new Date(b.published_at ?? 0).getTime() - new Date(a.published_at ?? 0).getTime())
      .slice(0, 3);
  }, [heroTab, posts, viewCounts]);

  function firstCat(postId: string) {
    const ids = postCatMap[postId] ?? [];
    return ids.map((id) => categories.find((c) => c.id === id)?.name).filter(Boolean)[0] ?? null;
  }

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="bg-[#eef1ff] border-b border-[#dde3f9] px-4 sm:px-6 lg:px-8 pt-12 pb-12">
        <div className="mx-auto max-w-7xl">

          {/* Header row */}
          <div className="flex items-center justify-between gap-4 mb-6">
            {/* Tab toggle */}
            <div className="flex items-center gap-1 bg-white/70 border border-[#c7d0f0] rounded-full p-1">
              {(["latest", "trending"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setHeroTab(tab)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all capitalize ${
                    heroTab === tab
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab === "latest" ? "Latest" : "Trending"}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full max-w-xs">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none"
                fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search articles..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-full bg-white/70 border border-[#c7d0f0] pl-9 pr-4 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#a0aee0] transition-colors"
              />
            </div>
          </div>

          {/* Hero cards */}
          {heroPosts.length === 0 ? (
            <p className="text-gray-400 text-sm">No posts yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {heroPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group relative overflow-hidden rounded-2xl"
                  style={{ minHeight: "300px" }}
                >
                  {post.cover_image ? (
                    <img
                      src={post.cover_image}
                      alt={post.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <p className="text-[11px] text-white/60 mb-1.5">
                      {fmtDate(post.published_at)} · {readTime(post.content ?? "")} min read
                    </p>
                    <h3 className="text-sm font-semibold text-white leading-snug line-clamp-2">
                      {post.title}
                    </h3>
                    <span className="mt-3 inline-flex items-center rounded-full bg-white/10 border border-white/20 backdrop-blur-sm px-3 py-1 text-[11px] font-medium text-white/90">
                      Read More
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── White section: filter tabs + grid ─────────────────── */}
      <section className="bg-white px-4 sm:px-6 lg:px-8 py-10">
        <div className="mx-auto max-w-7xl">
          {/* Category filter bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-8 border-b border-gray-100 scrollbar-none">
            {[{ id: null as string | null, name: "All Posts" }, ...parentCats].map((cat) => (
              <button
                key={cat.id ?? "all"}
                onClick={() => setActiveCategory(cat.id)}
                className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  activeCategory === cat.id
                    ? "bg-gray-900 text-white"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Post grid */}
          {filtered.length === 0 ? (
            <p className="py-20 text-center text-sm text-gray-400">No posts found.</p>
          ) : (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((post) => {
                const cat = firstCat(post.id);
                return (
                  <Link key={post.id} href={`/blog/${post.slug}`} className="group">
                    <div className="relative overflow-hidden rounded-xl aspect-video mb-4 bg-gray-100">
                      {post.cover_image && (
                        <img
                          src={post.cover_image}
                          alt={post.title}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      )}
                      {cat && (
                        <span className="absolute top-3 left-3 rounded-full bg-white/90 backdrop-blur-sm px-2.5 py-0.5 text-[11px] font-semibold text-gray-800">
                          {cat}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mb-1">
                      {fmtDate(post.published_at)} · {readTime(post.content ?? "")} min read
                    </p>
                    <h3 className="text-base font-semibold text-gray-900 group-hover:text-black leading-snug line-clamp-2">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="mt-1.5 text-sm text-gray-500 line-clamp-2">{post.excerpt}</p>
                    )}
                    <span className="mt-3 inline-block text-xs font-semibold text-gray-900 underline underline-offset-2 group-hover:opacity-50 transition-opacity">
                      Read more →
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
