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
    <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">Book a Session</h1>
        <p className="mt-4 text-lg text-gray-500 dark:text-white/50 max-w-2xl">
          Pick a session below, choose a time that works for you, and we&apos;ll take it from there.
        </p>
      </div>

      {active.length === 0 && (
        <p className="text-gray-400 dark:text-white/30">No sessions are available right now. Check back soon.</p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        {active.map(session => {
          const availableSlots = (session.slots ?? []).filter(s => !s.is_booked).length;
          const price = formatPrice(session, currency);
          return (
            <Link key={session.id} href={`/booking/${session.slug}?currency=${currency}`} className="group rounded-2xl border border-gray-200 dark:border-white/8 bg-white dark:bg-white/3 p-6 hover:border-gray-300 dark:hover:border-white/15 hover:shadow-sm transition-all">
              <div className="flex items-start justify-between mb-3">
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${!session.is_free ? "bg-blue-50 dark:bg-blue-400/10 text-blue-600 dark:text-blue-400" : "bg-green-50 dark:bg-green-400/10 text-green-600 dark:text-green-400"}`}>
                  {session.is_free ? "Free" : "Paid"}
                </span>
                <span className="text-xs text-gray-400 dark:text-white/30">{session.duration_minutes} min</span>
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-brand transition-colors">{session.title}</h2>
              {session.description && <p className="mt-1 text-sm text-gray-500 dark:text-white/40 line-clamp-2">{session.description}</p>}
              {!session.is_free && price && (
                <p className="mt-4 text-xl font-bold text-gray-900 dark:text-white">{price}</p>
              )}
              <div className="mt-4 flex items-center justify-between">
                <span className={`text-xs ${availableSlots > 0 ? "text-green-600 dark:text-green-400" : "text-red-400"}`}>
                  {availableSlots > 0 ? `${availableSlots} slot${availableSlots !== 1 ? "s" : ""} available` : "No slots available"}
                </span>
                <span className="text-xs font-medium text-brand">Book now →</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
