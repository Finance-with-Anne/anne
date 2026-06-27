import Link from "next/link";
import type { Testimonial } from "@/types";

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5 mb-4">
      {[1, 2, 3, 4, 5].map((n) => (
        <svg key={n} width="14" height="14" viewBox="0 0 24 24" fill={n <= rating ? "#0822C0" : "none"} stroke={n <= rating ? "#0822C0" : "#cbd5e1"} strokeWidth="1.5">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

const FALLBACKS: Testimonial[] = [
  { id: "1", name: "Adaeze O.", role: "Business Owner", content: "Anne's coaching completely changed how I think about money. I cleared my debt in 6 months and finally started saving.", rating: 5, image_url: null, published: true, created_at: "" },
  { id: "2", name: "Funmi B.", role: "Nurse", content: "I always thought investing was for rich people. Anne broke it down so simply — I started with ₦5,000 and haven't looked back.", rating: 5, image_url: null, published: true, created_at: "" },
  { id: "3", name: "Chidi M.", role: "Freelance Designer", content: "The budgeting system Anne taught me saved my business. I went from not knowing where my money went to having 3 months of savings.", rating: 5, image_url: null, published: true, created_at: "" },
  { id: "4", name: "Ngozi A.", role: "Teacher", content: "I joined the Legacy Builders Network and it's one of the best decisions I've made. The community alone is worth it.", rating: 5, image_url: null, published: true, created_at: "" },
  { id: "5", name: "Emeka T.", role: "Entrepreneur", content: "Anne gives you a plan, not just motivation. After our 1:1 session I had a real roadmap for building wealth.", rating: 5, image_url: null, published: true, created_at: "" },
  { id: "6", name: "Blessing K.", role: "Civil Servant", content: "I used to live paycheck to paycheck. 4 months with Anne's programme and I have an emergency fund for the first time ever.", rating: 5, image_url: null, published: true, created_at: "" },
];

export default function HomeTestimonialsSection({ testimonials }: { testimonials: Testimonial[] }) {
  const items = testimonials.length >= 3 ? testimonials : FALLBACKS;
  const [featured, ...rest] = items;
  const grid = rest.slice(0, 5);

  return (
    <section className="bg-white px-4 py-6 lg:py-8">
      <div className="w-full rounded-3xl px-6 sm:px-10 lg:px-16 py-16 lg:py-20" style={{ backgroundColor: "#070F1E" }}>

        {/* Header */}
        <div className="flex items-center justify-between gap-8 mb-14">
          <div>
            <span
              className="inline-block text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-4"
              style={{ backgroundColor: "#d8f04a", color: "#111" }}
            >
              Client Stories
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold leading-snug text-white max-w-lg">
              Real people. Real financial breakthroughs.
            </h2>
          </div>
          <Link href="/testimonials" className="btn-animated shrink-0 focus:outline-none">
            <span>Read all stories</span>
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Featured — tall left card */}
          <div
            className="lg:col-span-1 rounded-2xl p-8 flex flex-col justify-between"
            style={{ backgroundColor: "#0822C0", minHeight: 340 }}
          >
            <div>
              <Stars rating={featured.rating} />
              <p className="text-white text-xl font-bold leading-snug mb-6" style={{ letterSpacing: "-0.02em" }}>
                "{featured.content}"
              </p>
            </div>
            <div className="flex items-center gap-3">
              {featured.image_url ? (
                <img src={featured.image_url} alt={featured.name} className="w-10 h-10 rounded-full object-cover border-2 border-white/30" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm shrink-0">
                  {featured.name[0]}
                </div>
              )}
              <div>
                <p className="text-white font-semibold text-sm">{featured.name}</p>
                {featured.role && <p className="text-white/50 text-xs mt-0.5">{featured.role}</p>}
              </div>
            </div>
          </div>

          {/* Right — 2×3 grid of smaller cards */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {grid.map((t) => (
              <div
                key={t.id}
                className="rounded-2xl p-6 flex flex-col justify-between"
                style={{ backgroundColor: "#0f1d38" }}
              >
                <div>
                  <Stars rating={t.rating} />
                  <p className="text-white/80 text-sm leading-relaxed line-clamp-4">
                    "{t.content}"
                  </p>
                </div>
                <div className="flex items-center gap-3 mt-5">
                  {t.image_url ? (
                    <img src={t.image_url} alt={t.name} className="w-8 h-8 rounded-full object-cover border border-white/10" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/70 font-bold text-xs shrink-0">
                      {t.name[0]}
                    </div>
                  )}
                  <div>
                    <p className="text-white text-xs font-semibold">{t.name}</p>
                    {t.role && <p className="text-white/40 text-xs mt-0.5">{t.role}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}
