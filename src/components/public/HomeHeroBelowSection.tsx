import Link from "next/link";
import Image from "next/image";

/* ── Abstract geometric icons ───────────────────────────── */
function IconCoaching() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden>
      <path d="M22 6C13.163 6 6 13.163 6 22C6 22 6 22 6 22C6 22 13.163 22 22 22C22 13.163 22 6 22 6Z" fill="#111" />
      <path d="M22 38C30.837 38 38 30.837 38 22C38 22 38 22 38 22C38 22 30.837 22 22 22C22 30.837 22 38 22 38Z" fill="#111" />
      <circle cx="22" cy="22" r="6" fill="#111" />
      <circle cx="22" cy="8"  r="3" fill="#111" />
      <circle cx="22" cy="36" r="3" fill="#111" />
    </svg>
  );
}

function IconMoneyTalks() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden>
      <circle cx="22" cy="13" r="7" fill="#111" />
      <path d="M6 38C6 29.163 13.163 22 22 22C30.837 22 38 29.163 38 38H6Z" fill="#111" />
    </svg>
  );
}

function IconCourses() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden>
      <circle cx="14" cy="22" r="10" fill="#111" />
      <circle cx="30" cy="22" r="10" fill="#111" />
    </svg>
  );
}

function IconPlanning() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden>
      <circle cx="22" cy="22" r="16" fill="#111" />
      <path d="M22 22L38 22A16 16 0 0 0 22 6Z" fill="white" />
    </svg>
  );
}

/* ── Data ───────────────────────────────────────────────── */
const stats = [
  {
    text: "Weekly money tips and financial insights published on our blog and social channels",
    metric: "12k",
    unit: "readers",
    link: "Read the blog",
    href: "/blog",
  },
  {
    text: "Live monthly sessions where we talk budgeting, investing and wealth mindset",
    metric: "500+",
    unit: "members",
    link: "Join the talks",
    href: "/community",
  },
  {
    text: "Real stories from clients who transformed their financial lives through Anne's coaching",
    metric: "1.2k",
    unit: "views",
    link: "See the stories",
    href: "/testimonials",
  },
  {
    text: "Our Instagram where we share daily wins, tips and financial motivation every day",
    metric: "7.2k",
    unit: "followers",
    link: "Follow us",
    href: "https://instagram.com",
  },
];

const cards = [
  {
    n: "01",
    title: "1:1 Coaching",
    bg: "#f4b8d4",
    Icon: IconCoaching,
    desc: "Personalised sessions to build your financial confidence and create a clear money plan.",
    href: "/booking",
  },
  {
    n: "02",
    title: "Money Talks",
    bg: "#d8f04a",
    Icon: IconMoneyTalks,
    desc: "A live community where we talk money, mindset and long-term wealth strategies together.",
    href: "/blog",
  },
  {
    n: "03",
    title: "Courses & Resources",
    bg: "#f5c842",
    Icon: IconCourses,
    desc: "Self-paced courses and downloadable templates to help you manage money and build wealth.",
    href: "/products-services",
  },
  {
    n: "04",
    title: "Financial Planning",
    bg: "#ffffff",
    Icon: IconPlanning,
    desc: "Structured plans that map your income, expenses and goals into a clear financial roadmap.",
    href: "/legacy-builders-network",
  },
];

