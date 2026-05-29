import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import type { BlogPost } from "@/types";

export const metadata = { title: "Blog — ANNE" };

export default async function BlogPage() {
  const supabase = await createClient();
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("published", true)
    .order("published_at", { ascending: false });

  return (
    <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold tracking-tight text-gray-900">Blog</h1>
      <p className="mt-4 text-lg text-gray-600">Insights, tips, and strategies for your financial journey.</p>

      {!posts || posts.length === 0 ? (
        <div className="mt-16 text-center text-gray-400">No posts published yet. Check back soon.</div>
      ) : (
        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {(posts as BlogPost[]).map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-all"
            >
              {post.cover_image && (
                <img src={post.cover_image} alt={post.title} className="h-48 w-full object-cover" />
              )}
              <div className="p-5">
                <p className="text-xs text-gray-400">{post.published_at ? new Date(post.published_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : ""}</p>
                <h2 className="mt-2 text-base font-semibold text-gray-900 group-hover:text-black leading-snug">{post.title}</h2>
                <p className="mt-2 text-sm text-gray-500 line-clamp-2">{post.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
