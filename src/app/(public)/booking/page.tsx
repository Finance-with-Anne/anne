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
    <div className="bg-white dark:bg-[#0a0d14] min-h-screen">
      {/* Hero */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pt-20 pb-10 text-center">
        <span className="inline-block rounded-full border border-gray-300 dark:border-white/15 px-4 py-1 text-[11px] font-semibold uppercase tracking-widest text-gray-500 dark:text-white/40 mb-6">
          Coaching
        </span>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight">
          Work with Anne
        </h1>
        <p className="mt-4 text-lg text-gray-500 dark:text-white/40 max-w-xl mx-auto">
          Pick a session, choose a time that works for you, and let&apos;s build your financial future together.
        </p>
      </div>

      {/* Cards */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pb-24">
        {active.length === 0 ? (
          <div className="rounded-2xl border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/2 py-20 text-center">
            <p className="text-gray-400 dark:text-white/25 text-sm">No sessions available right now. Check back soon.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {active.map(session => {
              const availableSlots = (session.slots ?? []).filter(s => !s.is_booked).length;
              const price = formatPrice(session, currency);
              return (
                <Link
                  key={session.id}
                  href={`/booking/${session.slug}?currency=${currency}`}
                  className="group flex flex-col rounded-2xl border border-gray-100 dark:border-white/6 bg-white dark:bg-white/3 overflow-hidden hover:shadow-lg hover:border-gray-200 dark:hover:border-white/12 transition-all duration-200"
                >
                  {/* Image */}
                  <div className="relative aspect-square overflow-hidden bg-gray-50 dark:bg-white/4">
                    {session.cover_image ? (
                      <img
                        src={session.cover_image}
                        alt={session.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="h-12 w-12 text-gray-200 dark:text-white/10" fill="none" stroke="currentColor" strokeWidth={1.2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 21h18M3.75 3h16.5c.414 0 .75.336.75.75v13.5a.75.75 0 01-.75.75H3.75a.75.75 0 01-.75-.75V3.75c0-.414.336-.75.75-.75z"/>
                        </svg>
                      </div>
                    )}
                    {/* Badge */}
                    <span className={`absolute top-3 left-3 rounded-full px-2.5 py-1 text-[11px] font-semibold ${session.is_free ? "bg-green-500 text-white" : "bg-brand text-white"}`}>
                      {session.is_free ? "Free" : "Paid"}
                    </span>
                  </div>

                  {/* Body */}
                  <div className="flex flex-col flex-1 p-5">
                    <h2 className="text-base font-semibold text-gray-900 dark:text-white leading-snug group-hover:text-brand transition-colors">
                      {session.title}
                    </h2>
                    {session.description && (
                      <p className="mt-1.5 text-sm text-gray-500 dark:text-white/40 line-clamp-2 flex-1">
                        {session.description}
                      </p>
                    )}

                    {/* Meta row */}
                    <div className="mt-4 flex items-center justify-between pt-4 border-t border-gray-100 dark:border-white/5">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-white/30">
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2"/>
                          </svg>
                          {session.duration_minutes} min
                        </span>
                        <span className={`text-xs font-medium ${availableSlots > 0 ? "text-green-500 dark:text-green-400" : "text-red-400"}`}>
                          {availableSlots > 0 ? `${availableSlots} slots` : "Full"}
                        </span>
                      </div>
                      {!session.is_free && price && (
                        <span className="text-sm font-bold text-gray-900 dark:text-white">{price}</span>
                      )}
                    </div>
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
