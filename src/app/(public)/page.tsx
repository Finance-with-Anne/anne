import Link from "next/link";
import Image from "next/image";
import HeroSlider from "@/components/public/HeroSlider";
import CoreFeatures from "@/components/public/CoreFeatures";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { Testimonial, BookingSession } from "@/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [{ data: testimonialsData }, { data: sessionsData }] = await Promise.all([
    supabaseAdmin.from("testimonials").select("*").eq("published", true).limit(4),
    supabaseAdmin.from("booking_sessions").select("cover_image").eq("is_active", true).limit(1),
  ]);

  const testimonials = (testimonialsData ?? []) as Testimonial[];
  const heroImage = (sessionsData as Pick<BookingSession, "cover_image">[] | null)?.[0]?.cover_image ?? null;
  const avatars = testimonials.filter((t) => t.image_url).slice(0, 4);

  return (
    <div className="bg-white dark:bg-[#05090f]">

      {/* ══════════════════════════════════════
          HERO
      ══════════════════════════════════════ */}
      <section className="relative overflow-hidden border-b border-gray-100 dark:border-white/6">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#0822C0]/6 via-transparent to-transparent dark:from-[#0822C0]/12" />
        <div className="relative mx-auto max-w-6xl px-6 py-20 sm:py-28 lg:flex lg:items-center lg:gap-16">

          {/* Left — text */}
          <div className="flex-1 max-w-xl">
            <span className="inline-block rounded-full bg-[#0822C0]/8 dark:bg-[#0822C0]/20 border border-[#0822C0]/15 dark:border-[#0822C0]/30 px-4 py-1.5 text-xs font-semibold text-[#0822C0] dark:text-blue-400 tracking-widest uppercase mb-6">
              Finance with Anne
            </span>

            <HeroSlider />

            {/* Social proof */}
            <div className="mt-8 flex items-center gap-3">
              <div className="flex -space-x-2.5">
                {avatars.length > 0 ? (
                  avatars.map((t) => (
                    <img
                      key={t.id}
                      src={t.image_url!}
                      alt={t.name}
                      className="w-9 h-9 rounded-full border-2 border-white dark:border-[#05090f] object-cover"
                    />
                  ))
                ) : (
                  [
                    "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&h=80&fit=crop&crop=face&auto=format",
                    "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&h=80&fit=crop&crop=face&auto=format",
                    "https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=80&h=80&fit=crop&crop=face&auto=format",
                    "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=80&h=80&fit=crop&crop=face&auto=format",
                  ].map((src, i) => (
                    <img key={i} src={src} alt="Client" className="w-9 h-9 rounded-full border-2 border-white dark:border-[#05090f] object-cover" />
                  ))
                )}
                <div className="w-9 h-9 rounded-full border-2 border-white dark:border-[#05090f] bg-gray-900 dark:bg-white flex items-center justify-center">
                  <span className="text-white dark:text-gray-900 text-[9px] font-bold">1K+</span>
                </div>
              </div>
              <p className="text-sm text-gray-500 dark:text-white/40">
                500+ clients trust Finance with Anne.
              </p>
            </div>

            {/* CTAs */}
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Link
                href="/booking"
                className="inline-flex items-center gap-2 rounded-xl bg-[#0822C0] text-white font-semibold text-sm px-6 py-3 hover:bg-[#0618a0] transition-colors"
              >
                Book a Session
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-white/10 text-gray-700 dark:text-white/70 font-semibold text-sm px-6 py-3 hover:border-gray-300 dark:hover:border-white/20 transition-colors"
              >
                Learn More
              </Link>
            </div>
          </div>

          {/* Right — Anne portrait */}
          <div className="mt-14 lg:mt-0 flex-shrink-0 flex justify-center lg:justify-end">
            <div className="relative">
              <div className="absolute inset-0 rounded-3xl bg-[#0822C0]/10 dark:bg-[#0822C0]/20 blur-3xl scale-110" />
              <Image
                src="/anne-profile.png"
                alt="Anne — Financial Coach"
                width={400}
                height={480}
                className="relative rounded-3xl object-cover shadow-2xl"
                priority
              />
            </div>
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════
          CORE FEATURES — dark blue section
      ══════════════════════════════════════ */}
      <CoreFeatures />

      {/* ══════════════════════════════════════
          ABOUT / EMPOWERING
      ══════════════════════════════════════ */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-20">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400 dark:text-white/30 mb-4">
          About
        </p>
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white leading-[1.1]">
            Empowering you to build lasting wealth
          </h2>
          <div>
            <p className="text-gray-500 dark:text-white/45 text-base leading-relaxed">
              Finance with Anne provides expert coaching, resources, and community support to help you manage, grow, and protect your financial future — wherever you are in the world.
            </p>
            <Link
              href="/about"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-gray-900 dark:bg-white px-6 py-2.5 text-sm font-semibold text-white dark:text-gray-900 hover:opacity-80 transition-opacity"
            >
              Learn about Anne
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
