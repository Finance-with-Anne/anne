import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

async function syncCourseProduct(course: any) {
  const { data: cat } = await supabaseAdmin
    .from("product_categories")
    .select("id")
    .eq("slug", "course")
    .single();

  const productData = {
    name: course.title,
    description: course.description ?? "",
    price: course.price_ngn ?? course.price ?? 0,
    price_ngn: course.price_ngn ?? null,
    price_usd: course.price_usd ?? null,
    price_gbp: course.price_gbp ?? null,
    image_url: course.thumbnail_url ?? null,
    category_id: cat?.id ?? null,
    stock: 9999,
    active: true,
    source_type: "course",
    source_id: course.id,
    updated_at: new Date().toISOString(),
  };

  const { data: existing } = await supabaseAdmin
    .from("products")
    .select("id")
    .eq("source_type", "course")
    .eq("source_id", course.id)
    .maybeSingle();

  if (existing) {
    await supabaseAdmin.from("products").update(productData).eq("id", existing.id);
  } else {
    await supabaseAdmin.from("products").insert(productData);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorised." }, { status: 401 });

  const { sections, tag_ids, ...courseData } = await req.json();
  const { data, error } = await supabase
    .from("courses")
    .update({ ...courseData, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (sections !== undefined) {
    await supabase.from("lessons").delete().eq("course_id", id);
    await supabase.from("course_sections").delete().eq("course_id", id);
    for (const section of sections) {
      const { lessons, ...sectionData } = section;
      const { data: sec, error: secErr } = await supabase
        .from("course_sections")
        .insert({ ...sectionData, id: undefined, course_id: id })
        .select()
        .single();
      if (secErr) continue;
      if (lessons?.length) {
        await supabase.from("lessons").insert(
          lessons.map((l: any) => ({ ...l, id: undefined, course_id: id, section_id: sec.id }))
        );
      }
    }
  }

  if (tag_ids !== undefined) {
    await supabase.from("course_tag_assignments").delete().eq("course_id", id);
    if (tag_ids.length) {
      await supabase.from("course_tag_assignments").insert(
        tag_ids.map((tag_id: string) => ({ course_id: id, tag_id }))
      );
    }
  }

  await syncCourseProduct(data);

  return NextResponse.json(data);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorised." }, { status: 401 });

  await supabase.from("lessons").delete().eq("course_id", id);
  await supabase.from("course_sections").delete().eq("course_id", id);
  await supabase.from("course_tag_assignments").delete().eq("course_id", id);
  await supabaseAdmin.from("products").delete().eq("source_type", "course").eq("source_id", id);
  const { error } = await supabase.from("courses").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
