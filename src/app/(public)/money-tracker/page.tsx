import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "The Complete Budget & Money Tracker — Finance with Anne",
  description: "The Complete Money Tracker That Finds Your 'Lost Money' in Just 10 Minutes a Day!",
};

function CircleXIcon() {
  return (
    <svg className="w-6 h-6 shrink-0 mt-1" style={{ color: "#ef4444" }} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="m15 9-6 6" /><path d="m9 9 6 6" />
    </svg>
  );
}

function CircleCheckIcon({ size = 6 }: { size?: number }) {
  return (
    <svg className={`w-${size} h-${size} shrink-0 mt-1`} style={{ color: "#22c55e" }} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M21.801 10A10 10 0 1 1 17 3.335" />
      <path d="m9 11 3 3L22 4" />
    </svg>
  );
}

function ZapIcon({ className }: { className: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
    </svg>
  );
}

function ShieldIcon({ className }: { className: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    </svg>
  );
}

function ArrowRightIcon({ className }: { className: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
    </svg>
  );
}

export default function MoneyTrackerPage() {
  return (
    <div style={{ backgroundColor: "#f8fafc", color: "#111827" }}>

      {/* ── Hero ── */}
      <section style={{ background: "linear-gradient(to right, #0822C0, #1a3ed4)", color: "#ffffff", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.10)" }} />
        <div className="relative mx-auto max-w-4xl px-4 py-8 md:py-16 text-center">

          <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium mb-6" style={{ backgroundColor: "rgba(250,204,21,0.20)", color: "#fde68a" }}>
            <ZapIcon className="w-4 h-4 mr-2" />
            Limited Time Offer - First 100 Customers Only
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight" style={{ color: "#ffffff" }}>
            Stop Wondering Where Your Money Goes
            <span style={{ color: "#facc15" }}> Every Month</span>
          </h1>

          <p className="text-xl md:text-2xl mb-8 leading-relaxed" style={{ color: "rgba(255,255,255,0.90)" }}>
            The Complete Money Tracker That Finds Your &ldquo;Lost Money&rdquo; in Just
            <span className="font-bold" style={{ color: "#facc15" }}> 10 Minutes a Day!</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link href="/money-tracker/checkout">
              <button
                className="inline-flex items-center gap-2 font-bold px-8 py-4 text-lg rounded-md transition-colors group"
                style={{ backgroundColor: "#ffffff", color: "#0822C0" }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#fefce8")}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#ffffff")}
              >
                Get Your Tracker Now
                <ArrowRightIcon className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1.5" />
              </button>
            </Link>
            <div className="flex items-center" style={{ color: "#fde68a" }}>
              <ShieldIcon className="w-5 h-5 mr-2" />
              <span>Secure Checkout • Instant Access</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            {[
              { value: "78%", label: "Live paycheck to paycheck" },
              { value: "10 min", label: "Daily time investment" },
              { value: "100%", label: "Customizable to your life" },
            ].map((s) => (
              <div key={s.value} className="backdrop-blur-sm rounded-lg p-4" style={{ backgroundColor: "rgba(255,255,255,0.10)" }}>
                <div className="text-2xl font-bold" style={{ color: "#facc15" }}>{s.value}</div>
                <div className="text-sm" style={{ color: "rgba(255,255,255,0.90)" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── The Problem ── */}
      <section className="py-8 md:py-16" style={{ backgroundColor: "#ffffff" }}>
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12" style={{ color: "#111827" }}>THE PROBLEM</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              "You check your bank account thinking \"Where did all my money go?\"",
              "You want to save but there's never anything left over",
              "You've tried budgeting apps but they're too complicated or don't work",
              "You feel stressed about money but don't know where to start",
            ].map((text, i) => (
              <div key={i} className="rounded-lg shadow-sm" style={{ border: "1px solid #fecaca", backgroundColor: "#fef2f2" }}>
                <div className="p-6">
                  <div className="flex items-start space-x-3">
                    <CircleXIcon />
                    <p className="font-medium" style={{ color: "#1f2937" }}>{text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <p className="text-lg max-w-3xl mx-auto" style={{ color: "#374151" }}>
              You&apos;re not alone.{" "}
              <span className="font-bold" style={{ color: "#0822C0" }}>78% of people live paycheck to paycheck</span>{" "}
              not because they don&apos;t earn enough, but because they don&apos;t know where their money is going.
            </p>
          </div>
        </div>
      </section>

      {/* ── The Solution ── */}
      <section className="py-8 md:py-16" style={{ background: "linear-gradient(to right, rgba(8,34,192,0.05), rgba(250,204,21,0.05))" }}>
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6" style={{ color: "#111827" }}>THE SOLUTION</h2>
          <h3 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: "#0822C0" }}>The Complete Budget and Money Tracker</h3>
          <p className="text-xl mb-12" style={{ color: "#374151" }}>
            The Only Budget Tracker That Actually Adapts to{" "}
            <span className="font-bold" style={{ color: "#22c55e" }}>YOUR Life</span>
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {[
              "Track ALL Income Sources - Salary, freelance, business, investments, rental income",
              "Comprehensive Expenses - Every category you actually spend money on",
              "Investment Tracking - See how much you're building for your future",
              "100% Customizable - Adapts to YOUR unique situation",
              "Works Any Currency - Perfect for anyone, anywhere",
              "Simple & Clean - Takes 10 minutes a day, not hours",
            ].map((item, i) => (
              <div key={i} className="rounded-lg shadow-sm" style={{ border: "1px solid #bbf7d0", backgroundColor: "#f0fdf4" }}>
                <div className="p-6">
                  <div className="flex items-start space-x-3">
                    <CircleCheckIcon size={6} />
                    <p className="font-medium" style={{ color: "#1f2937" }}>{item}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Link href="/money-tracker/checkout">
            <button
              className="inline-flex items-center gap-2 font-bold px-8 py-4 text-lg rounded-md transition-colors group"
              style={{ backgroundColor: "#0822C0", color: "#ffffff" }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#0618a0")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#0822C0")}
            >
              Start Tracking Your Money Today
              <ArrowRightIcon className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1.5" />
            </button>
          </Link>
        </div>
      </section>

      {/* ── What Happens When You Use This ── */}
      <section className="py-8 md:py-16" style={{ backgroundColor: "#ffffff" }}>
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12" style={{ color: "#111827" }}>WHAT HAPPENS WHEN YOU USE THIS</h2>
          <div className="space-y-8">
            {[
              { n: 1, week: "Week 1", text: "Find your \"money leaks\" - small expenses that add up to thousands monthly", bg: "#3b82f6" },
              { n: 2, week: "Week 2", text: "Discover money you didn't know you had", bg: "#22c55e" },
              { n: 3, week: "Week 3", text: "Start making smarter spending decisions automatically", bg: "#a855f7" },
              { n: 4, week: "Week 4", text: "See exactly how much you can save and invest each month", bg: "#f97316" },
            ].map((item) => (
              <div key={item.n} className="flex items-center space-x-6">
                <div className="w-16 h-16 rounded-full flex items-center justify-center font-bold text-lg shrink-0" style={{ backgroundColor: item.bg, color: "#ffffff" }}>
                  {item.n}
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2" style={{ color: "#111827" }}>{item.week}</h3>
                  <p className="text-lg" style={{ color: "#374151" }}>{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Real Results ── */}
      <section className="py-8 md:py-16" style={{ backgroundColor: "#f9fafb" }}>
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12" style={{ color: "#111827" }}>REAL RESULTS</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Sarah M.", quote: "I found ₦80,000 in forgotten subscriptions in my first week!" },
              { name: "Michael T.", quote: "Finally, a tracker that doesn't feel like math homework." },
              { name: "David R.", quote: "I've saved more in 3 months than I did all last year." },
            ].map((t) => (
              <div key={t.name} className="rounded-lg shadow-lg" style={{ backgroundColor: "#ffffff", border: "1px solid #f3f4f6" }}>
                <div className="p-6">
                  <div className="flex mb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg key={i} className="w-5 h-5 fill-current" style={{ color: "#facc15" }} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
                      </svg>
                    ))}
                  </div>
                  <p className="mb-4 italic" style={{ color: "#374151" }}>&ldquo;{t.quote}&rdquo;</p>
                  <p className="font-semibold" style={{ color: "#0822C0" }}>- {t.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── What You Get ── */}
      <section className="py-8 md:py-16" style={{ backgroundColor: "#ffffff" }}>
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12" style={{ color: "#111827" }}>WHAT YOU GET</h2>
          <div className="rounded-lg shadow-sm" style={{ background: "linear-gradient(to right, rgba(8,34,192,0.10), rgba(250,204,21,0.10))", border: "1px solid rgba(8,34,192,0.20)" }}>
            <div className="p-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-4" style={{ color: "#0822C0" }}>🎯 The Complete Tracker</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  "Income tracking (all sources)",
                  "Expense management (comprehensive categories)",
                  "Investment & wealth building tracker",
                  "Fully customizable for your life",
                ].map((item) => (
                  <div key={item} className="flex items-center space-x-3">
                    <svg className="w-5 h-5 shrink-0" style={{ color: "#22c55e" }} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M21.801 10A10 10 0 1 1 17 3.335" /><path d="m9 11 3 3L22 4" />
                    </svg>
                    <span className="font-medium" style={{ color: "#1f2937" }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Urgency ── */}
      <section className="py-8 md:py-16" style={{ background: "linear-gradient(to right, #ef4444, #f97316)", color: "#ffffff" }}>
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-6xl font-bold mb-6">⏰</h2>
          <p className="text-xl mb-4">
            This price is only for the <span className="font-bold">first 100 customers</span>
          </p>
          <p className="text-lg mb-8" style={{ color: "rgba(255,255,255,0.90)" }}>After that, price returns to the original price.</p>
          <p className="text-2xl font-bold mb-8">Every day you wait is another day money slips away.</p>
          <Link href="/money-tracker/checkout">
            <button
              className="inline-flex items-center gap-2 font-bold px-8 py-4 text-lg rounded-md transition-colors group"
              style={{ backgroundColor: "#ffffff", color: "#dc2626" }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#f3f4f6")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#ffffff")}
            >
              Get Your Complete Budget and Money Tracker Today!
              <ArrowRightIcon className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1.5" />
            </button>
          </Link>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-8 md:py-16" style={{ backgroundColor: "#f9fafb" }}>
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12" style={{ color: "#111827" }}>FAQ</h2>
          <div className="space-y-6">
            {[
              { q: "Do I need spreadsheet skills?", a: "No! If you can type numbers, you can use this." },
              { q: "Works with my currency?", a: "Yes! Any currency worldwide." },
              { q: "How much time does this take?", a: "Just 10 minutes per day." },
              { q: "Can it work with my phone?", a: "Yes, you can use it on your phone and it updates online for you." },
              { q: "Do I need Excel to use this?", a: "No, this works with Google sheets, you don't need excel." },
            ].map((item) => (
              <div key={item.q} className="rounded-lg shadow-sm" style={{ backgroundColor: "#ffffff", border: "1px solid #e5e7eb" }}>
                <div className="p-6">
                  <h3 className="font-bold mb-2" style={{ color: "#0822C0" }}>Q: {item.q}</h3>
                  <p style={{ color: "#374151" }}>A: {item.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Two Choices ── */}
      <section className="py-8 md:py-16" style={{ background: "linear-gradient(to right, #0822C0, #1a3ed4)", color: "#ffffff" }}>
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">You have two choices:</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="rounded-lg shadow-sm" style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca" }}>
              <div className="p-6 text-center">
                <svg className="w-12 h-12 mx-auto mb-4" style={{ color: "#ef4444" }} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <path d="m15 9-6 6" /><path d="m9 9 6 6" />
                </svg>
                <p className="font-medium" style={{ color: "#1f2937" }}>Keep wondering where your money goes...</p>
              </div>
            </div>
            <div className="rounded-lg shadow-sm" style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0" }}>
              <div className="p-6 text-center">
                <svg className="w-12 h-12 mx-auto mb-4" style={{ color: "#22c55e" }} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M21.801 10A10 10 0 1 1 17 3.335" />
                  <path d="m9 11 3 3L22 4" />
                </svg>
                <p className="font-medium" style={{ color: "#1f2937" }}>Take control today with the Complete Money Mastery Tracker.</p>
              </div>
            </div>
          </div>
          <p className="text-xl mb-8" style={{ color: "rgba(255,255,255,0.90)" }}>Don&apos;t let another day of financial uncertainty slip by.</p>
          <Link href="/money-tracker/checkout">
            <button
              className="inline-flex items-center gap-2 font-bold px-8 py-4 text-lg rounded-md transition-colors mb-6 group"
              style={{ backgroundColor: "#ffffff", color: "#0822C0" }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#eff6ff")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#ffffff")}
            >
              Get Your Tracker Now
              <ArrowRightIcon className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1.5" />
            </button>
          </Link>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center" style={{ color: "#fde68a" }}>
            <div className="flex items-center">
              <ZapIcon className="w-5 h-5 mr-2" />
              <span>Instant Access</span>
            </div>
            <div className="flex items-center">
              <ShieldIcon className="w-5 h-5 mr-2" />
              <span>Secure Checkout</span>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
