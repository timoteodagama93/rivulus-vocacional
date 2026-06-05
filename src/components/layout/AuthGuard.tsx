"use client";
// ============================================================
// GAMA VOCACIONAL — AuthGuard
// Protege rotas por role. Redireciona não autenticados.
// ============================================================
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import type { UserRole } from "@/types";

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export default function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const { user, role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace("/auth/login"); return; }
    if (allowedRoles && role && !allowedRoles.includes(role)) {
      router.replace("/dashboard");
    }
  }, [user, role, loading, router, allowedRoles]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-page)" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: "var(--ag-blue-600)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>RV</span>
          </div>
          <div style={{
            width: 120, height: 3, borderRadius: 99,
            background: "var(--border)", overflow: "hidden",
          }}>
            <div style={{
              height: "100%", width: "40%", borderRadius: 99,
              background: "var(--ag-blue-600)",
              animation: "slide 1.2s ease-in-out infinite",
            }} />
          </div>
        </div>
        <style>{`
          @keyframes slide {
            0%   { margin-left: 0%;   width: 40%; }
            50%  { margin-left: 60%;  width: 40%; }
            100% { margin-left: 0%;   width: 40%; }
          }
        `}</style>
      </div>
    );
  }

  if (!user) return null;
  if (allowedRoles && role && !allowedRoles.includes(role)) return null;

  return <>{children}</>;
}
