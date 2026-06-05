// types/canonical.ts
// ============================================================================
// ARQUIVO CANï¿½NICO - Fonte ï¿½nica de Verdade para Tipos do Rivulus
// ============================================================================
// REGRA: Este arquivo ï¿½ o ï¿½NICO permitido fazer imports de tipos especï¿½ficos.
// Todos os demais arquivos devem importar APENAS de @/types (canonical).
// ============================================================================

import { GradingScale } from "./academic";

// Tipos base UTC/ISO
export type ISODate = string; // YYYY-MM-DD
export type ISODateTime = string; // ISO 8601

export interface Usuario {
  id: string;
  email?: string | null;
  nome?: string | null;
  fotoUrl?: string | null;
  papel: 'professor' | 'aluno' | 'encarregado';
  ativo?: boolean;
  criadoEm: ISODateTime;
  atualizadoEm: ISODateTime;
}

export type ModeloPeriodizacao = 'trimestral' | 'semestral' | 'anual';
// types/canonical.ts (ou types/index.ts) – trecho atualizado

export interface Escola {
  id: string;
  nome: string;
  slug?: string;                 // URL amigável para perfil público (ex: "colegio-sao-pedro")
  nomeCompleto?: string;
  numeroEscola?: string;
  codigoMinisterial?: string;    // Código oficial no ministério da educação
  publica: boolean;

  // Perfil público
  descricaoCurta?: string;       // Uma frase de destaque
  descricaoLonga?: string;       // Texto rico (markdown) sobre a escola
  missao?: string;
  visao?: string;
  valores?: string[];
  historia?: string;
  fundacao?: ISODate;

  // Mídia
  logotipoUrl?: string;
  capaUrl?: string;
  galeriaFotos?: string[];
  videoInstitucionalUrl?: string;

  // Contato
  telefonePrincipal?: string;
  telefonesSecundarios?: string[];
  emailPrincipal?: string;
  emailsAdicionais?: string[];
  website?: string;
  redesSociais?: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    twitter?: string;
    youtube?: string;
  };

  // Localização
  pais: string;
  provincia: string;
  municipio: string;
  distrito?: string;
  bairro?: string;
  rua?: string;
  localidade?: string;
  enderecoCompleto?: string;
  coordenadas?: {
    latitude: number;
    longitude: number;
  };

  // Estrutura educacional
  niveisEnsino: ('infantil' | 'primario' | 'secundario' | 'medio' | 'tecnico' | 'superior')[];
  cursos?: string[];
  regime?: 'publico' | 'privado' | 'comparticipada' | 'comunitario';
  turnos?: ('manha' | 'tarde' | 'noite' | 'integral')[];
  idiomas?: string[];

  // Infraestrutura
  infraestrutura?: {
    biblioteca?: boolean;
    laboratorios?: boolean;
    quadrasEsportivas?: boolean;
    cantina?: boolean;
    transporte?: boolean;
    acessibilidade?: boolean;
    internet?: boolean;
    salasClimatizadas?: boolean;
  };

  // Estatísticas (calculadas periodicamente via Cloud Function)
  estatisticas?: {
    totalAlunos?: number;
    totalProfessores?: number;
    totalTurmas?: number;
    mediaAlunosTurma?: number;
    taxaAprovacao?: number;
  };
  metricas?: {
    visualizacoes: number;
    totalSeguidores: number;
    totalAvaliacoes: number;
    avaliacaoMedia: number;
  };

  // Equipe
  diretor?: {
    nome: string;
    fotoUrl?: string;
    mensagem?: string;
  };
  coordenadores?: { nome: string; cargo: string; fotoUrl?: string }[];

  // Diferenciais
  programasEspeciais?: string[];
  parcerias?: string[];
  premios?: string[];

  // Verificação e status
  verificado?: boolean;
  dataVerificacao?: ISODateTime;
  status: 'pendente' | 'ativa' | 'inativa' | 'suspensa' | 'verificada' | 'premium';

  // Métricas (deprecated – use metricas)
  visualizacoes?: number;
  avaliacaoMedia?: number;
  totalAvaliacoes?: number;

  // ═══════════════════════════════════════════════════════════════
  // NOVOS CAMPOS (serviço unificado)
  // ═══════════════════════════════════════════════════════════════

  // Quem cadastrou a escola
  cadastradoPor: string;            // userId
  cadastradoPorNome?: string;

  // Sistema de verificação comunitária
  totalVerificacoes: number;        // número de atestações recebidas

  // Solicitações do proprietário
  solicitouVisita?: boolean;        // pedido de visita presencial da Academia Gama
  solicitouVerificacao?: boolean;   // pedido de verificação telefónica

  // Código comercial (se usado no cadastro)
  codigoComercialUsado?: string;

  // Verificação manual pela equipa
  verificadoManualmente?: boolean;   // se foi verificado por admin

  // Destaque no directório
  destacado?: boolean;               // escola em destaque (carrossel)

  // Contacto para verificação (quando solicitado)
  contactoVerificacao?: string;
  telefoneVerificacao?: string;

  // Timestamps
  criadoEm: ISODateTime;
  atualizadoEm: ISODateTime;
}

