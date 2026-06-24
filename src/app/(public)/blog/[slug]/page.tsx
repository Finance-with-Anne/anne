import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import ViewTracker from "@/components/public/ViewTracker";
import BlogSubscribeBanner from "@/components/public/BlogSubscribeBanner";
import PostLike from "@/components/public/PostLike";
import PostComments from "@/components/public/PostComments";

function readTime(content: string) {
  const words = content.replace(/<[^>]*>/g, "").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

function fmtDate(d: string | null) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  const now = new Date().toISOString();
  const liveFilter = `published.eq.true,and(published.eq.false,published_at.lte.${now})`;

  const [{ data: post }, { data: latestRaw }] = await Promise.all([
    supabase
      .from("blog_posts")
      .select("*")
      .eq("slug", slug)
      .or(liveFilter)
      .single(),
    supabase
      .from("blog_posts")
      .select("id, title, slug, cover_image, published_at, excerpt")
      .or(liveFilter)
      .neq("slug", slug)
      .order("published_at", { ascending: false })
      .limit(4),
  ]);

  if (!post) notFound();

  const latest = latestRaw ?? [];
  const mins = readTime(post.content ?? "");

  return (
    <div className="bg-white dark:bg-[#05090f] min-h-screen flex flex-col transition-colors">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 flex-1 flex flex-col">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_300px] lg:divide-x lg:divide-gray-200 dark:lg:divide-white/5 flex-1">

          {/* ── Main article ─────────────────────────────────── */}
          <article className="py-12 lg:pr-10">
            <ViewTracker postId={post.id} />

            {/* Back button */}
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 dark:text-white/40 hover:text-gray-900 dark:hover:text-white transition-colors mb-6"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              All Posts
            </Link>

            {/* Meta */}
            <p className="text-sm text-gray-400 dark:text-white/30 mb-2">
              {fmtDate(post.published_at)} · {mins} min read
            </p>

            {/* Title */}
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight sm:text-4xl mb-6">
              {post.title}
            </h1>

            {/* Cover image */}
            {post.cover_image && (
              <img
                src={post.cover_image}
                alt={post.title}
                className="w-full rounded-lg object-cover aspect-video mb-8"
              />
            )}

            {/* Content */}
            <div
              className="blog-content"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Like + share row */}
            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-white/5 flex items-center gap-3">
              <PostLike postId={post.id} />
              <span className="text-sm text-gray-400 dark:text-white/30">If you found this helpful, give it a like!</span>
            </div>

            {/* Comments */}
            <PostComments postId={post.id} />

          </article>

          {/* ── Sidebar ──────────────────────────────────────── */}
          <aside className="space-y-8 py-12 lg:pl-10">
            <div className="lg:sticky lg:top-24 space-y-8">

              {/* Latest posts */}
              {latest.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-widest">
                    Latest Posts
                  </h3>
                  <ul className="space-y-4">
                    {latest.map((p) => (
                      <li key={p.id}>
                        <Link href={`/blog/${p.slug}`} className="group flex gap-3">
                          <div className="h-16 w-20 shrink-0 overflow-hidden bg-gray-100 dark:bg-white/8 ring-2 ring-gray-200 dark:ring-white/5">
                            {p.cover_image && (
                              <img
                                src={p.cover_image}
                                alt={p.title}
                                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs text-gray-400 dark:text-white/30 mb-0.5">{fmtDate(p.published_at)}</p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white/80 line-clamp-2 leading-snug group-hover:text-black dark:group-hover:text-white">
                              {p.title}
                            </p>
                            <span className="mt-1 inline-block text-[11px] font-medium text-gray-400 dark:text-white/30 group-hover:text-gray-600 dark:group-hover:text-white/60 transition-colors">
                              Read more →
                            </span>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Subscribe banner */}
              <BlogSubscribeBanner />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
