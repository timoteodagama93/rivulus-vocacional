// types/suggestions.ts
// ============================================================================
// TIPOS DE SUGESTÃO — Entidades sugeridas por utilizadores sem conta
// Colecções Firebase separadas: suggested_schools, suggested_teachers, suggested_students
// Regras Firebase: leitura/escrita pública (sem autenticação) — auto-cadastro
// ============================================================================

import type { ISODate, ISODateTime } from './canonical';

export type StatusSugestao =
  | 'pendente'
  | 'em_revisao'
  | 'aprovada'
  | 'rejeitada'
  | 'arquivada';

export type OrigemSugestao =
  | 'auto_cadastro_aluno'
  | 'auto_cadastro_encarregado'
  | 'professor_externo'
  | 'admin';

// ============================================================================
// ESCOLA SUGERIDA — colecção: suggested_schools
// ============================================================================
export interface EscolaSugerida {
  id: string;
  nome: string;
  nomeCompleto?: string;
  numeroEscola?: string;
  pais?: string;
  provincia?: string;
  municipio?: string;
  distrito?: string;
  bairro?: string;
  rua?: string;
  telefone?: string;
  email?: string;
  origem: OrigemSugestao;
  submissaoPor?: string;
  submissaoNome?: string;
  submissaoEmail?: string;
  submissaoTelefone?: string;
  alunoSugeridoId?: string;
  alunoSugeridoNome?: string;
  status: StatusSugestao;
  escolaCanonicoId?: string;
  revisadoPor?: string;
  revisadoEm?: ISODateTime;
  motivoRejeicao?: string;
  nota?: string;
  criadoEm: ISODateTime;
  atualizadoEm: ISODateTime;
}

export type CriarEscolaSugeridaDTO = Omit<EscolaSugerida, 'id' | 'status' | 'escolaCanonicoId' | 'revisadoPor' | 'revisadoEm' | 'criadoEm' | 'atualizadoEm'>;
export type AtualizarEscolaSugeridaDTO = Partial<Pick<EscolaSugerida, 'status' | 'escolaCanonicoId' | 'revisadoPor' | 'revisadoEm' | 'motivoRejeicao' | 'nota'>>;

// ============================================================================
// PROFESSOR SUGERIDO — colecção: suggested_teachers
// ============================================================================
export interface ProfessorSugerido {
  id: string;
  nome: string;
  nomeCurto?: string;
  disciplinas?: string[];
  telefone?: string;
  email?: string;
  escolaId?: string;
  escolaSugeridaId?: string;
  escolaNome?: string;
  origem: OrigemSugestao;
  submissaoPor?: string;
  submissaoNome?: string;
  submissaoEmail?: string;
  submissaoTelefone?: string;
  alunoSugeridoId?: string;
  alunoSugeridoNome?: string;
  status: StatusSugestao;
  professorCanonicoId?: string;
  revisadoPor?: string;
  revisadoEm?: ISODateTime;
  motivoRejeicao?: string;
  nota?: string;
  criadoEm: ISODateTime;
  atualizadoEm: ISODateTime;
}

export type CriarProfessorSugeridoDTO = Omit<ProfessorSugerido, 'id' | 'status' | 'professorCanonicoId' | 'revisadoPor' | 'revisadoEm' | 'criadoEm' | 'atualizadoEm'>;
export type AtualizarProfessorSugeridoDTO = Partial<Pick<ProfessorSugerido, 'status' | 'professorCanonicoId' | 'revisadoPor' | 'revisadoEm' | 'motivoRejeicao' | 'nota'>>;

// ============================================================================
// ALUNO SUGERIDO — colecção: suggested_students
// ============================================================================
export interface AlunoSugerido {
  id: string;
  nomeCompleto: string;
  nomeCurto?: string;
  genero?: 'M' | 'F' | 'Outro';
  dataNascimento?: ISODate;
  identificacao?: {
    tipo: 'BI' | 'Passaporte' | 'Cédula' | 'Outro';
    numero: string;
  };
  escolaId?: string;
  escolaSugeridaId?: string;
  escolaNome?: string;
  classeActual?: string;
  anoLetivo?: string;
  professorSugeridoId?: string;
  professorSugeridoNome?: string;
  nomeEncarregado?: string;
  telefoneEncarregado?: string;
  emailEncarregado?: string;
  relacaoEncarregado?: string;
  telefone?: string;
  email?: string;
  motivacaoCadastro?: string;
  nota?: string;
  origem: OrigemSugestao;
  submissaoPor?: string;
  codigoAtivacao?: string;
  status: StatusSugestao;
  alunoCanonicoId?: string;
  revisadoPor?: string;
  revisadoEm?: ISODateTime;
  motivoRejeicao?: string;
  criadoEm: ISODateTime;
  atualizadoEm: ISODateTime;
}

export type CriarAlunoSugeridoDTO = Omit<AlunoSugerido, 'id' | 'status' | 'alunoCanonicoId' | 'revisadoPor' | 'revisadoEm' | 'criadoEm' | 'atualizadoEm'>;
export type AtualizarAlunoSugeridoDTO = Partial<Pick<AlunoSugerido, 'status' | 'alunoCanonicoId' | 'revisadoPor' | 'revisadoEm' | 'motivoRejeicao' | 'nota'>>;

// ============================================================================
// FILTROS — para a tela de gestão do admin
// ============================================================================
export interface FiltrosAlunoSugerido {
  status?: StatusSugestao[];
  origem?: OrigemSugestao;
  escolaId?: string;
  textoBusca?: string;
  ordenarPor?: 'criadoEm' | 'nomeCompleto';
  direcao?: 'asc' | 'desc';
}

// ============================================================================
// RESULTADO DO AUTO-CADASTRO
// ============================================================================
export interface ResultadoAutoCadastro {
  sucesso: boolean;
  alunoSugeridoId: string;
  escolaSugeridaId?: string;
  professorSugeridoId?: string;
  codigoAtivacao: string;
  mensagem: string;
  contaCriada?: boolean;
  userId?: string;
}

// ============================================================================
// RESULTADO DA APROVAÇÃO (admin)
// ============================================================================
export interface ResultadoAprovacao {
  sucesso: boolean;
  alunoCanonicoId: string;   // ID criado na colecção students
  alunoSugeridoId: string;   // ID removido de suggested_students
  codigoAtivacao: string;
  mensagem: string;
}

// ============================================================================
// PAYLOAD DO FORMULÁRIO DE AUTO-CADASTRO
// ============================================================================
export interface PayloadAutoCadastro {
  aluno: CriarAlunoSugeridoDTO;
  escolaCanonicoId?: string;
  dadosEscolaSugerida?: Omit<CriarEscolaSugeridaDTO, 'origem' | 'alunoSugeridoId' | 'alunoSugeridoNome'>;
  dadosProfessorSugerido?: Omit<CriarProfessorSugeridoDTO, 'origem' | 'alunoSugeridoId' | 'alunoSugeridoNome'>;
  criarConta?: boolean;
  credenciais?: { email: string; password: string };
}