export interface AnoLetivo {
  id: string;
  nome?: string; // Ex: "2025/2026"
  titulo: string; // Ex: "2025/2026"
  modeloPeriodizacao: 'trimestral' | 'semestral' | 'anual'; // Ex: 
  dataInicio: ISODate;
  dataFim: ISODate;
  escolaId: string;
  criadoEm: ISODateTime;
  atualizadoEm: ISODateTime;
}

export interface Periodo {
  id: string;
  nome: string; // Ex: "1º Trimestre"
  titulo?: string; // Ex: "1º Trimestre"
  ordem: number; //1, 2 ou 3
  dataInicio: ISODate;
  dataFim: ISODate;
  anoLetivoId: string;
  isClosed?: boolean; // Marcado como fechado - dados congelados
  criadoEm: ISODateTime;
  atualizadoEm: ISODateTime;
}

export interface Disciplina {
  id: string;
  nome: string;
  codigo?: string;
  area?: string;
  cargaHorariaSemanal?: number;
  escolaId?: string;
  criadoEm: ISODateTime;
  atualizadoEm: ISODateTime;
}
export interface ProgramaCurricular {
  id: string;
  disciplinaId: string;
  anoEscolar: string;
  descricao?: string;
  objetivosGerais?: string[];
  competencias?: string[];
  ativo: boolean;
  criadoEm: ISODateTime;
  atualizadoEm: ISODateTime;
}

export interface UnidadeCurricular {
  id: string;
  programaId: string;
  titulo: string;
  ordem: number;
  cargaHorariaPrevista?: number;
  descricao?: string;
  objetivoGeral?: string;
  temas?: TemaCurricular[];
  criadoEm: ISODateTime;
  atualizadoEm: ISODateTime;
}

export interface Dosificacao {
  id: string;
  unidadeId: string;
  periodoId: string;
  semanasPrevistas?: number;
  dataInicioPrevista?: ISODate;
  dataFimPrevista?: ISODate;
  criadoEm: ISODateTime;
  atualizadoEm: ISODateTime;
}

export interface TemaCurricular {
  id: string;
  unidadeId: string;
  titulo: string;
  ordem: number;
  subtemas?: string[];
  objetivosEspecificos?: string[];
  objetivosSubtemas?: Record<string, string[]>;
  descricao?: string;
  criadoEm: ISODateTime;
  atualizadoEm: ISODateTime;
}

export type DiaSemana = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface HorarioAulaSlot {
  id: string;
  diaSemana: DiaSemana;
  inicio: string; // HH:mm
  fim: string; // HH:mm
  duracaoMin?: number;
  disciplinaId?: string;
  professorId?: string;
  sala?: string;
  observacao?: string;
}

export interface HorarioSemanal {
  id: string;
  turmaId: string;
  disciplinaId?: string; // legado (horï¿½rio por disciplina)
  professorId?: string;
  anoLetivoId?: string;
  periodoId?: string; // legado (usar anoLetivoId)
  slots: HorarioAulaSlot[];
  criadoEm: ISODateTime;
  atualizadoEm: ISODateTime;
}

export interface Turma {
  id: string;
  nome: string; // Ex: "10A"
  escolaId: string;
  anoLetivoId: string;
  codigo?: string; // CRÍTICO: Código de compartilhamento para criação ou adição de disciplina
  fingerprint?: string;
  sala?: string;
  criadorId: string; // CRÍTICO: ID do professor/admin que criou a turma (rastreabilidade)
  periodoId?: string; // Período atual da turma
  totalAvaliacoes?: number; // QUantidade total de avaliações lançadas na turma (para monitoramento)
  nivel?: number; // Ex: Primária
  curso?: string;
  classe?: string;
  ordemListagem?: string;
  estudantesMaximo?: number;
  regrasAvaliacao?: AcademicConfig; // Regras específicas de avaliação para a turma.
  notas?: string[]; // Anotações gerais
  diretorTurmaId?: string; // Id do professor responsável (opcional, diferente de criadorId)
  disciplinaIds: string[]; // disciplinas lecionadas na turma
  professorIds: string[]; // professores que lecionam na turma
  horarioSemanalIds?: string[]; // horários semanais associados (por disciplina/professor)
  status: 'ativa' | 'arquivada';
  criadoEm: ISODateTime;
  atualizadoEm: ISODateTime;
}

