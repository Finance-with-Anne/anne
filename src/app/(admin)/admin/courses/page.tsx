import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import type { Course } from "@/types";

export default async function AdminCoursesPage() {
  const supabase = await createClient();
  const { data: courses } = await supabase
    .from("courses")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
          <p className="mt-1 text-sm text-gray-500">{courses?.length ?? 0} courses</p>
        </div>
        <Link
          href="/admin/courses/new"
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
        >
          + New Course
        </Link>
      </div>

      {!courses || courses.length === 0 ? (
        <div className="mt-16 text-center text-gray-400 text-sm">No courses yet.</div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(courses as Course[]).map((course) => (
            <Link
              key={course.id}
              href={`/admin/courses/${course.id}`}
              className="rounded-xl border border-gray-200 bg-white overflow-hidden hover:shadow-sm transition-all"
            >
              {course.thumbnail_url && (
                <img src={course.thumbnail_url} alt={course.title} className="h-40 w-full object-cover" />
              )}
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${course.published ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {course.published ? "Published" : "Draft"}
                  </span>
                  <span className="text-sm font-bold text-gray-900">£{course.price.toFixed(2)}</span>
                </div>
                <h2 className="mt-2 text-sm font-semibold text-gray-900">{course.title}</h2>
                <p className="mt-1 text-xs text-gray-500 line-clamp-2">{course.description}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
