import { headers } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase/admin";
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
  if (!data) return { title: "Course — Finance with Anne" };
  return {
    title: `${data.title} — Finance with Anne`,
    description: data.description ?? undefined,
  };
}

export default async function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const headersList = await headers();
  const country = headersList.get("x-vercel-ip-country");
  const currency = detectCurrency(country);

  const [{ data: course }, { data: relatedRaw }] = await Promise.all([
    supabaseAdmin
      .from("courses")
      .select(`
        *,
        category:course_categories(id, name, color),
        sections:course_sections(*, lessons(*)),
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
  ]);

  if (!course) notFound();

  const sections = (course.sections ?? [])
    .sort((a: any, b: any) => a.sort_order - b.sort_order)
    .map((s: any) => ({
      ...s,
      lessons: (s.lessons ?? []).sort((a: any, b: any) => a.order - b.order),
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
    />
  );
}
