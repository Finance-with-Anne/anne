import { supabaseAdmin } from "@/lib/supabase/admin";
import Link from "next/link";
import { headers } from "next/headers";
import type { BookingSession } from "@/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "Book a Session — Finance with Anne" };

type Currency = "NGN" | "USD" | "GBP";

function detectCurrency(country: string | null): Currency {
  if (!country) return "NGN";
  if (country === "GB") return "GBP";
  if (country === "US" || country === "CA" || country === "AU") return "USD";
  return "NGN";
}

function formatPrice(session: BookingSession, currency: Currency): string | null {
  if (currency === "GBP" && session.price_gbp) return `£${session.price_gbp.toLocaleString()}`;
  if (currency === "USD" && session.price_usd) return `$${session.price_usd.toLocaleString()}`;
  if (session.price_ngn) return `₦${session.price_ngn.toLocaleString()}`;
  if (session.price_usd) return `$${session.price_usd.toLocaleString()}`;
  if (session.price_gbp) return `£${session.price_gbp.toLocaleString()}`;
  return null;
}

const BADGE_COLORS = [
  "bg-[#f0eff9]",
  "bg-[#fde8ea]",
  "bg-[#fce8f0]",
  "bg-[#e8f5e9]",
];

export default async function BookingPage() {
  const headersList = await headers();
  const country = headersList.get("x-vercel-ip-country");
  const currency = detectCurrency(country);

  const { data: sessions } = await supabaseAdmin
    .from("booking_sessions")
    .select("*, slots:booking_slots(*)")
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  const active = (sessions ?? []) as BookingSession[];

  return (
    <div className="min-h-screen bg-[#eaecf5]">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">

        <h1 className="text-4xl font-bold text-[#0f1c4d] mb-10">Sessions</h1>

        {active.length === 0 ? (
          <p className="text-gray-400 text-sm">No sessions available right now. Check back soon.</p>
        ) : (
          <div className="space-y-4">
            {active.map((session, i) => {
              const price = formatPrice(session, currency);
              const isFirst = i === 0;
              const badgeBg = BADGE_COLORS[i % BADGE_COLORS.length];
              return (
                <Link
                  key={session.id}
                  href={`/booking/${session.slug}?currency=${currency}`}
                  className="group flex items-center gap-5 bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  {/* Duration badge */}
                  <div className={`${badgeBg} rounded-xl shrink-0 w-24 h-20 flex flex-col items-center justify-center`}>
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-[#0f1c4d]/50">
                      {session.is_free ? "FREE" : "PAID"}
                    </span>
                    <span className="text-3xl font-bold text-[#0f1c4d] leading-none mt-0.5">
                      {session.duration_minutes}
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-[#0f1c4d]/50 mt-0.5">
                      min
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-bold text-[#0f1c4d] group-hover:text-brand transition-colors leading-snug">
                      {session.title}
                    </h2>
                    {session.description && (
                      <p className="mt-1 text-sm text-gray-500 line-clamp-2 leading-relaxed max-w-lg">
                        {session.description}
                      </p>
                    )}
                    {price && !session.is_free && (
                      <p className="mt-2 text-sm font-semibold text-[#0f1c4d]">{price}</p>
                    )}
                  </div>

                  {/* CTA */}
                  <div className="shrink-0">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-sm font-semibold transition-opacity group-hover:opacity-90 ${
                        isFirst
                          ? "bg-[#0f1c4d] text-white"
                          : "border border-gray-200 text-[#0f1c4d] bg-white"
                      }`}
                    >
                      Book now
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
