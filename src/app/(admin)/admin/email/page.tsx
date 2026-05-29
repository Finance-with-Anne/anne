import { createClient } from "@/lib/supabase/server";
import EmailPage from "@/components/admin/EmailPage";

export default async function AdminEmailPage() {
  const supabase = await createClient();
  const [{ data: campaigns }, { data: subscribers }, { count: activeCount }] = await Promise.all([
    supabase.from("email_campaigns").select("*").order("created_at", { ascending: false }),
    supabase.from("subscribers").select("*").order("created_at", { ascending: false }).limit(20),
    supabase.from("subscribers").select("*", { count: "exact", head: true }).eq("status", "active"),
  ]);
  return <EmailPage campaigns={campaigns ?? []} subscribers={subscribers ?? []} activeCount={activeCount ?? 0} />;
}
