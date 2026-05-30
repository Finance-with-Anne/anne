import { createClient } from "@/lib/supabase/server";
import EditorsPage from "@/components/admin/EditorsPage";

export default async function AdminEditorsPage() {
  const supabase = await createClient();
  const { data: editors } = await supabase
    .from("editors")
    .select("*")
    .order("created_at", { ascending: false });

  return <EditorsPage initialEditors={editors ?? []} />;
}
