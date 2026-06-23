import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CoursePlayer from "@/components/account/CoursePlayer";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ courseId: string }>;
  searchParams: Promise<{ lesson?: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { courseId } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("courses").select("title").eq("id", courseId).single();
  return { title: data?.title ? `${data.title} — Finance with Anne` : "Course Player" };
}

export default async function LearnPage({ params, searchParams }: Props) {
  const { courseId } = await params;
  const { lesson: activeLessonId } = await searchParams;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  // Must be enrolled
  const { data: enrollment } = await supabase
    .from("course_enrollments")
    .select("enrolled_at")
    .eq("user_id", user.id)
    .eq("course_id", courseId)
    .single();

  if (!enrollment) redirect(`/courses/${courseId}`);

  // Fetch course + curriculum
  const { data: course } = await supabase
    .from("courses")
    .select("id, title, description, thumbnail_url, level, curriculum, category:course_categories(name, color)")
    .eq("id", courseId)
    .single();

  if (!course) notFound();

  // Fetch lesson progress
  const { data: progress } = await supabase
    .from("lesson_progress")
    .select("lesson_id")
    .eq("user_id", user.id)
    .eq("course_id", courseId);

  const completedLessonIds = new Set((progress ?? []).map((p) => p.lesson_id));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const curriculum: any[] = course.curriculum ?? [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allLessons: any[] = curriculum.flatMap((s: any) => s.lessons ?? []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const initialLesson = activeLessonId
    ? (allLessons.find((l: any) => l.id === activeLessonId) ?? allLessons[0])
    : allLessons[0];

  return (
    <CoursePlayer
      courseId={course.id}
      courseTitle={course.title}
      thumbnailUrl={course.thumbnail_url}
      curriculum={curriculum}
      initialLessonId={initialLesson?.id ?? null}
      completedLessonIds={Array.from(completedLessonIds)}
      backHref="/account/courses"
    />
  );
}
