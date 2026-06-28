import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Testimonial } from "@/types";

export default async function HomeTestimonialsSection() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("testimonials")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false })
    .limit(6);

  const testimonials = (data ?? []) as Testimonial[];
  if (testimonials.length === 0) return null;

  return (
    <section className="bg-white px-4 py-6 lg:py-8">
      <div
        className="w-full rounded-3xl px-4 sm:px-10 lg:px-16 py-10 sm:py-14 lg:py-20"
        style={{ backgroundColor: "#eef1ff" }}
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-8 mb-10 sm:mb-12">
          <div className="max-w-lg">
            <span
              className="inline-block text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-4"
              style={{ backgroundColor: "#0822C0", color: "#fff" }}
            >
              Client Stories
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight" style={{ color: "#111" }}>
              Real people. Real financial breakthroughs.
            </h2>
            <p className="mt-3 text-sm sm:text-base leading-relaxed" style={{ color: "#555" }}>
              Hear from clients who took control of their money and transformed their financial lives.
            </p>
          </div>
          <Link
            href="/testimonials"
            className="self-start sm:self-auto shrink-0 text-sm font-semibold underline underline-offset-4 whitespace-nowrap"
            style={{ color: "#0822C0" }}
          >
            Read all testimonials →
          </Link>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="rounded-2xl p-4 sm:p-6 flex flex-col gap-3 sm:gap-4"
              style={{ backgroundColor: "#fff", border: "1px solid rgba(8,34,192,0.1)" }}
            >
              {/* Stars */}
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} width="15" height="15" viewBox="0 0 24 24" fill={i < t.rating ? "#f59e0b" : "#e5e7eb"}>
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>

              {/* Quote */}
              <p className="text-sm leading-relaxed flex-1" style={{ color: "#444" }}>
                &ldquo;{t.content}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                {t.image_url ? (
                  <img
                    src={t.image_url}
                    alt={t.name}
                    className="w-9 h-9 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                    style={{ backgroundColor: "#0822C0" }}
                  >
                    {t.name[0]}
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold" style={{ color: "#111" }}>{t.name}</p>
                  {t.role && <p className="text-xs" style={{ color: "#888" }}>{t.role}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
