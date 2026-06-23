import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import BookingFlow from "@/components/public/BookingFlow";
import Link from "next/link";
import type { BookingSession } from "@/types";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

type Currency = "NGN" | "USD" | "GBP";

function detectCurrency(country: string | null, param: string | null): Currency {
  if (param === "GBP" || param === "USD" || param === "NGN") return param;
  if (!country) return "NGN";
  if (country === "GB") return "GBP";
  if (country === "US" || country === "CA" || country === "AU") return "USD";
  return "NGN";
}

export default async function AccountBookSessionPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ currency?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { slug } = await params;
  const { currency: currencyParam } = await searchParams;
  const headersList = await headers();
  const country = headersList.get("x-vercel-ip-country");
  const currency = detectCurrency(country, currencyParam ?? null);

  const [sessionRes, profileRes] = await Promise.all([
    supabaseAdmin
      .from("booking_sessions")
      .select("*, questions:booking_questions(*), slots:booking_slots(*)")
      .eq("slug", slug)
      .eq("is_active", true)
      .single(),
    supabaseAdmin
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single(),
  ]);

  if (sessionRes.error || !sessionRes.data) notFound();

  const session = sessionRes.data as BookingSession;
  const fullName = profileRes.data?.full_name ?? "";
  const email = user.email ?? "";

  return (
    <div className="max-w-4xl space-y-4">
      <Link
        href="/account/bookings/book"
        className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors"
      >
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        All sessions
      </Link>

      <BookingFlow
        session={session}
        defaultCurrency={currency}
        initialName={fullName}
        initialEmail={email}
      />
    </div>
  );
}
