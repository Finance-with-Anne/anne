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

  return (
    <AdminThemeProvider>
      <AdminLayoutInner userRole={userRole} userName={userName} userEmail={userEmail}>{children}</AdminLayoutInner>
    </AdminThemeProvider>
  );
}

function AdminLayoutInner({ children, userRole, userName, userEmail }: { children: React.ReactNode; userRole: string; userName?: string; userEmail?: string }) {
  return (
    <AdminLayoutWrapper>
      <AdminSidebar userRole={userRole} userName={userName} userEmail={userEmail} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </AdminLayoutWrapper>
  );
}

import AdminLayoutWrapper from "@/components/admin/AdminLayoutWrapper";
