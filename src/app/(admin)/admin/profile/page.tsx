import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import ProfilePageClient from "@/components/admin/ProfilePage";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const isEditor = (user.user_metadata?.role as string | undefined) === "editor";
  let editorRecord: Record<string, string | null> | null = null;

  if (isEditor) {
    const { data } = await supabaseAdmin
      .from("editors")
      .select("id, first_name, last_name, bio, avatar_url")
      .eq("user_id", user.id)
      .single();
    editorRecord = data;
  }

  return (
    <ProfilePageClient
      userId={user.id}
      email={user.email ?? ""}
      name={user.user_metadata?.name ?? ""}
      firstName={user.user_metadata?.first_name ?? ""}
      lastName={user.user_metadata?.last_name ?? ""}
      role={isEditor ? "editor" : "admin"}
      editorId={editorRecord?.id ?? null}
      bio={editorRecord?.bio ?? null}
    />
  );
}
