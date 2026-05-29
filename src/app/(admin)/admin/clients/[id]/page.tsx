import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import ClientForm from "@/components/admin/ClientForm";

export default async function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: client } = await supabase.from("clients").select("*").eq("id", id).single();
  if (!client) notFound();
  return <ClientForm initialData={client} />;
}
