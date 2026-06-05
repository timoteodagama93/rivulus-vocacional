// types/feedback.ts
// ============================================================================
// COMPATIBILIDADE: Re-export de tipos canônicos
// Este arquivo existe apenas para COMPATIBILIDADE durante a migração.
// NOVO PADRÃO: Importar de @/types (canonical)
// 
// O canonical.ts é a FONTE ÚNICA DE VERDADE.
// ============================================================================

// Re-exportar tipos principais com aliases para compatibilidade
export {
  CriarFeedbackDTO as CreateFeedbackDTO, Feedback, ComentarioFeedback as FeedbackComment, PrioridadeFeedback as FeedbackPriority, StatusFeedback as FeedbackStatus, TipoFeedback as FeedbackType, AtualizarFeedbackDTO as UpdateFeedbackDTO
} from './canonical';

// ============================================================================
// TIPOS DE SUPORTE (ainda mantidos aqui)
// ============================================================================

export interface FeedbackCategory {
  id: string;
  name: string;
  description?: string;
}