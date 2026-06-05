// types/user.ts
export type UserRole = 'professor'| 'escola' | 'aluno' | 'encarregado' | 'admin';

// Configurações pedagógicas do professor
export interface PedagogicalSettings {
    ordemTurmas: 'alfabetica' | 'numerica';
    ordemChamada: 'alfabetica' | 'numeroTurma';
    modoPresenca: 'individual' | 'lista';
}

export interface UserProfile {
    uid: string;
    email: string | null;
    displayName: string | null;
    pictureUrl: string | null;
    role: UserRole;
    createdAt: string | Date;
    updatedAt: string | Date;

    // Campos específicos do professor
    disciplinaPrincipal?: string;
    escola?: string; //campo do professor e aluno
    classes?: string[]; // IDs das turmas que o professor gerencia (referência)
    turmasAtivas?: string[]; // IDs das turmas que o professor gerencia

    // Configurações pedagógicas (apenas para professores)
    pedagogicalSettings?: PedagogicalSettings;

    // Campos específicos do aluno
    dataNascimento?: string | Date;
    numeroIdentificacao?: string;
    classe?: string;
    numeroEstudante?: string;
    turmasInscritas?: string[]; // IDs das turmas onde o aluno está inscrito
    encarregados?: string[]; // IDs dos encarregados associados

    // Campos específicos do encarregado
    alunosAssociados?: string[]; // IDs dos alunos associados
    contactoPrincipal?: string;
    profissao?: string;

    // Status da conta
    isActive?: boolean;
    lastLogin?: string | Date;
    isVerified?: boolean;
}

export interface AuthUser {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    emailVerified: boolean;
    providerId: string;
    lastLoginAt?: string;
    createdAt?: string;
    offlineValidUntil?: string | Date;

    // Campos locais
    isOffline?: boolean;
    lastSynced?: string | Date;
    token?: string;
    role?: UserRole;
}

export interface LocalAuthData {
    user: AuthUser;
    profile: UserProfile;
    sessionToken: string;
    lastLogin: string;
    expiresAt: string;
}
