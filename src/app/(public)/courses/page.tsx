import { headers } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase/admin";
import CoursesShopClient from "@/components/public/CoursesShopClient";
import type { Course, CourseCategory } from "@/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "Courses — Finance with Anne" };

type Currency = "NGN" | "USD" | "GBP";

function detectCurrency(country: string | null): Currency {
  if (!country) return "NGN";
  if (country === "GB") return "GBP";
  if (country === "US" || country === "CA" || country === "AU") return "USD";
  return "NGN";
}

export default async function CoursesPage() {
  const headersList = await headers();
  const country = headersList.get("x-vercel-ip-country");
  const currency = detectCurrency(country);

  const [{ data: courses }, { data: categories }] = await Promise.all([
    supabaseAdmin
      .from("courses")
      .select("*, lessons(count), category:course_categories(id, name, color)")
      .eq("published", true)
      .order("created_at", { ascending: false }),
    supabaseAdmin
      .from("course_categories")
      .select("*")
      .order("name"),
  ]);

  const usedCategoryIds = new Set(
    (courses ?? []).map((c: any) => c.category_id).filter(Boolean)
  );
  const filteredCategories = (categories ?? []).filter(
    (c: CourseCategory) => usedCategoryIds.has(c.id)
  );

  const coursesWithCount = (courses ?? []).map((c: any) => ({
    ...c,
    lesson_count: c.lessons?.[0]?.count ?? 0,
    lessons: [],
  }));

  return (
    <CoursesShopClient
      courses={coursesWithCount as Course[]}
      categories={filteredCategories as CourseCategory[]}
      currency={currency}
    />
  );
}