/* ── Component ──────────────────────────────────────────── */
export default function HomeHeroBelowSection() {
  return (
    <section className="bg-white px-4 py-6 lg:py-8">
      <div className="w-full rounded-3xl px-6 sm:px-10 lg:px-16 py-16 lg:py-20" style={{ backgroundColor: "#070F1E", color: "#ffffff" }}>

        {/* Heading + CTA */}
        <div className="flex items-center justify-between gap-8 mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold leading-snug text-white max-w-lg">
            Financial freedom is a skill and we'll teach you
          </h2>
          <Link href="/legacy-builders-network" className="btn-animated shrink-0 focus:outline-none">
            <span>Join Paid Community</span>
          </Link>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-14">
          {stats.map((s) => (
            <div key={s.metric} className="flex flex-col gap-3 pt-6 border-t border-white/20">
              <p className="text-sm text-white/50 leading-relaxed">{s.text}</p>
              <p className="text-base font-semibold text-white">
                {s.metric} <span className="font-normal text-white/60">{s.unit}</span>
              </p>
              <Link
                href={s.href}
                className="text-sm text-white underline underline-offset-4 decoration-white/30 hover:decoration-white transition-all w-fit"
              >
                {s.link}
              </Link>
            </div>
          ))}
        </div>

        {/* Service cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((card) => (
            <Link
              key={card.n}
              href={card.href}
              className="group rounded-2xl p-6 flex flex-col justify-between min-h-[300px] lg:min-h-[340px]"
              style={{ backgroundColor: card.bg, color: "#111111" }}
            >
              {/* Icon — lifts on hover */}
              <div className="w-fit transition-transform duration-300 ease-out group-hover:-translate-y-2 group-hover:scale-110">
                <card.Icon />
              </div>

              {/* Bottom content */}
              <div>
                <p className="text-xs font-semibold mb-1" style={{ color: "rgba(0,0,0,0.5)" }}>{card.n}.</p>
                <h3 className="text-xl font-bold" style={{ color: "#111" }}>{card.title}</h3>

                {/* Expandable content: always open for featured, opens on hover for others */}
                <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-all duration-500 ease-in-out">
                  <div className="overflow-hidden">
                    <p
                      className="text-sm leading-relaxed mt-3 mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ color: "rgba(0,0,0,0.65)" }}
                    >
                      {card.desc}
                    </p>
                    <div
                      className="w-9 h-9 rounded-full border-2 border-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M2 7h10M8 3l4 4-4 4" stroke="#111" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* My Process */}
        <div className="mt-6 relative rounded-2xl overflow-hidden">
          {/* Background image */}
          <Image src="/anne-hero.png" alt="Anne — Financial Coach" fill className="object-cover object-center" />
          {/* Dark overlay */}
          <div className="absolute inset-0" style={{ backgroundColor: "rgba(7,15,30,0.78)" }} />

          {/* Content */}
          <div className="relative z-10 p-8 lg:p-12 pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
              <div>
                <span className="inline-block text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-4" style={{ backgroundColor: "#d8f04a", color: "#111" }}>
                  My Process
                </span>
                <h3 className="text-2xl lg:text-4xl font-bold leading-snug text-white max-w-lg">
                  How FWA Helps You Take Control of Your Money
                </h3>
              </div>
              <Link
                href="/booking"
                className="inline-flex items-center gap-3 text-sm font-semibold px-5 py-3 rounded-full shrink-0"
                style={{ backgroundColor: "#fff", color: "#111" }}
              >
                Book a session
              </Link>
            </div>

            {/* Cards — different heights for organic feel */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 items-start">
              {[
                { n: "01", title: "Understand Your Financial Situation", desc: "Review your income, expenses, debt, and financial goals to gain a clear picture of where you stand.", minH: "min-h-[200px]" },
                { n: "02", title: "Create a Smart Money Plan", desc: "Develop a practical system for budgeting, saving, and managing your money effectively.", minH: "min-h-[260px]" },
                { n: "03", title: "Build Strong Financial Habits", desc: "Learn the daily and monthly money habits that help you stay consistent and avoid financial stress.", minH: "min-h-[230px]" },
                { n: "04", title: "Grow and Invest Your Wealth", desc: "Start building long-term wealth through smart saving strategies and beginner-friendly investment guidance.", minH: "min-h-[180px]" },
              ].map((step) => (
                <div
                  key={step.n}
                  className={`${step.minH} rounded-xl p-5 flex flex-col justify-between`}
                  style={{ backgroundColor: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}
                >
                  <p className="text-xs font-semibold mb-3" style={{ color: "#d8f04a" }}>{step.n}.</p>
                  <div>
                    <h4 className="text-sm font-bold text-white mb-2">{step.title}</h4>
                    <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
