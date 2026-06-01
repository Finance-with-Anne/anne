import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import type { BlogPost, Category } from "@/types";

export const metadata = { title: "Money Talks — Finance with Anne" };

export default async function MoneyTalksPage() {
  const supabase = await createClient();

  const [{ data: categories }, { data: postCats }] = await Promise.all([
    supabase.from("blog_categories").select("*").order("created_at", { ascending: true }),
    supabase.from("blog_post_categories").select("post_id, category_id"),
  ]);

  const allCats = (categories ?? []) as Category[];
  const links   = postCats ?? [];

  // Find the Money Talks parent category
  const moneyTalksCat = allCats.find(c => c.name.toLowerCase() === "money talks" && !c.parent_id);

  // Get all category IDs under Money Talks (itself + subcategories)
  const subCats = moneyTalksCat ? allCats.filter(c => c.parent_id === moneyTalksCat.id) : [];
  const relevantCatIds = new Set([
    ...(moneyTalksCat ? [moneyTalksCat.id] : []),
    ...subCats.map(c => c.id),
  ]);

  const relevantPostIds = new Set(
    links.filter(l => relevantCatIds.has(l.category_id)).map(l => l.post_id)
  );

  const { data: posts } = await supabase
    .from("blog_posts")
    .select("id, title, slug, excerpt, cover_image, published_at, created_at")
    .eq("published", true)
    .in("id", relevantPostIds.size > 0 ? [...relevantPostIds] : ["none"])
    .order("published_at", { ascending: false });

  const allPosts = (posts ?? []) as BlogPost[];

  // Group by subcategory
  const sections: { cat: Category; posts: BlogPost[] }[] = subCats
    .map(cat => {
      const ids = new Set(links.filter(l => l.category_id === cat.id).map(l => l.post_id));
      return { cat, posts: allPosts.filter(p => ids.has(p.id)) };
    })
    .filter(s => s.posts.length > 0);

  // Posts only tagged to the parent (no subcategory)
  const subPostIds = new Set(
    links.filter(l => subCats.map(c => c.id).includes(l.category_id)).map(l => l.post_id)
  );
  const uncategorisedUnderParent = allPosts.filter(p => !subPostIds.has(p.id));

  return (
    <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      {/* Hero */}
      <div className="mb-14">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">Money Talks</h1>
        <p className="mt-4 text-lg text-gray-500 dark:text-white/50 max-w-2xl">
          Deep-dive conversations, insights, and strategies on money, wealth, and financial freedom.
        </p>
      </div>

      {allPosts.length === 0 && (
        <div className="text-center py-20 text-gray-400">No posts yet — check back soon.</div>
      )}

      {/* Posts with no subcategory */}
      {uncategorisedUnderParent.length > 0 && sections.length === 0 && (
        <PostGrid posts={uncategorisedUnderParent} />
      )}

      {/* Subcategory sections */}
      {sections.map(({ cat, posts: catPosts }) => (
        <section key={cat.id} className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{cat.name}</h2>
          <PostGrid posts={catPosts} />
        </section>
      ))}

      {/* Leftover posts not in any subcategory, alongside subcategory sections */}
      {uncategorisedUnderParent.length > 0 && sections.length > 0 && (
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">More</h2>
          <PostGrid posts={uncategorisedUnderParent} />
        </section>
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
            <div className="w-full aspect-video rounded-xl bg-gray-100 dark:bg-white/5 mb-4" />
          )}
          <p className="text-xs text-gray-400 mb-1">
            {new Date(post.published_at ?? post.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
          </p>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white group-hover:text-black dark:group-hover:text-white/80 leading-snug">{post.title}</h3>
          {post.excerpt && <p className="mt-1 text-sm text-gray-500 dark:text-white/40 line-clamp-2">{post.excerpt}</p>}
          <span className="mt-3 inline-block text-xs font-medium text-gray-900 dark:text-white underline underline-offset-2 group-hover:opacity-70">Read more →</span>
        </Link>
      ))}
    </div>
  );
}
