import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "The Complete Budget & Money Tracker — Finance with Anne",
  description: "The Complete Money Tracker That Finds Your 'Lost Money' in Just 10 Minutes a Day!",
};

function CheckIcon({ color = "#0822C0" }: { color?: string }) {
  return (
    <svg className="h-4 w-4 shrink-0 mt-0.5" fill="none" stroke={color} strokeWidth={2.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

export default function MoneyTrackerPage() {
  return (
    <div className="bg-white text-gray-900">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0822C0] via-[#1a3ed4] to-[#2563EB] text-white">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_#ffffff_0%,_transparent_60%)]" />
        <div className="relative mx-auto max-w-4xl px-6 py-20 sm:py-28 text-center">

          <span className="inline-block rounded-full bg-white/15 border border-white/25 px-5 py-1.5 text-xs font-semibold tracking-widest uppercase mb-8">
            Limited Time Offer · First 100 Customers Only
          </span>

          <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold leading-tight tracking-tight mb-6">
            Stop Wondering Where Your<br className="hidden sm:block" /> Money Goes{" "}
            <span className="text-yellow-400">Every Month</span>
          </h1>

          <p className="text-lg sm:text-xl text-white/75 max-w-2xl mx-auto mb-10">
            The Complete Money Tracker That Finds Your &ldquo;Lost Money&rdquo; in Just{" "}
            <span className="text-yellow-300 font-semibold">10 Minutes a Day!</span>
          </p>

          <div className="flex flex-col items-center gap-3">
            <Link
              href="/money-tracker/checkout"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white text-[#0822C0] font-bold text-base px-10 py-4 hover:bg-yellow-50 transition-colors shadow-xl"
            >
              Get Your Tracker Now →
            </Link>
            <p className="text-sm text-white/50">🔒 Secure Checkout + Instant Access</p>
          </div>

          {/* Stats */}
          <div className="mt-14 grid grid-cols-3 divide-x divide-white/15 border border-white/15 rounded-2xl bg-white/8 backdrop-blur-sm overflow-hidden">
            {[
              { value: "76%", label: "Live paycheck to paycheck" },
              { value: "10 min", label: "Daily time investment" },
              { value: "100%", label: "Customizable to your life" },
            ].map((s) => (
              <div key={s.value} className="py-5 px-4">
                <p className="text-2xl sm:text-3xl font-extrabold text-white">{s.value}</p>
                <p className="text-xs text-white/50 mt-1 leading-tight">{s.label}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── The Problem ── */}
      <section className="mx-auto max-w-4xl px-6 py-20">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-center uppercase mb-12">
          The Problem
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            "You check your bank account thinking \"Where did all my money go?\"",
            "You want to save but there's never anything left over",
            "You've tried budgeting apps but they're too complicated or don't work",
            "You feel stressed about money but don't know where to start",
          ].map((text, i) => (
            <div key={i} className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50/60 p-5">
              <svg className="h-4 w-4 text-red-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <p className="text-gray-700 text-sm leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
        <p className="mt-10 text-center text-sm text-gray-500 max-w-xl mx-auto leading-relaxed">
          You&apos;re not alone.{" "}
          <span className="font-semibold text-gray-900">78% of people live paycheck to paycheck</span>{" "}
          not because they don&apos;t earn enough, but because they don&apos;t know where their money is going.
        </p>
      </section>

      {/* ── Solution ── */}
      <section className="bg-[#f0f2ff] border-y border-[#0822C0]/8">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight uppercase mb-4">
            The Solution
          </h2>
          <p className="text-[#0822C0] font-bold text-xl sm:text-2xl mb-2">
            The Complete Budget and Money Tracker
          </p>
          <p className="text-gray-600 text-base mb-12">
            The Only Budget Tracker That Actually Adapts to <span className="font-semibold text-gray-900">YOUR Life</span>
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left max-w-2xl mx-auto mb-12">
            {[
              "Track ALL Income Sources - Salary, Freelance, business, investments, rental income",
              "Comprehensive Expenses - Every category you actually spend money on",
              "Investment Tracking - See how much you're building for your future",
              "100% Customizable - Adapts to YOUR unique situation",
              "Works Any Currency - Perfect for anyone, anywhere",
              "Simple & Clean - Takes 10 minutes a day, not hours",
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 bg-white rounded-xl border border-[#0822C0]/10 px-4 py-3">
                <CheckIcon color="#0822C0" />
                <span className="text-sm text-gray-700 leading-relaxed">{item}</span>
              </div>
            ))}
          </div>

          <Link
            href="/money-tracker/checkout"
            className="inline-flex items-center gap-2 rounded-xl bg-[#0822C0] text-white font-bold text-base px-8 py-4 hover:bg-[#0618a0] transition-colors shadow-lg"
          >
            Start Tracking Your Money Today →
          </Link>
        </div>
      </section>

      {/* ── What Happens Week by Week ── */}
      <section className="mx-auto max-w-3xl px-6 py-20">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-center uppercase mb-14">
          What Happens When You Use This
        </h2>
        <div className="space-y-6">
          {[
            {
              week: "Week 1",
              text: "Find your \"money leaks\" - small expenses that add up to thousands monthly",
              color: "bg-blue-500",
            },
            {
              week: "Week 2",
              text: "Discover money you didn't know you had",
              color: "bg-green-500",
            },
            {
              week: "Week 3",
              text: "Start making smarter spending decisions automatically",
              color: "bg-purple-500",
            },
            {
              week: "Week 4",
              text: "See exactly how much you can save and invest each month",
              color: "bg-orange-500",
            },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-5">
              <div className={`h-10 w-10 rounded-full ${item.color} text-white font-bold text-sm flex items-center justify-center shrink-0`}>
                {i + 1}
              </div>
              <div>
                <p className="font-bold text-sm text-gray-900">{item.week}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="bg-gray-50 border-y border-gray-100">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-center uppercase mb-14">
            Real Results
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                name: "Sarah M.",
                quote: "I found ₦40,320 in forgotten subscriptions in my first week!",
              },
              {
                name: "Michael T.",
                quote: "Finally a tracker that doesn't feel like math homework.",
              },
              {
                name: "David R.",
                quote: "I've saved more in 3 months than I did all last year.",
              },
            ].map((t) => (
              <div key={t.name} className="rounded-2xl bg-white border border-gray-100 p-6">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg key={i} className="h-4 w-4 text-amber-400 fill-amber-400" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">&ldquo;{t.quote}&rdquo;</p>
                <p className="font-semibold text-sm text-gray-900">— {t.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── What You Get ── */}
      <section className="bg-[#f0f2ff] border-b border-[#0822C0]/8">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight uppercase mb-10">
            What You Get
          </h2>
          <div className="rounded-2xl border border-[#0822C0]/15 bg-white p-8 text-left inline-block w-full max-w-lg">
            <p className="font-bold text-base text-gray-900 mb-5">🎁 The Complete Tracker</p>
            <div className="space-y-3">
              {[
                "Income tracking (all sources)",
                "Expense management (comprehensive categories)",
                "Investment & wealth building tracker",
                "Fully customizable for your life",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckIcon color="#16a34a" />
                  <span className="text-sm text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Urgency CTA ── */}
      <section className="bg-gradient-to-br from-red-600 to-orange-500 text-white">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <p className="text-base font-semibold text-white/80 mb-3">
            This price is only for the first 100 customers
          </p>
          <p className="text-white/60 text-sm mb-8">
            After that, price returns to the original price.
          </p>
          <p className="text-2xl sm:text-3xl font-bold mb-10">
            Every day you wait is another day money slips away.
          </p>
          <Link
            href="/money-tracker/checkout"
            className="inline-flex items-center gap-2 rounded-xl bg-white text-red-600 font-bold text-base px-10 py-4 hover:bg-red-50 transition-colors shadow-xl"
          >
            Get Your Complete Budget and Money Tracker Today! →
          </Link>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="mx-auto max-w-3xl px-6 py-20">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-center uppercase mb-12">FAQ</h2>
        <div className="space-y-6">
          {[
            {
              q: "Do I need spreadsheet skills?",
              a: "No. If you can type numbers, you can use this.",
            },
            {
              q: "Works with my currency?",
              a: "Yes. Any currency worldwide.",
            },
            {
              q: "How much time does this take?",
              a: "Just 10 minutes per day.",
            },
            {
              q: "Can it work with my phone?",
              a: "Yes, you can use it on your phone and it updates online for you.",
            },
            {
              q: "Do I need Excel to use this?",
              a: "No, this works with Google Sheets, you don't need Excel.",
            },
          ].map((item) => (
            <div key={item.q} className="border-b border-gray-100 pb-6">
              <p className="font-semibold text-sm text-[#0822C0] mb-1">Q: {item.q}</p>
              <p className="text-sm text-gray-500 leading-relaxed">A: {item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Two Choices ── */}
      <section className="bg-gradient-to-br from-[#050D2A] to-[#0822C0] text-white">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-10">
            You have two choices:
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-12">
            {/* Choice 1 */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-left">
              <div className="h-9 w-9 rounded-full bg-red-500/20 border border-red-400/30 flex items-center justify-center mb-4">
                <svg className="h-4 w-4 text-red-400" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="text-white/70 text-sm leading-relaxed">
                Keep wondering where your money goes...
              </p>
            </div>
            {/* Choice 2 */}
            <div className="rounded-2xl border border-green-400/25 bg-green-400/8 p-6 text-left">
              <div className="h-9 w-9 rounded-full bg-green-500/20 border border-green-400/30 flex items-center justify-center mb-4">
                <svg className="h-4 w-4 text-green-400" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-white/85 text-sm leading-relaxed font-medium">
                Take control today with the Complete Money Mastery Tracker
              </p>
            </div>
          </div>
          <p className="text-white/50 text-sm mb-8">
            Don&apos;t let another day of financial uncertainty slip by.
          </p>
          <Link
            href="/money-tracker/checkout"
            className="inline-flex items-center gap-2 rounded-xl bg-white text-[#0822C0] font-bold text-base px-10 py-4 hover:bg-blue-50 transition-colors shadow-xl"
          >
            Get Your Tracker Now →
          </Link>
          <div className="mt-5 flex items-center justify-center gap-6 text-xs text-white/35">
            <span>🔒 Instant Access</span>
            <span>🔒 Secure Checkout</span>
          </div>
        </div>
      </section>

    </div>
  );
}
