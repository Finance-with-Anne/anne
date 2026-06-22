import { supabaseAdmin } from "@/lib/supabase/admin";
import ProductCategoriesPage from "@/components/admin/ProductCategoriesPage";
import type { ProductCategory } from "@/types";

interface RawCategory extends ProductCategory {
  products?: { count: number }[];
}

export default async function AdminProductCategoriesPage() {
  const { data: categories } = await supabaseAdmin
    .from("product_categories")
    .select("*, products(count)")
    .order("name");

  const normalized = (categories as RawCategory[] ?? []).map(c => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    color: c.color,
    created_at: c.created_at,
    product_count: c.products?.[0]?.count ?? 0,
  }));

  return <ProductCategoriesPage categories={normalized} />;
}
