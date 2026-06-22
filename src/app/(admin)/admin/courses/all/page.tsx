import { supabaseAdmin } from "@/lib/supabase/admin";
import CourseList from "@/components/admin/CourseList";

export default async function AllCoursesPage() {
  const { data: courses } = await supabaseAdmin
    .from("courses")
    .select("*, lessons(count), category:course_categories(id, name, color)")
    .order("created_at", { ascending: false });
  return <CourseList courses={courses ?? []} />;
}
