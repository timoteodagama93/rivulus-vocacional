export type ModeloPeriodizacao = 'trimestral' | 'semestral' | 'anual';

export interface Escola {
  id: string;
  nome: string;
  codigo?: string;
  localidade?: string;
  modeloPeriodizacao: ModeloPeriodizacao;
  criadoEm: string;
  atualizadoEm: string;
}

export interface AnoLetivo {
  id: string;
  escolaId: string;
  titulo: string;
  dataInicio?: string;
  dataFim?: string;
  modeloPeriodizacao: ModeloPeriodizacao;
  criadoEm: string;
  atualizadoEm: string;
}

export interface Periodo {
  id: string;
  anoLetivoId: string;
  titulo: string;
  ordem: number;
  dataInicio?: string;
  dataFim?: string;
  criadoEm: string;
  atualizadoEm: string;
}

export interface Matricula {
  id: string;
  alunoId: string;
  turmaId: string;
  disciplinaId?: string;
  periodoId?: string;
  numeroAluno?: number;
  ordem?: number;
  status: 'ativa' | 'concluida' | 'cancelada' | 'transferida';
  criadoEm: string;
  atualizadoEm: string;
}

export interface ProfessorTurmaDisciplina {
  id: string;
  professorId: string;
  turmaId: string;
  disciplinaId: string;
  anoLetivoId?: string;
  periodoId?: string;
  status: 'ativo' | 'inativo';
  criadoEm: string;
  atualizadoEm: string;
}
