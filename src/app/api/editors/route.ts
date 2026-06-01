import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorised." }, { status: 401 });

  const { data: editors, error } = await supabaseAdmin
    .from("editors")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Enrich with verified status (has logged in at least once)
  const { data: { users } } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
  const userMap = new Map(users.map(u => [u.id, u]));

  const enriched = (editors ?? []).map(e => ({
    ...e,
    verified: userMap.get(e.user_id)?.last_sign_in_at != null,
    last_sign_in_at: userMap.get(e.user_id)?.last_sign_in_at ?? null,
  }));

  return NextResponse.json(enriched);
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorised." }, { status: 401 });

  const { first_name, last_name, email, bio, avatar_url } = await req.json();
  if (!first_name?.trim() || !email?.trim()) {
    return NextResponse.json({ error: "First name and email are required." }, { status: 400 });
  }

  const fullName = [first_name.trim(), last_name?.trim()].filter(Boolean).join(" ");

  // Create Supabase auth account for the editor
  const tempPassword = Math.random().toString(36).slice(-10) + "Aa1!";
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: email.trim(),
    password: tempPassword,
    email_confirm: true,
    user_metadata: { name: fullName, role: "editor", first_name: first_name.trim(), last_name: last_name?.trim() ?? "" },
  });

  if (authError) return NextResponse.json({ error: authError.message }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from("editors")
    .insert({
      user_id:    authData.user.id,
      name:       fullName,
      first_name: first_name.trim(),
      last_name:  last_name?.trim() ?? null,
      email:      email.trim(),
      bio:        bio?.trim() ?? null,
      avatar_url: avatar_url ?? null,
      role:       "editor",
    })
    .select()
    .single();

  if (error) {
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ editor: { ...data, verified: false, last_sign_in_at: null }, tempPassword }, { status: 201 });
}
