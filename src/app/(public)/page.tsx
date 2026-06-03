import Link from "next/link";
import HeroSlider from "@/components/public/HeroSlider";
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
    <div className="bg-white dark:bg-[#0a0d14]">

      {/* ══════════════════════════════════════
          HERO
      ══════════════════════════════════════ */}
      <section className="w-full bg-[#eef1ff] dark:bg-[#070d1a] p-4 sm:p-6 lg:p-8">
        <div className="overflow-hidden rounded-2xl grid lg:grid-cols-2 min-h-[660px] bg-white dark:bg-[#0d1220] shadow-sm">

          {/* Left — text */}
          <div className="flex flex-col justify-center py-16 px-10 lg:px-14">
            <div className="w-full max-w-lg">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400 dark:text-white/30 mb-6">
              Finance with Anne
            </p>

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
                      className="w-9 h-9 rounded-full border-2 border-white dark:border-[#0d1220] object-cover"
                    />
                  ))
                ) : (
                  ["#d4c5b0", "#b0c5d4", "#c5d4b0", "#d4b0c5"].map((bg, i) => (
                    <div key={i} className="w-9 h-9 rounded-full border-2 border-white dark:border-[#0d1220]" style={{ backgroundColor: bg }} />
                  ))
                )}
                <div className="w-9 h-9 rounded-full border-2 border-white dark:border-[#0d1220] bg-gray-900 dark:bg-white flex items-center justify-center">
                  <span className="text-white dark:text-gray-900 text-[9px] font-bold">1K+</span>
                </div>
              </div>
              <p className="text-sm text-gray-500 dark:text-white/40">
                500+ clients trust Finance with Anne.
              </p>
            </div>

            {/* CTAs */}
            <div className="mt-10 flex items-center gap-3">
              <Link
                href="/booking"
                className="rounded-full px-8 py-3.5 text-sm font-semibold text-white hover:opacity-85 transition-opacity"
                style={{ backgroundColor: "#0822C0" }}
              >
                Book a Session
              </Link>
              <Link
                href="/about"
                className="rounded-full px-8 py-3.5 text-sm font-semibold text-gray-700 dark:text-white bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/15 transition-colors"
              >
                Learn More
              </Link>
            </div>
            </div>
          </div>

          {/* Right — image bleeding to edge */}
          <div className="relative hidden lg:block">
            <div className="absolute inset-0 bg-[#dde3f9] dark:bg-[#0f1628]" />

            {/* Floating stat card */}
            <div className="absolute bottom-10 left-8 bg-white dark:bg-[#111827] rounded-2xl shadow-2xl p-4 w-48">
              <p className="text-[11px] text-gray-400 dark:text-white/40 font-medium">Sessions booked</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">500+</p>
              <div className="mt-2 flex items-end gap-0.5 h-7">
                {[35, 55, 40, 70, 50, 85, 65].map((h, i) => (
                  <div key={i} className="flex-1 rounded-sm" style={{ height: `${h}%`, backgroundColor: "#0822C0" }} />
                ))}
              </div>
            </div>

            {/* Floating rating badge */}
            <div className="absolute top-10 right-10 bg-white dark:bg-[#111827] rounded-2xl shadow-2xl px-4 py-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0" style={{ backgroundColor: "#0822C0" }}>A</div>
              <div>
                <p className="text-[11px] font-semibold text-gray-900 dark:text-white">Finance with Anne</p>
                <div className="flex items-center gap-0.5 mt-0.5">
                  {[1,2,3,4,5].map((s) => (
                    <svg key={s} className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <span className="text-[11px] text-gray-400 ml-1">4.9</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════
          CORE FEATURES — dark section
      ══════════════════════════════════════ */}
      <section className="bg-[#152a1c] dark:bg-[#0d1f13] px-4 sm:px-6 lg:px-8 py-20">
        <div className="mx-auto max-w-6xl">

          {/* Top row: label left + 2×2 feature grid right */}
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/35">
                What we offer
              </p>
            </div>

            <div className="grid grid-cols-2 gap-x-10 gap-y-10">
              {[
                { n: "01", title: "1:1 Coaching", desc: "Personalised sessions tailored to your financial situation and goals." },
                { n: "02", title: "Money Talks", desc: "A live community where we talk money, mindset, and wealth." },
                { n: "03", title: "Courses & Resources", desc: "Self-paced learning to sharpen your financial knowledge." },
                { n: "04", title: "Financial Planning", desc: "Custom roadmaps to help you reach your money milestones faster." },
              ].map((f) => (
                <div key={f.n}>
                  <p className="text-xs font-semibold text-white/25 mb-2">{f.n}</p>
                  <h3 className="text-[15px] font-semibold text-white leading-snug">{f.title}</h3>
                  <p className="mt-2 text-sm text-white/45 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom row: large heading left + image right */}
          <div className="mt-20 grid lg:grid-cols-2 gap-12 items-end">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white leading-snug">
                Everything you need to transform your finances
              </h2>
              <p className="mt-4 text-sm text-white/45 leading-relaxed max-w-sm">
                From coaching to community, we give you the tools, knowledge, and support to take control of your money for good.
              </p>
            </div>

            <div className="rounded-2xl overflow-hidden bg-[#1e3d28] aspect-video">
              {/* Placeholder — swap for a real photo */}
            </div>
          </div>

        </div>
      </section>

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
