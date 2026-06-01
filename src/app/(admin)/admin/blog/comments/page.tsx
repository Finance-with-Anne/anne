import { supabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import AdminCommentsClient from "@/components/admin/AdminComments";

export default async function AdminCommentsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: comments } = await supabaseAdmin
    .from("blog_comments")
    .select("*, blog_posts(title, slug)")
    .order("created_at", { ascending: false });

  return <AdminCommentsClient initialComments={comments ?? []} />;
}
