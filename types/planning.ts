// types/planning.ts
// ============================================================================
// TIPOS DO SISTEMA DE PLANEAMENTO PEDAGÓGICO — Rivulus
//
// Hierarquia:
//   Programa → Dosificação → Unidade → Tema → PlanoAula → SessãoAula (sumário)
//
// Um Programa pertence a uma (Disciplina × AnoLetivo).
// Uma Dosificação distribui o Programa por Trimestres/Semanas.
// Uma Unidade agrupa Temas com afinidade conceptual.
// Um Tema é o nó atómico de conteúdo — uma ou várias aulas.
// Um PlanoAula prepara uma SessãoAula concreta.
// Um Sumário é o registo formal do que foi leccionado (campo da SessãoAula).
// Um Horário define quando a turma tem cada disciplina.
// ============================================================================

export type ISODate = string;   // "YYYY-MM-DD"
export type ISODateTime = string; // "YYYY-MM-DDTHH:mm:ssZ"

// ─── Programa Curricular ──────────────────────────────────────────────────────

export interface Programa {
    id: string;
    disciplinaId: string;
    disciplinaNome?: string;
    anoLetivoId?: string;
    /** Nível escolar (ex: "8ª Classe", "10º Ano") */
    nivel: string;
    titulo: string;
    descricao?: string;
    /** Objectivos gerais do programa */
    objetivosGerais: string[];
    /** Competências que o aluno deve adquirir */
    competencias: string[];
    /** Sugestões metodológicas do ministério / escola */
    sugestoesMetodologicas?: string;
    /** Carga horária semanal (horas) */
    cargaHorariaSemanal: number;
    /** Total de semanas lectivas previstas */
    semanasLetivas: number;
    /** URL ou referência ao documento oficial */
    documentoOficialUrl?: string;
    /** Publicado pelo Ministério ou pela escola */
    origem: 'ministerio' | 'escola' | 'professor';
    status: 'rascunho' | 'activo' | 'arquivado';
    criadoPorId: string;
    criadoEm: ISODateTime;
    atualizadoEm: ISODateTime;
}

// ─── Dosificação ──────────────────────────────────────────────────────────────
// Distribui o programa ao longo do calendário lectivo.
// Uma dosificação contém entradas (DosificacaoItem) — uma por unidade/semana.

export interface Dosificacao {
    id: string;
    programaId: string;
    turmaId?: string;
    disciplinaId?: string;
    anoLetivoId?: string;
    titulo: string;
    /** Modelo: 3 trimestres, 2 semestres ou anual */
    modelo: 'trimestral' | 'semestral' | 'anual';
    status: 'rascunho' | 'aprovada' | 'em_execucao' | 'concluida';
    criadoPorId: string;
    criadoEm: ISODateTime;
    atualizadoEm: ISODateTime;
}

export interface DosificacaoItem {
    id: string;
    dosificacaoId: string;
    /** 1, 2 ou 3 (trimestre) */
    periodo: number;
    semana: number;
    /** Semana de início (segunda-feira) */
    dataInicio: ISODate;
    dataFim: ISODate;
    unidadeId?: string;
    temaId?: string;
    descricaoConteudo: string;
    /** Número de aulas previstas nesta semana */
    aulasPrevistos: number;
    /** Recursos / materiais necessários */
    recursos?: string;
    /** Observação (ex: feriado, avaliação) */
    observacao?: string;
    tipo: 'conteudo' | 'revisao' | 'avaliacao' | 'feriado';
    criadoEm: ISODateTime;
    atualizadoEm: ISODateTime;
}

// ─── Unidade Didática ─────────────────────────────────────────────────────────

export interface UnidadeDidatica {
    id: string;
    programaId: string;
    disciplinaId: string;
    anoLetivoId: string;
    numero: number;           // ex: 1, 2, 3
    titulo: string;
    descricao?: string;
    objetivos: string[];
    /** Período lectivo em que ocorre (1=T1, 2=T2, 3=T3) */
    periodo: number;
    /** Número de semanas previstas para esta unidade */
    duracaoSemanas: number;
    criadoPorId: string;
    criadoEm: ISODateTime;
    atualizadoEm: ISODateTime;
}

// ─── Tema ─────────────────────────────────────────────────────────────────────

export interface Tema {
    id: string;
    unidadeId: string;
    programaId: string;
    disciplinaId: string;
    numero: number;           // ex: 1, 2, 3 dentro da unidade
    titulo: string;
    descricao?: string;
    /** Número de aulas previstas para este tema */
    aulasPrevistos: number;
    /** Conteúdos / subtópicos a cobrir */
    conteudos: string[];
    /** Competências específicas a desenvolver */
    competenciasEspecificas: string[];
    /** Recursos didácticos sugeridos */
    recursos?: string;
    /** Sugestão de avaliação para este tema */
    sugestaoAvaliacao?: string;
    criadoPorId: string;
    criadoEm: ISODateTime;
    atualizadoEm: ISODateTime;
}

// ─── Plano de Aula ────────────────────────────────────────────────────────────

export type MetodoEnsino =
    | 'expositivo'
    | 'demonstrativo'
    | 'interrogativo'
    | 'descoberta'
    | 'debate'
    | 'trabalho_grupo'
    | 'projeto'
    | 'laboratorial'
    | 'outro';

export type MeioEnsino =
    | 'quadro'
    | 'manual'
    | 'projetor'
    | 'computador'
    | 'ficha_trabalho'
    | 'laboratorio'
    | 'video'
    | 'audio'
    | 'mapas'
    | 'outro';

