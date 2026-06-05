// types/assessment.ts
// ============================================================================
// COMPATIBILIDADE: Re-export de tipos canônicos
// Este arquivo existe apenas para COMPATIBILIDADE durante a migração.
// NOVO PADRÃO: Importar de @/types (canonical)
// 
// O canonical.ts é a FONTE ÚNICA DE VERDADE.
// ============================================================================

// Re-exportar principais tipos com aliases para compatibilidade de código existente
export {
  Avaliacao as Assessment, TipoAvaliacao as AssessmentType, CriarAvaliacaoDTO as CreateAssessmentDTO,
  AtualizarAvaliacaoDTO as UpdateAssessmentDTO
} from './canonical';

// ============================================================================
// TIPOS DE SUPORTE (ainda mantidos aqui)
// ============================================================================

export interface BatchAssessmentData {
  studentId: string;
  studentName: string;
  score: number;
  note?: string;
}

export interface ClassAssessmentSummary {
  classId: string;
  totalStudents: number;
  totalAssessments: number;
  averageMAC: number;
  averageTrimester: number;
  bestStudent: { studentId: string; studentName: string; average: number };
  worstStudent: { studentId: string; studentName: string; average: number };
  subjects: Array<{
    name: string;
    averageMAC: number;
    averageTrimester: number;
    bestStudent: { studentId: string; studentName: string; average: number };
    worstStudent: { studentId: string; studentName: string; average: number };
  }>;
}

export interface StudentAssessmentSummary {
  studentId: string;
  studentName: string;
  totalAssessments: number;
  averageMAC: number;
  averageTrimester: number;
  status: "green" | "yellow" | "red";
  subjects: Array<{
    name: string;
    averageMAC: number;
    averageTrimester: number;
    status: "green" | "yellow" | "red";
  }>;
}
