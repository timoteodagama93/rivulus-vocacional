"use client";
// ============================================================
// GAMA VOCACIONAL — Player de Testes
// /avaliacoes/[testeId]
// ============================================================
import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, collection, addDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useAuth } from "@/lib/hooks/useAuth";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { CATALOGO_TESTES, LABELS_AREA } from "@/constants/testes";
import { gerarQuestoesTeste } from "@/constants/questoesTestes";
import { calcularResultadoTeste } from "@/lib/avaliacoes/calcularResultadoTeste";
import type { Teste, Questao, RespostaQuestao, TipoTeste } from "@/types";

// ── Dados de demonstração (enquanto não há testes reais no Firestore) ──
function gerarQuestoesDemo(tipo: TipoTeste, total: number): Questao[] {
  const questoesBase: Record<string, string[]> = {
    riasec: [
      "Prefiro trabalhar com ferramentas e máquinas a trabalhar com pessoas.",
      "Gosto de resolver problemas complexos e investigar fenómenos.",
      "Aprecio actividades criativas como pintura, música ou escrita.",
      "Sinto satisfação ao ajudar outras pessoas a resolver os seus problemas.",
      "Gosto de liderar grupos e convencer outras pessoas.",
      "Prefiro seguir procedimentos claros e organizar informação.",
    ],
    big_five: [
      "Considero-me uma pessoa aberta a novas experiências.",
      "Sou organizado e cumpro sempre os meus compromissos.",
      "Sinto-me energizado quando estou rodeado de pessoas.",
      "Preocupo-me facilmente com o que pode correr mal.",
      "Gosto de ajudar os outros mesmo quando não me pedem.",
    ],
    default: [
      "Consigo manter a calma em situações de pressão.",
      "Planejo as minhas acções antes de as executar.",
      "Adapto-me facilmente a novas situações.",
      "Procuro sempre aprender algo novo todos os dias.",
      "Sei comunicar as minhas ideias com clareza.",
    ],
  };

  const textos = questoesBase[tipo] ?? questoesBase.default;

  return Array.from({ length: Math.min(total, 8) }, (_, i) => ({
    id: `q${i + 1}`,
    texto: textos[i % textos.length],
    tipo: "escala_likert" as const,
    opcoes: [
      { valor: 1, texto: "Discordo totalmente" },
      { valor: 2, texto: "Discordo" },
      { valor: 3, texto: "Neutro" },
      { valor: 4, texto: "Concordo" },
      { valor: 5, texto: "Concordo totalmente" },
    ],
    ordem: i + 1,
  }));
}

