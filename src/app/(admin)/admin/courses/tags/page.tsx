import { supabaseAdmin } from "@/lib/supabase/admin";
import CourseTagsPage from "@/components/admin/CourseTagsPage";

export default async function CourseTagsRoute() {
  const { data: tags } = await supabaseAdmin
    .from("course_tags")
    .select("*")
    .order("name");
  return <CourseTagsPage tags={tags ?? []} />;
}
