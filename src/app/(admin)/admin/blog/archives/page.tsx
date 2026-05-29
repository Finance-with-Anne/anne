import { createClient } from "@/lib/supabase/server";
import BlogArchives from "@/components/admin/BlogArchives";

export default async function BlogArchivesPage() {
  const supabase = await createClient();
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("id, title, slug, published, published_at, created_at, excerpt")
    .order("created_at", { ascending: false });

  return <BlogArchives posts={posts ?? []} />;
}