export interface Professor {
  id: string;
  usuarioId?: string;
  nome: string;
  escolaId?: string;
  disciplinaPrincipalId?: string;
  turmasAtivas?: string[];
  contactoPrincipal?: string;
  email?: string;
  fotoPerfil?: string | null;
  criadoEm: ISODateTime;
  atualizadoEm: ISODateTime;
}


export type SubscriptionPlan = "free" | "premium";
export interface Subscription {
  userId: string;
  plan: SubscriptionPlan;
  status: 'active' | 'expired' | 'suspended';
  expiresAt?: ISODateTime;
  maxClasses?: number;
  maxStudentsPerClass?: number;
  maxPrograms?: number;
  maxLessonPlans?: number;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface PaymentRecord {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  method?: string;
  status: 'paid' | 'pending' | 'failed';
  reference?: string;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface Encarregado {
  id: string;
  usuarioId?: string;
  nome: string;
  contactoPrincipal?: string;
  profissao?: string;
  grauParentesco?: string;
  alunosAssociados?: string[]; // alunoIds
  fotoPerfil?: string; // URL Supabase para foto de perfil
  criadoEm: ISODateTime;
  atualizadoEm: ISODateTime;
}

export interface TeacherPost {
  id: string;
  autorId: string;
  autorNome: string;
  titulo: string;
  conteudo: string;
  tags?: string[];
  recursos?: string[]; // ids ou urls
  likesCount?: number;
  commentsCount?: number;
  likedBy?: string[];
  criadoEm: ISODateTime;
  atualizadoEm: ISODateTime;
}

export interface TeacherPostComment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  content: string;
  criadoEm: ISODateTime;
}

export interface MessageThread {
  id: string;
  participantes: string[]; // userIds
  participantesNomes?: Record<string, string>;
  tipo: 'professor_professor' | 'professor_aluno' | 'professor_encarregado';
  ultimaMensagem?: string;
  ultimaMensagemRemetenteId?: string;
  ultimaMensagemLidaPor?: string[];
  atualizadoEm: ISODateTime;
  criadoEm: ISODateTime;
}

export interface Message {
  id: string;
  threadId: string;
  remetenteId: string;
  texto: string;
  criadoEm: ISODateTime;
  lida?: boolean;
}

export interface Identificacao {
  tipo: "BI" | "Passaporte" | "Cédula" | "Outro";
  numero: string;
}
export interface Aluno {
  id: string;
  usuarioId?: string;
  perfilAtivo?: boolean;
  perfilIncompleto?: boolean;
  pendenciaDados?: boolean;
  origemCadastro?: 'regular' | 'provisorio';
  turmaOrigemProvisoriaId?: string;
  codigoAtivacao?: string;
  nomeCompleto: string;
  nomeCurto?: string;
  genero?: 'M' | 'F' | 'Outro';
  dataNascimento?: ISODate;
  identificacao?: Identificacao;
  escolaId: string;
  turmaId?: string; // Matricula reference
  classeActual: string;
  escolaActual: string;
  numeroEstudante?: number;
  telefone?: string;
  performance?: string;

  sincronizado?: boolean;

  // Legado (compatibilidade com registros antigos)
  fullName?: string;
  shortName?: string;
  classId?: string;
  className?: string;
  classLevel?: string;
  course?: string;
  schoolId?: string;
  schoolName?: string;
  studentNumber?: number;
  orderIndex?: number;
  // Encarregado fields
  nomeEncarregado?: string;
  telefonEncarregado?: string;
  encarregados?: string[]; // encarregadoIds
  contactosEncarregados?: string[]; // telefones
  nota?: string; // Anotaï¿½ï¿½o
  fotoPerfil?: string; // URL Supabase para foto de perfil
  profilePicture?: string;
  status: 'ativo' | 'transferido' | 'desistente' | 'active' | 'inactive' | 'transferred' | 'dropped';
  criadoEm: ISODateTime;
  atualizadoEm: ISODateTime;
}

export interface Matricula {
  id: string;
  alunoId: string;
  turmaId: string;
  disciplinaId: string;
  periodoId: string;
  status: 'ativa' | 'concluida' | 'cancelada' | 'transferida';
  numeroAluno?: number;
  ordem?: number;
  criadoEm: ISODateTime;
  atualizadoEm: ISODateTime;
}

export interface SessaoAula {
  id: string;
  turmaId: string;
  disciplinaId: string;
  periodoId: string;
  professorId: string;
  data: ISODate;
  inicio?: ISODateTime;
  fim?: ISODateTime;
  planoAulaId?: string;
  planoQuinzenalId?: string;
  status: 'planeada' | 'realizada' | 'cancelada';
  criadoEm: ISODateTime;
  atualizadoEm: ISODateTime;
}

export interface Observacao {
  id: string;
  turmaId: string;
  alunoId: string;
  disciplinaId: string;
  periodoId: string;
  professorId: string;
  deletado?: boolean;
  deletadoEm: ISODateTime;
  tipo?: 'comportamento' | 'desempenho' | 'frequencia';
  observacao: string;
  criadoEm: ISODateTime;
  atualizadoEm: ISODateTime;

}

export interface AcademicConfig {
  id: string;
  turmaId: string;
  disciplinaId: string;
  anoLetivoId: string;
  escalaMaxima: GradingScale; // ex: 20
  pesoFormativa: number;
  pesoSumativa: number;
  pesoProva: number;
  pesoTrabalho?: number;
  frequenciaMinima: number; // ex: 75 (%)
  arredondamento: 'matematico' | 'cima' | 'baixo';

