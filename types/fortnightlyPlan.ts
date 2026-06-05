// types/fortnightlyPlan.ts
// ============================================================================
// COMPATIBILIDADE: Re-export de tipos canônicos
// Este arquivo existe apenas para COMPATIBILIDADE durante a migração.
// NOVO PADRÃO: Importar de @/types (canonical)
// 
// O canonical.ts é a FONTE ÚNICA DE VERDADE.
// ============================================================================

// Re-exportar tipos principais com aliases para compatibilidade
export {
  CriarPlanoQuinzenalDTO as CreateFortnightlyPlanDTO, PlanoQuinzenal as FortnightlyPlan, StatusPlanoPeriodo as FortnightlyPlanStatus,
  SemanaPlanoQuinzenal as FortnightlyPlanWeek, AtualizarPlanoQuinzenalDTO as UpdateFortnightlyPlanDTO
} from './canonical';

// Alias para compatibilidade
export type WeekPlan = any;
