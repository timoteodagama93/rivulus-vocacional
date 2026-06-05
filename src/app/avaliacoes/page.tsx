"use client";
// ============================================================
// RIVULUS VOCACIONAL — Avaliações: Listagem de Testes
// ============================================================
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useAuth } from "@/lib/hooks/useAuth";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { CATALOGO_TESTES, TESTES_POR_AREA, LABELS_AREA } from "@/constants/testes";
import PageHeader from "@/components/layout/PageHeader";
import Link from "next/link";
import type { TipoTeste } from "@/types";

const AREA_CONFIG = {
  quem_sou_eu: {
    icon: "ti-user-search",
    cor: "#1B4F8A",
    bg: "#E8F0FA",
    border: "#C5D8F3",
    descricao: "Descobre os teus interesses, talentos, estilo de aprendizagem e o que te motiva.",
  },
  como_funciono: {
    icon: "ti-brain",
    cor: "#0F5E3F",
    bg: "#E6F4EE",
    border: "#C0DD97",
    descricao: "Explora a tua personalidade, forças de carácter, resiliência e forma de comunicar.",
  },
  para_onde_vou: {
    icon: "ti-map-2",
    cor: "#7B2D8B",
    bg: "#FAF5FF",
    border: "#DDD6FE",
    descricao: "Clarifica os teus objectivos, maturidade vocacional e capacidade de planear o futuro.",
  },
} as const;