  notaMinAprovacao: number;
  minAvalicoesMac: number;
  pesoMac: number;
  pesoExame: number;

  versao?: string;
  criadoEm: ISODateTime;
  atualizadoEm: ISODateTime;

}

export interface PeriodoFechamento {
  id: string;
  periodoId: string;
  turmaId: string;
  disciplinaId: string;
  mediaFinal: number;
  frequenciaFinal: number;
  ispFinal: number;
  situacaoFinal: 'aprovado' | 'reprovado';
  fechadoEm: ISODateTime;
  fechadoPor: string;
  criadoEm: ISODateTime;
  atualizadoEm: ISODateTime;
}

export interface ProfessorTurmaDisciplina {
  id: string;
  professorId: string;
  turmaId: string;
  disciplinaId: string;
  periodoId?: string;
  criadoEm: ISODateTime;
  atualizadoEm: ISODateTime;
}
// ============================================================================
// AVALIAï¿½ï¿½O - Tipos consolidados de assessment e avaliaï¿½ï¿½o
// ============================================================================

export type TipoAvaliacao =
  | 'avaliacao_continua'
  | 'trabalho'
  | 'teste'
  | 'prova_trimestral'
  | 'diagnostica'
  | 'formativa'
  | 'sumativa';

export interface Avaliacao {
  //Identificação da avaliação
  id: string;
  //Aula e sala
  sessaoAulaId: string;
  turmaId: string;
  disciplinaId: string;
  disciplina?: string;
  periodoId: string;
  professorId: string;

  //Identificação do aluno
  alunoId: string;
  nomeAluno: string;

  tipo: TipoAvaliacao;
  titulo?: string;
  nota: number;
  notaMaxima: number;
  peso?: number;
  trimestre?: 1 | 2 | 3;
  observacao?: string;

  // Sincronização
  sincronizado?: boolean;
  statusSincronizacao: 'pendente' | 'sincronizado' | 'falhou';
  ultimaTentativaSincronizacao?: ISODateTime;

  // Soft delete
  deletado?: boolean;
  deletadoEm?: ISODateTime;

  criadoEm: ISODateTime;
  atualizadoEm: ISODateTime;
}

export type CriarAvaliacaoDTO = Omit<
  Avaliacao,
  'id' | 'sincronizado' | 'statusSincronizacao' | 'criadoEm' | 'atualizadoEm' | 'deletado'
>;

export type CriarObservacaoDTO = Omit<
  Observacao,
  'id' | 'sincronizado' | 'criadoEm' | 'atualizadoEm' | 'deletado'
>;

export type AtualizarObservacaoDTO = Omit<
  Observacao,
  'id' | 'alunoId' | 'sincronizado' | 'criadoEm' | 'atualizadoEm' | 'deletado'
>;
export type AtualizarAvaliacaoDTO = Partial<Omit<Avaliacao, 'id' | 'alunoId' | 'turmaId' | 'disciplinaId'>>;

// ============================================================================
// PRESENï¿½A - Tipos consolidados de attendance
// ============================================================================

export type StatusPresenca = 'presente' | 'ausente' | 'justificada';

export interface Presenca {
  id: string;
  sessaoAulaId: string;
  alunoId: string;
  turmaId: string;
  disciplinaId: string;
  periodoId: string;
  professorId: string;
  data: ISODate;
  status: StatusPresenca;
  observacao?: string;

  // Sincronizaï¿½ï¿½o
  sincronizado?: boolean;
  statusSincronizacao: 'pendente' | 'sincronizado' | 'falhou';
  ultimaTentativaSincronizacao?: ISODateTime;

  // Soft delete
  deletado?: boolean;
  deletadoEm?: ISODateTime;

  criadoEm: ISODateTime;
  atualizadoEm: ISODateTime;
}

export type CriarPresencaDTO = Omit<
  Presenca,
  'id' | 'sincronizado' | 'statusSincronizacao' | 'criadoEm' | 'atualizadoEm' | 'deletado'
>;
export type AtualizarPresencaDTO = Partial<Omit<Presenca, 'id' | 'alunoId' | 'turmaId' | 'data'>>;

// ============================================================================
// PARTICIPAï¿½ï¿½O - Tipos consolidados
// ============================================================================

export type NivelParticipacao = 'baixa' | 'media' | 'alta';

export interface Participacao {
  id: string;
  sessaoAulaId: string;
  alunoId: string;
  nomeAluno?: string;
  turmaId: string;
  disciplinaId: string;
  periodoId: string;
  professorId: string;
  data: ISODate;
  nivel: NivelParticipacao;
  observacao?: string;

