import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AccountShell from "@/components/account/AccountShell";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url")
    .eq("id", user.id)
    .single();

  return (
    <AccountShell
      userName={profile?.full_name ?? user.email ?? "Student"}
      userEmail={user.email ?? ""}
      userAvatar={profile?.avatar_url ?? null}
    >
      {children}
    </AccountShell>
  );
}
