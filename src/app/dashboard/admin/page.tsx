"use client";
// ============================================================
// RIVULUS VOCACIONAL — Dashboard do Administrador
// ============================================================
import { useEffect, useState } from "react";
import { collection, getCountFromServer, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { COLLECTIONS } from "@/lib/firebase/collections";
import PageHeader from "@/components/layout/PageHeader";
import StatCard from "@/components/ui/StatCard";
import Link from "next/link";

interface KPIs {
  totalAlunos: number;
  testesRealizados: number;
  relatoriosGerados: number;
  encaminhamentos: number;
  relatoriosPendentes: number;
  alunosAtivos: number;
}

interface AlunoRecente {
  id: string;
  nome: string;
  escola: string;
  classe: string;
  createdAt: any;
}

export default function DashboardAdmin() {
  const [kpis, setKpis] = useState<KPIs>({
    totalAlunos: 0, testesRealizados: 0, relatoriosGerados: 0,
    encaminhamentos: 0, relatoriosPendentes: 0, alunosAtivos: 0,
  });
  const [alunosRecentes, setAlunosRecentes] = useState<AlunoRecente[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [
          alunosSnap,
          relatoriosSnap,
          pendentesSnap,
          encSnap,
          alunosRecentesSnap,
        ] = await Promise.all([
          getCountFromServer(collection(db, COLLECTIONS.ESTUDANTES)),
          getCountFromServer(collection(db, COLLECTIONS.RELATORIOS)),
          getCountFromServer(query(
            collection(db, COLLECTIONS.RELATORIOS),
            where("estado", "==", "pendente_aprovacao")
          )),
          getCountFromServer(collection(db, COLLECTIONS.ENCAMINHAMENTOS)),
          getDocs(query(
            collection(db, COLLECTIONS.ESTUDANTES),
            orderBy("createdAt", "desc"),
            limit(5)
          )),
        ]);

        setKpis({
          totalAlunos: alunosSnap.data().count,
          testesRealizados: 0, // via collection group — simplificado
          relatoriosGerados: relatoriosSnap.data().count,
          encaminhamentos: encSnap.data().count,
          relatoriosPendentes: pendentesSnap.data().count,
          alunosAtivos: alunosSnap.data().count,
        });

        setAlunosRecentes(
          alunosRecentesSnap.docs.map((d) => ({ id: d.id, ...d.data() } as AlunoRecente))
        );
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const hoje = new Date().toLocaleDateString("pt-PT", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  return (
    <>
      <PageHeader
        title="Dashboard Executivo"
        subtitle={hoje.charAt(0).toUpperCase() + hoje.slice(1)}
        actions={
          <Link href="/admin/alunos/novo" style={{ textDecoration: "none" }}>
            <button className="btn btn-primary btn-sm">
              <i className="ti ti-plus" aria-hidden="true" />
              Novo aluno
            </button>
          </Link>
        }
      />

      <div className="page-body">

        {/* Alerta de pendentes */}
        {kpis.relatoriosPendentes > 0 && (
          <div style={{
            background: "#FEF3C7", border: "1px solid #FCD34D",
            borderRadius: 10, padding: "12px 16px",
            display: "flex", alignItems: "center", gap: 10, marginBottom: 20,
          }}>
            <i className="ti ti-alert-triangle" style={{ fontSize: 16, color: "#B45309" }} aria-hidden="true" />
            <span style={{ fontSize: 13, color: "#92400E", flex: 1 }}>
              <strong>{kpis.relatoriosPendentes}</strong> relatório{kpis.relatoriosPendentes > 1 ? "s" : ""} aguarda{kpis.relatoriosPendentes === 1 ? "" : "m"} aprovação.
            </span>
            <Link href="/admin/relatorios?estado=pendente_aprovacao" style={{ textDecoration: "none" }}>
              <span style={{ fontSize: 12, fontWeight: 500, color: "#B45309", cursor: "pointer" }}>
                Rever agora →
              </span>
            </Link>
          </div>
        )}

        {/* KPIs principais */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 12, marginBottom: 24,
        }}>
          <StatCard
            label="Total de alunos"
            value={loading ? "—" : kpis.totalAlunos}
            icon="ti-users"
            color="#E8F0FA" iconColor="#1B4F8A"
          />
          <StatCard
            label="Relatórios gerados"
            value={loading ? "—" : kpis.relatoriosGerados}
            icon="ti-file-text"
            color="#EAF3DE" iconColor="#0F5E3F"
          />
          <StatCard
            label="Encaminhamentos"
            value={loading ? "—" : kpis.encaminhamentos}
            icon="ti-arrow-right-circle"
            color="#FAEEDA" iconColor="#BA7517"
          />
          <StatCard
            label="Pendentes aprovação"
            value={loading ? "—" : kpis.relatoriosPendentes}
            icon="ti-clock"
            color={kpis.relatoriosPendentes > 0 ? "#FEF3C7" : "#F1EFE8"}
            iconColor={kpis.relatoriosPendentes > 0 ? "#B45309" : "#5F5E5A"}
          />
        </div>

        {/* Corpo principal: 2 colunas */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 16 }}>

          {/* Alunos recentes */}
          <div style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: 12, overflow: "hidden",
          }}>
            <div style={{
              padding: "16px 20px",
              borderBottom: "1px solid var(--border)",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>
                Alunos recentes
              </h2>
              <Link href="/admin/alunos" style={{ textDecoration: "none" }}>
                <span style={{ fontSize: 12, color: "var(--ag-blue-600)" }}>Ver todos →</span>
              </Link>
            </div>

            {loading ? (
              <div style={{ padding: 24 }}>
                {[...Array(4)].map((_, i) => (
                  <div key={i} style={{
                    display: "flex", gap: 12, alignItems: "center",
                    marginBottom: 14,
                  }}>
                    <div className="skeleton" style={{ width: 36, height: 36, borderRadius: "50%" }} />
                    <div style={{ flex: 1 }}>
                      <div className="skeleton" style={{ height: 12, width: "55%", marginBottom: 6, borderRadius: 4 }} />
                      <div className="skeleton" style={{ height: 10, width: "35%", borderRadius: 4 }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : alunosRecentes.length === 0 ? (
              <div style={{ padding: "40px 20px", textAlign: "center" }}>
                <i className="ti ti-users" style={{ fontSize: 32, color: "var(--border-strong)", display: "block", marginBottom: 8 }} aria-hidden="true" />
                <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Ainda não há alunos registados.</p>
                <Link href="/admin/alunos/novo" style={{ textDecoration: "none" }}>
                  <button className="btn btn-primary btn-sm" style={{ marginTop: 12 }}>
                    Adicionar primeiro aluno
                  </button>
                </Link>
              </div>
            ) : (
              <div>
                {alunosRecentes.map((aluno, i) => (
                  <Link key={aluno.id} href={`/admin/alunos/${aluno.id}`} style={{ textDecoration: "none" }}>
                    <div style={{
                      display: "flex", alignItems: "center", gap: 12,
                      padding: "12px 20px",
                      borderBottom: i < alunosRecentes.length - 1 ? "1px solid var(--border)" : "none",
                      cursor: "pointer",
                      transition: "background .1s",
                    }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: "50%",
                        background: "#E8F0FA",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0,
                      }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: "#1B4F8A" }}>
                          {aluno.nome?.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase() ?? "??"}
                        </span>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: 13, fontWeight: 500, color: "var(--text-primary)",
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        }}>{aluno.nome}</div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                          {aluno.escola} · {aluno.classe}
                        </div>
                      </div>
                      <i className="ti ti-chevron-right" style={{ fontSize: 14, color: "var(--border-strong)" }} aria-hidden="true" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Painel direito: acções + módulos */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

            {/* Acções rápidas */}
            <div style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: 12, padding: "16px",
            }}>
              <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", marginBottom: 12 }}>
                Acções rápidas
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {[
                  { href: "/admin/alunos/novo",      icon: "ti-user-plus",        label: "Adicionar aluno",    cor: "#1B4F8A", bg: "#E8F0FA" },
                  { href: "/admin/relatorios",        icon: "ti-file-plus",        label: "Gerar relatório",    cor: "#0F5E3F", bg: "#E6F4EE" },
                  { href: "/admin/testes",            icon: "ti-clipboard-list",   label: "Gerir testes",       cor: "#7B2D8B", bg: "#FAF5FF" },
                  { href: "/admin/estatisticas",      icon: "ti-chart-bar",        label: "Ver estatísticas",   cor: "#BA7517", bg: "#FAEEDA" },
                  { href: "/admin/parceiros",         icon: "ti-building",         label: "Gerir parceiros",    cor: "#C53030", bg: "#FED7D7" },
                ].map((item) => (
                  <Link key={item.href} href={item.href} style={{ textDecoration: "none" }}>
                    <div style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "9px 10px", borderRadius: 8,
                      border: "1px solid var(--border)",
                      cursor: "pointer", transition: "border-color .15s",
                    }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: 6,
                        background: item.bg,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0,
                      }}>
                        <i className={`ti ${item.icon}`} style={{ fontSize: 14, color: item.cor }} aria-hidden="true" />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-primary)" }}>
                        {item.label}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Estado dos módulos */}
            <div style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: 12, padding: "16px",
            }}>
              <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", marginBottom: 12 }}>
                Estado da plataforma
              </h2>
              {[
                { label: "Avaliações",     estado: "Activo",    cor: "#0F5E3F", bg: "#E6F4EE" },
                { label: "IA Conselheira", estado: "Activo",    cor: "#0F5E3F", bg: "#E6F4EE" },
                { label: "Relatórios",     estado: "Activo",    cor: "#0F5E3F", bg: "#E6F4EE" },
                { label: "Encaminhamento", estado: "Activo",    cor: "#0F5E3F", bg: "#E6F4EE" },
              ].map((m) => (
                <div key={m.label} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  marginBottom: 8,
                }}>
                  <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{m.label}</span>
                  <span style={{
                    fontSize: 10, fontWeight: 500,
                    color: m.cor, background: m.bg,
                    padding: "2px 8px", borderRadius: 20,
                  }}>{m.estado}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
