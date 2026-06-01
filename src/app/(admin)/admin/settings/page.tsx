import { createClient } from "@/lib/supabase/server";
import SettingsPageClient from "@/components/admin/SettingsPage";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const role = (user.user_metadata?.role as string | undefined) ?? "admin";

  return <SettingsPageClient role={role} email={user.email ?? ""} />;
}
