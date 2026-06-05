export type ClassStatus = "active" | "archived";

export interface EvaluationRules {
    macMinEvaluations: number;
    macWeight: number;
    examWeight: number;
}

export interface Class {
    id: string;

    name: string;
    schoolName: string;
    schoolId?: string;
    anoLetivoId?: string;
    periodoId?: string;

    classLevel: number;
    course?: string;
    subject: string;
    subjects?: string[];
    disciplines?: string[];
    disciplinas?: string[];
    academicYear: string;

    teacherId: string;
    diretorTurma?: string[];
    professores?: string[];

    studentOrder: "alphabetical" | "numeric";
    maxStudents?: number;

    evaluationRules: EvaluationRules;

    status: ClassStatus;

    notes?: string;

    createdAt: any;
    updatedAt: any;
}

/**
 * Usado ao criar (id, timestamps e teacherId não vêm da UI)
 */
export type CreateClassDTO = Omit<
    Class,
    "id" | "teacherId" | "status" | "createdAt" | "updatedAt"
>;

/**
 * Usado ao editar
 */
export type UpdateClassDTO = Partial<CreateClassDTO>;
