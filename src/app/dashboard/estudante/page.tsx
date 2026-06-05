"use client";
// ============================================================
// GAMA VOCACIONAL — Dashboard do Estudante
// ============================================================
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useAuth } from "@/lib/hooks/useAuth";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { CATALOGO_TESTES, TOTAL_TESTES, LABELS_AREA } from "@/constants/testes";
import PageHeader from "@/components/layout/PageHeader";
import StatCard from "@/components/ui/StatCard";
import Link from "next/link";
import type { Estudante, PerfilVocacional } from "@/types";

interface DashboardData {
  estudante: Estudante | null;
  perfil: PerfilVocacional | null;
  testesFeitos: number;
  relatorios: number;
}

export default function DashboardEstudante() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [data, setData] = useState<DashboardData>({
    estudante: null, perfil: null, testesFeitos: 0, relatorios: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    async function load() {
      try {
        const [estudanteSnap, perfilSnap, resultadosSnap, relatoriosSnap] = await Promise.all([
          getDoc(doc(db, COLLECTIONS.ESTUDANTES, user!.uid)),
          getDoc(doc(db, COLLECTIONS.PERFIS_VOCACIONAIS, user!.uid)),
          getDocs(collection(db, COLLECTIONS.ESTUDANTES, user!.uid, "resultados")),
          getDocs(query(
            collection(db, COLLECTIONS.RELATORIOS),
            where("estudanteId", "==", user!.uid)
          )),
        ]);
        setData({
          estudante: estudanteSnap.exists() ? (estudanteSnap.data() as Estudante) : null,
          perfil: perfilSnap.exists() ? (perfilSnap.data() as PerfilVocacional) : null,
          testesFeitos: resultadosSnap.size,
          relatorios: relatoriosSnap.size,
        });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  const completude = data.perfil?.completude ?? Math.round((data.testesFeitos / TOTAL_TESTES) * 100);
  const nome = data.estudante?.nome?.split(" ")[0] ?? "Estudante";
  const hora = new Date().getHours();
  const saudacao = hora < 12 ? "Bom dia" : hora < 18 ? "Boa tarde" : "Boa noite";

  // Testes agrupados por área com progresso simulado
  const areasProgress = [
    {
      key: "quem_sou_eu", cor: "#1B4F8A", bg: "#E8F0FA",
      total: CATALOGO_TESTES.filter(t => t.area === "quem_sou_eu").length,
    },
    {
      key: "como_funciono", cor: "#0F5E3F", bg: "#E6F4EE",
      total: CATALOGO_TESTES.filter(t => t.area === "como_funciono").length,
    },
    {
      key: "para_onde_vou", cor: "#7B2D8B", bg: "#FAF5FF",
      total: CATALOGO_TESTES.filter(t => t.area === "para_onde_vou").length,
    },
  ];

  return (
    <>
      <PageHeader
        title={`${saudacao}, ${nome}`}
        subtitle="O teu mapa de futuro começa aqui."
        actions={
          <button
            className="btn btn-secondary btn-sm"
            onClick={async () => {
              await logout();
              router.push("/auth/login");
            }}
          >
            <i className="ti ti-logout" aria-hidden="true" />
            Sair
          </button>
        }
      />

      <div className="page-body">

        {/* Banner de progresso */}
        <div style={{
          background: "linear-gradient(135deg, #0D2F56 0%, #1B4F8A 100%)",
          borderRadius: 14, padding: "24px 28px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: 24, gap: 20,
          position: "relative", overflow: "hidden",
        }}>
          {/* Decoração de fundo */}
          <div style={{
            position: "absolute", right: -30, top: -30,
            width: 160, height: 160, borderRadius: "50%",
            background: "rgba(255,255,255,0.04)",
          }} />
          <div style={{
            position: "absolute", right: 60, bottom: -40,
            width: 100, height: 100, borderRadius: "50%",
            background: "rgba(255,255,255,0.03)",
          }} />

          <div style={{ position: "relative" }}>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 4 }}>
              Progresso do teu perfil vocacional
            </div>
            <div style={{ fontSize: 32, fontWeight: 700, color: "#fff", letterSpacing: "-1px" }}>
              {completude}%
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>
              {data.testesFeitos} de {TOTAL_TESTES} avaliações concluídas
            </div>
            <div style={{ marginTop: 14, width: 260 }}>
              <div style={{
                height: 5, background: "rgba(255,255,255,0.15)",
                borderRadius: 99, overflow: "hidden",
              }}>
                <div style={{
                  height: "100%", width: `${completude}%`,
                  background: "#4A87D4", borderRadius: 99,
                  transition: "width .6s ease",
                }} />
              </div>
            </div>
          </div>

          <Link href="/avaliacoes" style={{ textDecoration: "none", position: "relative" }}>
            <div style={{
              background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.18)",
              borderRadius: 9, padding: "10px 18px",
              color: "#fff", fontSize: 13, fontWeight: 500,
              cursor: "pointer", whiteSpace: "nowrap",
              display: "flex", alignItems: "center", gap: 7,
            }}>
              <i className="ti ti-player-play" style={{ fontSize: 14 }} aria-hidden="true" />
              Continuar avaliações
            </div>
          </Link>
        </div>

        {/* Estatísticas */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 12, marginBottom: 24,
        }}>
          <StatCard
            label="Avaliações feitas"
            value={loading ? "—" : data.testesFeitos}
            icon="ti-clipboard-check"
            color="#E8F0FA" iconColor="#1B4F8A"
            subtitle={`de ${TOTAL_TESTES} disponíveis`}
          />
          <StatCard
            label="Completude do perfil"
            value={loading ? "—" : `${completude}%`}
            icon="ti-user-circle"
            color="#E6F4EE" iconColor="#0F5E3F"
          />
          <StatCard
            label="Relatórios"
            value={loading ? "—" : data.relatorios}
            icon="ti-file-text"
            color="#FAF5FF" iconColor="#7B2D8B"
          />
          <StatCard
            label="Mapa de futuro"
            value={completude >= 50 ? "Disponível" : "Em construção"}
            icon="ti-map"
            color="#FAEEDA" iconColor="#BA7517"
          />
        </div>

        {/* Áreas de avaliação */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
          <div>
            <h2 style={{
              fontSize: 14, fontWeight: 600, color: "var(--text-primary)",
              marginBottom: 12,
            }}>As tuas áreas de avaliação</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {areasProgress.map((area) => {
                const feitos = Math.min(data.testesFeitos, area.total); // simplificado
                const pct = Math.round((feitos / area.total) * 100);
                return (
                  <Link key={area.key} href={`/avaliacoes?area=${area.key}`} style={{ textDecoration: "none" }}>
                    <div style={{
                      background: "var(--bg-card)",
                      border: "1px solid var(--border)",
                      borderRadius: 10, padding: "14px 16px",
                      cursor: "pointer",
                      transition: "border-color .15s",
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>
                          {LABELS_AREA[area.key]}
                        </span>
                        <span style={{
                          fontSize: 11, fontWeight: 500,
                          color: area.cor,
                          background: area.bg,
                          padding: "2px 8px", borderRadius: 20,
                        }}>
                          {feitos}/{area.total}
                        </span>
                      </div>
                      <div style={{
                        height: 4, background: "var(--border)",
                        borderRadius: 99, overflow: "hidden",
                      }}>
                        <div style={{
                          height: "100%", width: `${pct}%`,
                          background: area.cor, borderRadius: 99,
                          transition: "width .5s ease",
                        }} />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Acções rápidas */}
          <div>
            <h2 style={{
              fontSize: 14, fontWeight: 600, color: "var(--text-primary)",
              marginBottom: 12,
            }}>Acções rápidas</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                {
                  href: "/avaliacoes", icon: "ti-clipboard-list",
                  label: "Iniciar avaliação", desc: "18 testes disponíveis",
                  cor: "#1B4F8A", bg: "#E8F0FA",
                },
                {
                  href: "/perfil", icon: "ti-user-circle",
                  label: "Ver meu perfil", desc: "Interesses, personalidade, valores",
                  cor: "#0F5E3F", bg: "#E6F4EE",
                },
                {
                  href: "/ia-conselheira", icon: "ti-message-circle",
                  label: "Falar com a IA", desc: "Tira dúvidas sobre o teu futuro",
                  cor: "#7B2D8B", bg: "#FAF5FF",
                },
                {
                  href: "/planeamento", icon: "ti-target",
                  label: "Planeamento", desc: "Define objectivos e metas",
                  cor: "#BA7517", bg: "#FAEEDA",
                },
              ].map((item) => (
                <Link key={item.href} href={item.href} style={{ textDecoration: "none" }}>
                  <div style={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border)",
                    borderRadius: 10, padding: "12px 14px",
                    display: "flex", alignItems: "center", gap: 12,
                    cursor: "pointer",
                    transition: "border-color .15s",
                  }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: 8,
                      background: item.bg,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      <i className={`ti ${item.icon}`} style={{ fontSize: 16, color: item.cor }} aria-hidden="true" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>
                        {item.label}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{item.desc}</div>
                    </div>
                    <i className="ti ti-chevron-right" style={{
                      fontSize: 14, color: "var(--text-muted)",
                    }} aria-hidden="true" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Próximo teste sugerido */}
        {data.testesFeitos < TOTAL_TESTES && (
          <div style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: 12, padding: "18px 20px",
            display: "flex", alignItems: "center", gap: 16,
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: "#E8F0FA",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <i className="ti ti-bulb" style={{ fontSize: 20, color: "#1B4F8A" }} aria-hidden="true" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                Próxima avaliação sugerida
              </div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                {CATALOGO_TESTES[data.testesFeitos]?.nome ?? "RIASEC"} ·{" "}
                {CATALOGO_TESTES[data.testesFeitos]?.duracaoMinutos ?? 15} min ·{" "}
                {LABELS_AREA[CATALOGO_TESTES[data.testesFeitos]?.area ?? "quem_sou_eu"]}
              </div>
            </div>
            <Link
              href={`/avaliacoes/${CATALOGO_TESTES[data.testesFeitos]?.tipo ?? "riasec"}`}
              style={{ textDecoration: "none" }}
            >
              <div style={{
                background: "#1B4F8A", color: "#fff",
                padding: "8px 16px", borderRadius: 8,
                fontSize: 13, fontWeight: 500,
                cursor: "pointer", whiteSpace: "nowrap",
              }}>
                Começar agora
              </div>
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
