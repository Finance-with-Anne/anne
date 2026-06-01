import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import EditorsPage from "@/components/admin/EditorsPage";

export default async function AdminEditorsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: editors } = await supabaseAdmin
    .from("editors")
    .select("*")
    .order("created_at", { ascending: false });

  // Enrich with verified status
  const { data: { users } } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
  const userMap = new Map(users.map(u => [u.id, u]));

  const enriched = (editors ?? []).map(e => ({
    ...e,
    verified: userMap.get(e.user_id)?.last_sign_in_at != null,
    last_sign_in_at: userMap.get(e.user_id)?.last_sign_in_at ?? null,
  }));

  return <EditorsPage initialEditors={enriched} />;
}
