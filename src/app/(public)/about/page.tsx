import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Anne — Finance with Anne",
  description: "Meet Anne — personal finance educator, money coach, and the voice behind Finance with Anne. Helping Nigerians take control of their money and build real wealth.",
};

const values = [
  {
    title: "Simplicity",
    desc: "Finance doesn't have to be complicated. We break down complex concepts into clear, actionable steps anyone can follow.",
    icon: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z",
  },
  {
    title: "Accountability",
    desc: "We show up consistently — in your inbox, on your feed, and in your corner — so you stay on track with your financial goals.",
    icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
  },
  {
    title: "Real Results",
    desc: "No fluff. No get-rich-quick. Just proven strategies that help real people save more, spend smarter, and build lasting wealth.",
    icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
  },
  {
    title: "Accessibility",
    desc: "Whether you earn ₦50,000 or ₦5,000,000 a month, there's a path forward. Financial freedom is for everyone.",
    icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
  },
];

const offerings = [
  { label: "1-on-1 Coaching", href: "/booking",           desc: "Personal sessions tailored to your exact financial situation." },
  { label: "Online Courses",  href: "/courses",            desc: "Self-paced learning on budgeting, saving, investing and more." },
  { label: "Templates",       href: "/products-services",  desc: "Done-for-you spreadsheets and trackers to organise your money." },
  { label: "The Blog",        href: "/blog",               desc: "Free weekly content on money, mindset and building wealth in Nigeria." },
];

