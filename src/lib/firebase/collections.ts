// ============================================================
// RIVULUS VOCACIONAL — Colecções Firestore
// ============================================================
export const COLLECTIONS = {
  ESTUDANTES:         "estudantes",
  ORIENTADORES:       "orientadores",
  ADMINS:             "admins",
  TESTES:             "testes",
  RESULTADOS:         "resultados",
  PERFIS_VOCACIONAIS: "perfis_vocacionais",
  RELATORIOS:         "relatorios",
  PLANOS:             "planos",
  INSTITUICOES:       "instituicoes",
  ENCAMINHAMENTOS:    "encaminhamentos",
  ESCOLAS:            "escolas",
  ESTATISTICAS:       "estatisticas",
} as const;

// Subcoleções
export const SUBCOLLECTIONS = {
  RESULTADOS_BY_ESTUDANTE: (estudanteId: string) =>
    `${COLLECTIONS.ESTUDANTES}/${estudanteId}/resultados`,
} as const;
