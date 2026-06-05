"use client";

// ============================================================
// GAMA VOCACIONAL — Página de Registo
// ============================================================

import Link from "next/link";

export default function RegisterPage() {

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-100 p-8">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">RV</span>
            </div>
            <h1 className="text-xl font-semibold text-slate-900">
              Criar conta
            </h1>
          </div>
          <p className="text-slate-500 text-sm pl-10">
            GAMA VOCACIONAL — Academia Gama
          </p>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-700">
              O registo não está disponível neste aplicativo. As contas de Administrador e Orientador são criadas no Rivulus.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-700">
              Se é estudante, aguarde o pré-cadastro do admin e depois faça login com o documento ou email fornecido.
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link href="/auth/login" className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-white text-sm font-medium hover:bg-blue-700">
            Voltar para Login
          </Link>
        </div>
      </div>
    </main>
  );
}