import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { BlogPost, Category } from "@/types";
import BlogListClient from "@/components/public/BlogListClient";

export const metadata = { title: "Blog — Finance with Anne" };

export default async function BlogPage() {
  const supabase = await createClient();

  const [{ data: posts }, { data: categories }, { data: postCats }, { data: curated }] = await Promise.all([
    supabase
      .from("blog_posts")
      .select("*")
      .eq("published", true)
      .order("published_at", { ascending: false }),
    supabase
      .from("blog_categories")
      .select("*")
      .order("created_at", { ascending: true }),
    supabase.from("blog_post_categories").select("post_id, category_id"),
    supabaseAdmin
      .from("blog_curated")
      .select("id, url, source_name, title, excerpt, cover_image, created_at")
      .eq("published", true)
      .order("created_at", { ascending: false })
      .limit(12),
  ]);

  return (
    <BlogListClient
      posts={(posts ?? []) as BlogPost[]}
      categories={(categories ?? []) as Category[]}
      postCats={postCats ?? []}
      curated={curated ?? []}
    />
  );
}
