import { supabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import UsersPage from "@/components/admin/UsersPage";

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const { data: { user: me } } = await supabase.auth.getUser();
  if (!me) return null;

  const [
    { data: { users } },
    { data: profiles },
    { data: enrollments },
    { data: bookings },
  ] = await Promise.all([
    supabaseAdmin.auth.admin.listUsers({ perPage: 1000 }),
    supabaseAdmin.from("profiles").select("id, full_name, avatar_url"),
    supabaseAdmin.from("course_enrollments").select("user_id"),
    supabaseAdmin.from("bookings").select("client_email"),
  ]);

  const profileMap = new Map((profiles ?? []).map(p => [p.id, p]));

  const enrollMap: Record<string, number> = {};
  for (const e of enrollments ?? []) {
    enrollMap[e.user_id] = (enrollMap[e.user_id] ?? 0) + 1;
  }

  const bookingMap: Record<string, number> = {};
  for (const b of bookings ?? []) {
    if (b.client_email) bookingMap[b.client_email] = (bookingMap[b.client_email] ?? 0) + 1;
  }

  const enriched = users.map(u => ({
    id: u.id,
    email: u.email ?? "",
    full_name: profileMap.get(u.id)?.full_name ?? (u.user_metadata?.name as string | undefined) ?? null,
    avatar_url: profileMap.get(u.id)?.avatar_url ?? (u.user_metadata?.avatar_url as string | undefined) ?? null,
    role: (u.user_metadata?.role as string | undefined) ?? "student",
    created_at: u.created_at,
    last_sign_in_at: u.last_sign_in_at ?? null,
    enrollments: enrollMap[u.id] ?? 0,
    bookings: bookingMap[u.email ?? ""] ?? 0,
  }));

  return <UsersPage users={enriched} />;
}