  // Sincronizaï¿½ï¿½o
  sincronizado?: boolean;
  statusSincronizacao: 'pendente' | 'sincronizado' | 'falhou';
  ultimaTentativaSincronizacao?: ISODateTime;

  // Soft delete
  deletado?: boolean;
  deletadoEm?: ISODateTime;

  criadoEm: ISODateTime;
  atualizadoEm: ISODateTime;
}

export type CriarParticipacaoDTO = Omit<
  Participacao,
  'id' | 'sincronizado' | 'statusSincronizacao' | 'criadoEm' | 'atualizadoEm' | 'deletado'
>;
export type AtualizarParticipacaoDTO = Partial<Omit<Participacao, 'id' | 'alunoId' | 'turmaId' | 'data'>>;

// ============================================================================
// COMPORTAMENTO - Tipos consolidados
// ============================================================================

export type TipoComportamento = 'elogio' | 'advertencia' | 'positivo' | 'negativo';

export interface Comportamento {
  id: string;
  sessaoAulaId?: string;
  alunoId: string;
  turmaId: string;
  disciplinaId: string;
  periodoId: string;
  professorId: string;
  data: ISODate;
  tipo: TipoComportamento;
  gravidade?: 1 | 2 | 3;
  observacao?: string;

  // Sincronizaï¿½ï¿½o
  sincronizado?: boolean;
  statusSincronizacao: 'pendente' | 'sincronizado' | 'falhou';
  ultimaTentativaSincronizacao?: ISODateTime;

  // Soft delete
  deletado?: boolean;
  deletadoEm?: ISODateTime;

  criadoEm: ISODateTime;
  atualizadoEm: ISODateTime;
}

export type CriarComportamentoDTO = Omit<
  Comportamento,
  'id' | 'sincronizado' | 'statusSincronizacao' | 'criadoEm' | 'atualizadoEm' | 'deletado'
>;
export type AtualizarComportamentoDTO = Partial<Omit<Comportamento, 'id' | 'alunoId' | 'turmaId' | 'data'>>;

// ============================================================================
// PAUTA / BOLETIM - Tipos consolidados de Mapa
// ============================================================================

export type PeriodoAvaliacao = 'trimestral' | 'semestral' | 'anual';
export type TipoPauta = 'pauta' | 'boletim' | 'estatistica';
export type StatusPauta = 'rascunho' | 'finalizado' | 'arquivado';

export interface NotaAluno {
  alunoId: string;
  alunoNome: string;
  numeroEstudante?: number;
  ranking?: { posicao: number; total: number };
  faltasGerais?: number; // Faltas totais no perï¿½odo/ano (todas as disciplinas)

  // Notas por trimestre
  trimestre1?: {
    mac?: number;     // Mï¿½dia de Avaliaï¿½ï¿½es Contï¿½nuas
    npt?: number;     // Nota da Prova Trimestral
    mtx?: number;     // Mï¿½dia Trimestral
    eex?: number;     // Exame Extraordinï¿½rio
    faltas?: number;
    observacoes?: string;
    status?: 'aprovado' | 'reprovado' | 'recuperacao';
  };

  trimestre2?: {
    mac?: number;
    npt?: number;
    mtx?: number;
    eex?: number;
    faltas?: number;
    observacoes?: string;
    status?: 'aprovado' | 'reprovado' | 'recuperacao';
  };

  trimestre3?: {
    mac?: number;
    npt?: number;
    mtx?: number;
    eex?: number;
    faltas?: number;
    observacoes?: string;
    status?: 'aprovado' | 'reprovado' | 'recuperacao';
  };

  mediaAnual?: number;
  statusFinal?: 'aprovado' | 'reprovado' | 'exame';
}

export interface DisciplinaPauta {
  id: string;
  nome: string;
  peso?: number;
  notas: NotaAluno[];
}

export interface Pauta {
  id: string;
  idLocal?: string;
  idServidor?: string;
  titulo: string;
  descricao?: string;
  turmaId: string;
  turmaNome: string;
  escolaId: string;
  escolaNome: string;
  anoLetivo: string;
  periodo: PeriodoAvaliacao;
  trimestreAtual?: 1 | 2 | 3;
  tipo: TipoPauta;
  disciplinas: DisciplinaPauta[];

  cabecalho?: {
    nomeEscola: string;
    logoTipo?: string;
    endereco?: string;
    telefone?: string;
    email?: string;
    diretor?: string;
    anoLetivo?: string;
  };

