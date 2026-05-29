import { createClient } from "@/lib/supabase/server";
import type { Testimonial } from "@/types";

export const metadata = { title: "Testimonials — ANNE" };

export default async function TestimonialsPage() {
  const supabase = await createClient();
  const { data: testimonials } = await supabase
    .from("testimonials")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold tracking-tight text-gray-900">Testimonials</h1>
      <p className="mt-4 text-lg text-gray-600">Hear from people who have transformed their finances with ANNE.</p>

      {!testimonials || testimonials.length === 0 ? (
        <div className="mt-16 text-center text-gray-400">No testimonials yet.</div>
      ) : (
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {(testimonials as Testimonial[]).map((t) => (
            <div key={t.id} className="rounded-xl border border-gray-200 p-6">
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <span key={i} className="text-yellow-400 text-sm">★</span>
                ))}
              </div>
              <p className="text-sm text-gray-600 leading-relaxed italic">&ldquo;{t.content}&rdquo;</p>
              <div className="mt-4 flex items-center gap-3">
                {t.image_url && <img src={t.image_url} alt={t.name} className="h-8 w-8 rounded-full object-cover" />}
                <div>
                  <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                  {t.role && <p className="text-xs text-gray-400">{t.role}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
