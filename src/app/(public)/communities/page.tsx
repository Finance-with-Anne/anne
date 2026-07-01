import { headers } from "next/headers";
import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const metadata = { title: "Communities | Finance with Anne" };

type Currency = "NGN" | "USD" | "GBP";

function detectCurrency(country: string | null): Currency {
  if (!country) return "NGN";
  if (country === "GB") return "GBP";
  if (country === "US" || country === "CA" || country === "AU") return "USD";
  return "NGN";
}

function formatPrice(product: {
  price_ngn?: number | null;
  price_usd?: number | null;
  price_gbp?: number | null;
}, currency: Currency): string {
  if (currency === "GBP" && product.price_gbp) return `£${Number(product.price_gbp).toLocaleString()} / year`;
  if (currency === "USD" && product.price_usd) return `$${Number(product.price_usd).toLocaleString()} / year`;
  if (product.price_ngn) return `₦${Number(product.price_ngn).toLocaleString()} / year`;
  return "Free";
}

export default async function CommunitiesPage() {
  const headersList = await headers();
  const country = headersList.get("x-vercel-ip-country");
  const currency = detectCurrency(country);

  const { data: communities } = await supabaseAdmin
    .from("products")
    .select("id, name, description, image_url, sales_page_url, price_ngn, price_usd, price_gbp")
    .eq("source_type", "community")
    .eq("active", true)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-white dark:bg-[#05090f]">

      {/* Hero */}
      <div className="bg-[#05148a] px-4 py-16 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-white/50 mb-3">Finance with Anne</p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
          Premium Communities
        </h1>
        <p className="mt-3 text-white/60 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
          Join exclusive investment communities led by Anne. Get expert insights, live sessions, and a network of serious wealth builders.
        </p>
      </div>

      {/* Communities grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {!communities || communities.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-gray-400 dark:text-white/30 text-sm">No communities available yet. Check back soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {communities.map(c => {
              const href = c.sales_page_url ?? `/products-services/${c.id}`;
              const price = formatPrice(c, currency);

              return (
                <Link
                  key={c.id}
                  href={href}
                  className="group rounded-2xl border border-gray-200 dark:border-white/8 bg-white dark:bg-white/3 overflow-hidden hover:shadow-lg hover:border-[#0822C0]/30 dark:hover:border-white/20 transition-all duration-200 flex flex-col"
                >
                  {/* Image */}
                  <div className="aspect-video overflow-hidden bg-[#05148a]/5 dark:bg-white/5">
                    {c.image_url ? (
                      <img
                        src={c.image_url}
                        alt={c.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="h-12 w-12 text-[#0822C0]/20 dark:text-white/10" fill="none" stroke="currentColor" strokeWidth={1.2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5 flex flex-col flex-1">
                    <div className="mb-2">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#0822C0] dark:text-blue-400 bg-[#0822C0]/8 dark:bg-blue-400/10 px-2.5 py-1 rounded-full">
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Community
                      </span>
                    </div>

                    <h2 className="text-base font-bold text-gray-900 dark:text-white leading-snug mb-2 group-hover:text-[#0822C0] dark:group-hover:text-blue-400 transition-colors">
                      {c.name}
                    </h2>

                    {c.description && (
                      <p className="text-sm text-gray-500 dark:text-white/40 leading-relaxed line-clamp-3 flex-1">
                        {c.description}
                      </p>
                    )}

                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
                      <p className="text-lg font-extrabold text-[#0822C0] dark:text-blue-400">{price}</p>
                      <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#0822C0] dark:text-blue-400 group-hover:gap-2 transition-all">
                        Join
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-7-7 7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Bottom CTA */}
        {communities && communities.length > 0 && (
          <div className="mt-16 rounded-2xl bg-[#05148a] px-8 py-10 text-center">
            <h3 className="text-xl font-bold text-white mb-2">Not sure which community to join?</h3>
            <p className="text-white/60 text-sm mb-6 max-w-md mx-auto">
              Book a free discovery call with Anne and find the right community for your financial journey.
            </p>
            <Link
              href="/booking"
              className="inline-flex items-center gap-2 bg-white text-[#05148a] font-bold px-6 py-3 rounded-xl text-sm hover:bg-white/90 transition-colors"
            >
              Book a Free Call
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-7-7 7 7-7 7" />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
