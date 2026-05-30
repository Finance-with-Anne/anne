import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { AdminThemeProvider } from "@/lib/admin-theme";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userRole = (user?.user_metadata?.role as string | undefined) ?? "admin";

  return (
    <AdminThemeProvider>
      <AdminLayoutInner userRole={userRole}>{children}</AdminLayoutInner>
    </AdminThemeProvider>
  );
}

function AdminLayoutInner({ children, userRole }: { children: React.ReactNode; userRole: string }) {
  return (
    <AdminLayoutWrapper>
      <AdminSidebar userRole={userRole} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </AdminLayoutWrapper>
  );
}

import AdminLayoutWrapper from "@/components/admin/AdminLayoutWrapper";
