"use client";

import { useEffect, useMemo, useState } from "react";
import {
  addDoc,
  collection,
  getDocs,
  limit,
  query,
  serverTimestamp,
} from "firebase/firestore";
import PageHeader from "@/components/layout/PageHeader";
import { CATALOGO_TESTES, TOTAL_TESTES } from "@/constants/testes";
import { TIPOS_RELATORIO, getInfoTipoRelatorio } from "@/constants/relatorios";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { db } from "@/lib/firebase/config";
import { avaliarElegibilidadeRelatorio } from "@/lib/relatorios/elegibilidade";
import { useAuth } from "@/lib/hooks/useAuth";
import type { ResultadoDimensao, TipoRelatorio, TipoTeste } from "@/types";

interface AlunoAdmin {
  id: string;
  nome?: string;
  email?: string;
  escola?: string;
  classe?: string;
}

interface ResultadoAdmin {
  id: string;
  estudanteId?: string;
  testeId?: string;
  testeTipo?: TipoTeste;
  testeArea?: string;
  dimensoes?: ResultadoDimensao[];
  pontuacaoGeral?: number;
  resumo?: string;
  concluido?: boolean;
  questoesRespondidas?: number;
  totalQuestoes?: number;
  completadoEm?: unknown;
}

const AREA_COLORS = {
  quem_sou_eu: { cor: "#1B4F8A", bg: "#E8F0FA" },
  como_funciono: { cor: "#0F5E3F", bg: "#E6F4EE" },
  para_onde_vou: { cor: "#7B2D8B", bg: "#FAF5FF" },
} as const;

function nomeTeste(tipo?: TipoTeste) {
  return CATALOGO_TESTES.find((teste) => teste.tipo === tipo)?.nome ?? tipo ?? "Teste";
}

function formatPct(valor?: number) {
  if (typeof valor !== "number" || Number.isNaN(valor)) return "-";
  return `${Math.round(valor)}%`;
}

function obterTopDimensoes(resultados: ResultadoAdmin[]) {
  return resultados
    .flatMap((resultado) =>
      (resultado.dimensoes ?? []).map((dimensao) => ({
        ...dimensao,
        teste: nomeTeste(resultado.testeTipo),
      }))
    )
    .sort((a, b) => (b.pontuacao ?? 0) - (a.pontuacao ?? 0))
    .slice(0, 6);
}

