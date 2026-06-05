// RIVULUS VOCACIONAL — Layout: admin
import AuthGuard from "@/components/layout/AuthGuard";
import SidebarAdmin from "@/components/layout/SidebarAdmin";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allowedRoles={["administrador"]}>
      <div className="layout">
        <SidebarAdmin />
        <div className="main-content">{children}</div>
      </div>
    </AuthGuard>
  );
}
