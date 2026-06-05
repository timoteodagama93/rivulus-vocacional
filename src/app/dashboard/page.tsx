"use client";
// ============================================================
// GAMA VOCACIONAL — Dashboard (redireciona por role)
// ============================================================
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";

export default function DashboardPage() {
  const { role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!role) { router.push("/auth/login"); return; }
    if (role === "estudante")     router.push("/dashboard/estudante");
    if (role === "orientador")    router.push("/dashboard/orientador");
    if (role === "administrador") router.push("/dashboard/admin");
  }, [role, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <p className="text-slate-400 text-sm">A carregar...</p>
    </div>
  );
}
