import { supabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import PostMetricsClient from "@/components/admin/PostMetrics";

export default async function PostMetricsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [
    { data: posts },
    { data: viewCounts },
    { data: likeCounts },
    { data: commentCounts },
    { data: durationData },
  ] = await Promise.all([
    supabaseAdmin
      .from("blog_posts")
      .select("id, title, slug, published, published_at, cover_image")
      .order("published_at", { ascending: false }),

    supabaseAdmin
      .from("blog_post_views")
      .select("post_id")
      .then(({ data }) => {
        const map: Record<string, number> = {};
        for (const r of data ?? []) map[r.post_id] = (map[r.post_id] ?? 0) + 1;
        return { data: map };
      }),

    supabaseAdmin
      .from("blog_likes")
      .select("post_id")
      .then(({ data }) => {
        const map: Record<string, number> = {};
        for (const r of data ?? []) map[r.post_id] = (map[r.post_id] ?? 0) + 1;
        return { data: map };
      }),

    supabaseAdmin
      .from("blog_comments")
      .select("post_id, approved")
      .then(({ data }) => {
        const map: Record<string, { total: number; pending: number }> = {};
        for (const r of data ?? []) {
          map[r.post_id] = map[r.post_id] ?? { total: 0, pending: 0 };
          map[r.post_id].total++;
          if (!r.approved) map[r.post_id].pending++;
        }
        return { data: map };
      }),

    supabaseAdmin
      .from("blog_post_views")
      .select("post_id, read_duration_seconds")
      .not("read_duration_seconds", "is", null)
      .then(({ data }) => {
        const map: Record<string, number[]> = {};
        for (const r of data ?? []) {
          (map[r.post_id] = map[r.post_id] ?? []).push(r.read_duration_seconds);
        }
        const avg: Record<string, number> = {};
        for (const [id, durations] of Object.entries(map)) {
          avg[id] = Math.round(durations.reduce((a, b) => a + b, 0) / durations.length);
        }
        return { data: avg };
      }),
  ]);

  const enriched = (posts ?? []).map(p => ({
    ...p,
    views: viewCounts[p.id] ?? 0,
    likes: likeCounts[p.id] ?? 0,
    comments: commentCounts[p.id]?.total ?? 0,
    pending_comments: commentCounts[p.id]?.pending ?? 0,
    avg_read_secs: durationData[p.id] ?? null,
  }));

  return <PostMetricsClient posts={enriched} />;
}
