import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import ViewTracker from "@/components/public/ViewTracker";
import BlogSubscribeBanner from "@/components/public/BlogSubscribeBanner";

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

  const [{ data: post }, { data: latestRaw }] = await Promise.all([
    supabase
      .from("blog_posts")
      .select("*")
      .eq("slug", slug)
      .eq("published", true)
      .single(),
    supabase
      .from("blog_posts")
      .select("id, title, slug, cover_image, published_at, excerpt")
      .eq("published", true)
      .neq("slug", slug)
      .order("published_at", { ascending: false })
      .limit(4),
  ]);

  if (!post) notFound();

  const latest = latestRaw ?? [];
  const mins = readTime(post.content ?? "");

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 flex-1 flex flex-col">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_300px] lg:divide-x lg:divide-gray-200 flex-1">

          {/* ── Main article ─────────────────────────────────── */}
          <article className="py-12 lg:pr-10">
            <ViewTracker postId={post.id} />

            {/* Back button */}
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors mb-6"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              All Posts
            </Link>

            {/* Meta */}
            <p className="text-sm text-gray-400 mb-2">
              {fmtDate(post.published_at)} · {mins} min read
            </p>

            {/* Title */}
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 leading-tight sm:text-4xl mb-6">
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

          </article>

          {/* ── Sidebar ──────────────────────────────────────── */}
          <aside className="space-y-8 py-12 lg:pl-10">
            <div className="lg:sticky lg:top-24 space-y-8">

              {/* Latest posts */}
              {latest.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-widest">
                    Latest Posts
                  </h3>
                  <ul className="space-y-4">
                    {latest.map((p) => (
                      <li key={p.id}>
                        <Link href={`/blog/${p.slug}`} className="group flex gap-3">
                          <div className="h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100 ring-1 ring-gray-200">
                            {p.cover_image && (
                              <img
                                src={p.cover_image}
                                alt={p.title}
                                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs text-gray-400 mb-0.5">{fmtDate(p.published_at)}</p>
                            <p className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug group-hover:text-black">
                              {p.title}
                            </p>
                            <span className="mt-1 inline-block text-[11px] font-medium text-gray-400 group-hover:text-gray-600 transition-colors">
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