export default function AvaliacoesPage() {
  const { user } = useAuth();
  const [testesFeitos, setTestesFeitos] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<"todos" | keyof typeof TESTES_POR_AREA>("todos");

  useEffect(() => {
    if (!user) return;
    async function load() {
      try {
        const snap = await getDocs(
          collection(db, COLLECTIONS.ESTUDANTES, user!.uid, "resultados")
        );
        const feitos = new Set(
          snap.docs
            .map((d) => d.data())
            .filter((resultado) => resultado.concluido !== false)
            .map((resultado) => resultado.testeTipo as string)
        );
        setTestesFeitos(feitos);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  const totalFeitos = testesFeitos.size;
  const totalTestes = CATALOGO_TESTES.length;
  const pct = Math.round((totalFeitos / totalTestes) * 100);

  const areasVisiveis =
    filtro === "todos"
      ? (Object.keys(TESTES_POR_AREA) as (keyof typeof TESTES_POR_AREA)[])
      : [filtro as keyof typeof TESTES_POR_AREA];

  return (
    <>
      <PageHeader
        title="Avaliações"
        subtitle="Responde aos testes para construir o teu perfil vocacional completo."
      />

      <div className="page-body">

        {/* Progresso geral */}
        <div style={{
          background: "var(--bg-card)", border: "1px solid var(--border)",
          borderRadius: 12, padding: "18px 20px", marginBottom: 20,
          display: "flex", alignItems: "center", gap: 20,
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>
                Progresso geral
              </span>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ag-blue-600)" }}>
                {totalFeitos} / {totalTestes} testes
              </span>
            </div>
            <div style={{
              height: 8, background: "var(--border)", borderRadius: 99, overflow: "hidden",
            }}>
              <div style={{
                height: "100%", width: `${pct}%`,
                background: "linear-gradient(90deg, #1B4F8A, #4A87D4)",
                borderRadius: 99, transition: "width .6s ease",
              }} />
            </div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6 }}>
              {pct}% do perfil vocacional construído
            </div>
          </div>
          <div style={{
            width: 60, height: 60, borderRadius: "50%",
            background: "#E8F0FA", flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: "#1B4F8A" }}>{pct}%</span>
          </div>
        </div>

        {/* Filtros por área */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          {([
            { key: "todos", label: "Todas as áreas", icon: "ti-layout-grid" },
            { key: "quem_sou_eu", label: "Quem Sou Eu", icon: "ti-user-search" },
            { key: "como_funciono", label: "Como Funciono", icon: "ti-brain" },
            { key: "para_onde_vou", label: "Para Onde Vou", icon: "ti-map-2" },
          ] as const).map((f) => {
            const active = filtro === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setFiltro(f.key as any)}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "7px 14px", borderRadius: 20, border: "1px solid",
                  borderColor: active ? "#1B4F8A" : "var(--border)",
                  background: active ? "#E8F0FA" : "var(--bg-card)",
                  color: active ? "#1B4F8A" : "var(--text-secondary)",
                  fontSize: 13, fontWeight: active ? 500 : 400,
                  cursor: "pointer", transition: "all .15s",
                }}
              >
                <i className={`ti ${f.icon}`} style={{ fontSize: 14 }} aria-hidden="true" />
                {f.label}
              </button>
            );
          })}
        </div>

        {/* Áreas e testes */}
        {areasVisiveis.map((areaKey) => {
          const config = AREA_CONFIG[areaKey];
          const testes = TESTES_POR_AREA[areaKey];
          const feitosNaArea = testes.filter((t) => testesFeitos.has(t.tipo)).length;

          return (
            <div key={areaKey} style={{ marginBottom: 28 }}>
              {/* Header da área */}
              <div style={{
                display: "flex", alignItems: "center", gap: 12,
                marginBottom: 14,
                paddingBottom: 12,
                borderBottom: `2px solid ${config.border}`,
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 9,
                  background: config.bg,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <i className={`ti ${config.icon}`} style={{ fontSize: 18, color: config.cor }} aria-hidden="true" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>
                      {LABELS_AREA[areaKey]}
                    </h2>
                    <span style={{
                      fontSize: 11, fontWeight: 500,
                      background: config.bg, color: config.cor,
                      padding: "2px 8px", borderRadius: 20,
                    }}>
                      {feitosNaArea}/{testes.length} feitos
                    </span>
                  </div>
                  <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                    {config.descricao}
                  </p>
                </div>
              </div>

              {/* Grid de testes */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: 10,
              }}>
                {testes.map((teste) => {
                  const feito = testesFeitos.has(teste.tipo);
                  return (
                    <TesteCard
                      key={teste.tipo}
                      tipo={teste.tipo}
                      nome={teste.nome}
                      descricao={teste.descricao}
                      duracao={teste.duracaoMinutos}
                      questoes={teste.totalQuestoes}
                      feito={feito}
                      cor={config.cor}
                      bg={config.bg}
                      loading={loading}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

// ── Cartão individual de teste ────────────────────────────────
interface TesteCardProps {
  tipo: TipoTeste;
  nome: string;
  descricao: string;
  duracao: number;
  questoes: number;
  feito: boolean;
  cor: string;
  bg: string;
  loading: boolean;
}

function TesteCard({ tipo, nome, descricao, duracao, questoes, feito, cor, bg, loading }: TesteCardProps) {
  return (
    <div style={{
      background: "var(--bg-card)",
      border: `1px solid ${feito ? cor + "40" : "var(--border)"}`,
      borderRadius: 10,
      padding: "14px 16px",
      display: "flex", flexDirection: "column", gap: 10,
      position: "relative", overflow: "hidden",
      transition: "border-color .15s, box-shadow .15s",
    }}>
      {/* Barra superior de cor */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 3,
        background: feito ? cor : "var(--border)",
        transition: "background .3s",
      }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ flex: 1, paddingRight: 8 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>
            {nome}
          </div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.5 }}>
            {descricao}
          </div>
        </div>
        {loading ? (
          <div className="skeleton" style={{ width: 22, height: 22, borderRadius: "50%" }} />
        ) : feito ? (
          <div style={{
            width: 24, height: 24, borderRadius: "50%",
            background: cor, flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <i className="ti ti-check" style={{ fontSize: 13, color: "#fff" }} aria-hidden="true" />
          </div>
        ) : (
          <div style={{
            width: 24, height: 24, borderRadius: "50%",
            border: "1.5px solid var(--border)", flexShrink: 0,
          }} />
        )}
      </div>

      {/* Meta-info */}
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <span style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
          <i className="ti ti-clock" style={{ fontSize: 12 }} aria-hidden="true" />
          {duracao} min
        </span>
        <span style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
          <i className="ti ti-list" style={{ fontSize: 12 }} aria-hidden="true" />
          {questoes} questões
        </span>
      </div>

      {/* Botão */}
      <Link href={`/avaliacoes/${tipo}`} style={{ textDecoration: "none" }}>
        <button style={{
          width: "100%", padding: "8px 0", borderRadius: 7,
          border: `1px solid ${feito ? cor + "50" : "var(--border)"}`,
          background: feito ? bg : "transparent",
          color: feito ? cor : "var(--text-secondary)",
          fontSize: 12, fontWeight: 500, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          transition: "all .15s",
        }}>
          <i className={`ti ${feito ? "ti-refresh" : "ti-player-play"}`} style={{ fontSize: 13 }} aria-hidden="true" />
          {feito ? "Refazer teste" : "Iniciar teste"}
        </button>
      </Link>
    </div>
  );
}
