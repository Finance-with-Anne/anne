import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase/admin";
import AddToCartButton from "@/components/public/AddToCartButton";

export const dynamic = "force-dynamic";

type Currency = "NGN" | "USD" | "GBP";

function detectCurrency(country: string | null): Currency {
  if (!country) return "NGN";
  if (country === "GB") return "GBP";
  if (country === "US" || country === "CA" || country === "AU") return "USD";
  return "NGN";
}

function formatPrice(p: { price_ngn?: number | null; price_usd?: number | null; price_gbp?: number | null; price?: number }, currency: Currency): string {
  if (currency === "GBP" && p.price_gbp != null) return `£${p.price_gbp.toLocaleString()}`;
  if (currency === "USD" && p.price_usd != null) return `$${p.price_usd.toLocaleString()}`;
  if (p.price_ngn != null) return `₦${p.price_ngn.toLocaleString()}`;
  if (p.price_usd != null) return `$${p.price_usd.toLocaleString()}`;
  if (p.price_gbp != null) return `£${p.price_gbp.toLocaleString()}`;
  return "Free";
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const headersList = await headers();
  const country = headersList.get("x-vercel-ip-country");
  const currency = detectCurrency(country);

  const { data: product } = await supabaseAdmin
    .from("products")
    .select("*, category:product_categories(id, name, color)")
    .eq("id", id)
    .eq("active", true)
    .single();

  if (!product) notFound();

  // If it has a dedicated sales page, send them there
  if (product.sales_page_url) redirect(product.sales_page_url);

  const cat = product.category as { id: string; name: string; color: string } | null;
  const priceStr = formatPrice(product, currency);

  const allPrices = [
    product.price_ngn != null && currency !== "NGN" ? `₦${product.price_ngn.toLocaleString()}` : null,
    product.price_usd != null && currency !== "USD" ? `$${product.price_usd.toLocaleString()}` : null,
    product.price_gbp != null && currency !== "GBP" ? `£${product.price_gbp.toLocaleString()}` : null,
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-white dark:bg-[#05090f]">

      {/* Back nav */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Link
          href="/products-services"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-white/40 hover:text-gray-800 dark:hover:text-white/70 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Products &amp; Services
        </Link>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">

          {/* Image */}
          <div className="rounded-2xl overflow-hidden bg-gray-100 dark:bg-white/5 aspect-[4/3]">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center"
                style={{ backgroundColor: cat?.color ? cat.color + "22" : "#0822C022" }}
              >
                <svg className="h-16 w-16 opacity-20" fill="none" stroke="currentColor" strokeWidth={1.2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            {cat && (
              <span
                className="inline-block rounded-full px-3 py-1 text-xs font-bold text-white uppercase tracking-wide"
                style={{ backgroundColor: cat.color }}
              >
                {cat.name}
              </span>
            )}

            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white leading-tight">
              {product.name}
            </h1>

            {product.description && (
              <p className="text-gray-600 dark:text-white/55 leading-relaxed text-sm whitespace-pre-line">
                {product.description}
              </p>
            )}

            {/* Price */}
            <div>
              <p className="text-3xl font-extrabold text-[#0822C0] dark:text-blue-400">{priceStr}</p>
              {allPrices.length > 0 && (
                <p className="text-xs text-gray-400 dark:text-white/25 mt-1">
                  Also available as {allPrices.join(" · ")}
                </p>
              )}
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-3">
              <AddToCartButton
                product={{
                  id: product.id,
                  name: product.name,
                  price: currency === "GBP" ? (product.price_gbp ?? product.price_ngn ?? 0)
                       : currency === "USD" ? (product.price_usd ?? product.price_ngn ?? 0)
                       : (product.price_ngn ?? 0),
                  currency,
                  image_url: product.image_url,
                }}
              />
            </div>

            {product.download_url && (
              <p className="text-xs text-gray-400 dark:text-white/30 flex items-center gap-1.5">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Digital product — delivered instantly after purchase
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
