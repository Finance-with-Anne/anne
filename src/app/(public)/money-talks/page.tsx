import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import type { BlogPost, Category } from "@/types";

export const metadata = { title: "Money Talks — Finance with Anne" };

export default async function MoneyTalksPage() {
  const supabase = await createClient();

  const [{ data: posts }, { data: categories }] = await Promise.all([
    supabase
      .from("blog_posts")
      .select("id, title, slug, excerpt, cover_image, published_at, created_at")
      .eq("published", true)
      .order("published_at", { ascending: false }),
    supabase
      .from("blog_categories")
      .select("*")
      .order("created_at", { ascending: true }),
  ]);

  // Fetch post-category links
  const { data: postCats } = await supabase
    .from("blog_post_categories")
    .select("post_id, category_id");

  const allPosts   = (posts ?? []) as BlogPost[];
  const allCats    = (categories ?? []) as Category[];
  const links      = postCats ?? [];

  const parents    = allCats.filter(c => !c.parent_id);

  function postsForCategory(catId: string): BlogPost[] {
    const postIds = links.filter(l => l.category_id === catId).map(l => l.post_id);
    const subIds  = allCats.filter(c => c.parent_id === catId).map(c => c.id);
    const subPostIds = links.filter(l => subIds.includes(l.category_id)).map(l => l.post_id);
    const all = [...new Set([...postIds, ...subPostIds])];
    return allPosts.filter(p => all.includes(p.id));
  }

  // Posts with no category assignment
  const assignedPostIds = new Set(links.map(l => l.post_id));
  const uncategorised   = allPosts.filter(p => !assignedPostIds.has(p.id));

  return (
    <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      {/* Hero */}
      <div className="mb-14">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">Money Talks</h1>
        <p className="mt-4 text-lg text-gray-500 max-w-2xl">
          Deep-dive conversations, insights, and strategies on money, wealth, and financial freedom.
        </p>
      </div>

      {/* Category sections */}
      {parents.map(cat => {
        const catPosts = postsForCategory(cat.id);
        if (catPosts.length === 0) return null;
        const subs = allCats.filter(c => c.parent_id === cat.id);
        return (
          <section key={cat.id} className="mb-16">
            <div className="flex items-baseline gap-4 mb-6">
              <h2 className="text-2xl font-bold text-gray-900">{cat.name}</h2>
              {subs.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {subs.map(s => (
                    <span key={s.id} className="rounded-full border border-gray-200 px-3 py-0.5 text-xs font-medium text-gray-500">
                      {s.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <PostGrid posts={catPosts} />
          </section>
        );
      })}

      {/* Uncategorised posts */}
      {uncategorised.length > 0 && (
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Latest</h2>
          <PostGrid posts={uncategorised} />
        </section>
      )}

      {allPosts.length === 0 && (
        <div className="text-center py-20 text-gray-400">No posts yet — check back soon.</div>
      )}
    </div>
  );
}

function PostGrid({ posts }: { posts: BlogPost[] }) {
  return (
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map(post => (
        <Link key={post.id} href={`/blog/${post.slug}`} className="group">
          {post.cover_image ? (
            <img src={post.cover_image} alt={post.title} className="w-full aspect-video object-cover rounded-xl mb-4 group-hover:opacity-90 transition-opacity" />
          ) : (
            <div className="w-full aspect-video rounded-xl bg-gray-100 mb-4" />
          )}
          <p className="text-xs text-gray-400 mb-1">
            {new Date(post.published_at ?? post.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
          </p>
          <h3 className="text-base font-semibold text-gray-900 group-hover:text-black leading-snug">{post.title}</h3>
          {post.excerpt && <p className="mt-1 text-sm text-gray-500 line-clamp-2">{post.excerpt}</p>}
          <span className="mt-3 inline-block text-xs font-medium text-gray-900 underline underline-offset-2 group-hover:opacity-70">Read more →</span>
        </Link>
      ))}
    </div>
  );
}
