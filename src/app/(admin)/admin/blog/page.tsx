import { createClient } from "@/lib/supabase/server";
import BlogList from "@/components/admin/BlogList";

export default async function AdminBlogPage() {
  const supabase = await createClient();

  const [{ data: posts }, { data: categories }, { data: views }] = await Promise.all([
    supabase.from("blog_posts").select("*").order("created_at", { ascending: false }),
    supabase.from("blog_categories").select("*").order("name"),
    supabase.from("blog_post_view_counts").select("*"),
  ]);

  // Build category map per post
  const { data: postCats } = await supabase
    .from("blog_post_categories")
    .select("post_id, category_id");

  return (
    <BlogList
      posts={posts ?? []}
      categories={categories ?? []}
      postCats={postCats ?? []}
      viewCounts={views ?? []}
    />
  );
}
