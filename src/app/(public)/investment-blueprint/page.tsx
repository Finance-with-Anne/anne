import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
import { Fraunces, IBM_Plex_Mono } from "next/font/google";
import { createClient } from "@/lib/supabase/server";
import type { Testimonial } from "@/types";
import SocialProofToast from "@/components/public/SocialProofToast";
import LiveViewerBadge from "@/components/public/LiveViewerBadge";

const fraunces = Fraunces({ subsets: ["latin"], weight: ["500", "600"], style: ["normal", "italic"], variable: "--font-fraunces" });
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-plex-mono" });

export const metadata: Metadata = {
  title: "The ₦10,000 Investment Blueprint | Finance with Anne",
  description: "5 legit ways to start investing in Nigeria today, even if you've never bought a single share, fund, or dollar asset in your life.",
};

const NAVY = "#02133B";
const NAVY_SOFT = "#0A1C4D";
const ROYAL = "#0040CF";
const PERI = "#7596F7";
const GOLD = "#F8D300";
const UP = "#1FBF75";

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5 mb-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill={i < rating ? GOLD : "#e5e7eb"}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

const problems = [
  "You don't know where to start",
  "You can't tell a legit platform from a scam",
  "You think you need \"big money\" to qualify",
  "You don't know which investment fits your goal",
  "Every year you wait, compound growth waits too",
];

const learn = [
  "An investment for people who hate risk",
  "An investment that can beat inflation",
  "An investment that builds long-term wealth",
  "An investment that earns in dollars",
  "An investment with higher growth potential",
  "My simple framework for deciding how to split your money",
  "How to spot and avoid investment scams",
  "Beginner mistakes that quietly cost people money",
];

const fitYes = [
  "You've been saving but haven't started investing",
  "You've assumed investing is only for the wealthy",
  "You have ₦10,000 or more to put to work",
  "You want your money growing, not just sitting",
  "You want to invest with confidence, not guesswork",
];

const fitNo = [
  "You're chasing a get-rich-quick scheme",
  "You expect guaranteed overnight profits",
  "You're not willing to learn before you invest",
];

const valueStack = [
  { emoji: "📘", label: "The ₦10,000 Investment Blueprint", core: true, value: 45000 },
  { emoji: "📋", label: "Investment Starter Checklist", core: false, value: 10000 },
  { emoji: "🗂", label: "Trusted Investment Platforms Directory", core: false, value: 5000 },
  { emoji: "📊", label: "Investment Allocation Template", core: false, value: 20000 },
  { emoji: "🎯", label: "Investment Goal Planner", core: false, value: 5000 },
  { emoji: "🎁", label: "Lifetime access to my investment community", core: false, value: "25,000/yr" },
];

const faqs = [
  { q: "Is this for total beginners?", a: "Yes. The blueprint assumes zero investing experience and walks you through everything in plain language, no finance jargon." },
  { q: "Do I need to already have ₦10,000 saved?", a: "No. The guide shows you how to start with whatever you have, ₦10,000 is simply the smallest amount most of the platforms covered will accept." },
  { q: "How do I get access after paying?", a: "Instantly. As soon as your payment is confirmed, you'll get an email with your download link and access to the community." },
  { q: "What if I need help after going through it?", a: "You'll have lifetime access to the investment community, where you can ask questions and get support." },
];

