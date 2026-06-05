// types/school.ts
// ============================================================================
// MÓDULO DE ESCOLAS — Rivulus
// Fonte única de verdade para tipos do directório de escolas.
// Os tipos que também constam do canonical.ts são re-exportados de lá.
// Todos os outros componentes importam de '@/types/school'.
// ============================================================================

export type { ISODate, ISODateTime } from './canonical';

// ─── Enumerações ──────────────────────────────────────────────────────────────

export type EscolaStatus = 'pendente' | 'ativa' | 'inativa' | 'suspensa' | 'verificada' | 'premium';

export type EscolaRegime = 'publico' | 'privado' | 'comparticipada' | 'comunitario';

export type NivelEnsino =
  | 'infantil'
  | 'primario'
  | 'secundario'
  | 'medio'
  | 'tecnico'
  | 'superior';

export type Turno = 'manha' | 'tarde' | 'noite' | 'integral';

export type TipoPublicacao = 'noticia' | 'artigo' | 'comunicado' | 'conquista';

export type TipoEvento =
  | 'feira_ciencias'
  | 'reuniao_pais'
  | 'jornada_pedagogica'
  | 'cultural'
  | 'desportivo'
  | 'outro';

// ─── Sub-interfaces ────────────────────────────────────────────────────────────

export interface EscolaInfraestrutura {
  biblioteca?: boolean;
  laboratorios?: boolean;
  quadrasEsportivas?: boolean;
  cantina?: boolean;
  transporte?: boolean;
  acessibilidade?: boolean;
  internet?: boolean;
  salasClimatizadas?: boolean;
}

export interface EscolaRedesSociais {
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  twitter?: string;
  youtube?: string;
}

export interface EscolaDiretor {
  nome: string;
  fotoUrl?: string;
  mensagem?: string;
}

export interface EscolaCoordenador {
  nome: string;
  cargo: string;
  fotoUrl?: string;
}

export interface EscolaMetricas {
  visualizacoes: number;
  totalSeguidores: number;
  totalAvaliacoes: number;
  avaliacaoMedia: number; // 0–5
}

export interface EscolaAssinatura {
  plano: 'free' | 'basic' | 'premium';
  dataExpiracao?: string; // ISODateTime
}

export interface EscolaCoordenadas {
  latitude: number;
  longitude: number;
}

// ─── Interface principal ───────────────────────────────────────────────────────

export interface Escola {
  id: string;

  // Identificação
  nome: string;
  nomeCompleto?: string;
  slug?: string;                    // URL amigável (ex: "cesp-luanda")
  numeroEscola?: string;
  codigoMinisterial?: string;
  publica: boolean;
  regime?: EscolaRegime;
  status: EscolaStatus;
  verificado?: boolean;             // verificação pela Academia Gama ou por 100 utilizadores
  dataVerificacao?: string;         // ISODateTime

  // Perfil público
  descricaoCurta?: string;
  descricaoLonga?: string;
  missao?: string;
  visao?: string;
  valores?: string[];
  historia?: string;
  fundacao?: string;                // ISODate

  // Mídia
  logotipoUrl?: string;
  capaUrl?: string;
  galeriaFotos?: string[];
  videoInstitucionalUrl?: string;

  // Contacto
  telefone?: string;
  telefonePrincipal?: string;
  telefonesSecundarios?: string[];
  email?: string;
  emailPrincipal?: string;
  emailsAdicionais?: string[];
  website?: string;
  redesSociais?: EscolaRedesSociais;

  // Localização
  pais: string;
  provincia: string;
  municipio: string;
  distrito?: string;
  bairro?: string;
  rua?: string;
  localidade?: string;
  enderecoCompleto?: string;
  coordenadas?: EscolaCoordenadas;

  // Estrutura educacional
  niveisEnsino: NivelEnsino[];
  cursos?: string[];
  turnos?: Turno[];
  idiomas?: string[];

  // Infraestrutura e diferenciais
  infraestrutura?: EscolaInfraestrutura;
  programasEspeciais?: string[];
  parcerias?: string[];
  premios?: string[];
  diferenciais?: string[];

  // Equipa
  diretor?: EscolaDiretor;
  coordenadores?: EscolaCoordenador[];

  // Verificação comunitária (sistema de atestações)
  totalVerificacoes: number;
  solicitouVisita?: boolean;
  solicitouVerificacao?: boolean;
  codigoComercialUsado?: string;
  verificadoManualmente?: boolean;
  destacado?: boolean;
  contactoVerificacao?: string;
  telefoneVerificacao?: string;

  // Quem cadastrou
  cadastradoPor: string;            // userId
  cadastradoPorNome?: string;

  // Métricas (calculadas por Cloud Functions)
  metricas?: EscolaMetricas;
  assinatura?: EscolaAssinatura;
  estatisticas?: {
    totalAlunos?: number;
    totalProfessores?: number;
    totalTurmas?: number;
    mediaAlunosTurma?: number;
    taxaAprovacao?: number;
  };

