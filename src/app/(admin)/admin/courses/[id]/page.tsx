import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import CourseForm from "@/components/admin/CourseForm";

export default async function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: course } = await supabase.from("courses").select("*, lessons(*)").eq("id", id).single();
  if (!course) notFound();
  return <CourseForm initialData={{ ...course, lessons: course.lessons ?? [] }} />;
}
