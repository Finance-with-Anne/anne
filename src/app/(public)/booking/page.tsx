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
    <div className="bg-white dark:bg-[#0a0d14]">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-[#0f1c4d]">
        {/* Background glow */}
        <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[700px] rounded-full bg-brand/20 blur-[120px]" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-72 w-72 rounded-full bg-blue-400/10 blur-[80px]" />

        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-24 sm:py-32 text-center">
          <span className="inline-block rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-white/70 mb-8">
            1:1 Coaching
          </span>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.08] tracking-tight">
            Work directly<br className="hidden sm:block" /> with Anne
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-white/50 max-w-xl mx-auto leading-relaxed">
            Personalised financial coaching to help you take control of your money, clear debt, and build lasting wealth.
          </p>

          {/* Trust row */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            {[
              "Google Meet included",
              "Instant confirmation",
              "Secure payment",
              "Follow-up support",
            ].map((item) => (
              <span
                key={item}
                className="flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 py-2 text-sm text-white/60"
              >
                <svg className="h-3.5 w-3.5 text-brand shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Wave separator */}
        <div className="relative h-16 overflow-hidden">
          <svg
            viewBox="0 0 1440 64"
            className="absolute bottom-0 w-full text-white dark:text-[#0a0d14]"
            preserveAspectRatio="none"
            fill="currentColor"
          >
            <path d="M0,32 C360,64 1080,0 1440,32 L1440,64 L0,64 Z" />
          </svg>
        </div>
      </section>

      {/* ── Sessions ── */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Choose a session</h2>

        {active.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 dark:border-white/8 py-20 text-center">
            <p className="text-gray-400 text-sm">No sessions available right now. Check back soon.</p>
          </div>
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
                  className="group flex items-center gap-6 bg-white dark:bg-white/4 border border-gray-100 dark:border-white/6 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-gray-200 dark:hover:border-white/12 transition-all duration-200"
                >
                  {/* Cover image */}
                  {session.cover_image && (
                    <div className="shrink-0 w-28 h-28 rounded-xl overflow-hidden bg-gray-100 dark:bg-white/8">
                      <img
                        src={session.cover_image}
                        alt={session.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}

                  {/* Duration badge */}
                  <div className={`${badgeBg} rounded-xl shrink-0 w-28 h-28 flex flex-col items-center justify-center`}>
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
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-brand transition-colors leading-snug">
                      {session.title}
                    </h3>
                    {session.description && (
                      <p className="mt-1 text-sm text-gray-500 dark:text-white/40 line-clamp-2 leading-relaxed max-w-lg">
                        {session.description}
                      </p>
                    )}
                    {price && !session.is_free && (
                      <p className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">{price}</p>
                    )}
                  </div>

                  {/* CTA */}
                  <div className="shrink-0">
                    <span
                      className={`inline-flex items-center rounded-xl px-5 py-2.5 text-sm font-semibold transition-opacity group-hover:opacity-90 ${
                        isFirst
                          ? "bg-[#0f1c4d] dark:bg-brand text-white"
                          : "border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white"
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
      </section>
    </div>
  );
}
