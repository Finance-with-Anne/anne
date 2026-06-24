import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "The Complete Budget & Money Tracker — Finance with Anne",
  description: "Take control of your finances with a done-for-you Google Sheets budget tracker. Know exactly where every naira goes. ₦11,999 only.",
};

const PRICE = 11999;

function CheckIcon() {
  return (
    <svg className="h-5 w-5 text-[#0822C0] shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

export default function MoneyTrackerPage() {
  return (
    <div className="bg-white dark:bg-[#05090f] text-gray-900 dark:text-white">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-[#0822C0] text-white">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_left,_#ffffff_0%,_transparent_60%)]" />
        <div className="relative mx-auto max-w-5xl px-6 py-20 sm:py-28 text-center">
          <span className="inline-block rounded-full bg-white/15 border border-white/20 px-4 py-1.5 text-xs font-semibold tracking-widest uppercase mb-6">
            Digital Template
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight mb-6">
            The Complete Budget<br className="hidden sm:block" /> & Money Tracker
          </h1>
          <p className="text-lg sm:text-xl text-white/75 max-w-2xl mx-auto mb-10">
            A done-for-you Google Sheets system to track your income, expenses, savings goals, and debt — all in one place. Know exactly where every naira goes.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/money-tracker/checkout"
              className="inline-flex items-center justify-center rounded-xl bg-white text-[#0822C0] font-bold text-base px-8 py-4 hover:bg-blue-50 transition-colors shadow-xl"
            >
              Get it now — ₦{PRICE.toLocaleString()}
            </Link>
            <a href="#what-you-get" className="text-sm text-white/60 hover:text-white transition-colors underline underline-offset-4">
              See what&apos;s inside ↓
            </a>
          </div>
          <p className="mt-6 text-sm text-white/40">Instant access after payment · Works on Google Sheets (free)</p>
        </div>
      </section>

      {/* ── The Problem ── */}
      <section className="mx-auto max-w-4xl px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Does this sound familiar?
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[
            { emoji: "😩", text: "You get paid and somehow it's gone before the month ends." },
            { emoji: "😰", text: "You have no idea how much you actually spend every month." },
            { emoji: "😔", text: "You&apos;ve tried budgeting apps but they never stick." },
            { emoji: "😤", text: "You want to save more but there&apos;s nothing left after expenses." },
            { emoji: "🤯", text: "Your bank statement stresses you out to even look at." },
            { emoji: "😶", text: "You feel like you earn enough but have nothing to show for it." },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-4 rounded-2xl border border-gray-100 dark:border-white/8 bg-gray-50 dark:bg-white/3 p-5">
              <span className="text-2xl leading-none mt-0.5">{item.emoji}</span>
              <p className="text-gray-700 dark:text-white/70 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: item.text }} />
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            You don&apos;t have a money problem. You have a <em>visibility</em> problem.
          </p>
          <p className="mt-2 text-gray-500 dark:text-white/45 text-sm max-w-lg mx-auto">
            When you can&apos;t see where your money is going, you can&apos;t control it. That&apos;s what this tracker fixes.
          </p>
        </div>
      </section>

      {/* ── Solution ── */}
      <section className="bg-[#0822C0]/4 dark:bg-[#0822C0]/8 border-y border-[#0822C0]/10">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Introducing The Complete Budget & Money Tracker
          </h2>
          <p className="text-gray-600 dark:text-white/55 text-lg max-w-2xl mx-auto">
            A beautifully designed Google Sheets template that does the heavy lifting for you. Set it up in 20 minutes, use it for life.
          </p>
        </div>
      </section>

      {/* ── What You Get ── */}
      <section id="what-you-get" className="mx-auto max-w-5xl px-6 py-20">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-center mb-4">
          Everything inside the tracker
        </h2>
        <p className="text-center text-gray-500 dark:text-white/45 mb-14 max-w-xl mx-auto">
          One template. Six powerful tabs. Total financial clarity.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: "Monthly Budget Planner",
              desc: "Plan income vs. expenses before the month starts. Allocate every naira intentionally.",
              icon: "📋",
            },
            {
              title: "Daily Expense Tracker",
              desc: "Log every expense by category. See your spending patterns in real time.",
              icon: "📝",
            },
            {
              title: "Savings Goals Tracker",
              desc: "Set savings targets — emergency fund, vacation, investment — and track progress visually.",
              icon: "🎯",
            },
            {
              title: "Debt Payoff Plan",
              desc: "List all your debts, enter your payments, and watch the snowball method work.",
              icon: "❄️",
            },
            {
              title: "Net Worth Calculator",
              desc: "Assets minus liabilities = your real financial picture. Update monthly.",
              icon: "📊",
            },
            {
              title: "Annual Overview Dashboard",
              desc: "Year-at-a-glance view. See your monthly trends, saving rate, and top spending categories.",
              icon: "🗓️",
            },
          ].map(item => (
            <div key={item.title} className="rounded-2xl border border-gray-100 dark:border-white/8 p-6 hover:border-[#0822C0]/30 dark:hover:border-[#0822C0]/40 transition-colors">
              <span className="text-3xl block mb-4">{item.icon}</span>
              <h3 className="font-bold text-base mb-2">{item.title}</h3>
              <p className="text-sm text-gray-500 dark:text-white/45 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features list ── */}
      <section className="bg-gray-50 dark:bg-white/3 border-y border-gray-100 dark:border-white/6">
        <div className="mx-auto max-w-4xl px-6 py-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-16 gap-y-4">
            {[
              "Pre-built formulas — no manual calculations",
              "Works on Google Sheets (100% free to use)",
              "Mobile-friendly — track on your phone",
              "Colour-coded categories for easy reading",
              "Automatic running totals and summaries",
              "Customisable — add your own categories",
              "One-time purchase, use forever",
              "Includes short video walkthrough guide",
            ].map(f => (
              <div key={f} className="flex items-start gap-3">
                <CheckIcon />
                <span className="text-sm text-gray-700 dark:text-white/65">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <h2 className="text-3xl font-bold tracking-tight text-center mb-14">
          Real results from real people
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            {
              name: "Chisom O.",
              location: "Lagos",
              quote: "I finally stopped living paycheck to paycheck. By month two I had ₦80,000 saved up — more than I'd saved all of last year.",
            },
            {
              name: "Tunde A.",
              location: "Abuja",
              quote: "The debt payoff tab alone is worth it. I've paid off two of my credit cards in four months using the plan it gave me.",
            },
            {
              name: "Amaka N.",
              location: "Port Harcourt",
              quote: "I'm not a numbers person but this tracker makes it so easy. I spend 10 minutes a week and I know exactly where I stand.",
            },
          ].map(t => (
            <div key={t.name} className="rounded-2xl border border-gray-100 dark:border-white/8 bg-white dark:bg-white/3 p-6">
              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} className="h-4 w-4 text-amber-400 fill-amber-400" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                ))}
              </div>
              <p className="text-sm text-gray-600 dark:text-white/60 leading-relaxed mb-4">&ldquo;{t.quote}&rdquo;</p>
              <div>
                <p className="font-semibold text-sm">{t.name}</p>
                <p className="text-xs text-gray-400 dark:text-white/30">{t.location}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pricing CTA ── */}
      <section className="bg-[#0822C0] text-white">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Get instant access today
          </h2>
          <p className="text-white/65 mb-2">One-time payment. No subscription. Use it forever.</p>
          <div className="my-8">
            <span className="text-5xl font-extrabold">₦{PRICE.toLocaleString()}</span>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/money-tracker/checkout"
              className="inline-flex items-center justify-center rounded-xl bg-white text-[#0822C0] font-bold text-base px-10 py-4 hover:bg-blue-50 transition-colors shadow-xl w-full sm:w-auto"
            >
              Yes, I want this — ₦{PRICE.toLocaleString()}
            </Link>
          </div>
          <p className="mt-6 text-xs text-white/35">Secure payment via Flutterwave · Instant delivery to your email</p>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="mx-auto max-w-3xl px-6 py-20">
        <h2 className="text-3xl font-bold tracking-tight text-center mb-12">FAQ</h2>
        <div className="space-y-6">
          {[
            {
              q: "What exactly do I get?",
              a: "You get a Google Sheets file with 6 pre-built tabs: Monthly Budget Planner, Daily Expense Tracker, Savings Goals, Debt Payoff Plan, Net Worth Calculator, and Annual Dashboard. You also get a short video guide showing you how to set everything up.",
            },
            {
              q: "Do I need to pay for Google Sheets?",
              a: "No. Google Sheets is completely free to use with any Google/Gmail account.",
            },
            {
              q: "How do I receive it?",
              a: "As soon as your payment is confirmed, we'll email you a link to copy the Google Sheets file directly into your own Google Drive. If you're new, we'll also create your Finance with Anne account and send you login details.",
            },
            {
              q: "Can I use it on my phone?",
              a: "Yes. Google Sheets works on Android and iOS via their free app. You can track expenses on the go.",
            },
            {
              q: "What if I'm not good with spreadsheets?",
              a: "The tracker is designed for people who are not spreadsheet experts. All formulas are already built in — you just fill in your numbers. The video guide walks you through it step by step.",
            },
            {
              q: "Can I get a refund?",
              a: "Because this is a digital product, we don't offer refunds. If you have any issues accessing or using it, reach out to us at contact@financewithanne.com and we'll help you.",
            },
          ].map(item => (
            <div key={item.q} className="border-b border-gray-100 dark:border-white/8 pb-6">
              <h3 className="font-semibold text-base mb-2">{item.q}</h3>
              <p className="text-sm text-gray-500 dark:text-white/50 leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="border-t border-gray-100 dark:border-white/6">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to take control of your money?
          </h2>
          <p className="text-gray-500 dark:text-white/45 mb-8 text-sm">
            Join hundreds of Nigerians who have used this tracker to build savings, pay off debt, and finally understand their finances.
          </p>
          <Link
            href="/money-tracker/checkout"
            className="inline-flex items-center justify-center rounded-xl bg-[#0822C0] text-white font-bold text-base px-10 py-4 hover:bg-[#0618a0] transition-colors shadow-xl"
          >
            Get The Complete Budget & Money Tracker — ₦{PRICE.toLocaleString()}
          </Link>
          <p className="mt-4 text-xs text-gray-400 dark:text-white/25">Instant access · Secure checkout · One-time payment</p>
        </div>
      </section>

    </div>
  );
}