  configuracao?: {
    notaMinimaAprovacao: number;
    notaMaxima: number;
    mostrarFaltas: boolean;
    mostrarObservacoes: boolean;
    mostrarEstatisticas: boolean;
    formatoExportacao: 'pdf' | 'excel' | 'ambos';
    sistemaNotas: '0-20' | '0-100' | 'A-F';
  };

  metadata?: {
    criadoPor: string;
    criadoPorNome: string;
    dataCriacao: ISODateTime;
    dataAtualizacao: ISODateTime;
    ultimaExportacao?: ISODateTime;
    versao: number;
  };

  status: StatusPauta;
  sincronizado: boolean;
  criadoOffline: boolean;
  criadoEm: ISODateTime;
  atualizadoEm: ISODateTime;
}

export type CriarPautaDTO = Omit<Pauta, 'id' | 'sincronizado' | 'criadoEm' | 'atualizadoEm'>;
export type AtualizarPautaDTO = Partial<CriarPautaDTO>;

// ============================================================================
// PLANO QUINZENAL - Tipos consolidados
// ============================================================================

export type StatusPlanoPeriodo = 'rascunho' | 'ativo' | 'arquivado';

export interface SemanaPlanoQuinzenal {
  numeroSemana: number; // 1 ou 2
  unidade: string;
  tema: string;
  subTema: string;
  temaId?: string;
  subtemas?: string[];
  aulasPrevistas?: number;
  idUnidadeCurricular?: string;
  idDosificacao?: string;
  horarioSlotIds?: string[];
  metodos: string[];
  objetivoGeral: string;
  objetivosEspecificos: string[];
  atividades?: string[];
  materiais?: string[];
}

export interface PlanoQuinzenal {
  id: string;
  professorId: string;
  titulo: string;
  disciplina: string;
  turma: string;
  periodoId?: string;
  programaId?: string;
  unidadeId?: string;
  temaIds?: string[];
  idProgramaCurricular?: string;
  idUnidadeCurricular?: string;
  idDosificacao?: string;
  dataInicio: ISODate;
  dataFim: ISODate;
  semanas: [SemanaPlanoQuinzenal, SemanaPlanoQuinzenal];
  status: StatusPlanoPeriodo;
  criadoOffline?: boolean;
  sincronizado?: boolean;
  idLocal?: string;
  criadoEm: ISODateTime;
  atualizadoEm: ISODateTime;
  // Legacy aliases (compatibilidade)
  teacherId?: string;
  title?: string;
  discipline?: string;
  class?: string;
  startDate?: ISODate;
  endDate?: ISODate;
  weeks?: [SemanaPlanoQuinzenal, SemanaPlanoQuinzenal];
}

export type CriarPlanoQuinzenalDTO = Omit<PlanoQuinzenal, 'id' | 'criadoEm' | 'atualizadoEm' | 'sincronizado' | 'idLocal'>;
export type AtualizarPlanoQuinzenalDTO = Partial<CriarPlanoQuinzenalDTO>;

// ============================================================================
// PLANO DE AULA - Tipos consolidados
// ============================================================================

export type StatusPlanoAula = 'rascunho' | 'ativo' | 'arquivado';

export interface Exercicio {
  id: string;
  questao: string;
  tipo: 'multipla_escolha' | 'aberta' | 'verdadeiro_falso';
  opcoes?: string[];
  respostaCorreta?: string | number | boolean;
}

export interface PlanoAula {
  id: string;
  professorId: string;
  idPlanoQuinzenal?: string;
  semanaNumero?: 1 | 2;
  periodoId?: string;
  idProgramaCurricular?: string;
  idUnidadeCurricular?: string;
  idDosificacao?: string;
  temaId?: string;
  tema?: string;
  subtema?: string;
  horarioSlotId?: string;
  titulo: string;
  disciplina: string;
  turma: string;
  unidadeTematica: string;
  assunto: string;
  data: ISODate;
  objetivoGeral: string;
  objetivosEspecificos: string[];
  metodos: string[];
  materiais: string[];
  recursos: string[];

  fases: {
    introducao: {
      descricao: string;
      duracao: number; // em minutos
      atividades: string[];
    };
    desenvolvimento: {
      descricao: string;
      duracao: number;
      atividades: string[];
    };
    conclusao: {
      descricao: string;
      duracao: number;
      atividades: string[];
    };
  };

