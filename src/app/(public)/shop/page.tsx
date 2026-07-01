import { headers } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase/admin";
import ProductsShopClient from "@/components/public/ProductsShopClient";
import type { Product, ProductCategory } from "@/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "Shop | Finance with Anne" };

type Currency = "NGN" | "USD" | "GBP";

function detectCurrency(country: string | null): Currency {
  if (!country) return "NGN";
  if (country === "GB") return "GBP";
  if (country === "US" || country === "CA" || country === "AU") return "USD";
  return "NGN";
}

export default async function ShopPage() {
  const headersList = await headers();
  const country = headersList.get("x-vercel-ip-country");
  const currency = detectCurrency(country);

  const [{ data: products }, { data: categories }] = await Promise.all([
    supabaseAdmin
      .from("products")
      .select("*, category:product_categories(id, name, color)")
      .eq("active", true)
      .order("created_at", { ascending: false }),
    supabaseAdmin
      .from("product_categories")
      .select("*")
      .order("name"),
  ]);

  const usedCategoryIds = new Set(
    (products ?? []).map((p: Record<string, unknown>) => p.category_id).filter(Boolean)
  );
  const filteredCategories = (categories ?? []).filter((c: ProductCategory) =>
    usedCategoryIds.has(c.id)
  );

  return (
    <ProductsShopClient
      products={(products ?? []) as Product[]}
      categories={filteredCategories as ProductCategory[]}
      currency={currency}
    />
  );
}