export default function AboutPage() {
  return (
    <div className="bg-white dark:bg-[#05090f] text-gray-900 dark:text-white">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-gray-100 dark:border-white/6">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#0822C0]/6 via-transparent to-transparent dark:from-[#0822C0]/12" />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-20 lg:py-28 lg:flex lg:items-center lg:gap-16">

          {/* Text */}
          <div className="flex-1 max-w-xl">
            <span className="inline-block rounded-full bg-[#0822C0]/8 dark:bg-[#0822C0]/20 border border-[#0822C0]/15 dark:border-[#0822C0]/30 px-4 py-1.5 text-xs font-semibold text-[#0822C0] dark:text-blue-400 tracking-widest uppercase mb-6">
              About Anne
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight mb-5 sm:mb-6">
              Your money deserves<br className="hidden sm:block" /> a better story.
            </h1>
            <p className="text-base sm:text-lg text-gray-600 dark:text-white/60 leading-relaxed mb-6 sm:mb-8">
              I&apos;m Anne — a personal finance educator and money coach helping Nigerians break free from financial stress, build healthy money habits, and create real, lasting wealth.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/booking" className="inline-flex items-center gap-2 rounded-xl bg-[#0822C0] text-white font-semibold text-sm px-6 py-3 hover:bg-[#0618a0] transition-colors">
                Book a session
              </Link>
              <Link href="/courses" className="inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-white/10 text-gray-700 dark:text-white/70 font-semibold text-sm px-6 py-3 hover:border-gray-300 dark:hover:border-white/20 transition-colors">
                Browse courses
              </Link>
            </div>
          </div>

          {/* Portrait */}
          <div className="mt-10 lg:mt-0 flex-shrink-0 flex justify-center lg:justify-end">
            <div className="relative">
              <div className="absolute inset-0 rounded-3xl bg-[#0822C0]/10 dark:bg-[#0822C0]/20 blur-3xl scale-110" />
              <Image
                src="/anne-profile.png"
                alt="Anne — Finance with Anne"
                width={400}
                height={480}
                className="relative rounded-3xl object-cover shadow-2xl w-[240px] sm:w-[300px] lg:w-[400px]"
                priority
              />
            </div>
          </div>

        </div>
      </section>

      {/* ── Story + Credentials ── */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">

          {/* Left — portrait with overlay card */}
          <div className="relative">
            <div className="rounded-3xl overflow-hidden bg-gray-100 dark:bg-white/5">
              <Image
                src="/anne-about.jpg"
                alt="Anne — Finance with Anne"
                width={600}
                height={700}
                className="w-full object-cover object-top"
              />
            </div>
            {/* Overlay card */}
            <div className="absolute bottom-6 right-0 sm:-right-6 w-[220px] sm:w-[260px] rounded-2xl shadow-2xl overflow-hidden"
              style={{ background: "linear-gradient(135deg, #0822C0 0%, #05148a 100%)" }}>
              <div className="p-5 sm:p-6">
                <p className="text-white font-bold text-base mb-4">Why Hire Anne?</p>
                <ul className="space-y-3 mb-5">
                  {["10+ Years of Experience", "Top-Rated Consultancy", "Certified Professional"].map(item => (
                    <li key={item} className="flex items-center gap-2.5 text-white text-sm">
                      <svg className="h-4 w-4 shrink-0 text-white/80" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
                <a
                  href="https://t.me/+SNSQzX94_Gk1M2M0"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between w-full bg-white rounded-xl px-4 py-2.5 text-[#0822C0] font-semibold text-sm hover:bg-blue-50 transition-colors"
                >
                  Telegram Channel
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-7-7 7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Right — story text */}
          <div className="lg:pt-6">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-gray-400 border border-gray-200 dark:border-white/10 px-3 py-1 rounded-full mb-5">
              Who AM I
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight mb-6 text-gray-900 dark:text-white">
              My Story
            </h2>
            <div className="space-y-4 text-gray-600 dark:text-white/60 text-base leading-relaxed mb-8">
              <p>
                Growing up, I watched many of my dad&apos;s colleagues — men who were once top government officials with drivers, beautiful homes and a good life — struggle financially after retirement. They had spent their prime earning years in comfort, yet when the paychecks stopped, so did the lifestyle. Many had to go back to work just to get by. That reality left a lasting impression on me.
              </p>
              <p>
                It made me realise something important: it&apos;s not just about how much money you make, it&apos;s about how well you manage it. Money should serve you not only in your active years but also in retirement.
              </p>
            </div>
            <ul className="space-y-3.5">
              {["Smart Budgeting", "Strategic Saving", "Smart Investing"].map(item => (
                <li key={item} className="flex items-center gap-3 text-gray-800 dark:text-white/80 font-medium text-sm sm:text-base">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-[#0822C0]/30 dark:border-blue-400/30">
                    <svg className="h-3.5 w-3.5 text-[#0822C0] dark:text-blue-400" fill="none" stroke="currentColor" strokeWidth={2.8} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

        </div>
      </section>

      {/* ── Values ── */}
      <section className="bg-gray-50 dark:bg-white/3 border-y border-gray-100 dark:border-white/6">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12 sm:py-20">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">What we stand for</h2>
            <p className="mt-3 text-gray-500 dark:text-white/40 text-sm max-w-lg mx-auto">
              Every resource, course, and coaching session is built around these principles.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {values.map(v => (
              <div key={v.title} className="bg-white dark:bg-white/4 rounded-2xl border border-gray-100 dark:border-white/8 p-6 flex gap-4">
                <span className="h-10 w-10 rounded-xl bg-[#0822C0]/8 dark:bg-[#0822C0]/15 flex items-center justify-center shrink-0">
                  <svg className="h-5 w-5 text-[#0822C0] dark:text-blue-400" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d={v.icon} />
                  </svg>
                </span>
                <div>
                  <h3 className="font-bold text-base mb-1">{v.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-white/45 leading-relaxed">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── What I offer ── */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-12 sm:py-20">
        <div className="text-center mb-10 sm:mb-14">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">How I can help you</h2>
          <p className="mt-3 text-gray-500 dark:text-white/40 text-sm max-w-lg mx-auto">
            Pick the format that works best for where you are right now.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {offerings.map((o, i) => (
            <Link
              key={o.label}
              href={o.href}
              className="group rounded-2xl border border-gray-100 dark:border-white/8 bg-white dark:bg-white/3 p-6 hover:border-[#0822C0]/30 dark:hover:border-[#0822C0]/40 hover:shadow-sm transition-all flex items-start gap-4"
            >
              <span className="h-10 w-10 rounded-xl bg-[#0822C0] flex items-center justify-center shrink-0 text-white font-bold text-sm">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm group-hover:text-[#0822C0] dark:group-hover:text-blue-400 transition-colors">{o.label}</p>
                <p className="text-xs text-gray-500 dark:text-white/40 mt-1 leading-relaxed">{o.desc}</p>
              </div>
              <svg className="h-4 w-4 text-gray-300 dark:text-white/20 group-hover:text-[#0822C0] dark:group-hover:text-blue-400 transition-colors shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-[#0822C0] text-white">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12 sm:py-20 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
            Ready to change your relationship with money?
          </h2>
          <p className="text-white/65 mb-8 text-sm max-w-lg mx-auto leading-relaxed">
            Start with a free blog post, enroll in a course, or book a 1-on-1 session. Wherever you are in your journey, there&apos;s a next step.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/booking" className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-white text-[#0822C0] font-bold text-sm px-8 py-3.5 hover:bg-blue-50 transition-colors">
              Book a coaching session
            </Link>
            <Link href="/courses" className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl border border-white/30 text-white font-semibold text-sm px-8 py-3.5 hover:bg-white/10 transition-colors">
              Explore courses
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