export default function TestePlayerPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const tipoTeste = params.testeId as TipoTeste;
  const infoTeste = CATALOGO_TESTES.find((t) => t.tipo === tipoTeste);

  const [questoes, setQuestoes] = useState<Questao[]>([]);
  const [respostas, setRespostas] = useState<Record<string, number>>({});
  const [questaoAtual, setQuestaoAtual] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [iniciouEm] = useState(Date.now());

  useEffect(() => {
    if (!tipoTeste || !infoTeste) return;
    const totalQuestoes = infoTeste.totalQuestoes;
    async function load() {
      try {
        // Tenta buscar do Firestore; usa demo se não existir
        const testeRef = doc(db, COLLECTIONS.TESTES, tipoTeste);
        const testeSnap = await getDoc(testeRef);
        if (testeSnap.exists()) {
          const data = testeSnap.data() as Teste;
          setQuestoes(data.questoes.sort((a, b) => a.ordem - b.ordem));
        } else {
          setQuestoes(gerarQuestoesTeste(tipoTeste, totalQuestoes));
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [tipoTeste, infoTeste]);

  const responder = useCallback((questaoId: string, valor: number) => {
    setRespostas((prev) => ({ ...prev, [questaoId]: valor }));
  }, []);

  const avancar = useCallback(() => {
    if (questaoAtual < questoes.length - 1) {
      setQuestaoAtual((q) => q + 1);
    }
  }, [questaoAtual, questoes.length]);

  const recuar = useCallback(() => {
    if (questaoAtual > 0) setQuestaoAtual((q) => q - 1);
  }, [questaoAtual]);

  const submeter = async () => {
    if (!user || submitting || !infoTeste || !todasRespondidas) return;
    setSubmitting(true);
    try {
      const respostasArray: RespostaQuestao[] = questoes.map((q) => ({
        questaoId: q.id,
        valor: respostas[q.id] ?? 0,
      }));

      const duracaoSegundos = Math.round((Date.now() - iniciouEm) / 1000);
      const resultadoCalculado = calcularResultadoTeste(tipoTeste, questoes, respostasArray);

      // Salva o resultado
      const resultadoRef = await addDoc(
        collection(db, COLLECTIONS.ESTUDANTES, user.uid, "resultados"),
        {
          estudanteId: user.uid,
          testeId: tipoTeste,
          testeTipo: tipoTeste,
          testeArea: infoTeste.area,
          respostas: respostasArray,
          dimensoes: resultadoCalculado.dimensoes,
          pontuacaoGeral: resultadoCalculado.pontuacaoGeral,
          percentilGeral: resultadoCalculado.percentilGeral,
          resumo: resultadoCalculado.resumo,
          concluido: true,
          questoesRespondidas: respostasArray.length,
          totalQuestoes: questoes.length,
          completadoEm: serverTimestamp(),
          atualizadoEm: serverTimestamp(),
          duracaoSegundos,
          versaoTeste: 1,
        }
      );

      // Escreve o `id` no documento para facilitar leituras posteriores
      try {
        await setDoc(
          doc(db, COLLECTIONS.ESTUDANTES, user.uid, "resultados", resultadoRef.id),
          { id: resultadoRef.id },
          { merge: true }
        );
      } catch (e) {
        console.warn("Não foi possível anexar id ao resultado:", e);
      }

      await setDoc(
        doc(db, COLLECTIONS.ESTUDANTES, user.uid),
        {
          testesConcluidos: {
            [tipoTeste]: {
              resultadoId: resultadoRef.id,
              testeTipo: tipoTeste,
              testeArea: infoTeste.area,
              concluido: true,
              totalQuestoes: questoes.length,
              questoesRespondidas: respostasArray.length,
              pontuacaoGeral: resultadoCalculado.pontuacaoGeral,
              completadoEm: serverTimestamp(),
            },
          },
          atualizadoEm: serverTimestamp(),
        },
        { merge: true }
      );

      router.push(`/avaliacoes/${tipoTeste}/resultado?id=${resultadoRef.id}`);
    } catch (err) {
      console.error("Erro ao submeter:", err);
      setSubmitting(false);
    }
  };

  if (!infoTeste) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <p style={{ color: "var(--text-muted)" }}>Teste não encontrado.</p>
      </div>
    );
  }

  const questaoActual = questoes[questaoAtual];
  const totalRespondidas = Object.keys(respostas).length;
  const pctProgress = questoes.length > 0 ? ((questaoAtual + 1) / questoes.length) * 100 : 0;
  const todasRespondidas = questoes.every((q) => respostas[q.id] !== undefined);
  const estaUltima = questaoAtual === questoes.length - 1;

  const areaCfg = {
    quem_sou_eu:   { cor: "#1B4F8A", bg: "#E8F0FA" },
    como_funciono: { cor: "#0F5E3F", bg: "#E6F4EE" },
    para_onde_vou: { cor: "#7B2D8B", bg: "#FAF5FF" },
  }[infoTeste.area] ?? { cor: "#1B4F8A", bg: "#E8F0FA" };

  return (
    <div style={{
      minHeight: "100vh", background: "var(--bg-page)",
      display: "flex", flexDirection: "column",
    }}>
      {/* Header do player */}
      <div style={{
        background: "var(--bg-card)", borderBottom: "1px solid var(--border)",
        padding: "0 24px", height: 60,
        display: "flex", alignItems: "center", gap: 16,
        position: "sticky", top: 0, zIndex: 30,
      }}>
        <button
          onClick={() => router.push("/avaliacoes")}
          style={{
            background: "none", border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", gap: 6,
            color: "var(--text-muted)", fontSize: 13, padding: "4px 0",
          }}
        >
          <i className="ti ti-arrow-left" style={{ fontSize: 16 }} aria-hidden="true" />
          Voltar
        </button>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>
            {infoTeste.nome}
          </div>
          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
            {LABELS_AREA[infoTeste.area]} · {infoTeste.duracaoMinutos} min
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
            {questaoAtual + 1} / {questoes.length}
          </span>
          <span style={{
            fontSize: 11, fontWeight: 500,
            background: areaCfg.bg, color: areaCfg.cor,
            padding: "2px 10px", borderRadius: 20,
          }}>
            {totalRespondidas} respondidas
          </span>
        </div>
      </div>

      {/* Barra de progresso */}
      <div style={{ height: 3, background: "var(--border)" }}>
        <div style={{
          height: "100%", width: `${pctProgress}%`,
          background: areaCfg.cor, transition: "width .3s ease",
        }} />
      </div>

      {loading ? (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center" }}>
            <i className="ti ti-loader" style={{
              fontSize: 32, color: areaCfg.cor, display: "block", marginBottom: 12,
            }} aria-hidden="true" />
            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>A carregar avaliação...</p>
          </div>
        </div>
      ) : (
        <div style={{
          flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
          padding: "32px 24px",
        }}>
          <div style={{ width: "100%", maxWidth: 620 }}>

            {/* Indicador de questão */}
            <div style={{ display: "flex", gap: 4, marginBottom: 24, flexWrap: "wrap" }}>
              {questoes.map((q, i) => (
                <button
                  key={q.id}
                  onClick={() => setQuestaoAtual(i)}
                  style={{
                    width: 28, height: 6, borderRadius: 99, border: "none",
                    cursor: "pointer", transition: "background .2s",
                    background: i === questaoAtual
                      ? areaCfg.cor
                      : respostas[q.id] !== undefined
                      ? areaCfg.cor + "60"
                      : "var(--border)",
                  }}
                  aria-label={`Questão ${i + 1}`}
                />
              ))}
            </div>

            {/* Card da questão */}
            {questaoActual && (
              <div style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: 14, padding: "28px 28px 24px",
              }}>
                <div style={{
                  fontSize: 11, fontWeight: 600, letterSpacing: ".08em",
                  color: areaCfg.cor, textTransform: "uppercase", marginBottom: 16,
                }}>
                  Questão {questaoAtual + 1}
                </div>

                <p style={{
                  fontSize: 17, fontWeight: 500, color: "var(--text-primary)",
                  lineHeight: 1.55, marginBottom: 28,
                }}>
                  {questaoActual.texto}
                </p>

                {/* Opções Likert */}
                {questaoActual.tipo === "escala_likert" && questaoActual.opcoes && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {questaoActual.opcoes.map((opcao) => {
                      const selected = respostas[questaoActual.id] === opcao.valor;
                      return (
                        <button
                          key={opcao.valor}
                          onClick={() => {
                            responder(questaoActual.id, opcao.valor);
                            // avança automaticamente após breve delay
                            setTimeout(() => {
                              if (questaoAtual < questoes.length - 1) {
                                setQuestaoAtual((q) => q + 1);
                              }
                            }, 300);
                          }}
                          style={{
                            width: "100%", padding: "12px 16px",
                            border: `1.5px solid ${selected ? areaCfg.cor : "var(--border)"}`,
                            borderRadius: 9,
                            background: selected ? areaCfg.bg : "transparent",
                            cursor: "pointer", textAlign: "left",
                            display: "flex", alignItems: "center", gap: 12,
                            transition: "all .15s",
                          }}
                        >
                          <div style={{
                            width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
                            border: `1.5px solid ${selected ? areaCfg.cor : "var(--border-strong)"}`,
                            background: selected ? areaCfg.cor : "transparent",
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}>
                            {selected && (
                              <div style={{
                                width: 8, height: 8, borderRadius: "50%", background: "#fff",
                              }} />
                            )}
                          </div>
                          <span style={{
                            fontSize: 14,
                            fontWeight: selected ? 500 : 400,
                            color: selected ? areaCfg.cor : "var(--text-primary)",
                          }}>
                            {opcao.texto}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Opções escolha múltipla */}
                {questaoActual.tipo === "escolha_multipla" && questaoActual.opcoes && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {questaoActual.opcoes.map((opcao) => {
                      const selected = respostas[questaoActual.id] === opcao.valor;
                      return (
                        <button
                          key={opcao.valor}
                          onClick={() => responder(questaoActual.id, opcao.valor)}
                          style={{
                            padding: "12px 14px",
                            border: `1.5px solid ${selected ? areaCfg.cor : "var(--border)"}`,
                            borderRadius: 9,
                            background: selected ? areaCfg.bg : "transparent",
                            cursor: "pointer", textAlign: "center",
                            fontSize: 13, fontWeight: selected ? 500 : 400,
                            color: selected ? areaCfg.cor : "var(--text-primary)",
                            transition: "all .15s",
                          }}
                        >
                          {opcao.texto}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Navegação */}
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              marginTop: 16,
            }}>
              <button
                onClick={recuar}
                disabled={questaoAtual === 0}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "8px 16px", borderRadius: 8,
                  border: "1px solid var(--border)", background: "var(--bg-card)",
                  color: "var(--text-secondary)", fontSize: 13, cursor: "pointer",
                  opacity: questaoAtual === 0 ? 0.4 : 1,
                  transition: "opacity .15s",
                }}
              >
                <i className="ti ti-arrow-left" style={{ fontSize: 14 }} aria-hidden="true" />
                Anterior
              </button>

              {estaUltima ? (
                <button
                  onClick={submeter}
                  disabled={!todasRespondidas || submitting}
                  style={{
                    display: "flex", alignItems: "center", gap: 7,
                    padding: "10px 22px", borderRadius: 8,
                    border: "none",
                    background: todasRespondidas && !submitting ? areaCfg.cor : "var(--border)",
                    color: todasRespondidas && !submitting ? "#fff" : "var(--text-muted)",
                    fontSize: 13, fontWeight: 500, cursor: "pointer",
                    transition: "all .2s",
                  }}
                >
                  <i className={`ti ${submitting ? "ti-loader" : "ti-check"}`} style={{ fontSize: 14 }} aria-hidden="true" />
                  {submitting ? "A submeter..." : "Concluir avaliação"}
                </button>
              ) : (
                <button
                  onClick={avancar}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "8px 16px", borderRadius: 8,
                    border: `1px solid ${areaCfg.cor}`,
                    background: respostas[questaoActual?.id] !== undefined ? areaCfg.cor : "transparent",
                    color: respostas[questaoActual?.id] !== undefined ? "#fff" : areaCfg.cor,
                    fontSize: 13, fontWeight: 500, cursor: "pointer",
                    transition: "all .15s",
                  }}
                >
                  Próxima
                  <i className="ti ti-arrow-right" style={{ fontSize: 14 }} aria-hidden="true" />
                </button>
              )}
            </div>

            {/* Aviso se não respondeu tudo */}
            {estaUltima && !todasRespondidas && (
              <div style={{
                marginTop: 12, padding: "10px 14px",
                background: "#FEF3C7", borderRadius: 8,
                fontSize: 12, color: "#92400E",
                display: "flex", alignItems: "center", gap: 8,
              }}>
                <i className="ti ti-alert-triangle" style={{ fontSize: 14 }} aria-hidden="true" />
                Ainda tens {questoes.length - totalRespondidas} questão(ões) por responder.
                Podes navegar pelos indicadores acima.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
