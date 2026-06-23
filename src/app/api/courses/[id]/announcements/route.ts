import { NextRequest, NextResponse } from "next/server";
import * as React from "react";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { resend, EMAIL_FROM } from "@/lib/resend";
import { CourseAnnouncementEmail } from "@/lib/emails/course-announcement";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data } = await supabaseAdmin
    .from("course_announcements")
    .select("*")
    .eq("course_id", id)
    .order("created_at", { ascending: false });
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, body } = await req.json();
  if (!title || !body) return NextResponse.json({ error: "title and body are required" }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from("course_announcements")
    .insert({ course_id: id, title, body })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Send email to all enrolled students (fire-and-forget)
  sendAnnouncementEmails(id, title, body).catch(console.error);

  return NextResponse.json(data, { status: 201 });
}

async function sendAnnouncementEmails(courseId: string, title: string, body: string) {
  const [enrollRes, courseRes] = await Promise.all([
    supabaseAdmin.from("course_enrollments").select("user_id").eq("course_id", courseId),
    supabaseAdmin.from("courses").select("title").eq("id", courseId).single(),
  ]);

  if (!enrollRes.data?.length || !courseRes.data) return;

  const userIds = enrollRes.data.map((e) => e.user_id);

  const [profilesRes, authUsers] = await Promise.all([
    supabaseAdmin.from("profiles").select("id, full_name").in("id", userIds),
    Promise.all(userIds.map((uid) => supabaseAdmin.auth.admin.getUserById(uid))),
  ]);

  const profileMap = Object.fromEntries((profilesRes.data ?? []).map((p) => [p.id, p.full_name]));
  const courseTitle = courseRes.data.title;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://financewithanne.com";

  const emails = authUsers
    .map((r) => r.data?.user)
    .filter((u): u is NonNullable<typeof u> => !!u?.email)
    .map((u) => ({
      from: EMAIL_FROM,
      to: u.email!,
      subject: `New announcement: ${title}`,
      react: React.createElement(CourseAnnouncementEmail, {
        studentName: profileMap[u.id] || u.email!.split("@")[0],
        courseTitle,
        announcementTitle: title,
        announcementBody: body,
        courseUrl: `${siteUrl}/learn/${courseId}`,
      }),
    }));

  if (!emails.length) return;

  const chunkSize = 100;
  for (let i = 0; i < emails.length; i += chunkSize) {
    await resend.batch.send(emails.slice(i, i + chunkSize));
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: courseId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { announcement_id } = await req.json();
  const { error } = await supabaseAdmin
    .from("course_announcements")
    .delete()
    .eq("id", announcement_id)
    .eq("course_id", courseId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
