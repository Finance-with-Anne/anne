import { createClient } from "@/lib/supabase/server";
import BlogList from "@/components/admin/BlogList";

export default async function AdminBlogPage() {
  const supabase = await createClient();
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("*")
    .order("created_at", { ascending: false });

  return <BlogList posts={posts ?? []} />;
}
