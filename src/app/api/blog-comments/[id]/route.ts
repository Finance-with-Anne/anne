import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

async function auth() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// PATCH — approve/reject/reply
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await auth();
  if (!user) return NextResponse.json({ error: "Unauthorised." }, { status: 401 });

  const body = await req.json();
  const update: Record<string, unknown> = {};
  if (typeof body.approved === "boolean") update.approved = body.approved;
  if (typeof body.admin_reply === "string") {
    update.admin_reply = body.admin_reply.trim() || null;
    update.replied_at = body.admin_reply.trim() ? new Date().toISOString() : null;
  }

  const { data, error } = await supabaseAdmin
    .from("blog_comments")
    .update(update)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// DELETE
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await auth();
  if (!user) return NextResponse.json({ error: "Unauthorised." }, { status: 401 });

  const { error } = await supabaseAdmin.from("blog_comments").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
