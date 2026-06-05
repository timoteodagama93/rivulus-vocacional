"use client";
// ============================================================
// GAMA VOCACIONAL — Resultado do Teste
// /avaliacoes/[testeId]/resultado?id=xxx
// ============================================================
import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useAuth } from "@/lib/hooks/useAuth";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { CATALOGO_TESTES, LABELS_AREA } from "@/constants/testes";
import { DIMENSOES_TESTES, gerarQuestoesTeste } from "@/constants/questoesTestes";
import Link from "next/link";
import type { ResultadoTeste, TipoTeste } from "@/types";

// Interpreta o resultado de forma simplificada (antes da Netlify Function calcular)
function interpretarResultado(tipo: TipoTeste, respostas: { valor: number }[]): {
  dimensoes: { nome: string; pontuacao: number; nivel: "baixo" | "medio" | "alto" }[];
  resumo: string;
} {
  const media = respostas.reduce((s, r) => s + r.valor, 0) / Math.max(respostas.length, 1);
  const nivel = media >= 4 ? "alto" : media >= 3 ? "medio" : "baixo";

  const dimensoesPorTipo: Record<string, string[]> = {
    riasec: ["Realista", "Investigativo", "Artístico", "Social", "Empreendedor", "Convencional"],
    big_five: ["Abertura", "Conscienciosidade", "Extroversão", "Amabilidade", "Neuroticismo"],
    inteligencias_multiplas: ["Linguística", "Lógica-matemática", "Espacial", "Musical", "Corporal", "Interpessoal", "Intrapessoal", "Naturalista"],
    vak: ["Visual", "Auditivo", "Cinestésico"],
    default: ["Pontuação geral"],
  };

  const nomes = DIMENSOES_TESTES[tipo] ?? dimensoesPorTipo[tipo] ?? dimensoesPorTipo.default;
  const questoesReferencia = gerarQuestoesTeste(tipo, respostas.length);
  const chunkSize = Math.ceil(respostas.length / nomes.length);

  const dimensoes = nomes.map((nome, i) => {
    const respostasDaDimensao = respostas.filter((_, index) => (
      questoesReferencia[index]?.dimensao === nome
    ));
    const chunk = respostasDaDimensao.length
      ? respostasDaDimensao
      : respostas.slice(i * chunkSize, (i + 1) * chunkSize);
    const mediaChunk = chunk.length
      ? chunk.reduce((s, r) => s + r.valor, 0) / chunk.length
      : media;
    const pct = Math.round(((mediaChunk - 1) / 4) * 100);
    const n: "baixo" | "medio" | "alto" = pct >= 65 ? "alto" : pct >= 40 ? "medio" : "baixo";
    return { nome, pontuacao: pct, nivel: n };
  });

  const resumos: Record<string, Record<string, string>> = {
    riasec: {
      alto: "O teu perfil RIASEC mostra interesses vocacionais marcados. As tuas dimensões mais altas indicam as carreiras mais compatíveis contigo.",
      medio: "O teu perfil RIASEC apresenta interesses equilibrados entre diferentes áreas vocacionais.",
      baixo: "Ainda estás a desenvolver os teus interesses vocacionais. Explora diferentes áreas para descobrir o que mais te motiva.",
    },
    default: {
      alto: "Os teus resultados mostram pontuações elevadas. Consulta o teu orientador para uma interpretação detalhada.",
      medio: "Os teus resultados mostram pontuações equilibradas em diferentes dimensões.",
      baixo: "Os teus resultados indicam áreas com potencial de crescimento. Fala com o teu orientador.",
    },
  };

  const resumoTipo = resumos[tipo] ?? resumos.default;
  const resumo = resumoTipo[nivel];

  return { dimensoes, resumo };
}

