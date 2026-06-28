import { headers } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase/admin";
import ProductsShopClient from "@/components/public/ProductsShopClient";
import type { Product, ProductCategory } from "@/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "Products & Services — Finance with Anne" };

type Currency = "NGN" | "USD" | "GBP";

function detectCurrency(country: string | null): Currency {
  if (!country) return "NGN";
  if (country === "GB") return "GBP";
  if (country === "US" || country === "CA" || country === "AU") return "USD";
  return "NGN";
}

export default async function ProductsServicesPage() {
  const headersList = await headers();
  const country = headersList.get("x-vercel-ip-country");
  const currency = detectCurrency(country);

  const [{ data: products }, { data: categories }, { data: bookingSessions }] = await Promise.all([
    supabaseAdmin
      .from("products")
      .select("*, category:product_categories(id, name, color)")
      .eq("active", true)
      .order("created_at", { ascending: false }),
    supabaseAdmin
      .from("product_categories")
      .select("*")
      .order("name"),
    supabaseAdmin
      .from("booking_sessions")
      .select("id, slug")
      .eq("is_active", true),
  ]);

  // Only return categories that have at least one active product
  const usedCategoryIds = new Set((products ?? []).map((p: Record<string, unknown>) => p.category_id).filter(Boolean));
  const filteredCategories = (categories ?? []).filter((c: ProductCategory) => usedCategoryIds.has(c.id));

  // Map booking session id -> slug for linking booking products to their detail page
  const bookingSlugMap: Record<string, string> = {};
  for (const s of bookingSessions ?? []) bookingSlugMap[s.id] = s.slug;

  return (
    <ProductsShopClient
      products={(products ?? []) as Product[]}
      categories={filteredCategories as ProductCategory[]}
      currency={currency}
      bookingSlugMap={bookingSlugMap}
    />
  );
}
