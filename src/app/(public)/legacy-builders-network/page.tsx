import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Legacy Builders Network — Finance with Anne",
  description:
    "A high-level investment community. Stock signals, market analysis, expert sessions, and vetted strategies — all in one premium circle.",
};

const painPoints = [
  "You've been saving, but your money isn't really growing.",
  "You want to invest, but you're overwhelmed by too many options.",
  "You're scared of losing money to scammers or bad advice.",
  "You wish you had someone to guide you and a community that 'gets it.'",
];

const features = [
  {
    num: 1,
    title: "Stock Signals",
    desc: "Stay ahead of the market with monthly and timely stock recommendations. Know what to buy, when to buy and when to take profit.",
    wide: true,
  },
  {
    num: 2,
    title: "Smart Money Moves",
    desc: "Break down where to put your money right now (and where to pull out fast).",
    wide: false,
  },
  {
    num: 3,
    title: "Expert Sessions",
    desc: "Host monthly webinars with me + guest experts.",
    wide: false,
  },
  {
    num: 4,
    title: "Exclusive Analysis",
    desc: "Share exclusive analysis you won't find on YouTube or Google.",
    wide: false,
  },
  {
    num: 5,
    title: "Foundation Building",
    desc: "Give beginners a solid foundation with our step-by-step investor's course.",
    wide: false,
  },
];

const membershipPerks = [
  "Monthly Webinars with Anne.",
  "Market analysis & breakdowns (stocks, bonds, T-bills, real estate).",
  "Guest Experts from across industries.",
  "Beginners Investment Course (start strong)",
  "Private community access",
  "Vetted investment opportunities & strategies",
  "Direct Q&A support",
];

const testimonials = [
  {
    quote: "Very excellent and professional. Attended to all my questions and provided practical steps to improve my finance.",
    name: "A. Adekunle",
  },
  {
    quote: "Engaging with Anne has been an eye opener. Her advice is relatable and practical.",
    name: "C. Mbakigwe",
  },
  {
    quote: "Coach Anne is a practical financial advisor with vast investment acumen. Her wisdom is a gift.",
    name: "O. Okulaja",
  },
  {
    quote: "Thank you very much for today's class. I feel so strong that my journey to financial freedom just began. I feel so excited right now. Thank you very much, God bless you.",
    name: "C. Miracle",
  },
  {
    quote: "Engaging with Anne has been an eye opener. Her guidance and advice are born out of experience of someone who can relate to the everyday challenges of an average person trying to navigate the personal finance journey.",
    name: "O. Toyin",
  },
];

function ArrowRight({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
    </svg>
  );
}

function InfoFlipped({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />
    </svg>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function VideoIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5" /><rect x="2" y="6" width="14" height="12" rx="2" />
    </svg>
  );
}

function TrendingUpIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" />
    </svg>
  );
}

function BookOpenIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M12 7v14" /><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" />
    </svg>
  );
}

function CircleCheckIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
    </svg>
  );
}

const benefitItems = [
  { Icon: VideoIcon, title: "Monthly Webinars with Anne", desc: "Live sessions where you can ask questions and learn directly from me.", wide: false },
  { Icon: TrendingUpIcon, title: "Market Analysis Breakdown", desc: "Stocks, bonds, T-bills, real estate all analyzed and explained.", wide: false },
  { Icon: UsersIcon, title: "Guest Experts", desc: "Learn from industry professionals across various investment sectors.", wide: false },
  { Icon: BookOpenIcon, title: "Beginners Investment Course", desc: "Start with a solid foundation — perfect for those just getting started.", wide: false },
  { Icon: CircleCheckIcon, title: "Vetted Strategies", desc: "Access insider-level opportunities and proven strategies.", wide: true },
];

