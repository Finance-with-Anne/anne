import { supabaseAdmin } from "@/lib/supabase/admin";
import CourseEditShell from "@/components/admin/CourseEditShell";

export default async function NewCoursePage() {
  const [{ data: categories }, { data: tags }] = await Promise.all([
    supabaseAdmin.from("course_categories").select("*").order("name"),
    supabaseAdmin.from("course_tags").select("*").order("name"),
  ]);
  return <CourseEditShell categories={categories ?? []} tags={tags ?? []} />;
}
