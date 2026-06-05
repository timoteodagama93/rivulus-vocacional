// types/comportamento.ts
// ============================================================================
// COMPATIBILIDADE: Re-export de tipos canônicos
// Este arquivo existe apenas para COMPATIBILIDADE durante a migração.
// NOVO PADRÃO: Importar de @/types (canonical)
// 
// O canonical.ts é a FONTE ÚNICA DE VERDADE.
// ============================================================================

// Re-exportar tipos principais com aliases para compatibilidade
export {
  Comportamento, TipoComportamento as ComportamentoTipo, CriarComportamentoDTO as CreateComportamentoDTO,
  AtualizarComportamentoDTO as UpdateComportamentoDTO
} from './canonical';

