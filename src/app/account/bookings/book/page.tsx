import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import Link from "next/link";
import { headers } from "next/headers";
import type { BookingSession } from "@/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "Book a Session | Finance with Anne" };

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

export default async function AccountBookPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

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
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Book a Session</h1>
        <p className="text-sm text-gray-400 mt-1">Choose a session to schedule your 1-on-1 with Anne.</p>
      </div>

      {active.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 py-20 text-center">
          <p className="text-sm font-medium text-gray-500">No sessions available right now.</p>
          <p className="text-xs text-gray-400 mt-1">Check back soon.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {active.map((session) => {
            const price = formatPrice(session, currency);
            const available = (session.slots ?? []).filter((s: any) => !s.is_booked).length;
            return (
              <Link
                key={session.id}
                href={`/account/bookings/book/${session.slug}?currency=${currency}`}
                className="group flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 hover:border-[#0822C0]/30 hover:shadow-sm transition-all"
              >
                {session.cover_image && (
                  <div className="shrink-0 w-16 h-16 rounded-xl overflow-hidden bg-gray-100">
                    <img src={session.cover_image} alt={session.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 group-hover:text-[#0822C0] transition-colors">
                    {session.title}
                  </p>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className="text-xs text-gray-400">{session.duration_minutes} min</span>
                    {available > 0 ? (
                      <span className="text-xs text-green-600">{available} slot{available !== 1 ? "s" : ""} available</span>
                    ) : (
                      <span className="text-xs text-red-400">No slots available</span>
                    )}
                  </div>
                  {session.description && (
                    <p className="text-xs text-gray-400 mt-1 line-clamp-1">{session.description}</p>
                  )}
                </div>
                <div className="shrink-0 text-right">
                  {session.is_free ? (
                    <span className="text-sm font-bold text-green-600">Free</span>
                  ) : price ? (
                    <span className="text-sm font-bold text-gray-900">{price}</span>
                  ) : null}
                  <div className="mt-1">
                    <span className="inline-flex items-center gap-1 text-xs text-[#0822C0] font-medium">
                      Book
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
