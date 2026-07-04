import { supabaseAdmin } from "@/lib/supabase/admin";
import OrdersList from "@/components/admin/OrdersList";

export const dynamic = "force-dynamic";
export const metadata = { title: "Orders | Admin" };

export default async function AdminOrdersPage() {
  const { data: orders } = await supabaseAdmin
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  return <OrdersList orders={orders ?? []} />;
}