export default function ResultadoPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const tipoTeste = params.testeId as TipoTeste;
  const resultadoId = searchParams.get("id");
  const infoTeste = CATALOGO_TESTES.find((t) => t.tipo === tipoTeste);

  const [resultado, setResultado] = useState<ResultadoTeste | null>(null);
  const [loading, setLoading] = useState(true);
  const [interpretacao, setInterpretacao] = useState<ReturnType<typeof interpretarResultado> | null>(null);

  useEffect(() => {
    if (!user || !resultadoId) return;
    async function load() {
      try {
        const snap = await getDoc(
          doc(db, COLLECTIONS.ESTUDANTES, user!.uid, "resultados", resultadoId!)
        );
        if (snap.exists()) {
          const raw = snap.data() as any;
          const data: ResultadoTeste = {
            id: snap.id,
            estudanteId: raw.estudanteId,
            testeId: raw.testeId,
            testeTipo: raw.testeTipo,
            testeArea: raw.testeArea,
            respostas: raw.respostas ?? [],
            dimensoes: raw.dimensoes ?? [],
            pontuacaoGeral: raw.pontuacaoGeral,
            percentilGeral: raw.percentilGeral,
            resumo: raw.resumo,
            concluido: raw.concluido,
            questoesRespondidas: raw.questoesRespondidas,
            totalQuestoes: raw.totalQuestoes,
            completadoEm: raw.completadoEm && raw.completadoEm.toDate ? raw.completadoEm.toDate() : raw.completadoEm,
            atualizadoEm: raw.atualizadoEm && raw.atualizadoEm.toDate ? raw.atualizadoEm.toDate() : raw.atualizadoEm,
            duracaoSegundos: raw.duracaoSegundos ?? 0,
            versaoTeste: raw.versaoTeste ?? 1,
          };
          setResultado(data);
          const interp = data.dimensoes?.length
            ? {
                dimensoes: data.dimensoes.map((dim) => ({
                  nome: dim.nome,
                  pontuacao: dim.pontuacao,
                  nivel: dim.nivel ?? (dim.pontuacao >= 65 ? "alto" as const : dim.pontuacao >= 40 ? "medio" as const : "baixo" as const),
                })),
                resumo: data.resumo ?? interpretarResultado(tipoTeste, data.respostas ?? []).resumo,
              }
            : interpretarResultado(tipoTeste, data.respostas ?? []);
          setInterpretacao(interp);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user, resultadoId, tipoTeste]);

  const areaCfg = {
    quem_sou_eu:   { cor: "#1B4F8A", bg: "#E8F0FA" },
    como_funciono: { cor: "#0F5E3F", bg: "#E6F4EE" },
    para_onde_vou: { cor: "#7B2D8B", bg: "#FAF5FF" },
  }[infoTeste?.area ?? "quem_sou_eu"] ?? { cor: "#1B4F8A", bg: "#E8F0FA" };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <i className="ti ti-loader" style={{ fontSize: 36, color: areaCfg.cor, display: "block", marginBottom: 12 }} aria-hidden="true" />
          <p style={{ fontSize: 13, color: "var(--text-muted)" }}>A processar resultados...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-page)" }}>
      {/* Header */}
      <div style={{
        background: "var(--bg-card)", borderBottom: "1px solid var(--border)",
        padding: "0 24px", height: 60,
        display: "flex", alignItems: "center", gap: 16,
        position: "sticky", top: 0, zIndex: 30,
      }}>
        <Link href="/avaliacoes" style={{ textDecoration: "none" }}>
          <button style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "none", border: "none", cursor: "pointer",
            color: "var(--text-muted)", fontSize: 13,
          }}>
            <i className="ti ti-arrow-left" style={{ fontSize: 16 }} aria-hidden="true" />
            Voltar às avaliações
          </button>
        </Link>
        <div style={{
          fontSize: 14, fontWeight: 600, color: "var(--text-primary)",
          flex: 1, textAlign: "center",
        }}>
          Resultado — {infoTeste?.nome}
        </div>
        <div style={{ width: 120 }} />
      </div>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "32px 24px" }}>

        {/* Celebração */}
        <div style={{
          background: `linear-gradient(135deg, ${areaCfg.cor}15, ${areaCfg.cor}05)`,
          border: `1px solid ${areaCfg.cor}30`,
          borderRadius: 16, padding: "28px 28px 24px",
          textAlign: "center", marginBottom: 24,
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: "50%",
            background: areaCfg.cor,
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 14px",
          }}>
            <i className="ti ti-trophy" style={{ fontSize: 26, color: "#fff" }} aria-hidden="true" />
          </div>
          <h1 style={{
            fontSize: 20, fontWeight: 700, color: "var(--text-primary)", marginBottom: 6,
          }}>
            Avaliação concluída!
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6 }}>
            Completaste a avaliação <strong>{infoTeste?.nome}</strong>.
            {resultado && (
              <> Respondeste a {resultado.respostas?.length ?? 0} questões em{" "}
              {Math.round((resultado.duracaoSegundos ?? 0) / 60)} minutos.</>
            )}
          </p>
          {infoTeste && (
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              marginTop: 12, fontSize: 11, fontWeight: 500,
              background: areaCfg.bg, color: areaCfg.cor,
              padding: "4px 12px", borderRadius: 20,
            }}>
              <i className="ti ti-map" style={{ fontSize: 12 }} aria-hidden="true" />
              {LABELS_AREA[infoTeste.area]}
            </div>
          )}
        </div>

        {/* Resultados por dimensão */}
        {interpretacao && (
          <div style={{
            background: "var(--bg-card)", border: "1px solid var(--border)",
            borderRadius: 14, padding: "20px 20px 16px", marginBottom: 16,
          }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", marginBottom: 16 }}>
              Resultados por dimensão
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {interpretacao.dimensoes.map((dim) => {
                const nivelCor = dim.nivel === "alto"
                  ? { cor: "#0F5E3F", bg: "#E6F4EE" }
                  : dim.nivel === "medio"
                  ? { cor: "#BA7517", bg: "#FAEEDA" }
                  : { cor: "#5F5E5A", bg: "#F1EFE8" };
                return (
                  <div key={dim.nome}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <span style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 500 }}>
                        {dim.nome}
                      </span>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: areaCfg.cor }}>
                          {dim.pontuacao}%
                        </span>
                        <span style={{
                          fontSize: 10, fontWeight: 500,
                          background: nivelCor.bg, color: nivelCor.cor,
                          padding: "1px 7px", borderRadius: 20,
                        }}>
                          {dim.nivel === "alto" ? "Alto" : dim.nivel === "medio" ? "Médio" : "Baixo"}
                        </span>
                      </div>
                    </div>
                    <div style={{
                      height: 6, background: "var(--border)", borderRadius: 99, overflow: "hidden",
                    }}>
                      <div style={{
                        height: "100%", width: `${dim.pontuacao}%`,
                        background: areaCfg.cor, borderRadius: 99,
                        transition: "width .6s ease",
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Resumo interpretativo */}
        {interpretacao && (
          <div style={{
            background: "var(--bg-card)", border: "1px solid var(--border)",
            borderRadius: 14, padding: "18px 20px", marginBottom: 16,
          }}>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: areaCfg.bg, flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <i className="ti ti-bulb" style={{ fontSize: 16, color: areaCfg.cor }} aria-hidden="true" />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>
                  Interpretação inicial
                </div>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                  {interpretacao.resumo}
                </p>
                <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>
                  Para uma interpretação completa, consulta a IA Conselheira ou solicita um relatório detalhado.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Próximos passos */}
        <div style={{
          background: "var(--bg-card)", border: "1px solid var(--border)",
          borderRadius: 14, padding: "18px 20px", marginBottom: 24,
        }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", marginBottom: 12 }}>
            O que fazer a seguir?
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              {
                href: "/ia-conselheira",
                icon: "ti-message-circle", label: "Falar com a IA Conselheira",
                desc: "Pede uma interpretação detalhada dos teus resultados",
                cor: "#7B2D8B", bg: "#FAF5FF",
              },
              {
                href: "/avaliacoes",
                icon: "ti-clipboard-list", label: "Continuar avaliações",
                desc: "Completa os restantes testes para um perfil mais completo",
                cor: "#1B4F8A", bg: "#E8F0FA",
              },
              {
                href: "/perfil",
                icon: "ti-user-circle", label: "Ver o meu perfil",
                desc: "Consulta o teu perfil vocacional actualizado",
                cor: "#0F5E3F", bg: "#E6F4EE",
              },
            ].map((item) => (
              <Link key={item.href} href={item.href} style={{ textDecoration: "none" }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "10px 12px", borderRadius: 9,
                  border: "1px solid var(--border)",
                  cursor: "pointer", transition: "border-color .15s",
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: item.bg, flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <i className={`ti ${item.icon}`} style={{ fontSize: 15, color: item.cor }} aria-hidden="true" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>
                      {item.label}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{item.desc}</div>
                  </div>
                  <i className="ti ti-chevron-right" style={{ fontSize: 14, color: "var(--border-strong)" }} aria-hidden="true" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
