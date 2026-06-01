import { supabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import CuratedLinksClient from "@/components/admin/CuratedLinks";

export default async function CuratedPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabaseAdmin
    .from("blog_curated")
    .select("*")
    .order("created_at", { ascending: false });

  return <CuratedLinksClient initialLinks={data ?? []} />;
}