export interface PlanoAulaFase {
    /** "introducao" | "desenvolvimento" | "consolidacao" */
    tipo: 'introducao' | 'desenvolvimento' | 'consolidacao';
    duracao: number;  // minutos
    descricao: string;
    metodologia: MetodoEnsino[];
    meios: MeioEnsino[];
}

export interface PlanoAula {
    id: string;
    temaId: string;
    unidadeId: string;
    turmaId?: string;
    turmasId?: string[];
    disciplinaId: string;
    professorId: string;
    /** Número da aula dentro do tema */
    numeroAula: number;
    titulo: string;
    /** Data prevista (pode diferir da data real da sessão) */
    dataPrevista?: ISODate;
    /** Duração total em minutos */
    duracaoMinutos: number;
    /** Objectivos específicos desta aula */
    objetivosEspecificos: string[];
    /** Conteúdo a leccionar */
    conteudo: string;
    /** Competências a desenvolver */
    competencias: string[];
    /** Fases da aula */
    fases: PlanoAulaFase[];
    meiosEnsino: MeioEnsino[];
    metodologias: MetodoEnsino[];
    /** Pré-requisitos (temas que o aluno deve já dominar) */
    preRequisitos?: string;
    /** Avaliação prevista nesta aula */
    avaliacao?: string;
    /** Trabalho de casa */
    tpc?: string;
    /** Link da sessão de aula onde este plano foi executado */
    sessaoAulaId?: string;
    status: 'rascunho' | 'pronto' | 'executado';
    criadoEm: ISODateTime;
    atualizadoEm: ISODateTime;
}

// ─── Sumário ──────────────────────────────────────────────────────────────────
// É um campo dentro de SessãoAula mas com estrutura própria.

export interface Sumario {
    /** Texto formal do sumário (o que ficará registado) */
    texto: string;
    /** Tema leccionado nesta aula */
    temaId?: string;
    /** Plano de aula executado */
    planoAulaId?: string;
    /** Conteúdos realmente abordados */
    conteudosAbordados: string[];
    /** Número de alunos presentes (para o registo oficial) */
    numeroPresentesOficial?: number;
    /** Observações do professor */
    observacoes?: string;
    /** Assinado/lançado pelo professor */
    lancadoEm?: ISODateTime;
}

// ─── Horário da Turma ─────────────────────────────────────────────────────────

export type DiaSemana = 'segunda' | 'terca' | 'quarta' | 'quinta' | 'sexta' | 'sabado';

export interface HorarioAula {
    id: string;
    horarioId: string;
    diaSemana: DiaSemana;
    /** "08:00" */
    horaInicio: string;
    /** "09:30" */
    horaFim: string;
    disciplinaId: string;
    professorId: string;
    sala?: string;
    /** Número do bloco/período (1ª aula do dia = 1, etc.) */
    blocoNumero?: number;
}

export interface HorarioTurma {
    id: string;
    turmaId: string;
    anoLetivoId: string;
    periodoId?: string;
    titulo: string;
    /** Data de vigência */
    dataInicio: ISODate;
    dataFim?: ISODate;
    aulas: HorarioAula[];
    status: 'activo' | 'inactivo' | 'rascunho';
    criadoPorId: string;
    criadoEm: ISODateTime;
    atualizadoEm: ISODateTime;
}

// ─── Progresso (calculado, não persiste) ──────────────────────────────────────

export interface ProgressoTema {
    temaId: string;
    temaTitulo: string;
    aulasPrevistos: number;
    aulasRealizadas: number;
    percentagem: number;
    concluido: boolean;
}

export interface ProgressoUnidade {
    unidadeId: string;
    unidadeTitulo: string;
    temas: ProgressoTema[];
    percentagem: number;
}

export interface ProgressoPrograma {
    programaId: string;
    unidades: ProgressoUnidade[];
    percentageTotal: number;
    aulasPrevistoTotal: number;
    aulasRealizadasTotal: number;
}

// types/planning.ts (adicione ao final)

export interface PlanoQuinzenal {
    id: string;
    programaId: string;
    disciplinaId: string;
    titulo: string;
    dataInicio: ISODate;        // data da segunda-feira da primeira semana
    dataFim: ISODate;            // data do domingo da segunda semana
    semanas: [PlanoQuinzenalSemana, PlanoQuinzenalSemana];
    status: 'rascunho' | 'ativo' | 'concluido';
    criadoPorId: string;
    criadoEm: ISODateTime;
    atualizadoEm: ISODateTime;
}

export interface PlanoQuinzenalSemana {
    numero: 1 | 2;
    temasIds: string[];          // IDs dos temas alocados nesta semana
    observacoes?: string;
}



// ─── DTOs de criação ──────────────────────────────────────────────────────────

export type CriarProgramaDTO = Omit<Programa, 'id' | 'criadoEm' | 'atualizadoEm'>;
export type CriarDosificacaoDTO = Omit<Dosificacao, 'id' | 'criadoEm' | 'atualizadoEm'>;
export type CriarDosificacaoItemDTO = Omit<DosificacaoItem, 'id' | 'criadoEm' | 'atualizadoEm'>;
export type CriarUnidadeDTO = Omit<UnidadeDidatica, 'id' | 'criadoEm' | 'atualizadoEm'>;
export type CriarTemaDTO = Omit<Tema, 'id' | 'criadoEm' | 'atualizadoEm'>;
export type CriarPlanoAulaDTO = Omit<PlanoAula, 'id' | 'criadoEm' | 'atualizadoEm'>;
export type CriarHorarioTurmaDTO = Omit<HorarioTurma, 'id' | 'criadoEm' | 'atualizadoEm'>;
export type CriarPlanoQuinzenalDTO = Omit<PlanoQuinzenal, 'id' | 'criadoEm' | 'atualizadoEm'>;