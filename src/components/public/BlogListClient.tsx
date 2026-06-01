"use client";

import { useState, useMemo } from "react";
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
  // Latest posts sorted by date
  const latestPosts = useMemo(() =>
    [...posts].sort((a, b) => new Date(b.published_at ?? 0).getTime() - new Date(a.published_at ?? 0).getTime()),
    [posts]
  );

  const featuredPost = latestPosts.find(p => p.featured) ?? latestPosts[0] ?? null;
  const sidebarPosts = latestPosts.filter(p => p.id !== featuredPost?.id);

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
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.excerpt ?? "").toLowerCase().includes(q) ||
          (p.content ?? "").replace(/<[^>]*>/g, "").toLowerCase().includes(q)
      );
    }
    return result;
  }, [posts, activeCategory, search, postCatMap, subIdsByParent]);

  function firstCat(postId: string) {
    const ids = postCatMap[postId] ?? [];
    return ids.map((id) => categories.find((c) => c.id === id)?.name).filter(Boolean)[0] ?? null;
  }

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="bg-[#eef1ff] border-b border-[#dde3f9] pt-8 pb-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          {!featuredPost ? (
            <p className="text-gray-400 text-sm py-12">No posts yet.</p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6" style={{ minHeight: "500px" }}>

              {/* ── Left: Featured ── */}
              <div className="flex flex-col">
                <h2 className="text-xl font-bold text-gray-900 mb-3">Featured</h2>
                <Link
                  href={`/blog/${featuredPost.slug}`}
                  className="group relative overflow-hidden rounded-2xl flex-1 block min-h-[320px] lg:min-h-0"
                >
                  {featuredPost.cover_image ? (
                    <img
                      src={featuredPost.cover_image}
                      alt={featuredPost.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-300 to-gray-400" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <p className="text-[11px] text-white/60 mb-2">
                      {fmtDate(featuredPost.published_at)} · {readTime(featuredPost.content ?? "")} min read
                    </p>
                    <h3 className="text-xl font-bold text-white leading-snug line-clamp-2 mb-3">
                      {featuredPost.title}
                    </h3>
                    <span className="inline-flex items-center rounded-full bg-white/15 border border-white/25 backdrop-blur-sm px-3.5 py-1 text-xs font-medium text-white">
                      Read More
                    </span>
                  </div>
                </Link>
              </div>

              {/* ── Right: Latest Posts ── */}
              <div className="flex flex-col">
                <h2 className="text-xl font-bold text-gray-900 mb-3">Latest Posts</h2>
                <div className="flex flex-col gap-2 flex-1">
                  {sidebarPosts.map((post) => (
                    <Link
                      key={post.id}
                      href={`/blog/${post.slug}`}
                      className="flex gap-3 items-start rounded-xl p-2.5 bg-white/40 border border-transparent hover:bg-white hover:border-white hover:shadow-sm transition-all group"
                    >
                      <div className="h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-200">
                        {post.cover_image && (
                          <img
                            src={post.cover_image}
                            alt={post.title}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] text-gray-400 mb-0.5">{fmtDate(post.published_at)}</p>
                        <p className="text-sm font-semibold text-gray-700 leading-snug line-clamp-2 group-hover:text-gray-900">
                          {post.title}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

            </div>
          )}
        </div>
      </section>

      {/* ── White section: filter tabs + grid ─────────────────── */}
      <section className="bg-white py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          {/* Top bar: category filters + search */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-8">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 flex-1 scrollbar-none">
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
            {/* Search */}
            <div className="relative sm:w-60 shrink-0">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search posts…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-full bg-gray-100 border border-gray-200 pl-9 pr-8 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-gray-300 focus:bg-white transition-colors"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Post grid */}
          {filtered.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-sm text-gray-400">No posts found{search ? ` for "${search}"` : ""}.</p>
              {search && (
                <button onClick={() => setSearch("")} className="mt-2 text-xs font-medium text-gray-500 underline underline-offset-2 hover:text-gray-900 transition-colors">
                  Clear search
                </button>
              )}
            </div>
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
