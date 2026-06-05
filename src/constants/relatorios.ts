import type { TipoRelatorio } from "@/types";

export interface InfoTipoRelatorio {
  tipo: TipoRelatorio;
  nome: string;
  descricao: string;
  minimoTestes: number;
  exigeTodosTestes: boolean;
}

export const MIN_TESTES_PARCIAL_SIMPLES = 3;

export const TIPOS_RELATORIO: InfoTipoRelatorio[] = [
  {
    tipo: "parcial_simples",
    nome: "Parcial simples",
    descricao: "Resumo inicial com base nos primeiros testes completos do aluno.",
    minimoTestes: MIN_TESTES_PARCIAL_SIMPLES,
    exigeTodosTestes: false,
  },
  {
    tipo: "parcial_normal",
    nome: "Parcial normal",
    descricao: "Leitura parcial com todos os 18 testes completos.",
    minimoTestes: 18,
    exigeTodosTestes: true,
  },
  {
    tipo: "completo_simples",
    nome: "Completo simples",
    descricao: "Relatorio completo simplificado com todos os 18 testes completos.",
    minimoTestes: 18,
    exigeTodosTestes: true,
  },
  {
    tipo: "completo_total",
    nome: "Completo total",
    descricao: "Relatorio integral com todos os 18 testes completos.",
    minimoTestes: 18,
    exigeTodosTestes: true,
  },
];

export const LABELS_TIPO_RELATORIO = TIPOS_RELATORIO.reduce(
  (acc, item) => ({ ...acc, [item.tipo]: item.nome }),
  {} as Record<TipoRelatorio, string>
);

export function getInfoTipoRelatorio(tipo: TipoRelatorio) {
  return TIPOS_RELATORIO.find((item) => item.tipo === tipo) ?? TIPOS_RELATORIO[0];
}
