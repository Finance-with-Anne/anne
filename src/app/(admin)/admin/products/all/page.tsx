import { createClient } from "@/lib/supabase/server";
import ProductList from "@/components/admin/ProductList";
import type { Product } from "@/types";

export default async function AllProductsPage() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("*, category:product_categories(id, name, color)")
    .order("created_at", { ascending: false });
  return <ProductList products={(products ?? []) as Product[]} />;
}
