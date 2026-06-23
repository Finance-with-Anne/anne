import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

// Admin: get all support threads for a course
// Student: get own thread (handled by RLS on client)
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const isAdmin = req.headers.get("x-admin") === "1";

  const client = isAdmin ? supabaseAdmin : await createClient();

  const { data: messages } = await (isAdmin ? supabaseAdmin : (client as any))
    .from("course_support")
    .select("*")
    .eq("course_id", id)
    .order("created_at", { ascending: true });

  if (!messages?.length) return NextResponse.json([]);

  if (isAdmin) {
    const userIds = [...new Set(messages.filter((m: any) => !m.is_admin).map((m: any) => m.user_id))];
    const { data: profiles } = await supabaseAdmin.from("profiles").select("id, full_name, avatar_url").in("id", userIds);
    const { data: { users } } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
    const emailMap = Object.fromEntries(users.map(u => [u.id, u.email ?? ""]));
    const profileMap = Object.fromEntries((profiles ?? []).map(p => [p.id, p]));
    const enriched = messages.map((m: any) => ({
      ...m,
      profile: profileMap[m.user_id] ?? null,
      email: emailMap[m.user_id] ?? "",
    }));
    return NextResponse.json(enriched);
  }

  return NextResponse.json(messages);
}

// Student posts a message; admin replies via separate "reply" endpoint
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { message, is_admin, user_id } = await req.json();
  if (!message?.trim()) return NextResponse.json({ error: "Message is required" }, { status: 400 });

  const isAdminReply = is_admin === true;
  const targetUserId = isAdminReply ? user_id : user.id;
  if (!targetUserId) return NextResponse.json({ error: "user_id required for admin reply" }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from("course_support")
    .insert({ course_id: id, user_id: targetUserId, message: message.trim(), is_admin: isAdminReply })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
