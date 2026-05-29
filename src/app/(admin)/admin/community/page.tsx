import { createClient } from "@/lib/supabase/server";
import CommunityPage from "@/components/admin/CommunityPage";

export default async function AdminCommunityPage() {
  const supabase = await createClient();
  const [{ count: subCount }, { count: clientCount }] = await Promise.all([
    supabase.from("subscribers").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("clients").select("*", { count: "exact", head: true }).eq("status", "active"),
  ]);
  const { data: recentSubs } = await supabase.from("subscribers").select("*").order("created_at", { ascending: false }).limit(10);
  return <CommunityPage subscriberCount={subCount ?? 0} clientCount={clientCount ?? 0} recentSubscribers={recentSubs ?? []} />;
}
