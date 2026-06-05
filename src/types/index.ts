// ============================================================
// RIVULUS VOCACIONAL — Tipos Base
// Academia Gama | vocacional.academiagama.ao
// ============================================================

// ── Utilizadores ────────────────────────────────────────────

export type UserRole = "estudante" | "orientador" | "administrador";
export type NivelEnsino = "primario" | "i_ciclo" | "medio" | "universitario" | "profissional";
export type Sexo = "masculino" | "feminino" | "outro";

export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  ativo: boolean;
}

// ── Estudante ────────────────────────────────────────────────

export interface Estudante extends UserProfile {
  role: "estudante";
  nome: string;
  nomeBusca: string;
  documento: string;
  dataNascimento: Date;
  idade: number;
  sexo: Sexo;
  foto?: string;
  escola: string;
  classe: string;
  curso?: string;
  nivelEnsino: NivelEnsino;
  bairro?: string;
  municipio?: string;
  provincia?: string;
  endereco?: string;
  telefone?: string;
  encarregado?: string;
  telefoneEncarregado?: string;
  emailEncarregado?: string;
  authEmail?: string;
  loginMethod?: "email" | "documento";
  objetivos?: string;
  areasInteresse?: string[];
  carreirasPretendidas?: string[];
  orientadorId?: string;
  escolaId?: string;
}

export interface CursoEscola {
  id: string;
  nome: string;
  nivelEnsino: NivelEnsino | string;
  duracao: string;
  vagas?: number;
  requisitos?: string[];
  competencias?: string[];
  descricao?: string;
  areasRelacionadas?: string[];
  ativo: boolean;
}

export interface Docente {
  nome: string;
  cargo?: string;
  qualificacao?: string;
  especialidades?: string[];
}

export interface InfraestruturaEscola {
  laboratorios?: string[];
  bibliotecas?: string[];
  residencias?: string[];
  internet?: string;
  transporte?: string;
  oficinas?: string[];
  salasMultimedia?: string[];
  polosTecnologicos?: string[];
  outros?: string[];
}

export interface Escola {
  id: string;
  nome: string;
  codigo?: string;
  tipo: TipoInstituicao | "colegio" | "instituto" | "universidade" | "centro_formacao";
  descricao: string;
  resumo?: string;
  localidade: string;
  municipio: string;
  provincia: string;
  bairro?: string;
  endereco?: string;
  telefone?: string;
  email?: string;
  website?: string;
  coordenador?: string;
  contato?: string;
  imagemCapa?: string;
  infraestrutura?: InfraestruturaEscola;
  corpoDocente?: Docente[];
  cursos: CursoEscola[];
  tags?: string[];
  avaliacaoMedia?: number;
  ativo: boolean;
}

// ── Orientador ───────────────────────────────────────────────

export interface Orientador extends UserProfile {
  role: "orientador";
  nome: string;
  especialidade?: string;
  escolasAtribuidas?: string[];
  estudantesIds?: string[];
}

// ── Avaliações ───────────────────────────────────────────────

export type AreaAvaliacao = "quem_sou_eu" | "como_funciono" | "para_onde_vou";

export type TipoTeste =
  | "riasec" | "inteligencias_multiplas" | "vak" | "valores_carreira"
  | "motivadores_profissionais" | "interesses_academicos"
  | "big_five" | "keirsey" | "via_character" | "resiliencia"
  | "autorregulacao" | "comunicacao" | "autoconfianca"
  | "ancoras_carreira" | "clareza_vocacional" | "maturidade_vocacional"
  | "tomada_decisao" | "planeamento_futuro";

export type TipoQuestao = "escala_likert" | "escolha_multipla" | "ranking" | "binaria";

export interface OpcaoResposta {
  valor: number;
  texto: string;
}

export interface Questao {
  id: string;
  texto: string;
  tipo: TipoQuestao;
  opcoes?: OpcaoResposta[];
  dimensao?: string;
  inversa?: boolean;
  ordem: number;
}

export interface Teste {
  id: string;
  nome: string;
  descricao: string;
  tipo: TipoTeste;
  area: AreaAvaliacao;
  niveisAplicaveis: NivelEnsino[];
  questoes: Questao[];
  versao: number;
  ativo: boolean;
  duracaoMinutos?: number;
  instrucoes: string;
  createdAt: Date;
  updatedAt: Date;
}

// ── Resultados ───────────────────────────────────────────────

export interface RespostaQuestao {
  questaoId: string;
  valor: number;
  texto?: string;
}

export interface ResultadoDimensao {
  nome: string;
  pontuacao: number;
  percentil?: number;
  nivel?: "baixo" | "medio" | "alto";
  descricao?: string;
}

