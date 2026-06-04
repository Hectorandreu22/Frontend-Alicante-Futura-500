import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import AuthGuard from "@/components/layout/AuthGuard";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="admin-shell">
        <Sidebar />
        <div className="admin-main">
          <Header />
          <main className="admin-content">{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}
