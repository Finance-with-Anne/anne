import { supabaseAdmin } from "@/lib/supabase/admin";
import Link from "next/link";
import { headers } from "next/headers";
import type { BookingSession, Testimonial } from "@/types";

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

  const [{ data: sessions }, { data: testimonialData }] = await Promise.all([
    supabaseAdmin
      .from("booking_sessions")
      .select("*, slots:booking_slots(*)")
      .eq("is_active", true)
      .order("created_at", { ascending: true }),
    supabaseAdmin
      .from("testimonials")
      .select("*")
      .eq("published", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .single(),
  ]);

  const active = (sessions ?? []) as BookingSession[];
  const testimonial = testimonialData as Testimonial | null;
  const heroBg = active[0]?.cover_image ?? null;

  return (
    <div className="bg-white dark:bg-[#0a0d14]">

      {/* ── Hero ── */}
      <section className="relative min-h-[620px] flex items-center overflow-hidden">

        {/* Background */}
        {heroBg ? (
          <img
            src={heroBg}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-[#0f1c4d]" />
        )}
        <div className="absolute inset-0 bg-black/60" />

        {/* Content */}
        <div className="relative w-full mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-20 grid lg:grid-cols-[1fr_420px] gap-10 items-center">

          {/* Left — headline + testimonial */}
          <div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black uppercase text-white leading-[0.95] tracking-tight">
              Book a<br />session<br />with Anne
            </h1>
            <p className="mt-6 text-white/60 text-base sm:text-lg max-w-sm leading-relaxed">
              Personalised 1:1 financial coaching to help you build wealth and take control of your money.
            </p>

            {testimonial && (
              <div className="mt-10 flex items-start gap-4 max-w-sm">
                {testimonial.image_url && (
                  <img
                    src={testimonial.image_url}
                    alt={testimonial.name}
                    className="h-12 w-12 rounded-full object-cover shrink-0 border-2 border-white/20"
                  />
                )}
                <div>
                  <div className="flex gap-0.5 mb-1.5">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <span key={i} className="text-yellow-400 text-sm">★</span>
                    ))}
                  </div>
                  <p className="text-white/75 text-sm italic leading-relaxed">
                    &ldquo;{testimonial.content}&rdquo;
                  </p>
                  <p className="mt-2 text-white/45 text-xs font-medium">
                    {testimonial.name}
                    {testimonial.role && <span> — {testimonial.role}</span>}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right — session selector card */}
          <div className="bg-white rounded-2xl shadow-2xl p-7">
            <h2 className="text-xl font-bold text-[#0f1c4d]">Choose your session</h2>
            <p className="mt-1 text-sm text-gray-500">Select a session below to get started.</p>

            <div className="mt-6 space-y-3">
              {active.length === 0 ? (
                <p className="text-sm text-gray-400 py-6 text-center">No sessions available right now.</p>
              ) : (
                active.map((session, i) => {
                  const price = formatPrice(session, currency);
                  return (
                    <Link
                      key={session.id}
                      href={`/booking/${session.slug}?currency=${currency}`}
                      className="group flex items-center gap-4 rounded-xl border border-gray-100 p-4 hover:border-brand/30 hover:bg-brand/3 transition-all duration-150"
                    >
                      {session.cover_image && (
                        <div className="shrink-0 w-14 h-14 rounded-lg overflow-hidden bg-gray-100">
                          <img src={session.cover_image} alt={session.title} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#0f1c4d] group-hover:text-brand transition-colors truncate">
                          {session.title}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">{session.duration_minutes} min</p>
                      </div>
                      <div className="shrink-0 text-right">
                        {session.is_free ? (
                          <span className="text-sm font-bold text-green-600">Free</span>
                        ) : price ? (
                          <span className="text-sm font-bold text-[#0f1c4d]">{price}</span>
                        ) : null}
                      </div>
                    </Link>
                  );
                })
              )}
            </div>

            {active.length > 0 && (
              <p className="mt-5 text-center text-xs text-gray-400">
                Google Meet · Instant confirmation · Secure payment
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
