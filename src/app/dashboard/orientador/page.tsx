"use client";
// ============================================================
// RIVULUS VOCACIONAL — Dashboard do Orientador
// ============================================================
import { useAuth } from "@/lib/hooks/useAuth";

export default function AdvisorDashboard() {
    const { profile, user } = useAuth();

    return (
        <main className="min-h-screen bg-slate-50 p-6">
            <header className="mb-6">
                <h1 className="text-2xl font-semibold text-slate-900">
                    Painel do Orientador
                </h1>
                <p className="text-slate-500 text-sm">
                    {profile?.email || user?.email}
                </p>
            </header>

            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border rounded-xl p-4">
                    <h2 className="font-medium">Estudantes Acompanhados</h2>
                    <p className="text-sm text-slate-500 mt-1">
                        Gerir acompanhamento vocacional.
                    </p>
                </div>

                <div className="bg-white border rounded-xl p-4">
                    <h2 className="font-medium">Relatórios</h2>
                    <p className="text-sm text-slate-500 mt-1">
                        Criar e analisar relatórios psicopedagógicos.
                    </p>
                </div>

                <div className="bg-white border rounded-xl p-4">
                    <h2 className="font-medium">Encaminhamentos</h2>
                    <p className="text-sm text-slate-500 mt-1">
                        Recomendar cursos e percursos.
                    </p>
                </div>
            </section>
        </main>
    );
}