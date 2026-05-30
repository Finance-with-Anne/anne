import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorised." }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from("editors")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorised." }, { status: 401 });

  const { name, email, bio, avatar_url } = await req.json();
  if (!name?.trim() || !email?.trim()) {
    return NextResponse.json({ error: "Name and email are required." }, { status: 400 });
  }

  // Create Supabase auth account for the editor
  const tempPassword = Math.random().toString(36).slice(-12) + "Aa1!";
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: email.trim(),
    password: tempPassword,
    email_confirm: true,
    user_metadata: { name: name.trim(), role: "editor" },
  });

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 400 });
  }

  // Store editor profile
  const { data, error } = await supabaseAdmin
    .from("editors")
    .insert({
      user_id:    authData.user.id,
      name:       name.trim(),
      email:      email.trim(),
      bio:        bio?.trim() ?? null,
      avatar_url: avatar_url ?? null,
      role:       "editor",
    })
    .select()
    .single();

  if (error) {
    // Roll back the auth user if profile insert fails
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Send password reset so editor sets their own password
  await supabaseAdmin.auth.admin.generateLink({
    type: "recovery",
    email: email.trim(),
  });

  return NextResponse.json({ editor: data, tempPassword }, { status: 201 });
}
