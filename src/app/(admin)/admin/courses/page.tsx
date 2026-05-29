import { createClient } from "@/lib/supabase/server";
import CourseList from "@/components/admin/CourseList";

export default async function AdminCoursesPage() {
  const supabase = await createClient();
  const { data: courses } = await supabase.from("courses").select("*, lessons(count)").order("created_at", { ascending: false });
  return <CourseList courses={courses ?? []} />;
}