export interface ResultadoTeste {
  id: string;
  estudanteId: string;
  testeId: string;
  testeTipo: TipoTeste;
  testeArea: AreaAvaliacao;
  respostas: RespostaQuestao[];
  dimensoes: ResultadoDimensao[];
  pontuacaoGeral?: number;
  percentilGeral?: number;
  resumo?: string;
  concluido?: boolean;
  questoesRespondidas?: number;
  totalQuestoes?: number;
  completadoEm: Date;
  atualizadoEm?: Date;
  duracaoSegundos: number;
  versaoTeste: number;
  interpretacaoIA?: string;
  observacaoOrientador?: string;
}

// ── Perfil Vocacional ────────────────────────────────────────

export interface PerfilVocacional {
  id: string;
  estudanteId: string;
  perfilInteresses?: ResultadoDimensao[];
  perfilPersonalidade?: ResultadoDimensao[];
  perfilValores?: ResultadoDimensao[];
  perfilAprendizagem?: ResultadoDimensao[];
  perfilProfissional?: ResultadoDimensao[];
  perfilAcademico?: ResultadoDimensao[];
  codigoRiasec?: string;
  tipoKeirsey?: string;
  ancoraPrincipal?: string;
  cursosCompativeis?: string[];
  profissoesCompativeis?: string[];
  percursosAcademicos?: string[];
  percursosProfissionais?: string[];
  geradoEm: Date;
  atualizadoEm: Date;
  completude: number;
}

// ── Relatórios ───────────────────────────────────────────────

export type TipoRelatorio =
  | "parcial_simples"
  | "parcial_normal"
  | "completo_simples"
  | "completo_total";

export type EstadoRelatorio = "rascunho" | "pendente_aprovacao" | "aprovado" | "publicado";

export interface Relatorio {
  id: string;
  estudanteId: string;
  orientadorId?: string;
  tipo: TipoRelatorio;
  estado: EstadoRelatorio;
  titulo: string;
  perfilIntegrado?: string;
  interpretacoes?: string;
  recomendacoes?: string;
  planoAcademico?: string;
  planoProfissional?: string;
  parecerIA?: string;
  parecerOrientador?: string;
  urlPDF?: string;
  geradoEm: Date;
  aprovadoEm?: Date;
  publicadoEm?: Date;
  geradoPor: "sistema" | "orientador";
}

// ── Planeamento ──────────────────────────────────────────────

export type EstadoItem = "pendente" | "em_curso" | "concluido";

export interface ItemPlano {
  id: string;
  titulo: string;
  descricao?: string;
  prazo?: Date;
  estado: EstadoItem;
  tipo: "objetivo" | "meta" | "acao" | "competencia" | "certificacao";
}

export interface PlanoEstudante {
  id: string;
  estudanteId: string;
  planoAcademico: ItemPlano[];
  planoProfissional: ItemPlano[];
  atualizadoEm: Date;
}

// ── Encaminhamento ───────────────────────────────────────────

export type TipoInstituicao = "colegio" | "instituto" | "universidade" | "centro_formacao";

export interface CursoParceiro {
  id: string;
  nome: string;
  area: string;
  duracao: string;
  vagas?: number;
  requisitos?: string[];
  beneficios?: string[];
  ativo: boolean;
}

export interface InstituicaoParceira {
  id: string;
  nome: string;
  tipo: TipoInstituicao;
  localidade: string;
  provincia: string;
  contacto?: string;
  email?: string;
  website?: string;
  ativo: boolean;
  logotipo?: string;
  cursos: CursoParceiro[];
}

export type EstadoEncaminhamento = "interesse" | "pre_inscrito" | "encaminhado" | "matriculado";

export interface Encaminhamento {
  id: string;
  estudanteId: string;
  instituicaoId: string;
  cursoId: string;
  estado: EstadoEncaminhamento;
  dataInteresse: Date;
  dataEncaminhamento?: Date;
  dataMatricula?: Date;
  observacoes?: string;
}

// ── Estatísticas ─────────────────────────────────────────────

export interface EstatisticasInstitucionais {
  escolaId?: string;
  turmaId?: string;
  municipio?: string;
  periodo: { inicio: Date; fim: Date };
  totalEstudantes: number;
  testesRealizados: number;
  relatoriosGerados: number;
  perfisPredominantes: { perfil: string; percentagem: number }[];
  interessesPredominantes: { interesse: string; percentagem: number }[];
  cursosMaisDesejados: { curso: string; contagem: number }[];
  carreirasMaisDesejadas: { carreira: string; contagem: number }[];
  clarezaVocacionalMedia: number;
  encaminhamentosRealizados: number;
  conversoes: number;
}
