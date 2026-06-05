// types/lessonPlan.ts
// ============================================================================
// COMPATIBILIDADE: Re-export de tipos canônicos
// Este arquivo existe apenas para COMPATIBILIDADE durante a migração.
// NOVO PADRÃO: Importar de @/types (canonical)
// 
// O canonical.ts é a FONTE ÚNICA DE VERDADE.
// ============================================================================

// Re-exportar tipos principais com aliases para compatibilidade
export {
  CriarPlanoAulaDTO as CreateLessonPlanDTO, Exercicio as Exercise,
  PlanoAula as LessonPlan, StatusPlanoAula as LessonPlanStatus, AtualizarPlanoAulaDTO as UpdateLessonPlanDTO
} from './canonical';

