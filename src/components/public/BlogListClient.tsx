"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import type { BlogPost, Category } from "@/types";

const PER_PAGE = 12;

function Pagination({ page, total, onChange }: { page: number; total: number; onChange: (p: number) => void }) {
  if (total <= 1) return null;

  const pages: (number | "…")[] = [];
  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push("…");
    for (let i = Math.max(2, page - 1); i <= Math.min(total - 1, page + 1); i++) pages.push(i);
    if (page < total - 2) pages.push("…");
    pages.push(total);
  }

  const btn = (label: React.ReactNode, p: number, disabled: boolean, active = false) => (
    <button
      key={String(label)}
      onClick={() => { if (!disabled) { onChange(p); window.scrollTo({ top: 0, behavior: "smooth" }); } }}
      disabled={disabled}
      className={`flex items-center justify-center min-w-[36px] h-9 px-3 rounded-lg text-sm font-medium transition-colors ${
        active
          ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
          : disabled
          ? "text-gray-300 dark:text-white/15 cursor-not-allowed"
          : "text-gray-500 dark:text-white/40 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/8"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="flex items-center justify-center gap-1 mt-10">
      {btn(
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>,
        page - 1, page === 1
      )}
      {pages.map((p, i) =>
        p === "…"
          ? <span key={`ellipsis-${i}`} className="px-1 text-gray-400 dark:text-white/20 text-sm">…</span>
          : btn(p, p, false, p === page)
      )}
      {btn(
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>,
        page + 1, page === total
      )}
    </div>
  );
}

type PostCat = { post_id: string; category_id: string };

type CuratedLink = {
  id: string;
  url: string;
  source_name: string;
  title: string;
  excerpt: string | null;
  cover_image: string | null;
  created_at: string;
};

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
  curated = [],
}: {
  posts: BlogPost[];
  categories: Category[];
  postCats: PostCat[];
  curated?: CuratedLink[];
}) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [postsPage, setPostsPage] = useState(1);
  const [curatedPage, setCuratedPage] = useState(1);

  // Reset to page 1 whenever filter or search changes
  useEffect(() => { setPostsPage(1); }, [activeCategory, search]);
  // Latest posts sorted by date
  const latestPosts = useMemo(() =>
    [...posts].sort((a, b) => new Date(b.published_at ?? 0).getTime() - new Date(a.published_at ?? 0).getTime()),
    [posts]
  );

  const featuredPost = latestPosts.find(p => p.featured) ?? latestPosts[0] ?? null;
  const sidebarPosts = latestPosts.filter(p => p.id !== featuredPost?.id).slice(0, 5);

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
          (p.excerpt ?? "").toLowerCase().includes(q)
      );
    }
    return result;
  }, [posts, activeCategory, search, postCatMap, subIdsByParent]);

  const totalPostPages = Math.ceil(filtered.length / PER_PAGE);
  const pagedPosts = filtered.slice((postsPage - 1) * PER_PAGE, postsPage * PER_PAGE);

  const totalCuratedPages = Math.ceil(curated.length / PER_PAGE);
  const pagedCurated = curated.slice((curatedPage - 1) * PER_PAGE, curatedPage * PER_PAGE);

  function firstCat(postId: string) {
    const ids = postCatMap[postId] ?? [];
    return ids.map((id) => categories.find((c) => c.id === id)?.name).filter(Boolean)[0] ?? null;
  }

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="bg-[#eef1ff] dark:bg-[#070d1a] border-b border-[#dde3f9] dark:border-white/5 pt-8 pb-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          {!featuredPost ? (
            <p className="text-gray-400 text-sm py-12">No posts yet.</p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6" style={{ minHeight: "500px" }}>

              {/* ── Left: Featured ── */}
              <div className="flex flex-col">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Featured</h2>
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
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Latest Posts</h2>
                <div className="flex flex-col gap-2 flex-1">
                  {sidebarPosts.map((post) => (
                    <Link
                      key={post.id}
                      href={`/blog/${post.slug}`}
                      className="flex gap-3 items-start rounded-xl p-2.5 bg-white/40 dark:bg-white/5 border border-transparent hover:bg-white dark:hover:bg-white/10 hover:border-white dark:hover:border-white/10 hover:shadow-sm transition-all group"
                    >
                      <div className="h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-200 dark:bg-white/10">
                        {post.cover_image && (
                          <img
                            src={post.cover_image}
                            alt={post.title}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] text-gray-400 dark:text-white/30 mb-0.5">{fmtDate(post.published_at)}</p>
                        <p className="text-sm font-semibold text-gray-700 dark:text-white/75 leading-snug line-clamp-2 group-hover:text-gray-900 dark:group-hover:text-white">
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
      <section className="bg-white dark:bg-[#05090f] py-10">
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
                      ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                      : "text-gray-500 dark:text-white/40 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/8"
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
                className="w-full rounded-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/8 pl-9 pr-8 py-2 text-sm text-gray-700 dark:text-white/70 placeholder-gray-400 dark:placeholder-white/20 focus:outline-none focus:border-gray-300 dark:focus:border-white/15 focus:bg-white dark:focus:bg-white/8 transition-colors"
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

          {/* Results count */}
          {filtered.length > 0 && (
            <p className="text-xs text-gray-400 dark:text-white/25 mb-6">
              Showing {Math.min((postsPage - 1) * PER_PAGE + 1, filtered.length)}–{Math.min(postsPage * PER_PAGE, filtered.length)} of {filtered.length} post{filtered.length !== 1 ? "s" : ""}
            </p>
          )}

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
              {pagedPosts.map((post) => {
                const cat = firstCat(post.id);
                return (
                  <Link key={post.id} href={`/blog/${post.slug}`} className="group">
                    <div className="relative overflow-hidden rounded-xl aspect-video mb-4 bg-gray-100 dark:bg-white/5">
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
                    <p className="text-xs text-gray-400 dark:text-white/30 mb-1">
                      {fmtDate(post.published_at)} · {readTime(post.content ?? "")} min read
                    </p>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white group-hover:text-black dark:group-hover:text-white/80 leading-snug line-clamp-2">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="mt-1.5 text-sm text-gray-500 dark:text-white/40 line-clamp-2">{post.excerpt}</p>
                    )}
                    <span className="mt-3 inline-block text-xs font-semibold text-gray-900 dark:text-white/60 underline underline-offset-2 group-hover:opacity-50 transition-opacity">
                      Read more →
                    </span>
                  </Link>
                );
              })}
            </div>
          )}

          <Pagination page={postsPage} total={totalPostPages} onChange={setPostsPage} />
        </div>
      </section>

      {/* ── Blog Banner ─────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <Image
          src="/blog-banner-3.png"
          alt="Blog banner"
          width={1200}
          height={300}
          className="w-full rounded-2xl object-cover"
          priority={false}
        />
      </div>

      {/* ── Curated Sources ─────────────────────────────────────── */}
      {curated.length > 0 && (
        <section id="other-sources" className="bg-gray-50 dark:bg-[#070d1a] border-t border-gray-100 dark:border-white/5 py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-8">
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 text-gray-400 dark:text-white/30 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white whitespace-nowrap">Curated Sources</h2>
              </div>
              <span className="text-xs text-gray-400 dark:text-white/30">Articles from around the web, curated by Anne</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {pagedCurated.map(link => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col rounded-2xl overflow-hidden border border-gray-200 dark:border-white/5 bg-white dark:bg-white/3 hover:shadow-md dark:hover:bg-white/5 transition-all"
                >
                  {/* Cover image */}
                  <div className="relative h-40 bg-gray-100 dark:bg-white/5 overflow-hidden shrink-0">
                    {link.cover_image ? (
                      <img
                        src={link.cover_image}
                        alt={link.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="h-8 w-8 text-gray-300 dark:text-white/10" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                        </svg>
                      </div>
                    )}
                    {/* Source badge */}
                    <span className="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-black/60 backdrop-blur-sm px-2.5 py-1 text-[11px] font-semibold text-white">
                      <svg className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      {link.source_name}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex flex-col flex-1 p-4">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white leading-snug line-clamp-2 group-hover:text-black dark:group-hover:text-white/80 mb-2">
                      {link.title}
                    </p>
                    {link.excerpt && (
                      <p className="text-xs text-gray-500 dark:text-white/40 line-clamp-2 leading-relaxed flex-1">
                        {link.excerpt}
                      </p>
                    )}
                    <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-[#0822C0] dark:text-blue-400">
                      Read on {link.source_name}
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </div>
                  </div>
                </a>
              ))}
            </div>

            <Pagination page={curatedPage} total={totalCuratedPages} onChange={p => { setCuratedPage(p); window.scrollTo({ top: document.getElementById("other-sources")?.offsetTop ?? 0, behavior: "smooth" }); }} />
          </div>
        </section>
      )}
    </>
  );
}
