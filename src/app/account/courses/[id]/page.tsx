import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CoursePlayer from "@/components/account/CoursePlayer";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ lesson?: string }>;
}

export default async function CoursePlayerPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { lesson: activeLessonId } = await searchParams;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Check enrollment
  const { data: enrollment } = await supabase
    .from("course_enrollments")
    .select("enrolled_at, completed_at")
    .eq("user_id", user.id)
    .eq("course_id", id)
    .single();

  if (!enrollment) redirect("/account/courses");

  // Fetch course
  const { data: course } = await supabase
    .from("courses")
    .select("id, title, description, thumbnail_url, level, curriculum, category:course_categories(name, color)")
    .eq("id", id)
    .single();

  if (!course) notFound();

  // Fetch lesson progress
  const { data: progress } = await supabase
    .from("lesson_progress")
    .select("lesson_id")
    .eq("user_id", user.id)
    .eq("course_id", id);

  const completedLessonIds = new Set((progress ?? []).map((p) => p.lesson_id));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const curriculum: any[] = course.curriculum ?? [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allLessons: any[] = curriculum.flatMap((s: { lessons?: unknown[] }) => s.lessons ?? []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const initialLesson = activeLessonId
    ? allLessons.find((l: any) => l.id === activeLessonId) ?? allLessons[0]
    : allLessons[0];

  return (
    <CoursePlayer
      courseId={course.id}
      courseTitle={course.title}
      curriculum={curriculum}
      initialLessonId={initialLesson?.id ?? null}
      completedLessonIds={Array.from(completedLessonIds)}
    />
  );
}
