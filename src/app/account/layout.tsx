import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AccountSidebar from "@/components/account/AccountSidebar";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url")
    .eq("id", user.id)
    .single();

  return (
    <div className="min-h-screen flex bg-gray-50">
      <AccountSidebar
        userName={profile?.full_name ?? user.email ?? "Student"}
        userEmail={user.email ?? ""}
        userAvatar={profile?.avatar_url ?? null}
      />
      <main className="flex-1 min-w-0 p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
