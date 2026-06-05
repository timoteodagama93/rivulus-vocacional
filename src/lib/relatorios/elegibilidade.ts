import { CATALOGO_TESTES, TOTAL_TESTES } from "@/constants/testes";
import { getInfoTipoRelatorio } from "@/constants/relatorios";
import type { TipoRelatorio, TipoTeste } from "@/types";

export interface ResultadoElegibilidadeRelatorio {
  elegivel: boolean;
  completos: TipoTeste[];
  faltantes: TipoTeste[];
  totalCompletos: number;
  totalExigido: number;
  motivo: string;
}

export interface ResultadoMinimoRelatorio {
  testeTipo?: TipoTeste;
  testeId?: string;
  concluido?: boolean;
  questoesRespondidas?: number;
  totalQuestoes?: number;
}

function getTipoResultado(resultado: ResultadoMinimoRelatorio): TipoTeste | null {
  return resultado.testeTipo ?? (resultado.testeId as TipoTeste | undefined) ?? null;
}

function resultadoEstaCompleto(resultado: ResultadoMinimoRelatorio) {
  const tipo = getTipoResultado(resultado);
  if (!tipo) return false;

  const infoTeste = CATALOGO_TESTES.find((teste) => teste.tipo === tipo);
  const totalEsperado = resultado.totalQuestoes ?? infoTeste?.totalQuestoes ?? 0;
  const respondidas = resultado.questoesRespondidas ?? totalEsperado;

  return resultado.concluido !== false && respondidas >= totalEsperado;
}

export function avaliarElegibilidadeRelatorio(
  tipoRelatorio: TipoRelatorio,
  resultados: ResultadoMinimoRelatorio[]
): ResultadoElegibilidadeRelatorio {
  const infoRelatorio = getInfoTipoRelatorio(tipoRelatorio);
  const completosSet = new Set<TipoTeste>();

  resultados.forEach((resultado) => {
    const tipo = getTipoResultado(resultado);
    if (tipo && resultadoEstaCompleto(resultado)) {
      completosSet.add(tipo);
    }
  });

  const completos = CATALOGO_TESTES
    .map((teste) => teste.tipo)
    .filter((tipo) => completosSet.has(tipo));
  const faltantes = CATALOGO_TESTES
    .map((teste) => teste.tipo)
    .filter((tipo) => !completosSet.has(tipo));

  if (infoRelatorio.exigeTodosTestes) {
    const elegivel = faltantes.length === 0 && completos.length === TOTAL_TESTES;
    return {
      elegivel,
      completos,
      faltantes,
      totalCompletos: completos.length,
      totalExigido: TOTAL_TESTES,
      motivo: elegivel
        ? "Todos os 18 testes estao completos."
        : `Este tipo de relatorio exige os 18 testes completos. Faltam ${faltantes.length}.`,
    };
  }

  const elegivel = completos.length >= infoRelatorio.minimoTestes;
  return {
    elegivel,
    completos,
    faltantes,
    totalCompletos: completos.length,
    totalExigido: infoRelatorio.minimoTestes,
    motivo: elegivel
      ? `Minimo de ${infoRelatorio.minimoTestes} testes completos atingido.`
      : `Parcial simples exige pelo menos ${infoRelatorio.minimoTestes} testes completos.`,
  };
}
