import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Testimonial } from "@/types";

export const metadata: Metadata = {
  title: "Testimonials | Finance with Anne",
  description: "Read real stories from clients who transformed their financial lives with Finance with Anne.",
};

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5 mb-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="15" height="15" viewBox="0 0 24 24" fill={i < rating ? "#f59e0b" : "#e5e7eb"}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

export default async function TestimonialsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("testimonials")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false });

  const testimonials = (data ?? []) as Testimonial[];

  return (
    <div className="bg-white dark:bg-[#05090f] text-gray-900 dark:text-white">

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-gray-100 dark:border-white/6">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#0822C0]/6 via-transparent to-transparent dark:from-[#0822C0]/12" />
        <div className="relative mx-auto max-w-6xl px-6 py-20 sm:py-28 text-center">
          <span className="inline-block rounded-full bg-[#0822C0]/8 dark:bg-[#0822C0]/20 border border-[#0822C0]/15 dark:border-[#0822C0]/30 px-4 py-1.5 text-xs font-semibold text-[#0822C0] dark:text-blue-400 tracking-widest uppercase mb-6">
            Client Stories
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight mb-6">
            Real people.<br className="hidden sm:block" /> Real financial breakthroughs.
          </h1>
          <p className="text-lg text-gray-500 dark:text-white/50 max-w-xl mx-auto mb-10">
            Hear from people who took control of their money, cleared their debt, and started building real wealth with Finance with Anne.
          </p>
          <Link
            href="/booking"
            className="inline-flex items-center gap-2 rounded-xl bg-[#0822C0] text-white font-semibold text-base px-8 py-4 hover:bg-[#0618a0] transition-colors"
          >
            Book a Session
          </Link>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-b border-gray-100 dark:border-white/6">
        <div className="mx-auto max-w-6xl px-6 py-10 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            { value: "500+", label: "Clients coached" },
            { value: "10k+", label: "Community members" },
            { value: "5★",   label: "Average rating" },
            { value: "5+",   label: "Years of experience" },
          ].map(({ value, label }) => (
            <div key={label}>
              <p className="text-3xl font-bold text-[#0822C0]">{value}</p>
              <p className="text-sm text-gray-500 dark:text-white/40 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials grid */}
      <section className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
        {testimonials.length === 0 ? (
          <p className="text-center text-gray-400 py-20">No testimonials yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div
                key={t.id}
                className="rounded-2xl p-6 flex flex-col gap-4 border border-[#0822C0]/10 dark:border-white/8 bg-[#eef1ff]/60 dark:bg-white/3"
              >
                <Stars rating={t.rating} />

                <p className="text-sm leading-relaxed flex-1 text-gray-700 dark:text-white/70">
                  &ldquo;{t.content}&rdquo;
                </p>

                <div className="flex items-center gap-3 pt-3 border-t border-gray-200 dark:border-white/8">
                  {t.image_url ? (
                    <img
                      src={t.image_url}
                      alt={t.name}
                      className="w-10 h-10 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#0822C0] flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {t.name[0]}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{t.name}</p>
                    {t.role && <p className="text-xs text-gray-400 dark:text-white/40 mt-0.5">{t.role}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="border-t border-gray-100 dark:border-white/6">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to write your own story?</h2>
          <p className="text-gray-500 dark:text-white/50 mb-8 max-w-md mx-auto">
            Join hundreds of clients who have transformed their finances with Anne.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/booking"
              className="inline-flex items-center gap-2 rounded-xl bg-[#0822C0] text-white font-semibold text-base px-8 py-4 hover:bg-[#0618a0] transition-colors"
            >
              Book a Session
            </Link>
            <Link
              href="/legacy-builders-network"
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-white/10 text-gray-700 dark:text-white/70 font-semibold text-base px-8 py-4 hover:border-gray-300 dark:hover:border-white/20 transition-colors"
            >
              Join the Community
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
