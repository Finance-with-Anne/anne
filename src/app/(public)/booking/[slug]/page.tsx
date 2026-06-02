import { supabaseAdmin } from "@/lib/supabase/admin";
import BookingFlow from "@/components/public/BookingFlow";
import type { BookingSession } from "@/types";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

type Currency = "NGN" | "USD" | "GBP";

function detectCurrency(country: string | null, param: string | null): Currency {
  if (param === "GBP" || param === "USD" || param === "NGN") return param;
  if (!country) return "NGN";
  if (country === "GB") return "GBP";
  if (country === "US" || country === "CA" || country === "AU") return "USD";
  return "NGN";
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { data } = await supabaseAdmin.from("booking_sessions").select("title").eq("slug", slug).single();
  return { title: data ? `${data.title} — Finance with Anne` : "Book a Session" };
}

export default async function BookingSessionPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ currency?: string }>;
}) {
  const { slug } = await params;
  const { currency: currencyParam } = await searchParams;
  const headersList = await headers();
  const country = headersList.get("x-vercel-ip-country");
  const currency = detectCurrency(country, currencyParam ?? null);

  const { data, error } = await supabaseAdmin
    .from("booking_sessions")
    .select("*, questions:booking_questions(*), slots:booking_slots(*)")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error || !data) notFound();
  const session = data as BookingSession;

  // Price to show based on detected currency
  const displayPrice =
    currency === "GBP" && session.price_gbp ? `£${session.price_gbp.toLocaleString()}` :
    currency === "USD" && session.price_usd ? `$${session.price_usd.toLocaleString()}` :
    session.price_ngn ? `₦${session.price_ngn.toLocaleString()}` :
    session.price_usd ? `$${session.price_usd.toLocaleString()}` :
    session.price_gbp ? `£${session.price_gbp.toLocaleString()}` : null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="grid lg:grid-cols-[1fr_420px] gap-12">
        {/* Left: Session info */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${!session.is_free ? "bg-blue-50 dark:bg-blue-400/10 text-blue-600 dark:text-blue-400" : "bg-green-50 dark:bg-green-400/10 text-green-600 dark:text-green-400"}`}>
              {session.is_free ? "Free" : "Paid"}
            </span>
            <span className="text-xs text-gray-400 dark:text-white/30">{session.duration_minutes} min</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">{session.title}</h1>
          {session.description && (
            <p className="mt-4 text-gray-500 dark:text-white/50 leading-relaxed">{session.description}</p>
          )}
          {!session.is_free && displayPrice && (
            <div className="mt-6">
              <p className="text-xs font-semibold text-gray-400 dark:text-white/30 uppercase tracking-wide mb-2">Price</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{displayPrice}</p>
            </div>
          )}
        </div>

        {/* Right: Booking flow */}
        <div>
          <BookingFlow session={session} defaultCurrency={currency} />
        </div>
      </div>
    </div>
  );
}