export default function LegacyBuildersNetworkPage() {
  return (
    <main className="grow">

      {/* ── HERO ── */}
      <section className="relative h-screen min-h-[500px] text-white overflow-hidden">
        <div className="absolute inset-0">
          {/* Add investment.webp to /public to show the hero image */}
          <Image
            src="/investment.webp"
            alt="Legacy Builders Network Hero"
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-[#070F1E]/80" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 text-black">
              The Support You Need.<br />
              The Investments Guidance{" "}
              <span className="text-yellow-400">You Deserve</span>
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl mb-8 opacity-90 max-w-4xl mx-auto">
              Stocks, Bonds, Treasury Bills, Real Estate, Mutual Funds, Insurance.<br />
              The opportunity you've been waiting for all in one premium community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/payment">
                <button className="hidden sm:inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-gray-900 px-8 py-4 rounded-lg font-bold text-lg transition-colors group">
                  Join the Premium Community Today
                  <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1.5" />
                </button>
                <button className="inline-flex sm:hidden items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-gray-900 px-8 py-4 rounded-lg font-bold text-lg transition-colors group">
                  Join Now
                  <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1.5" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── PAIN POINTS ── */}
      <section className="py-8 sm:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center text-black mb-8 sm:mb-12">
            Does this sound familiar?
          </h2>
          <div className="w-full mb-8 sm:mb-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {painPoints.map((point, i) => (
                <div key={i} className="rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow duration-300">
                  <div className="p-4 sm:p-6">
                    <div className="flex items-start gap-4">
                      <InfoFlipped className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1 rotate-180" />
                      <p className="text-base sm:text-lg text-gray-700 leading-relaxed">{point}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="w-full text-center">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-black mb-3">
              Truth is: the wealthy don't work harder.
            </h3>
            <p className="text-base sm:text-lg md:text-xl text-black/70 max-w-2xl mx-auto leading-relaxed">
              They make smarter moves with their money. And that's exactly what you'll learn here.
            </p>
          </div>
        </div>
      </section>

      {/* ── WELCOME TO LBN ── */}
      <section className="py-8 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="w-full flex flex-col items-center mb-8 sm:mb-12">
            <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-yellow-400/20 flex items-center justify-center">
              <UsersIcon className="text-yellow-400 h-8 w-8" />
            </div>
            <h3 className="text-xl sm:text-3xl md:text-4xl font-bold mt-4 text-center">Welcome to</h3>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-yellow-400 mt-2 text-center">
              LEGACY BUILDERS NETWORK
            </h2>
          </div>
          <p className="text-base sm:text-xl font-semibold text-center mb-8 sm:mb-12 max-w-3xl mx-auto px-4">
            This isn't just another group chat. It's a high-level circle where we:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {features.map((f) => (
              <div
                key={f.num}
                className={`rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow duration-300${f.wide ? " sm:col-span-2" : ""}`}
              >
                <div className="p-6 pb-2 sm:pb-4">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 bg-yellow-400 text-black flex items-center justify-center rounded mb-3 font-semibold text-sm sm:text-base">
                    {f.num}
                  </div>
                  <div className="font-bold text-lg sm:text-xl md:text-2xl">{f.title}</div>
                </div>
                <div className="p-6 pt-0 font-semibold text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed">
                  {f.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHAT YOU WILL GET ── */}
      <section className="py-8 sm:py-16 md:py-24 bg-[#070F1E]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white text-center mb-8 sm:mb-12">
            What You Will Get
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {benefitItems.map((b) => (
              <div
                key={b.title}
                className={`rounded-lg border border-yellow-400 bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow duration-300${b.wide ? " sm:col-span-2" : ""}`}
              >
                <div className="p-6 pb-2 sm:pb-4">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 bg-yellow-400 text-black flex items-center justify-center rounded mb-3">
                    <b.Icon className="w-5 h-5" />
                  </div>
                  <div className="font-bold text-lg sm:text-xl md:text-2xl">{b.title}</div>
                </div>
                <div className="p-6 pt-0 font-semibold text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed">
                  {b.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── JOIN THE COMMUNITY ── */}
      <section className="py-8 sm:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-center mb-8 sm:mb-12">
            Join the Community
          </h2>
          <div className="max-w-xl mx-auto">
            <div className="rounded-lg bg-card border-2 border-yellow-400 shadow-lg hover:shadow-xl transition-shadow duration-300 p-4">
              <div className="p-6 pb-4">
                <div className="text-black mb-3 font-semibold text-xl sm:text-3xl">Annual Membership</div>
                <div className="font-bold text-4xl sm:text-6xl">₦150,000</div>
              </div>
              <div className="p-6 pt-0 font-semibold pb-6 sm:pb-8">
                <ul className="space-y-3 sm:space-y-4">
                  {membershipPerks.map((perk, i) => (
                    <li key={i} className="flex items-start">
                      <span className="flex-shrink-0 w-2 h-2 bg-gray-700 rounded-full mt-2 mr-4" />
                      <p className="text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed flex-1">{perk}</p>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-6 pt-4 sm:pt-6">
                <Link href="/payment" className="w-full">
                  <button className="inline-flex items-center justify-center gap-2 w-full bg-yellow-400 hover:bg-yellow-300 text-gray-900 px-6 py-5 sm:py-6 rounded-lg font-bold text-base sm:text-xl transition-colors duration-300 shadow-md hover:shadow-lg group">
                    <span>Join now</span>
                    <span className="hidden sm:inline"> — ₦150,000</span>
                    <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1.5" />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-8 sm:py-12 md:py-16 px-4 sm:px-6 md:px-8 bg-white">
        <div className="w-full text-center mb-8 sm:mb-12">
          <h2 className="text-xl sm:text-3xl md:text-4xl font-bold text-center mb-3 text-black">
            Don't just take my word for it
          </h2>
          <p className="text-sm sm:text-base text-gray-700">
            Here's what my clients have to say about working with me
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-6xl mx-auto">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className={`border p-4 sm:p-6 rounded shadow-sm${i === 3 ? " sm:col-span-2 lg:col-span-1" : ""}`}
            >
              <div className="flex mb-4">
                {Array.from({ length: 5 }).map((_, s) => (
                  <StarIcon key={s} className="h-4 w-4 sm:h-5 sm:w-5 fill-current text-yellow-300" />
                ))}
              </div>
              <p className="italic text-sm sm:text-base md:text-lg leading-relaxed">"{t.quote}"</p>
              <p className="mt-4 font-bold text-left text-sm sm:text-base">{t.name}</p>
            </div>
          ))}
        </div>
      </section>

    </main>
  );
}
