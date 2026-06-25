import Link from "next/link";
import Image from "next/image";
import HeroSlider from "@/components/public/HeroSlider";
import CoreFeatures from "@/components/public/CoreFeatures";
import ImpactSection from "@/components/public/ImpactSection";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { Testimonial } from "@/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { data: testimonialsData } = await supabaseAdmin
    .from("testimonials")
    .select("*")
    .eq("published", true)
    .limit(4);

  const testimonials = (testimonialsData ?? []) as Testimonial[];
  const avatars = testimonials.filter((t) => t.image_url).slice(0, 4);

  return (
    <div className="bg-white dark:bg-[#05090f]">

      {/* ══════════════════════════════════════
          HERO
      ══════════════════════════════════════ */}
      <section className="relative overflow-hidden border-b border-gray-100 dark:border-white/6 dark:bg-[#050910]">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#0822C0]/6 via-transparent to-transparent dark:hidden" />
        <div className="relative mx-auto max-w-7xl px-8 min-h-[calc(100vh-4rem)] flex flex-col justify-center lg:flex-row lg:items-center lg:gap-24 py-16">

          {/* Left — text */}
          <div className="flex-1 max-w-2xl">
            <span className="inline-block rounded-full bg-[#0822C0]/8 dark:bg-[#0822C0]/20 border border-[#0822C0]/15 dark:border-[#0822C0]/30 px-5 py-2 text-sm font-semibold text-[#0822C0] dark:text-blue-400 tracking-widest uppercase mb-8">
              Finance with Anne
            </span>

            <HeroSlider />

            {/* Social proof */}
            <div className="mt-10 flex items-center gap-4">
              <div className="flex -space-x-3">
                {avatars.length > 0 ? (
                  avatars.map((t) => (
                    <img
                      key={t.id}
                      src={t.image_url!}
                      alt={t.name}
                      className="w-11 h-11 rounded-full border-2 border-white dark:border-[#05090f] object-cover"
                    />
                  ))
                ) : (
                  [
                    "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&h=80&fit=crop&crop=face&auto=format",
                    "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&h=80&fit=crop&crop=face&auto=format",
                    "https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=80&h=80&fit=crop&crop=face&auto=format",
                    "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=80&h=80&fit=crop&crop=face&auto=format",
                  ].map((src, i) => (
                    <img key={i} src={src} alt="Client" className="w-11 h-11 rounded-full border-2 border-white dark:border-[#05090f] object-cover" />
                  ))
                )}
                <div className="w-11 h-11 rounded-full border-2 border-white dark:border-[#05090f] bg-gray-900 dark:bg-white flex items-center justify-center">
                  <span className="text-white dark:text-gray-900 text-[11px] font-bold">1K+</span>
                </div>
              </div>
              <p className="text-base text-gray-500 dark:text-white/40">
                500+ clients trust Finance with Anne.
              </p>
            </div>

            {/* CTAs */}
            <div className="mt-12 flex flex-wrap items-center gap-4">
              <Link
                href="/booking"
                className="inline-flex items-center gap-2 rounded-xl bg-[#0822C0] text-white font-semibold text-base px-8 py-4 hover:bg-[#0618a0] transition-colors"
              >
                Book a Session
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-white/10 text-gray-700 dark:text-white/70 font-semibold text-base px-8 py-4 hover:border-gray-300 dark:hover:border-white/20 transition-colors"
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
                width={520}
                height={620}
                className="relative rounded-3xl object-cover shadow-2xl"
                priority
              />
            </div>
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════
          IMPACT — stats + animated chart
      ══════════════════════════════════════ */}
      <ImpactSection />

      {/* ══════════════════════════════════════
          CORE FEATURES — dark blue section
      ══════════════════════════════════════ */}
      <CoreFeatures />


    </div>
  );
}
