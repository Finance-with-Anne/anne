import { supabaseAdmin } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import CourseWizard from "@/components/admin/CourseWizard";

export default async function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [{ data: course }, { data: categories }, { data: tags }, { data: tagAssignments }] = await Promise.all([
    supabaseAdmin
      .from("courses")
      .select("*, lessons(*), sections:course_sections(*, lessons(*))")
      .eq("id", id)
      .single(),
    supabaseAdmin.from("course_categories").select("*").order("name"),
    supabaseAdmin.from("course_tags").select("*").order("name"),
    supabaseAdmin.from("course_tag_assignments").select("tag_id").eq("course_id", id),
  ]);

  if (!course) notFound();

  const tag_ids = (tagAssignments ?? []).map((t: any) => t.tag_id);

  return (
    <CourseWizard
      categories={categories ?? []}
      tags={tags ?? []}
      initialData={{ ...course, lessons: course.lessons ?? [], tag_ids }}
    />
  );
}
