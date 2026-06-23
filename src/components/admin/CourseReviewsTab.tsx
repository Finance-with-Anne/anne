"use client";

import { useEffect, useState } from "react";
import { useAdminTheme } from "@/lib/admin-theme";

type Review = {
  id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  profile: { full_name: string | null; avatar_url: string | null } | null;
};

function Stars({ rating, size = "sm" }: { rating: number; size?: "sm" | "lg" }) {
  const s = size === "lg" ? "h-5 w-5" : "h-3.5 w-3.5";
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} className={`${s} ${i <= rating ? "text-yellow-400" : "text-gray-300"}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function Avatar({ name, url, dark }: { name: string; url: string | null; dark: boolean }) {
  if (url) return <img src={url} alt={name} className="h-8 w-8 rounded-full object-cover shrink-0" />;
  const initials = name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() || "?";
  return (
    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${dark ? "bg-white/10 text-white/60" : "bg-gray-200 text-gray-600"}`}>
      {initials}
    </div>
  );
}

export default function CourseReviewsTab({ courseId }: { courseId: string }) {
  const { dark } = useAdminTheme();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const card = dark ? "bg-[#111318] border-white/5" : "bg-white border-gray-200";
  const tText = dark ? "text-white/80" : "text-gray-800";
  const tSub = dark ? "text-white/35" : "text-gray-400";
  const divider = dark ? "border-white/5" : "border-gray-100";

  useEffect(() => {
    setLoading(true);
    fetch(`/api/courses/${courseId}/reviews`)
      .then(r => r.json())
      .then(d => { setReviews(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [courseId]);

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const dist = [5, 4, 3, 2, 1].map(n => ({
    n,
    count: reviews.filter(r => r.rating === n).length,
    pct: reviews.length ? Math.round((reviews.filter(r => r.rating === n).length / reviews.length) * 100) : 0,
  }));

  if (loading) return <div className={`rounded-2xl border py-16 text-center text-sm ${card} ${tSub}`}>Loading…</div>;

  if (reviews.length === 0) {
    return (
      <div className={`rounded-2xl border py-16 text-center text-sm ${card} ${tSub}`}>
        No reviews yet. Students can leave reviews from the course player.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className={`rounded-2xl border p-5 flex items-center gap-6 ${card}`}>
        <div className="text-center">
          <p className={`text-5xl font-bold ${tText}`}>{avgRating}</p>
          <Stars rating={Math.round(Number(avgRating))} size="lg" />
          <p className={`text-xs mt-1 ${tSub}`}>{reviews.length} review{reviews.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex-1 space-y-1.5">
          {dist.map(d => (
            <div key={d.n} className="flex items-center gap-2">
              <span className={`text-xs w-4 text-right ${tSub}`}>{d.n}</span>
              <svg className="h-3 w-3 text-yellow-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <div className={`flex-1 h-1.5 rounded-full overflow-hidden ${dark ? "bg-white/8" : "bg-gray-100"}`}>
                <div className="h-full rounded-full bg-yellow-400" style={{ width: `${d.pct}%` }} />
              </div>
              <span className={`text-xs w-6 ${tSub}`}>{d.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Individual reviews */}
      <div className={`rounded-2xl border overflow-hidden ${card}`}>
        {reviews.map(r => {
          const name = r.profile?.full_name ?? "Anonymous";
          return (
            <div key={r.id} className={`flex items-start gap-3 px-4 py-4 border-b last:border-b-0 ${divider}`}>
              <Avatar name={name} url={r.profile?.avatar_url ?? null} dark={dark} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className={`text-sm font-semibold ${tText}`}>{name}</p>
                  <span className={`text-xs ${tSub}`}>{new Date(r.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                </div>
                <Stars rating={r.rating} />
                {r.comment && <p className={`mt-1.5 text-sm leading-relaxed ${tSub}`}>{r.comment}</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
