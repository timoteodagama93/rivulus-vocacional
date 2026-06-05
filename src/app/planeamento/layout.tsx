import AuthGuard from "@/components/layout/AuthGuard";
import SidebarEstudante from "@/components/layout/SidebarEstudante";
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allowedRoles={["estudante"]}>
      <div className="layout">
        <SidebarEstudante />
        <div className="main-content">{children}</div>
      </div>
    </AuthGuard>
  );
}
