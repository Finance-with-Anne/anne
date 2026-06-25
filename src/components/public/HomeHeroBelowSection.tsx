import Link from "next/link";

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
    text: "Live monthly sessions where we talk budgeting, investing and wealth mindset openly",
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
    desc: null,
  },
  {
    n: "02",
    title: "Money Talks",
    bg: "#d8f04a",
    Icon: IconMoneyTalks,
    desc: "A live community where we talk money, mindset and long-term wealth strategies together.",
    featured: true,
  },
  {
    n: "03",
    title: "Courses & Resources",
    bg: "#f5c842",
    Icon: IconCourses,
    desc: null,
  },
  {
    n: "04",
    title: "Financial Planning",
    bg: "#ffffff",
    Icon: IconPlanning,
    desc: null,
  },
];

/* ── Component ──────────────────────────────────────────── */
export default function HomeHeroBelowSection() {
  return (
    <section style={{ backgroundColor: "#111111", color: "#ffffff" }} className="px-6 sm:px-10 lg:px-16 py-16 lg:py-20">
      <div className="mx-auto max-w-7xl">

        {/* Heading + CTA */}
        <div className="flex items-center justify-between gap-8 mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold leading-snug text-white max-w-lg">
            Financial freedom is a skill and we'll teach you
          </h2>
          <Link
            href="/legacy-builders-network"
            className="shrink-0 rounded-full px-6 py-3 text-sm font-semibold transition-colors"
            style={{ backgroundColor: "#ffffff", color: "#111111" }}
          >
            Join Paid Community
          </Link>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-14 border-t border-white/10 pt-10">
          {stats.map((s) => (
            <div key={s.metric} className="flex flex-col gap-3">
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
            <div
              key={card.n}
              className="rounded-2xl p-6 flex flex-col justify-between min-h-[300px] lg:min-h-[340px]"
              style={{ backgroundColor: card.bg, color: "#111111" }}
            >
              {/* Icon */}
              <div>
                <card.Icon />
              </div>

              {/* Bottom content */}
              <div>
                {card.featured && card.desc && (
                  <>
                    <p className="text-xs font-semibold mb-1" style={{ color: "#111" }}>{card.n}.</p>
                    <h3 className="text-xl font-bold mb-3" style={{ color: "#111" }}>{card.title}</h3>
                    <p className="text-sm leading-relaxed mb-4" style={{ color: "rgba(0,0,0,0.65)" }}>{card.desc}</p>
                    <div className="w-9 h-9 rounded-full border-2 border-black/30 flex items-center justify-center">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M2 7h10M8 3l4 4-4 4" stroke="#111" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </>
                )}
                {!card.featured && (
                  <>
                    <p className="text-xs font-semibold mb-1" style={{ color: "rgba(0,0,0,0.5)" }}>{card.n}.</p>
                    <h3 className="text-xl font-bold" style={{ color: "#111" }}>{card.title}</h3>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
