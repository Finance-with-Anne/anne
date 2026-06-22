"use client";

import { useState } from "react";
import type { Product, ProductCategory } from "@/types";

type Currency = "NGN" | "USD" | "GBP";

interface Props {
  products: Product[];
  categories: ProductCategory[];
  currency: Currency;
}

function formatPrice(product: Product, currency: Currency): string {
  if (currency === "GBP" && product.price_gbp != null) return `£${product.price_gbp.toLocaleString()}`;
  if (currency === "USD" && product.price_usd != null) return `$${product.price_usd.toLocaleString()}`;
  if (product.price_ngn != null) return `₦${product.price_ngn.toLocaleString()}`;
  if (product.price_usd != null) return `$${product.price_usd.toLocaleString()}`;
  if (product.price_gbp != null) return `£${product.price_gbp.toLocaleString()}`;
  return "Free";
}

export default function ProductsShopClient({ products, categories, currency }: Props) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = activeCategory
    ? products.filter(p => p.category_id === activeCategory)
    : products;

  return (
    <div className="bg-white dark:bg-[#05090f] min-h-screen">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0822C0] to-[#05148a]" />
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 20% 80%, #fff 1px, transparent 1px), radial-gradient(circle at 80% 20%, #fff 1px, transparent 1px)", backgroundSize: "60px 60px" }}
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white/80 mb-5">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
              {products.length} product{products.length !== 1 ? "s" : ""} available
            </span>
            <h1 className="text-5xl sm:text-6xl font-black text-white leading-tight tracking-tight">
              Products &<br />Services
            </h1>
            <p className="mt-5 text-lg text-white/60 leading-relaxed max-w-lg">
              Templates, ebooks, courses and coaching — everything you need to take control of your finances and build lasting wealth.
            </p>
          </div>
        </div>
      </section>

      {/* ── Category filter ── */}
      {categories.length > 0 && (
        <div className="sticky top-[88px] z-30 bg-white/90 dark:bg-[#05090f]/90 backdrop-blur border-b border-gray-100 dark:border-white/5">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 py-3 overflow-x-auto scrollbar-hide">
              <button
                onClick={() => setActiveCategory(null)}
                className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                  activeCategory === null
                    ? "bg-[#0822C0] text-white"
                    : "bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-white/40 hover:bg-gray-200 dark:hover:bg-white/10"
                }`}
              >
                All
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
                  className={`shrink-0 flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                    activeCategory === cat.id
                      ? "text-white"
                      : "bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-white/40 hover:bg-gray-200 dark:hover:bg-white/10"
                  }`}
                  style={activeCategory === cat.id ? { backgroundColor: cat.color } : {}}
                >
                  <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: activeCategory === cat.id ? "#fff" : cat.color }} />
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Product grid ── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        {filtered.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-gray-400 dark:text-white/30 text-sm">No products in this category yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(product => {
              const priceStr = formatPrice(product, currency);
              const cat = product.category;
              return (
                <div
                  key={product.id}
                  className="group rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#0d1117] overflow-hidden hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                >
                  {/* Image */}
                  <div className="relative h-52 overflow-hidden">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div
                        className="h-full w-full flex items-center justify-center"
                        style={{ backgroundColor: cat?.color ? cat.color + "22" : "#0822C022" }}
                      >
                        <svg className="h-12 w-12 opacity-30" style={{ color: cat?.color ?? "#0822C0" }} fill="none" stroke="currentColor" strokeWidth={1.2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                      </div>
                    )}
                    {/* Category badge */}
                    {cat && (
                      <span
                        className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold text-white"
                        style={{ backgroundColor: cat.color + "dd" }}
                      >
                        {cat.name}
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="font-bold text-gray-900 dark:text-white text-base leading-snug line-clamp-2">
                      {product.name}
                    </h3>
                    {product.description && (
                      <p className="mt-2 text-sm text-gray-500 dark:text-white/40 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>
                    )}

                    <div className="mt-5 flex items-center justify-between gap-3">
                      <span className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                        {priceStr}
                      </span>
                      <button className="shrink-0 rounded-xl bg-[#0822C0] hover:bg-[#061aa0] text-white text-xs font-semibold px-4 py-2.5 transition-colors">
                        Get It Now
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