  tarefaCasa: string;
  exercicios: Exercicio[];
  duracao: number;
  competencias?: string[];
  metodosAvaliacao?: string[];
  referencias?: string[];
  observacao?: string;
  status: StatusPlanoAula;
  criadoOffline?: boolean;
  sincronizado?: boolean;
  idLocal?: string;
  criadoEm: ISODateTime;
  atualizadoEm: ISODateTime;
  // Legacy aliases (compatibilidade)
  teacherId?: string;
  title?: string;
  discipline?: string;
  class?: string;
  thematicUnit?: string;
  subject?: string;
  date?: ISODate;
  generalObjective?: string;
  specificObjectives?: string[];
  methods?: string[];
  materials?: string[];
  resources?: string[];
  phases?: {
    introduction: { description: string; duration: number; activities: string[] };
    development: { description: string; duration: number; activities: string[] };
    conclusion: { description: string; duration: number; activities: string[] };
  };
  homework?: string;
  exercises?: Exercicio[];
  duration?: number;
  competencies?: string[];
  evaluationMethods?: string[];
  references?: string[];
  note?: string;
  fortnightlyPlanId?: string;
}

export type CriarPlanoAulaDTO = Omit<PlanoAula, 'id' | 'criadoEm' | 'atualizadoEm' | 'sincronizado' | 'idLocal'>;
export type AtualizarPlanoAulaDTO = Partial<CriarPlanoAulaDTO>;

// ============================================================================
// Mï¿½TRICAS ISP - Tipos consolidados
// ============================================================================

export type StatusISP = 'verde' | 'amarelo' | 'vermelho';

export interface MetricasISP {
  D: number;  // Desempenho acadï¿½mico (0-100)
  F: number;  // Frequï¿½ncia (0-100)
  P: number;  // Participaï¿½ï¿½o (0-100)
  C: number;  // Comportamento (0-100)
  total: number;  // ISP final (0-100)
  status: StatusISP;
  coberturaDados: {
    D: boolean;
    F: boolean;
    P: boolean;
    C: boolean;
  };
}

// ============================================================================
// RELATï¿½RIOS - Tipos consolidados
// ============================================================================

export type PeriodType = 'semana' | 'mes' | 'trimestre' | 'semestre' | 'ano';
export type StudentStatus = 'aprovado' | 'reprovado' | 'em_risco' | 'desistente';
export type ReportAssessmentKey = 'AC1' | 'AC2' | 'AC3' | 'AC4' | 'AC5' | 'AC6' | 'AC7' | 'PT';

export interface StudentAssessment {
  studentId: string;
  studentName: string;
  studentNumber: number;
  profilePicture?: string;
  assessments: Record<ReportAssessmentKey, number | null>;
  assessmentMeta?: Partial<Record<ReportAssessmentKey, { id?: string; date?: string; type?: string }>>;
  MAC: number | null;
  MT: number | null;
  faltas: number;
  status: StudentStatus;
}

export interface ClassReport {
  classId: string;
  className: string;
  discipline: string;
  turmaId?: string;
  disciplinaId?: string;
  periodoId?: string;
  sessaoAulaId?: string;
  academicYear: string;
  teacherId: string;
  teacherName: string;
  professorId?: string;
  period: PeriodType;
  subPeriod: string;
  students: StudentAssessment[];
  statistics: {
    mediaGeral: number;
    aprovados: number;
    reprovados: number;
    emRisco: number;
    desistencias: number;
    mediaFaltas: number;
  };
  generatedAt: string;
}

export interface ReportFilters {
  classId: string;
  discipline?: string;
  turmaId?: string;
  disciplinaId?: string;
  periodoId?: string;
  sessaoAulaId?: string;
  professorId?: string;
  period?: PeriodType;
  subPeriod?: string;
  date?: string;
}

export interface AssessmentWeight {
  AC: number;
  PT: number;
}

export interface ReportSettings {
  assessmentWeights: AssessmentWeight;
  passingGrade: number;
  maxAbsences: number;
  useAdvancedCalculations: boolean;
}

// ============================================================================
// ALERTAS PEDAGï¿½GICOS - Tipos consolidados
// ============================================================================

export type TipoAlertaPedagogico =
  | 'frequencia_baixa'
  | 'queda_desempenho'
  | 'tendencia_descendente'
  | 'risco_reprovacao'
  | 'participacao_baixa'
  | 'comportamento_critico';

export type NivelAlertaPedagogico = 'baixo' | 'medio' | 'alto';

export interface AlertaPedagogico {
  id: string;
  chaveAlerta: string;
  turmaId: string;
  disciplinaId?: string;
  periodoId?: string;
  sessaoAulaId?: string;
  alunoId?: string;
  alunoNome?: string;
  professorId?: string;

  tipo: TipoAlertaPedagogico;
  nivel: NivelAlertaPedagogico;
  titulo: string;
  descricao: string;
  sugestao?: string;

  isp?: MetricasISP;

  resolvido: boolean;
  resolvidoEm?: ISODateTime;
  origem?: 'automatico' | 'manual';

  sincronizado?: 'sincronizado' | 'pendente' | 'local';

