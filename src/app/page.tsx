"use client";
// ============================================================
// GAMA VOCACIONAL — Página Raiz (/)
// Redireciona utilizadores autenticados para o dashboard,
// não autenticados para o login.
// ============================================================
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  console.log("HomePage render - user:", user, "loading:", loading);
  useEffect(() => {
    if (loading) return;
    if (user) {
      router.replace("/dashboard");
    } else {
      router.replace("/auth/login");
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
          <span className="text-white text-sm font-bold">RV</span>
        </div>
        <p className="text-slate-400 text-sm">A carregar...</p>
      </div>
    </div>
  );
}
