import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { AdminThemeProvider } from "@/lib/admin-theme";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userRole = (user?.user_metadata?.role as string | undefined) ?? "admin";
  const userName = (user?.user_metadata?.name as string | undefined) ?? undefined;
  const userEmail = user?.email ?? undefined;
  const userAvatar = (user?.user_metadata?.avatar_url as string | undefined) ?? undefined;

  return (
    <AdminThemeProvider>
      <AdminLayoutInner userRole={userRole} userName={userName} userEmail={userEmail} userAvatar={userAvatar}>{children}</AdminLayoutInner>
    </AdminThemeProvider>
  );
}

function AdminLayoutInner({ children, userRole, userName, userEmail, userAvatar }: { children: React.ReactNode; userRole: string; userName?: string; userEmail?: string; userAvatar?: string }) {
  return (
    <AdminLayoutWrapper>
      <AdminSidebar userRole={userRole} userName={userName} userEmail={userEmail} userAvatar={userAvatar} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminHeader userName={userName} userEmail={userEmail} userRole={userRole} userAvatar={userAvatar} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </AdminLayoutWrapper>
  );
}

import AdminLayoutWrapper from "@/components/admin/AdminLayoutWrapper";