export default async function InvestmentBlueprintPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("testimonials")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false })
    .limit(3);
  const testimonials = (data ?? []) as Testimonial[];

  const totalValue = valueStack.reduce((sum, item) => sum + (typeof item.value === "number" ? item.value : 0), 0);

  return (
    <div className={`${fraunces.variable} ${plexMono.variable}`} style={{ background: "#F7F5EF", color: "#0C1220" }}>
      {/* Google Tag Manager */}
      <Script id="gtm-script" strategy="afterInteractive">
        {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-N6CS33QS');`}
      </Script>
      {/* Google Tag Manager (noscript) */}
      <noscript>
        <iframe
          src="https://www.googletagmanager.com/ns.html?id=GTM-N6CS33QS"
          height="0"
          width="0"
          style={{ display: "none", visibility: "hidden" }}
        />
      </noscript>
      {/* End Google Tag Manager */}

      {/* Meta Pixel Code */}
      <Script id="meta-pixel" strategy="afterInteractive">
        {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '4051514711819274');
fbq('track', 'PageView');`}
      </Script>
      <noscript>
        <img
          height={1}
          width={1}
          style={{ display: "none" }}
          src="https://www.facebook.com/tr?id=4051514711819274&ev=PageView&noscript=1"
          alt=""
        />
      </noscript>
      {/* End Meta Pixel Code */}

      {/* ── Hero ── */}
      <header style={{ background: NAVY, color: "#fff", position: "relative", overflow: "hidden" }}>
        <div
          style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            background: `radial-gradient(circle at 85% 15%, rgba(117,150,247,0.25), transparent 45%), radial-gradient(circle at 15% 90%, rgba(248,211,0,0.08), transparent 40%)`,
          }}
        />
        <div className="relative mx-auto max-w-6xl px-6 py-16 sm:py-24 grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-12 items-center">
          <div>
            <span
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs uppercase tracking-widest mb-6"
              style={{ fontFamily: "var(--font-plex-mono)", color: PERI, border: `1px solid rgba(117,150,247,0.4)` }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: UP, boxShadow: `0 0 0 3px rgba(31,191,117,0.2)` }} />
              Launch week: price rises soon
            </span>

            <h1
              className="text-[34px] sm:text-5xl leading-[1.06] font-semibold max-w-xl"
              style={{ fontFamily: "var(--font-fraunces)" }}
            >
              You don&apos;t need millions.<br />You need <em className="not-italic" style={{ color: GOLD, fontStyle: "italic" }}>₦10,000</em> and a plan.
            </h1>

            <p className="mt-5 text-lg max-w-lg" style={{ color: "rgba(255,255,255,0.78)" }}>
              5 legit ways to start investing in Nigeria today, even if you&apos;ve never bought a single share, fund, or dollar asset in your life.
            </p>

            <div className="mt-8 flex items-center gap-4 flex-wrap">
              <span className="text-3xl font-semibold" style={{ fontFamily: "var(--font-plex-mono)", color: GOLD }}>₦5,000</span>
              <span className="text-base line-through" style={{ fontFamily: "var(--font-plex-mono)", color: "rgba(255,255,255,0.45)" }}>₦110,000 value</span>
            </div>

            <div className="mt-4">
              <LiveViewerBadge />
            </div>

            <div className="mt-6">
              <Link
                href="/investment-blueprint/checkout"
                className="inline-block font-bold text-base px-8 py-4 rounded-lg transition-transform hover:-translate-y-0.5"
                style={{ background: GOLD, color: NAVY, boxShadow: "0 8px 24px rgba(248,211,0,0.18)" }}
              >
                Get the Blueprint + Starter Kit →
              </Link>
              <p className="mt-3 text-xs" style={{ fontFamily: "var(--font-plex-mono)", color: "rgba(255,255,255,0.5)" }}>
                Instant download · No app required · One-time payment
              </p>
            </div>
          </div>

          <div className="relative z-[2] rounded-2xl p-6" style={{ background: NAVY_SOFT, border: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="flex justify-between text-xs mb-1.5" style={{ fontFamily: "var(--font-plex-mono)", color: "rgba(255,255,255,0.55)" }}>
              <span>SAMPLE ₦10,000 STARTING POINT</span><span>ILLUSTRATIVE</span>
            </div>
            <div className="text-2xl font-semibold" style={{ fontFamily: "var(--font-plex-mono)" }}>
              ₦10,000 <span className="text-sm ml-2" style={{ color: UP }}>consistent monthly top-ups</span>
            </div>
            <svg viewBox="0 0 400 140" preserveAspectRatio="none" className="w-full h-[140px] mt-4">
              <defs>
                <linearGradient id="fillgrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7596F7" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#7596F7" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M0,120 L50,112 L100,100 L150,104 L200,80 L250,70 L300,42 L350,30 L400,10 L400,140 L0,140 Z" fill="url(#fillgrad)" />
              <path d="M0,120 L50,112 L100,100 L150,104 L200,80 L250,70 L300,42 L350,30 L400,10" fill="none" stroke={GOLD} strokeWidth="2.5" />
            </svg>
            <div className="flex justify-between text-[11px] mt-1.5" style={{ fontFamily: "var(--font-plex-mono)", color: "rgba(255,255,255,0.4)" }}>
              <span>YEAR 1</span><span>YEAR 3</span><span>YEAR 5+</span>
            </div>
          </div>
        </div>
      </header>

      {/* ── Problem ── */}
      <section style={{ background: NAVY, color: "#fff" }} className="py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-6">
          <span className="block text-xs uppercase tracking-widest mb-3.5" style={{ fontFamily: "var(--font-plex-mono)", color: PERI }}>
            Why most people never start
          </span>
          <h2 className="text-[26px] sm:text-4xl font-semibold max-w-xl" style={{ fontFamily: "var(--font-fraunces)" }}>
            You&apos;ve been saving. You haven&apos;t been investing. There&apos;s a difference, and it&apos;s costing you.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-11 items-start">
            <ul>
              {problems.map((p) => (
                <li key={p} className="flex gap-3 py-3.5 text-base" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                  <span style={{ fontFamily: "var(--font-plex-mono)", color: "#FF6B6B", fontWeight: 600 }}>✕</span> {p}
                </li>
              ))}
            </ul>

            <div className="rounded-2xl p-7" style={{ background: NAVY_SOFT, border: "1px solid rgba(255,255,255,0.08)" }}>
              <span className="text-xs uppercase tracking-widest" style={{ fontFamily: "var(--font-plex-mono)", color: "rgba(255,255,255,0.5)" }}>
                Cost of waiting one more year
              </span>
              <div className="text-4xl font-semibold mt-2.5" style={{ fontFamily: "var(--font-plex-mono)", color: GOLD }}>Not ₦0.</div>
              <p className="mt-3.5 text-[15px]" style={{ color: "rgba(255,255,255,0.68)" }}>
                Money sitting idle in a savings account doesn&apos;t just stay flat. Inflation quietly shrinks what it can buy. The guide isn&apos;t about getting rich overnight. It&apos;s about making sure your money is finally working as hard as you do.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── What you learn ── */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-6">
          <span className="block text-xs uppercase tracking-widest mb-3.5" style={{ fontFamily: "var(--font-plex-mono)", color: ROYAL }}>
            The ₦10,000 investment blueprint
          </span>
          <h2 className="text-[26px] sm:text-4xl font-semibold max-w-xl" style={{ fontFamily: "var(--font-fraunces)" }}>
            5 legit investments every Nigerian can start with ₦10,000 or less.
          </h2>
          <p className="mt-3.5 text-[17px] max-w-xl" style={{ color: "#4a5163" }}>
            No confusing jargon. No unrealistic promises. Just the real platforms and instruments Nigerians (at home and abroad) are already using to grow their money, matched to your income, goals, and risk level.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-10">
            {learn.map((item) => (
              <div key={item} className="flex gap-3.5 items-start rounded-xl p-5 bg-white" style={{ border: "1px solid rgba(2,19,59,0.08)" }}>
                <span
                  className="shrink-0 w-[26px] h-[26px] rounded-full flex items-center justify-center text-[13px] font-bold"
                  style={{ background: "rgba(0,64,207,0.1)", color: ROYAL, fontFamily: "var(--font-plex-mono)" }}
                >
                  ✓
                </span>
                <p className="text-[15px]" style={{ color: "#20263a" }}>{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Who for / not for ── */}
      <section className="pb-16 sm:pb-20">
        <div className="mx-auto max-w-6xl px-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl p-7 bg-white" style={{ border: "1px solid rgba(0,64,207,0.15)" }}>
            <h3 className="text-[19px] mb-4" style={{ color: ROYAL }}>This is for you if&hellip;</h3>
            <ul>
              {fitYes.map((item) => (
                <li key={item} className="flex gap-2.5 py-2 text-[15px]"><span style={{ color: UP }}>✓</span> {item}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl p-7" style={{ background: "#F1EEE6", border: "1px solid rgba(2,19,59,0.08)" }}>
            <h3 className="text-[19px] mb-4" style={{ color: "#6b6455" }}>This is not for you if&hellip;</h3>
            <ul>
              {fitNo.map((item) => (
                <li key={item} className="flex gap-2.5 py-2 text-[15px]"><span style={{ color: "#b8503f" }}>✕</span> {item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Value stack ── */}
      <section id="get" style={{ background: NAVY, color: "#fff" }} className="py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-6">
          <span className="block text-xs uppercase tracking-widest mb-3.5" style={{ fontFamily: "var(--font-plex-mono)", color: PERI }}>
            What&apos;s inside the Investment Starter Kit
          </span>
          <h2 className="text-[26px] sm:text-4xl font-semibold max-w-xl" style={{ fontFamily: "var(--font-fraunces)" }}>
            One payment. The complete kit, not just the ebook.
          </h2>

          <div className="rounded-[20px] p-8 sm:p-11 mt-11" style={{ background: NAVY, border: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="text-xs uppercase tracking-widest mb-6" style={{ fontFamily: "var(--font-plex-mono)", color: PERI }}>Value stack</div>

            {valueStack.map((item, i) => (
              <div
                key={item.label}
                className="flex justify-between items-center gap-5 py-4.5"
                style={{ borderBottom: i === valueStack.length - 1 ? "none" : "1px dashed rgba(255,255,255,0.15)", padding: "18px 0" }}
              >
                <div className="flex gap-3.5 items-center text-base">
                  <span className="text-[22px]">{item.emoji}</span> {item.label}
                  {item.core && (
                    <span
                      className="inline-block text-[10px] uppercase tracking-wide px-2 py-0.5 rounded ml-2.5"
                      style={{ fontFamily: "var(--font-plex-mono)", background: GOLD, color: NAVY }}
                    >
                      Core
                    </span>
                  )}
                </div>
                <div className="whitespace-nowrap" style={{ fontFamily: "var(--font-plex-mono)", color: "rgba(255,255,255,0.55)" }}>
                  ₦{item.value}
                </div>
              </div>
            ))}

            <div className="flex justify-between items-center pt-6 mt-2">
              <div className="text-base" style={{ color: "rgba(255,255,255,0.75)" }}>Total value</div>
              <div className="text-[26px] font-semibold" style={{ fontFamily: "var(--font-plex-mono)", color: GOLD }}>₦{totalValue.toLocaleString()}+</div>
            </div>

            <div className="mt-4.5 rounded-2xl p-6 text-center" style={{ background: NAVY_SOFT }}>
              <div className="text-xs uppercase tracking-widest" style={{ fontFamily: "var(--font-plex-mono)", color: "rgba(255,255,255,0.6)" }}>Today only</div>
              <div className="text-[44px] font-bold mt-1.5" style={{ fontFamily: "var(--font-plex-mono)", color: GOLD }}>₦5,000</div>
              <Link
                href="/investment-blueprint/checkout"
                className="inline-block mt-5 font-bold text-base px-8 py-4 rounded-lg transition-transform hover:-translate-y-0.5"
                style={{ background: GOLD, color: NAVY, boxShadow: "0 8px 24px rgba(248,211,0,0.18)" }}
              >
                YES, SEND ME MY STARTER KIT →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── About Anne ── */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-6 grid grid-cols-1 md:grid-cols-[0.8fr_1.2fr] gap-12 items-center">
          <div className="rounded-2xl overflow-hidden shadow-2xl">
            <Image src="/anne-about.jpg" alt="Anne, Finance with Anne" width={600} height={700} className="w-full object-cover object-top" />
          </div>
          <div>
            <span className="block text-xs uppercase tracking-widest mb-3.5" style={{ fontFamily: "var(--font-plex-mono)", color: ROYAL }}>
              Who&apos;s teaching you
            </span>
            <h2 className="text-[26px] sm:text-4xl font-semibold" style={{ fontFamily: "var(--font-fraunces)" }}>Hi, I&apos;m Anne.</h2>
            <p className="mt-3.5 text-[17px]" style={{ color: "#4a5163" }}>
              I&apos;m a personal finance educator and money coach helping Nigerians break free from financial stress, build healthy money habits, and create real, lasting wealth. This blueprint is the exact framework I use with my coaching clients, distilled into a guide anyone can follow.
            </p>
            <div className="flex gap-7 mt-6 flex-wrap" style={{ fontFamily: "var(--font-plex-mono)" }}>
              <div><div className="text-2xl font-semibold" style={{ color: ROYAL }}>10+</div><div className="text-xs uppercase tracking-wide text-gray-500">Years experience</div></div>
              <div><div className="text-2xl font-semibold" style={{ color: ROYAL }}>500+</div><div className="text-xs uppercase tracking-wide text-gray-500">Clients coached</div></div>
              <div><div className="text-2xl font-semibold" style={{ color: ROYAL }}>10k+</div><div className="text-xs uppercase tracking-wide text-gray-500">Community members</div></div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials (real, published) ── */}
      {testimonials.length > 0 && (
        <section className="py-16 sm:py-20" style={{ background: "#F1EEE6" }}>
          <div className="mx-auto max-w-6xl px-6">
            <span className="block text-xs uppercase tracking-widest mb-3.5" style={{ fontFamily: "var(--font-plex-mono)", color: ROYAL }}>What clients say</span>
            <h2 className="text-[26px] sm:text-4xl font-semibold max-w-xl" style={{ fontFamily: "var(--font-fraunces)" }}>Real people, real results.</h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-10">
              {testimonials.map((t) => (
                <div key={t.id} className="rounded-2xl p-6 bg-white" style={{ border: "1px solid rgba(2,19,59,0.08)" }}>
                  <Stars rating={t.rating} />
                  <p className="text-[15px]" style={{ color: "#20263a" }}>&ldquo;{t.content}&rdquo;</p>
                  <p className="mt-4 text-xs" style={{ fontFamily: "var(--font-plex-mono)", color: "#6b7280" }}>
                    {t.name}{t.role ? ` · ${t.role}` : ""}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── FAQ ── */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="text-[26px] sm:text-4xl font-semibold" style={{ fontFamily: "var(--font-fraunces)" }}>Questions, answered.</h2>
          <div className="mt-8">
            {faqs.map((f, i) => (
              <div key={f.q} className="py-5.5" style={{ borderBottom: i === faqs.length - 1 ? "none" : "1px solid rgba(2,19,59,0.1)" }}>
                <p className="font-bold text-base">{f.q}</p>
                <p className="mt-2.5 text-[15px]" style={{ color: "#40465a" }}>{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="text-center py-20 sm:py-24">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="text-[26px] sm:text-4xl font-semibold" style={{ fontFamily: "var(--font-fraunces)" }}>
            Your money deserves a plan, not just a savings account.
          </h2>
          <p className="mt-4.5 text-[17px]" style={{ color: "#4a5163" }}>
            Get the full ₦110,000 Investment Starter Kit today for ₦5,000.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              href="/investment-blueprint/checkout"
              className="inline-block font-bold text-base px-8 py-4 rounded-lg transition-transform hover:-translate-y-0.5"
              style={{ background: GOLD, color: NAVY, boxShadow: "0 8px 24px rgba(248,211,0,0.18)" }}
            >
              Get the Blueprint + Starter Kit →
            </Link>
          </div>
        </div>
      </section>

      <footer style={{ background: NAVY, color: "rgba(255,255,255,0.4)" }} className="text-center py-7 text-[13px]" >
        <span style={{ fontFamily: "var(--font-plex-mono)" }}>&copy; {new Date().getFullYear()} Finance with Anne. All rights reserved.</span>
      </footer>

      <SocialProofToast />
    </div>
  );
}
