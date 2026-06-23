import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

// GET all course support threads (admin view)
export async function GET(_: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [messagesRes, coursesRes] = await Promise.all([
    supabaseAdmin
      .from("course_support")
      .select("id, course_id, user_id, message, is_admin, created_at")
      .order("created_at", { ascending: true }),
    supabaseAdmin.from("courses").select("id, title, thumbnail_url"),
  ]);

  const messages = messagesRes.data ?? [];
  const courses = coursesRes.data ?? [];

  if (!messages.length) return NextResponse.json({ threads: [] });

  // Collect unique user IDs (exclude admin replies stored under student user_id that are identical)
  const userIds = [...new Set(messages.map(m => m.user_id))];
  const courseMap = Object.fromEntries(courses.map(c => [c.id, c]));

  const [profilesRes, authRes] = await Promise.all([
    supabaseAdmin.from("profiles").select("id, full_name, avatar_url").in("id", userIds),
    supabaseAdmin.auth.admin.listUsers({ perPage: 1000 }),
  ]);

  const profileMap = Object.fromEntries((profilesRes.data ?? []).map(p => [p.id, p]));
  const emailMap = Object.fromEntries((authRes.data?.users ?? []).map(u => [u.id, u.email ?? ""]));

  // Group by user_id + course_id
  const threadMap: Record<string, {
    key: string; courseId: string; userId: string;
    messages: typeof messages;
    lastMessage: string; lastTime: string;
    hasAdminReply: boolean; totalMessages: number;
  }> = {};

  for (const m of messages) {
    const key = `${m.user_id}::${m.course_id}`;
    if (!threadMap[key]) {
      threadMap[key] = {
        key, courseId: m.course_id, userId: m.user_id,
        messages: [], lastMessage: "", lastTime: m.created_at,
        hasAdminReply: false, totalMessages: 0,
      };
    }
    const t = threadMap[key];
    t.messages.push(m);
    t.lastMessage = m.message;
    t.lastTime = m.created_at;
    t.totalMessages++;
    if (m.is_admin) t.hasAdminReply = true;
  }

  const threads = Object.values(threadMap)
    .sort((a, b) => new Date(b.lastTime).getTime() - new Date(a.lastTime).getTime())
    .map(t => ({
      key: t.key,
      courseId: t.courseId,
      userId: t.userId,
      course: courseMap[t.courseId] ?? null,
      profile: profileMap[t.userId] ?? null,
      email: emailMap[t.userId] ?? "",
      lastMessage: t.lastMessage,
      lastTime: t.lastTime,
      hasAdminReply: t.hasAdminReply,
      totalMessages: t.totalMessages,
      messages: t.messages,
    }));

  return NextResponse.json({ threads });
}
