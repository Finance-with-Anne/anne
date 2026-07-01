import { headers } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import CourseDetailClient from "@/components/public/CourseDetailClient";

export const dynamic = "force-dynamic";

type Currency = "NGN" | "USD" | "GBP";

function detectCurrency(country: string | null): Currency {
  if (!country) return "NGN";
  if (country === "GB") return "GBP";
  if (country === "US" || country === "CA" || country === "AU") return "USD";
  return "NGN";
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data } = await supabaseAdmin
    .from("courses")
    .select("title, description")
    .eq("id", id)
    .single();
  if (!data) return { title: "Course | Finance with Anne" };
  return {
    title: `${data.title} | Finance with Anne`,
    description: data.description ?? undefined,
  };
}

export default async function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const headersList = await headers();
  const country = headersList.get("x-vercel-ip-country");
  const currency = detectCurrency(country);

  // Check if user is logged in and already enrolled
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: course }, { data: relatedRaw }, { data: enrollment }] = await Promise.all([
    supabaseAdmin
      .from("courses")
      .select(`
        *,
        curriculum,
        category:course_categories(id, name, color),
        tags:course_tag_assignments(tag:course_tags(id, name, slug))
      `)
      .eq("id", id)
      .eq("published", true)
      .single(),
    supabaseAdmin
      .from("courses")
      .select("id, title, thumbnail_url, price, price_ngn, price_usd, price_gbp, level, category:course_categories(id, name, color)")
      .eq("published", true)
      .neq("id", id)
      .order("created_at", { ascending: false })
      .limit(3),
    user
      ? supabase
          .from("course_enrollments")
          .select("enrolled_at")
          .eq("user_id", user.id)
          .eq("course_id", id)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ]);

  if (!course) notFound();

  // Read curriculum from JSONB field; fall back to empty
  const rawCurriculum: any[] = Array.isArray((course as any).curriculum)
    ? (course as any).curriculum
    : [];

  const sections = rawCurriculum
    .sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map((s: any) => ({
      id: s.id,
      title: s.title,
      sort_order: s.sort_order ?? 0,
      lessons: (s.lessons ?? [])
        .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0))
        .map((l: any) => ({
          id: l.id,
          title: l.title,
          type: l.type ?? "video",
          duration: l.duration ?? 0,
          order: l.order ?? 0,
        })),
    }));

  const tags = (course.tags ?? []).map((t: any) => t.tag).filter(Boolean);
  const totalLessons = sections.reduce((sum: number, s: any) => sum + s.lessons.length, 0);
  const totalMinutes = sections.reduce(
    (sum: number, s: any) => sum + s.lessons.reduce((ls: number, l: any) => ls + (l.duration ?? 0), 0),
    0
  );

  return (
    <CourseDetailClient
      course={{ ...course, sections, tags }}
      related={relatedRaw ?? []}
      currency={currency}
      totalLessons={totalLessons}
      totalMinutes={totalMinutes}
      isLoggedIn={!!user}
      isEnrolled={!!enrollment}
    />
  );
}
