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
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <BookingFlow session={session} defaultCurrency={currency} />
    </div>
  );
}
