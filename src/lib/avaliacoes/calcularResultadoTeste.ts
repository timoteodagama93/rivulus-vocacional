import type { Questao, RespostaQuestao, ResultadoDimensao, TipoTeste } from "@/types";

type ResultadoCalculado = {
  dimensoes: ResultadoDimensao[];
  pontuacaoGeral: number;
  percentilGeral: number;
  resumo: string;
};

const nivelPorPontuacao = (pontuacao: number): "baixo" | "medio" | "alto" => {
  if (pontuacao >= 65) return "alto";
  if (pontuacao >= 40) return "medio";
  return "baixo";
};

const normalizarValor = (valor: number, inversa?: boolean) => {
  const valorSeguro = Math.min(Math.max(valor, 1), 5);
  return inversa ? 6 - valorSeguro : valorSeguro;
};

const valorParaPercentual = (valorMedio: number) =>
  Math.round(((valorMedio - 1) / 4) * 100);

const resumosPorTipo: Partial<Record<TipoTeste, Record<"baixo" | "medio" | "alto", string>>> = {
  riasec: {
    alto: "O teu perfil RIASEC mostra interesses vocacionais marcados. As dimensões mais altas indicam ambientes de estudo e trabalho com maior compatibilidade.",
    medio: "O teu perfil RIASEC apresenta interesses equilibrados entre diferentes áreas vocacionais. Explorar experiências práticas pode ajudar a clarificar prioridades.",
    baixo: "Os teus interesses vocacionais ainda estão em construção. Experimentar áreas diferentes pode ajudar-te a descobrir o que mais te motiva.",
  },
  clareza_vocacional: {
    alto: "Tens boa clareza sobre o teu caminho vocacional e consegues explicar escolhas com mais segurança.",
    medio: "Tens alguns sinais de clareza vocacional, mas ainda há pontos a aprofundar antes de decisões importantes.",
    baixo: "Ainda precisas de explorar mais informação sobre cursos, profissões e objectivos pessoais.",
  },
};

const resumoPadrao: Record<"baixo" | "medio" | "alto", string> = {
  alto: "Os teus resultados mostram pontuações elevadas. Usa estas forças para orientar decisões académicas e profissionais.",
  medio: "Os teus resultados mostram pontuações equilibradas em diferentes dimensões. Há uma boa base para aprofundar com orientação.",
  baixo: "Os teus resultados indicam áreas com potencial de crescimento. Conversar com um orientador pode ajudar a transformar estes pontos em plano de acção.",
};

export function calcularResultadoTeste(
  tipo: TipoTeste,
  questoes: Questao[],
  respostas: RespostaQuestao[]
): ResultadoCalculado {
  const respostasPorQuestao = new Map(respostas.map((resposta) => [resposta.questaoId, resposta.valor]));
  const grupos = new Map<string, number[]>();
  const valoresGerais: number[] = [];

  questoes.forEach((questao) => {
    const valor = respostasPorQuestao.get(questao.id);
    if (valor === undefined || valor <= 0) return;

    const valorNormalizado = normalizarValor(valor, questao.inversa);
    const dimensao = questao.dimensao ?? "Pontuação geral";
    valoresGerais.push(valorNormalizado);

    const valores = grupos.get(dimensao) ?? [];
    valores.push(valorNormalizado);
    grupos.set(dimensao, valores);
  });

  const mediaGeral = valoresGerais.length
    ? valoresGerais.reduce((soma, valor) => soma + valor, 0) / valoresGerais.length
    : 0;
  const pontuacaoGeral = mediaGeral ? valorParaPercentual(mediaGeral) : 0;
  const nivelGeral = nivelPorPontuacao(pontuacaoGeral);

  const dimensoes = Array.from(grupos.entries()).map(([nome, valores]) => {
    const media = valores.reduce((soma, valor) => soma + valor, 0) / valores.length;
    const pontuacao = valorParaPercentual(media);
    return {
      nome,
      pontuacao,
      percentil: pontuacao,
      nivel: nivelPorPontuacao(pontuacao),
    };
  });

  const resumo = (resumosPorTipo[tipo] ?? resumoPadrao)[nivelGeral];

  return {
    dimensoes,
    pontuacaoGeral,
    percentilGeral: pontuacaoGeral,
    resumo,
  };
}
