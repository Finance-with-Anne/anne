import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import EditorsPage from "@/components/admin/EditorsPage";

export default async function AdminEditorsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: editors }, { data: { users } }, { data: postRows }] = await Promise.all([
    supabaseAdmin.from("editors").select("*").order("created_at", { ascending: false }),
    supabaseAdmin.auth.admin.listUsers({ perPage: 1000 }),
    supabaseAdmin.from("blog_posts").select("author_id").not("author_id", "is", null),
  ]);

  const userMap = new Map(users.map(u => [u.id, u]));

  const countMap: Record<string, number> = {};
  for (const p of postRows ?? []) {
    if (p.author_id) countMap[p.author_id] = (countMap[p.author_id] ?? 0) + 1;
  }

  const enriched = (editors ?? []).map(e => ({
    ...e,
    verified: userMap.get(e.user_id)?.last_sign_in_at != null,
    last_sign_in_at: userMap.get(e.user_id)?.last_sign_in_at ?? null,
    post_count: countMap[e.user_id] ?? 0,
  }));

  return <EditorsPage initialEditors={enriched} />;
}
