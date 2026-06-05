// ============================================================
// RIVULUS VOCACIONAL — Catálogo de Testes (18 no total)
// ============================================================
import type { TipoTeste, AreaAvaliacao, NivelEnsino } from "@/types";

export interface InfoTeste {
  tipo: TipoTeste;
  nome: string;
  descricao: string;
  area: AreaAvaliacao;
  duracaoMinutos: number;
  totalQuestoes: number;
  niveisAplicaveis: NivelEnsino[];
}

export const CATALOGO_TESTES: InfoTeste[] = [
  // ── ÁREA 1: QUEM SOU EU (6 testes) ──────────────────────
  {
    tipo: "riasec",
    nome: "RIASEC",
    descricao: "Interesses vocacionais: Realista, Investigativo, Artístico, Social, Empreendedor, Convencional",
    area: "quem_sou_eu",
    duracaoMinutos: 15,
    totalQuestoes: 42,
    niveisAplicaveis: ["i_ciclo", "medio", "universitario", "profissional"],
  },
  {
    tipo: "inteligencias_multiplas",
    nome: "Inteligências Múltiplas",
    descricao: "8 tipos de inteligência segundo Howard Gardner",
    area: "quem_sou_eu",
    duracaoMinutos: 12,
    totalQuestoes: 40,
    niveisAplicaveis: ["primario", "i_ciclo", "medio", "universitario", "profissional"],
  },
  {
    tipo: "vak",
    nome: "Estilo de Aprendizagem VAK",
    descricao: "Preferência de aprendizagem: Visual, Auditivo, Cinestésico",
    area: "quem_sou_eu",
    duracaoMinutos: 8,
    totalQuestoes: 30,
    niveisAplicaveis: ["primario", "i_ciclo", "medio", "universitario", "profissional"],
  },
  {
    tipo: "valores_carreira",
    nome: "Valores de Carreira",
    descricao: "O que mais valoriza numa carreira profissional",
    area: "quem_sou_eu",
    duracaoMinutos: 10,
    totalQuestoes: 24,
    niveisAplicaveis: ["medio", "universitario", "profissional"],
  },
  {
    tipo: "motivadores_profissionais",
    nome: "Motivadores Profissionais",
    descricao: "Factores de motivação intrínseca e extrínseca",
    area: "quem_sou_eu",
    duracaoMinutos: 8,
    totalQuestoes: 20,
    niveisAplicaveis: ["medio", "universitario", "profissional"],
  },
  {
    tipo: "interesses_academicos",
    nome: "Interesses Académicos",
    descricao: "Áreas do saber que mais captam a sua atenção",
    area: "quem_sou_eu",
    duracaoMinutos: 10,
    totalQuestoes: 30,
    niveisAplicaveis: ["i_ciclo", "medio", "universitario", "profissional"],
  },

  // ── ÁREA 2: COMO FUNCIONO (7 testes) ────────────────────
  {
    tipo: "big_five",
    nome: "Big Five Adaptado",
    descricao: "Personalidade: Abertura, Conscienciosidade, Extroversão, Amabilidade, Neuroticismo",
    area: "como_funciono",
    duracaoMinutos: 15,
    totalQuestoes: 44,
    niveisAplicaveis: ["medio", "universitario", "profissional"],
  },
  {
    tipo: "keirsey",
    nome: "Temperamento Keirsey",
    descricao: "4 temperamentos: Artesão, Guardião, Idealista, Racional",
    area: "como_funciono",
    duracaoMinutos: 20,
    totalQuestoes: 70,
    niveisAplicaveis: ["medio", "universitario", "profissional"],
  },
  {
    tipo: "via_character",
    nome: "VIA — Forças de Carácter",
    descricao: "24 forças de carácter segundo a psicologia positiva",
    area: "como_funciono",
    duracaoMinutos: 25,
    totalQuestoes: 96,
    niveisAplicaveis: ["medio", "universitario", "profissional"],
  },
  {
    tipo: "resiliencia",
    nome: "Resiliência",
    descricao: "Capacidade de recuperação perante adversidades",
    area: "como_funciono",
    duracaoMinutos: 8,
    totalQuestoes: 25,
    niveisAplicaveis: ["i_ciclo", "medio", "universitario", "profissional"],
  },
  {
    tipo: "autorregulacao",
    nome: "Autorregulação",
    descricao: "Gestão emocional e controlo de impulsos",
    area: "como_funciono",
    duracaoMinutos: 8,
    totalQuestoes: 20,
    niveisAplicaveis: ["i_ciclo", "medio", "universitario", "profissional"],
  },
  {
    tipo: "comunicacao",
    nome: "Estilos de Comunicação",
    descricao: "Perfil de comunicação: assertivo, passivo, agressivo, passivo-agressivo",
    area: "como_funciono",
    duracaoMinutos: 8,
    totalQuestoes: 20,
    niveisAplicaveis: ["i_ciclo", "medio", "universitario", "profissional"],
  },
  {
    tipo: "autoconfianca",
    nome: "Autoconfiança",
    descricao: "Percepção de autoeficácia e confiança pessoal",
    area: "como_funciono",
    duracaoMinutos: 6,
    totalQuestoes: 16,
    niveisAplicaveis: ["primario", "i_ciclo", "medio", "universitario", "profissional"],
  },

  // ── ÁREA 3: PARA ONDE VOU (5 testes) ────────────────────
  {
    tipo: "ancoras_carreira",
    nome: "Âncoras de Carreira",
    descricao: "Valores centrais que orientam decisões de carreira (Schein)",
    area: "para_onde_vou",
    duracaoMinutos: 12,
    totalQuestoes: 40,
    niveisAplicaveis: ["medio", "universitario", "profissional"],
  },
  {
    tipo: "clareza_vocacional",
    nome: "Clareza Vocacional",
    descricao: "Nível de clareza sobre o caminho profissional a seguir",
    area: "para_onde_vou",
    duracaoMinutos: 8,
    totalQuestoes: 20,
    niveisAplicaveis: ["i_ciclo", "medio", "universitario", "profissional"],
  },
  {
    tipo: "maturidade_vocacional",
    nome: "Maturidade Vocacional",
    descricao: "Prontidão para tomar decisões de carreira fundamentadas",
    area: "para_onde_vou",
    duracaoMinutos: 10,
    totalQuestoes: 30,
    niveisAplicaveis: ["medio", "universitario", "profissional"],
  },
  {
    tipo: "tomada_decisao",
    nome: "Estilos de Tomada de Decisão",
    descricao: "Estilo e eficácia no processo de decisão",
    area: "para_onde_vou",
    duracaoMinutos: 8,
    totalQuestoes: 22,
    niveisAplicaveis: ["medio", "universitario", "profissional"],
  },
  {
    tipo: "planeamento_futuro",
    nome: "Planeamento de Futuro",
    descricao: "Orientação temporal e capacidade de planear a longo prazo",
    area: "para_onde_vou",
    duracaoMinutos: 8,
    totalQuestoes: 20,
    niveisAplicaveis: ["i_ciclo", "medio", "universitario", "profissional"],
  },
];

export const TESTES_POR_AREA = {
  quem_sou_eu:   CATALOGO_TESTES.filter((t) => t.area === "quem_sou_eu"),
  como_funciono: CATALOGO_TESTES.filter((t) => t.area === "como_funciono"),
  para_onde_vou: CATALOGO_TESTES.filter((t) => t.area === "para_onde_vou"),
};

export const TOTAL_TESTES = CATALOGO_TESTES.length; // 18

export const LABELS_AREA: Record<string, string> = {
  quem_sou_eu:   "Quem Sou Eu",
  como_funciono: "Como Funciono",
  para_onde_vou: "Para Onde Vou",
};

export const LABELS_NIVEL: Record<string, string> = {
  primario:      "1.ª a 6.ª Classe",
  i_ciclo:       "7.ª a 9.ª Classe",
  medio:         "10.ª a 13.ª Classe",
  universitario: "Universitário",
  profissional:  "Profissionais",
};
