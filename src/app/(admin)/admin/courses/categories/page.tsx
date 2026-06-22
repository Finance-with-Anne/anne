import { supabaseAdmin } from "@/lib/supabase/admin";
import CourseCategoriesPage from "@/components/admin/CourseCategoriesPage";

export default async function CourseCategoriesRoute() {
  const { data: raw } = await supabaseAdmin
    .from("course_categories")
    .select("*, courses(count)")
    .order("name");

  const categories = (raw ?? []).map((c: any) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    color: c.color,
    created_at: c.created_at,
    course_count: c.courses?.[0]?.count ?? 0,
  }));

  return <CourseCategoriesPage categories={categories} />;
}
