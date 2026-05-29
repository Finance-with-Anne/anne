import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { AdminThemeProvider } from "@/lib/admin-theme";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminThemeProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </AdminThemeProvider>
  );
}

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  return (
    <AdminLayoutWrapper>
      <AdminSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </AdminLayoutWrapper>
  );
}

// Wrapper reads theme from context — needs to be a client component
import AdminLayoutWrapper from "@/components/admin/AdminLayoutWrapper";
