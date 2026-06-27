import Link from "next/link";
import Image from "next/image";
import type { BlogPost, YouTubeVideo } from "@/types";

function formatDate(dateStr: string | null) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function HomeBlogSection({ posts, videos = [] }: { posts: BlogPost[]; videos?: YouTubeVideo[] }) {
  const [featured, ...rest] = posts;
  const secondary = rest.slice(0, 2);

  return (
    <section className="bg-white px-4 py-6 lg:py-8">
      <div
        className="w-full rounded-3xl px-6 sm:px-10 lg:px-16 py-16 lg:py-20"
        style={{ backgroundColor: "#eef1ff" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-8 mb-14">
          <div>
            <span
              className="inline-block text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-4"
              style={{ backgroundColor: "#0822C0", color: "#fff" }}
            >
              Money Talks
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold leading-snug max-w-lg" style={{ color: "#111" }}>
              Fresh insights on finance, wealth and mindset
            </h2>
          </div>
          <Link href="/blog" className="btn-animated shrink-0 focus:outline-none">
            <span>View all posts</span>
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Featured post — spans 2 cols */}
          {featured && (
            <Link
              href={`/blog/${featured.slug}`}
              className="group lg:col-span-2 rounded-2xl overflow-hidden flex flex-col relative min-h-[420px]"
              style={{ backgroundColor: "#c7d0f8" }}
            >
              {featured.cover_image ? (
                <div className="absolute inset-0">
                  <Image
                    src={featured.cover_image}
                    alt={featured.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(7,15,30,0.92) 40%, rgba(7,15,30,0.3) 100%)" }} />
                </div>
              ) : (
                <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #0822C0 0%, #3b55e6 100%)" }} />
              )}

              <div className="relative z-10 mt-auto p-8">
                <span
                  className="inline-block text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-4"
                  style={{ backgroundColor: "#d8f04a", color: "#111" }}
                >
                  Featured
                </span>
                <h3 className="text-2xl lg:text-3xl font-bold text-white leading-snug mb-3 group-hover:underline underline-offset-4">
                  {featured.title}
                </h3>
                {featured.excerpt && (
                  <p className="text-sm text-white/60 leading-relaxed line-clamp-2 mb-4">{featured.excerpt}</p>
                )}
                <p className="text-xs text-white/40">{formatDate(featured.published_at)}</p>
              </div>
            </Link>
          )}

          {/* Secondary posts — stack in 1 col */}
          <div className="flex flex-col gap-4">
            {secondary.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group rounded-2xl overflow-hidden flex flex-col relative min-h-[196px]"
                style={{ backgroundColor: "#c7d0f8" }}
              >
                {post.cover_image ? (
                  <div className="absolute inset-0">
                    <Image
                      src={post.cover_image}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(7,15,30,0.9) 40%, rgba(7,15,30,0.25) 100%)" }} />
                  </div>
                ) : (
                  <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #0822C0 0%, #3b55e6 100%)" }} />
                )}

                <div className="relative z-10 mt-auto p-6">
                  <h3 className="text-base font-bold text-white leading-snug mb-2 group-hover:underline underline-offset-4 line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-xs text-white/40">{formatDate(post.published_at)}</p>
                </div>
              </Link>
            ))}

            {/* "All posts" filler card if fewer than 2 secondary posts */}
            {secondary.length < 2 && (
              <Link
                href="/blog"
                className="group rounded-2xl flex flex-col items-center justify-center min-h-[196px] border border-[#0822C0]/20 hover:border-[#0822C0]/40 transition-colors"
              >
                <span className="text-[#0822C0]/50 text-sm font-semibold group-hover:text-[#0822C0] transition-colors">
                  View all posts →
                </span>
              </Link>
            )}
          </div>

        </div>

        {/* YouTube section */}
        {videos.length > 0 && (
          <div className="mt-10">
            <div className="flex items-center justify-between gap-8 mb-8">
              <div className="flex items-center gap-4">
                <span
                  className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full"
                  style={{ backgroundColor: "#ff4444", color: "#fff" }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8z" />
                    <path d="M9.75 15.5l6.25-3.5-6.25-3.5v7z" fill="white" />
                  </svg>
                  Watch on YouTube
                </span>
                <h3 className="text-xl font-bold" style={{ color: "#111" }}>Latest Videos</h3>
              </div>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold underline underline-offset-4 decoration-[#0822C0]/30 hover:decoration-[#0822C0] transition-all"
                style={{ color: "#0822C0" }}
              >
                View channel →
              </a>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {videos.map((video) => (
                <a
                  key={video.id}
                  href={`https://www.youtube.com/watch?v=${video.youtube_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group rounded-2xl overflow-hidden flex flex-col"
                  style={{ backgroundColor: "#dde3ff" }}
                >
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={video.thumbnail ?? `https://img.youtube.com/vi/${video.youtube_id}/mqdefault.jpg`}
                      alt={video.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center shadow-lg">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="white" aria-hidden>
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-sm font-semibold leading-snug line-clamp-2" style={{ color: "#111" }}>
                      {video.title}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
