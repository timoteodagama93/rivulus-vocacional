// types/mapa.ts
// ============================================================================
// COMPATIBILIDADE: Re-export de tipos canônicos
// Este arquivo existe apenas para COMPATIBILIDADE durante a migração.
// NOVO PADRÃO: Importar de @/types (canonical)
// 
// O canonical.ts é a FONTE ÚNICA DE VERDADE.
// ============================================================================

// Re-exportar tipos principais com aliases para compatibilidade
export {
  CriarPautaDTO as CreateMapaDTO, DisciplinaPauta as DisciplinaMapa,
  Pauta as Mapa, NotaAluno, PeriodoAvaliacao, StatusPauta, TipoPauta as TipoMapa, AtualizarPautaDTO as UpdateMapaDTO
} from './canonical';


export interface CreateMapaDTO {
    titulo: string;
    descricao?: string;
    turmaId: string;
    turmaNome: string;
    periodo: PeriodoAvaliacao;
    tipo: TipoMapa;
    disciplinas: Array<{
        nome: string;
        peso?: number;
    }>;
    cabecalho?: {
        nomeEscola: string;
        logoTipo?: string;
        endereco?: string;
        telefone?: string;
        email?: string;
        director?: string;
    };
    configuracao?: {
        notasMinimaAprovacao: number;
        notasMaxima: number;
        mostrarFaltas: boolean;
        mostrarObservacoes: boolean;
        mostrarEstatisticas: boolean;
        formatoExportacao: 'pdf' | 'excel' | 'ambos';
    };
}

export interface UpdateMapaDTO {
    titulo?: string;
    descricao?: string;
    periodo?: PeriodoAvaliacao;
    disciplinas?: DisciplinaMapa[];
    cabecalho?: Mapa['cabecalho'];
    configuracao?: Mapa['configuracao'];
    status?: Mapa['status'];
}

export interface ExportacaoMapa {
    id: string;
    mapaId: string;
    formato: 'pdf' | 'excel';
    dataExportacao: Date;
    tamanhoArquivo?: number;
    urlDownload?: string;
    localPath?: string;
}