import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function BlogArchivesPage() {
  const supabase = await createClient();
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("id, title, slug, published, published_at, created_at")
    .order("created_at", { ascending: false });

  // Group by month/year
  const grouped: Record<string, typeof posts> = {};
  (posts ?? []).forEach((p) => {
    const date = new Date(p.published_at ?? p.created_at);
    const key = date.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
    if (!grouped[key]) grouped[key] = [];
    grouped[key]!.push(p);
  });

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Archives</h1>
        <p className="text-sm mt-0.5 text-white/40">All posts organised by date.</p>
      </div>

      {Object.keys(grouped).length === 0 ? (
        <div className="rounded-xl border border-white/5 bg-[#111318] py-16 text-center text-sm text-white/30">
          No posts yet.
        </div>
      ) : (
        Object.entries(grouped).map(([month, posts]) => (
          <div key={month}>
            <p className="text-xs font-semibold uppercase tracking-widest text-white/30 mb-3">{month}</p>
            <div className="rounded-xl border border-white/5 bg-[#111318] overflow-hidden">
              {posts?.map((p, i) => (
                <Link
                  key={p.id}
                  href={`/admin/blog/${p.id}`}
                  className={`flex items-center justify-between px-5 py-3.5 hover:bg-white/3 transition-colors ${i > 0 ? "border-t border-white/5" : ""}`}
                >
                  <div>
                    <p className="text-sm font-medium text-white/80">{p.title}</p>
                    <p className="text-xs text-white/30 mt-0.5">
                      {new Date(p.published_at ?? p.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${p.published ? "bg-green-400/15 text-green-400" : "bg-white/5 text-white/30"}`}>
                    {p.published ? "Published" : "Draft"}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
