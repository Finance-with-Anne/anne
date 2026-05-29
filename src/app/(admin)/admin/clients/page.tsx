import { createClient } from "@/lib/supabase/server";
import ClientList from "@/components/admin/ClientList";

export default async function AdminClientsPage() {
  const supabase = await createClient();
  const { data: clients } = await supabase.from("clients").select("*").order("created_at", { ascending: false });
  return <ClientList clients={clients ?? []} />;
}