  deletado?: boolean;
  criadoEm: ISODateTime;
  atualizadoEm: ISODateTime;
}

// ============================================================================
// FEEDBACK - Tipos consolidados
// ============================================================================

export type TipoFeedback = 'bug' | 'sugestao' | 'solicitacao_recurso' | 'geral' | 'elogio';
export type StatusFeedback = 'pendente' | 'enviado' | 'em_revisao' | 'resolvido' | 'arquivado';
export type PrioridadeFeedback = 'baixa' | 'media' | 'alta' | 'critica';

export interface ComentarioFeedback {
  id: string;
  autorId: string;
  autorNome: string;
  autorPapel: string;
  conteudo: string;
  do_time: boolean;
  criadoEm: ISODateTime;
}

export interface Feedback {
  id: string;
  tipo: TipoFeedback;
  titulo: string;
  descricao: string;
  prioridade: PrioridadeFeedback;
  categoria: string;
  urlsFoto?: string[];

  infoDispositivo: {
    plataforma: string;
    versao: string;
    modelo: string;
    versaoApp: string;
  };

  infoUsuario: {
    usuarioId?: string;
    papelUsuario?: 'professor' | 'aluno' | 'encarregado' | 'admin';
    nomeUsuario?: string;
    email?: string;
  };

  status: StatusFeedback;
  atribuidoPara?: string;
  comentarios: ComentarioFeedback[];
  votos: string[];

  criadoEm: ISODateTime;
  atualizadoEm: ISODateTime;
}

export type CriarFeedbackDTO = Omit<Feedback, 'id' | 'comentarios' | 'votos' | 'criadoEm' | 'atualizadoEm'>;
export type AtualizarFeedbackDTO = Partial<{
  status: StatusFeedback;
  atribuidoPara: string;
  prioridade: PrioridadeFeedback;
  comentarios: ComentarioFeedback[];
}>;




// ============================================================================
// AI
// ============================================================================
export interface Mensagem {
  id: string;
  papel: 'user' | 'assistant';
  conteudo: string;
  timestamp: Date;
}

export interface ChatSession {
  sessionId: string;
  userId?: string;
  context: {
    tipo: 'professor' | 'aluno' | 'encarregado' | 'geral';
    nome?: string;
    turmaId?: string;
    disciplinaId?: string;
  };
  messages: Mensagem[];
  createdAt: Date;
  updatedAt: Date;
}
// ============================================================================
// DTOs E TIPOS UTILITï¿½RIOS
// ============================================================================

export type CriarEscolaDTO = Omit<Escola, 'id' | 'criadoEm' | 'atualizadoEm'>;
export type AtualizarEscolaDTO = Partial<CriarEscolaDTO>;

export type CriarAnoLetivoDTO = Omit<AnoLetivo, 'id' | 'criadoEm' | 'atualizadoEm'>;
export type AtualizarAnoLetivoDTO = Partial<CriarAnoLetivoDTO>;

export type CriarPeriodoDTO = Omit<Periodo, 'id' | 'criadoEm' | 'atualizadoEm'>;
export type AtualizarPeriodoDTO = Partial<CriarPeriodoDTO>;

export type CriarDisciplinaDTO = Omit<Disciplina, 'id' | 'criadoEm' | 'atualizadoEm'>;
export type AtualizarDisciplinaDTO = Partial<CriarDisciplinaDTO>;

export type CriarTurmaDTO = Omit<Turma, 'id' | 'criadoEm' | 'atualizadoEm'>;
export type AtualizarTurmaDTO = Partial<CriarTurmaDTO>;

export type CriarProfessorDTO = Omit<Professor, 'id' | 'criadoEm' | 'atualizadoEm'>;
export type AtualizarProfessorDTO = Partial<CriarProfessorDTO>;

export type CriarEncarregadoDTO = Omit<Encarregado, 'id' | 'criadoEm' | 'atualizadoEm'>;
export type AtualizarEncarregadoDTO = Partial<CriarEncarregadoDTO>;

export type CriarAlunoDTO = Omit<Aluno, 'id' | 'criadoEm' | 'atualizadoEm'>;
export type AtualizarAlunoDTO = Partial<CriarAlunoDTO>;

export type CriarMatriculaDTO = Omit<Matricula, 'criadoEm' | 'atualizadoEm'>;

// ============================================================================
// TYPE ALIASES FOR BACKWARD COMPATIBILITY
// Consolidating from legacy types/types.ts into canonical.ts
// ============================================================================

/**
 * Backward compatibility alias
 * Student (legacy) -> Aluno (canonical)
 */
export type Student = Aluno;
export type CreateStudentDTO = CriarAlunoDTO;
export type UpdateStudentDTO = AtualizarAlunoDTO;

// Legacy Gender type alias
export type Gender = 'M' | 'F' | 'Outro';

// ============================================================================
// FIM DO ARQUIVO CANï¿½NICO
// ============================================================================






