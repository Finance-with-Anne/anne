import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/types";

export const metadata = { title: "Shop — ANNE" };

export default async function ShopPage() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("active", true)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold tracking-tight text-gray-900">Shop</h1>
      <p className="mt-4 text-lg text-gray-600">Curated financial tools, templates, and resources.</p>

      {!products || products.length === 0 ? (
        <div className="mt-16 text-center text-gray-400">No products available yet.</div>
      ) : (
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {(products as Product[]).map((product) => (
            <div key={product.id} className="rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-all">
              {product.image_url && (
                <img src={product.image_url} alt={product.name} className="h-48 w-full object-cover" />
              )}
              <div className="p-4">
                <h2 className="text-sm font-semibold text-gray-900">{product.name}</h2>
                <p className="mt-1 text-xs text-gray-500 line-clamp-2">{product.description}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-base font-bold text-gray-900">£{product.price.toFixed(2)}</span>
                  <button className="rounded-md bg-black px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800 transition-colors">
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