export default function AdminRelatoriosPage() {
  const { user } = useAuth();
  const [alunos, setAlunos] = useState<AlunoAdmin[]>([]);
  const [alunoId, setAlunoId] = useState("");
  const [tipoRelatorio, setTipoRelatorio] =
    useState<TipoRelatorio>("parcial_simples");
  const [resultados, setResultados] = useState<ResultadoAdmin[]>([]);
  const [loadingAlunos, setLoadingAlunos] = useState(true);
  const [loadingResultados, setLoadingResultados] = useState(false);
  const [gerando, setGerando] = useState(false);
  const [erro, setErro] = useState("");
  const [relatorioGeradoId, setRelatorioGeradoId] = useState("");

  useEffect(() => {
    async function loadAlunos() {
      try {
        const snap = await getDocs(
          query(collection(db, COLLECTIONS.ESTUDANTES), limit(80))
        );
        const lista = snap.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        })) as AlunoAdmin[];
        lista.sort((a, b) => (a.nome ?? "").localeCompare(b.nome ?? ""));
        setAlunos(lista);
        if (!alunoId && lista.length > 0) {
          setAlunoId(lista[0].id);
        }
      } catch (err) {
        console.error("Erro ao carregar alunos:", err);
        setErro("Nao foi possivel carregar a lista de alunos.");
      } finally {
        setLoadingAlunos(false);
      }
    }
    loadAlunos();
  }, [alunoId]);

  useEffect(() => {
    if (!alunoId) {
      setResultados([]);
      return;
    }

    async function loadResultados() {
      setLoadingResultados(true);
      setErro("");
      setRelatorioGeradoId("");
      try {
        const snap = await getDocs(
          collection(db, COLLECTIONS.ESTUDANTES, alunoId, "resultados")
        );
        setResultados(
          snap.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          })) as ResultadoAdmin[]
        );
      } catch (err) {
        console.error("Erro ao carregar resultados:", err);
        setErro("Nao foi possivel carregar os resultados deste aluno.");
      } finally {
        setLoadingResultados(false);
      }
    }

    loadResultados();
  }, [alunoId]);

  const alunoSelecionado = alunos.find((aluno) => aluno.id === alunoId);
  const infoRelatorio = getInfoTipoRelatorio(tipoRelatorio);
  const elegibilidade = useMemo(
    () => avaliarElegibilidadeRelatorio(tipoRelatorio, resultados),
    [tipoRelatorio, resultados]
  );
  const topDimensoes = useMemo(() => obterTopDimensoes(resultados), [resultados]);
  const resultadosCompletos = resultados.filter((resultado) =>
    elegibilidade.completos.includes(resultado.testeTipo as TipoTeste)
  );

  const gerarRelatorio = async () => {
    if (!alunoSelecionado || !elegibilidade.elegivel || gerando) return;

    setGerando(true);
    setErro("");
    setRelatorioGeradoId("");

    try {
      const testesIncluidos = resultadosCompletos.map((resultado) => ({
        resultadoId: resultado.id,
        testeTipo: resultado.testeTipo ?? resultado.testeId,
        testeNome: nomeTeste(resultado.testeTipo),
        testeArea: resultado.testeArea,
        pontuacaoGeral: resultado.pontuacaoGeral ?? null,
      }));

      const topDimensoesTexto = topDimensoes
        .map((dimensao) => `${dimensao.nome} (${dimensao.teste})`)
        .join(", ");

      const relatorioRef = await addDoc(collection(db, COLLECTIONS.RELATORIOS), {
        estudanteId: alunoSelecionado.id,
        tipo: tipoRelatorio,
        estado: "rascunho",
        titulo: `${infoRelatorio.nome} - ${alunoSelecionado.nome ?? "Aluno"}`,
        perfilIntegrado:
          topDimensoesTexto.length > 0
            ? `Sintese automatica baseada em ${resultadosCompletos.length} testes completos. Dimensoes em destaque: ${topDimensoesTexto}.`
            : `Sintese automatica baseada em ${resultadosCompletos.length} testes completos.`,
        interpretacoes:
          "Relatorio gerado a partir dos resultados ja guardados em Firestore. Deve ser revisto por um orientador antes de publicacao.",
        recomendacoes:
          "Validar as dimensoes predominantes, cruzar com objectivos do aluno e preparar proximos passos academicos ou profissionais.",
        parecerIA: "",
        parecerOrientador: "",
        geradoEm: serverTimestamp(),
        atualizadoEm: serverTimestamp(),
        geradoPor: "sistema",
        criadoPorAdminId: user?.uid ?? null,
        totalTestesCompletos: elegibilidade.totalCompletos,
        totalTestesExigidos: elegibilidade.totalExigido,
        completude: Math.round((elegibilidade.totalCompletos / TOTAL_TESTES) * 100),
        testesIncluidos,
        testesFaltantes: elegibilidade.faltantes,
      });

      setRelatorioGeradoId(relatorioRef.id);
    } catch (err) {
      console.error("Erro ao gerar relatorio:", err);
      setErro("Nao foi possivel gerar o relatorio.");
    } finally {
      setGerando(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Relatorios"
        subtitle="Geracao administrativa com regras de elegibilidade por tipo."
      />

      <div className="page-body">
        {erro && (
          <div style={alertStyle("#FEF3C7", "#FCD34D", "#92400E")}>
            <i className="ti ti-alert-triangle" aria-hidden="true" />
            <span>{erro}</span>
          </div>
        )}

        {relatorioGeradoId && (
          <div style={alertStyle("#E6F4EE", "#C0DD97", "#0F5E3F")}>
            <i className="ti ti-circle-check" aria-hidden="true" />
            <span>Relatorio gerado como rascunho: {relatorioGeradoId}</span>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: 16 }}>
          <section style={panelStyle}>
            <h2 style={sectionTitleStyle}>Gerar relatorio</h2>

            <label style={labelStyle} htmlFor="aluno">
              Aluno
            </label>
            <select
              id="aluno"
              value={alunoId}
              onChange={(event) => setAlunoId(event.target.value)}
              disabled={loadingAlunos}
              style={inputStyle}
            >
              {loadingAlunos ? (
                <option>A carregar alunos...</option>
              ) : alunos.length === 0 ? (
                <option>Nenhum aluno encontrado</option>
              ) : (
                alunos.map((aluno) => (
                  <option key={aluno.id} value={aluno.id}>
                    {aluno.nome ?? aluno.email ?? aluno.id}
                  </option>
                ))
              )}
            </select>

            <label style={{ ...labelStyle, marginTop: 14 }} htmlFor="tipo">
              Tipo de relatorio
            </label>
            <select
              id="tipo"
              value={tipoRelatorio}
              onChange={(event) =>
                setTipoRelatorio(event.target.value as TipoRelatorio)
              }
              style={inputStyle}
            >
              {TIPOS_RELATORIO.map((tipo) => (
                <option key={tipo.tipo} value={tipo.tipo}>
                  {tipo.nome}
                </option>
              ))}
            </select>

            <div style={{ ...mutedBoxStyle, marginTop: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                Regra aplicada
              </div>
              <p style={{ fontSize: 12, lineHeight: 1.5 }}>
                {infoRelatorio.descricao}
              </p>
              <p style={{ fontSize: 12, lineHeight: 1.5, marginTop: 6 }}>
                {elegibilidade.motivo}
              </p>
            </div>

            <button
              onClick={gerarRelatorio}
              disabled={!elegibilidade.elegivel || loadingResultados || gerando}
              className="btn btn-primary"
              style={{
                width: "100%",
                marginTop: 16,
                justifyContent: "center",
                opacity: !elegibilidade.elegivel || loadingResultados ? 0.55 : 1,
              }}
            >
              <i
                className={`ti ${gerando ? "ti-loader" : "ti-file-plus"}`}
                aria-hidden="true"
              />
              {gerando ? "A gerar..." : "Gerar rascunho"}
            </button>
          </section>

          <section style={panelStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <div>
                <h2 style={sectionTitleStyle}>
                  {alunoSelecionado?.nome ?? "Aluno seleccionado"}
                </h2>
                <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
                  {alunoSelecionado?.escola ?? "Escola nao informada"}
                  {alunoSelecionado?.classe ? ` - ${alunoSelecionado.classe}` : ""}
                </p>
              </div>
              <StatusBadge elegivel={elegibilidade.elegivel} />
            </div>

            <div style={statsGridStyle}>
              <MetricCard
                label="Testes completos"
                value={`${elegibilidade.totalCompletos}/${TOTAL_TESTES}`}
              />
              <MetricCard
                label="Exigidos"
                value={`${elegibilidade.totalExigido}`}
              />
              <MetricCard
                label="Completude"
                value={`${Math.round((elegibilidade.totalCompletos / TOTAL_TESTES) * 100)}%`}
              />
            </div>

            {loadingResultados ? (
              <div style={{ padding: 32, textAlign: "center", color: "var(--text-muted)" }}>
                <i className="ti ti-loader" style={{ fontSize: 28 }} aria-hidden="true" />
                <p style={{ fontSize: 13, marginTop: 8 }}>A carregar resultados...</p>
              </div>
            ) : (
              <>
                <h3 style={subTitleStyle}>Cobertura por teste</h3>
                <div style={testGridStyle}>
                  {CATALOGO_TESTES.map((teste) => {
                    const completo = elegibilidade.completos.includes(teste.tipo);
                    const colors = AREA_COLORS[teste.area];
                    return (
                      <div
                        key={teste.tipo}
                        style={{
                          ...testPillStyle,
                          borderColor: completo ? `${colors.cor}55` : "var(--border)",
                          background: completo ? colors.bg : "var(--bg-page)",
                        }}
                      >
                        <i
                          className={`ti ${completo ? "ti-check" : "ti-minus"}`}
                          style={{ color: completo ? colors.cor : "var(--text-muted)" }}
                          aria-hidden="true"
                        />
                        <span>{teste.nome}</span>
                      </div>
                    );
                  })}
                </div>

                <h3 style={subTitleStyle}>Dimensoes em destaque</h3>
                {topDimensoes.length === 0 ? (
                  <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
                    Ainda nao ha dimensoes suficientes para uma sintese automatica.
                  </p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {topDimensoes.map((dimensao) => (
                      <div key={`${dimensao.teste}-${dimensao.nome}`} style={dimensionRowStyle}>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 600 }}>
                            {dimensao.nome}
                          </div>
                          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                            {dimensao.teste}
                          </div>
                        </div>
                        <strong style={{ fontSize: 13 }}>
                          {formatPct(dimensao.pontuacao)}
                        </strong>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </div>
    </>
  );
}

function StatusBadge({ elegivel }: { elegivel: boolean }) {
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 600,
        padding: "4px 10px",
        borderRadius: 999,
        color: elegivel ? "#0F5E3F" : "#92400E",
        background: elegivel ? "#E6F4EE" : "#FEF3C7",
        alignSelf: "flex-start",
      }}
    >
      {elegivel ? "Elegivel" : "Bloqueado"}
    </span>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div style={metricCardStyle}>
      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)" }}>
        {value}
      </div>
    </div>
  );
}

function alertStyle(bg: string, border: string, color: string): React.CSSProperties {
  return {
    background: bg,
    border: `1px solid ${border}`,
    color,
    borderRadius: 10,
    padding: "12px 14px",
    marginBottom: 14,
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 13,
  };
}

const panelStyle: React.CSSProperties = {
  background: "var(--bg-card)",
  border: "1px solid var(--border)",
  borderRadius: 12,
  padding: 18,
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: 15,
  fontWeight: 700,
  color: "var(--text-primary)",
};

const subTitleStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 700,
  color: "var(--text-primary)",
  marginTop: 18,
  marginBottom: 10,
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 12,
  fontWeight: 600,
  color: "var(--text-secondary)",
  marginTop: 18,
  marginBottom: 6,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  height: 38,
  border: "1px solid var(--border)",
  borderRadius: 8,
  background: "var(--bg-card)",
  color: "var(--text-primary)",
  padding: "0 10px",
  fontSize: 13,
};

const mutedBoxStyle: React.CSSProperties = {
  background: "var(--bg-page)",
  border: "1px solid var(--border)",
  borderRadius: 10,
  padding: 12,
  color: "var(--text-secondary)",
};

const statsGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: 10,
  marginTop: 16,
};

const metricCardStyle: React.CSSProperties = {
  background: "var(--bg-page)",
  border: "1px solid var(--border)",
  borderRadius: 10,
  padding: 12,
};

const testGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
  gap: 8,
};

const testPillStyle: React.CSSProperties = {
  border: "1px solid var(--border)",
  borderRadius: 8,
  padding: "8px 10px",
  display: "flex",
  alignItems: "center",
  gap: 8,
  fontSize: 12,
  color: "var(--text-primary)",
};

const dimensionRowStyle: React.CSSProperties = {
  border: "1px solid var(--border)",
  borderRadius: 8,
  padding: "9px 10px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 10,
};