  // Índices de pesquisa (Firestore)
  nomeBusca?: string;
  nomeTokens?: string[];
  provinciaIdx?: string;
  municipioIdx?: string;

  // Timestamps
  criadoEm: string;                 // ISODateTime
  atualizadoEm: string;             // ISODateTime
}

// ─── DTOs ─────────────────────────────────────────────────────────────────────

export type CriarEscolaDTO = Omit<
  Escola,
  | 'id'
  | 'slug'
  | 'metricas'
  | 'assinatura'
  | 'estatisticas'
  | 'criadoEm'
  | 'atualizadoEm'
  | 'nomeBusca'
  | 'nomeTokens'
  | 'provinciaIdx'
  | 'municipioIdx'
>;

export type AtualizarEscolaDTO = Partial<CriarEscolaDTO>;

// ─── Subcolecções ──────────────────────────────────────────────────────────────

export interface EscolaPublicacao {
  id: string;
  tipo: TipoPublicacao;
  titulo: string;
  resumo?: string;
  conteudo: string;
  imagemCapa?: string;
  galeria?: string[];
  tags?: string[];
  destaque?: boolean;
  publicadoEm: string;
  atualizadoEm: string;
  visualizacoes?: number;
}

export interface EscolaEvento {
  id: string;
  titulo: string;
  descricao?: string;
  dataInicio: string;
  dataFim?: string;
  local?: string;
  tipo: TipoEvento;
  inscricoesAbertas?: boolean;
  linkInscricao?: string;
}

export interface EscolaAvaliacao {
  id: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  nota: number;           // 1–5
  comentario?: string;
  respostaEscola?: string;
  dataResposta?: string;
  util: number;
  reportado: boolean;
  criadoEm: string;
}

export interface AtestacaoEscola {
  id: string;
  escolaId: string;
  userId: string;
  userNome?: string;
  comentario?: string;
  criadoEm: string;
}

export interface CodigoComercial {
  id?: string;
  codigo: string;
  escolaNomePrevisto?: string;
  municipio?: string;
  usado: boolean;
  usadoPor?: string;
  criadoEm: string;
  expiradoEm?: string;
}

// ─── Filtros de pesquisa ───────────────────────────────────────────────────────

export interface EscolaFiltros {
  termo?: string;
  provincia?: string;
  municipio?: string;
  nivelEnsino?: NivelEnsino;
  regime?: EscolaRegime;
  apenasVerificadas?: boolean;
  orderBy?: 'relevancia' | 'avaliacao' | 'nome';
}

// ─── Tipo para cards no directório ────────────────────────────────────────────

export type EscolaCard = Pick<
  Escola,
  | 'id'
  | 'slug'
  | 'nome'
  | 'nomeCompleto'
  | 'logotipoUrl'
  | 'capaUrl'
  | 'descricaoCurta'
  | 'verificado'
  | 'publica'
  | 'regime'
  | 'status'
  | 'provincia'
  | 'municipio'
  | 'bairro'
  | 'enderecoCompleto'
  | 'coordenadas'
  | 'niveisEnsino'
  | 'metricas'
  | 'assinatura'
  | 'totalVerificacoes'
>;

// ─── Dados para o formulário de cadastro ──────────────────────────────────────

export interface DadosCadastroEscola {
  nome: string;
  nomeCompleto?: string;
  publica: boolean;
  pais: string;
  provincia: string;
  municipio: string;
  distrito?: string;
  bairro?: string;
  rua?: string;
  enderecoCompleto?: string;
  coordenadas?: EscolaCoordenadas;
  telefone?: string;
  email?: string;
  website?: string;
  niveisEnsino: NivelEnsino[];
  descricaoCurta?: string;
  directorNome?: string;
  codigoComercial?: string;
  solicitouVisita?: boolean;
  solicitouVerificacao?: boolean;
  cadastradoPor: string;
  cadastradoPorNome?: string;
}

// ─── Lista de províncias ───────────────────────────────────────────────────────

export const PROVINCIAS_ANGOLA = [
  'Bengo', 'Benguela', 'Bié', 'Cabinda', 'Cuando Cubango',
  'Cuanza Norte', 'Cuanza Sul', 'Cunene', 'Huambo', 'Huíla',
  'Luanda', 'Lunda Norte', 'Lunda Sul', 'Malanje', 'Moxico',
  'Namibe', 'Uíge', 'Zaire',
] as const;

export type ProvinciaAngola = typeof PROVINCIAS_ANGOLA[number];

export const NIVEIS_ENSINO_LABELS: Record<NivelEnsino, string> = {
  infantil: 'Infantil',
  primario: 'Primário',
  secundario: 'Secundário',
  medio: 'Médio',
  tecnico: 'Técnico',
  superior: 'Superior',
};

export const REGIME_LABELS: Record<EscolaRegime, string> = {
  publico: 'Pública',
  privado: 'Privada',
  comparticipada: 'Comparticipada',
  comunitario: 'Comunitária',
};