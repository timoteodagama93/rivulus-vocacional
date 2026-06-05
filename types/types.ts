// types/user.ts
export type UserRole = 'professor' | 'aluno' | 'encarregado' | 'admin';

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
    classes?: string[];
    turmasAtivas?: string[]; // IDs das turmas que o professor gerencia

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


export type Gender = "M" | "F";

export interface Identification {
    type: "BI" | "Passaporte" | "Cédula" | "Outro";
    number: string;
}

export interface StudentPerformance {
    mac?: number;
    exam?: number;
    finalAverage?: number;
    status?: "approved" | "failed" | "pending";
}

export interface Student {
    id: string;
    userId?: string;

    fullName: string;
    shortName?: string;

    gender?: Gender;
    birthDate?: string;

    identification?: Identification;
    profilePicture?: string;

    schoolName: string;
    schoolId?: string;

    classId: string;
    className: string;

    classLevel: number;
    course: string;


    studentNumber: number; // número na pauta
    orderIndex: number;    // controlo interno (swipe, lista)

    guardianName?: string;
    guardianPhone?: string;

    performance?: StudentPerformance;

    status: "active" | "transferred" | "dropped";

    notes?: string;

    createdAt: any;
    updatedAt: any;
}

/**
 * Criar aluno
 */
export type CreateStudentDTO = Omit<
    Student,
    "id" | "performance" | "status" | "createdAt" | "updatedAt"
>;

/**
 * Atualizar aluno
 */
export type UpdateStudentDTO = Partial<CreateStudentDTO>;


// types/report.ts
export type PeriodType = 'trimestre' | 'semestre' | 'ano' | 'mes';
export type StudentStatus = 'aprovado' | 'reprovado' | 'em_risco' | 'desistente';


export interface StudentAssessment {
    studentId: string;
    studentName: string;
    studentNumber: number;
    profilePicture?: string;
    assessments: Record<AssessmentType, number | null>;
    MAC: number | null; // Média de Avaliação Contínua
    MT: number | null;  // Média Trimestral
    faltas: number;
    status: StudentStatus;
}

export interface ClassReport {
    classId: string;
    className: string;
    discipline: string;
    academicYear: string;
    teacherId: string;
    teacherName: string;
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
    period?: PeriodType;
    subPeriod?: string;
    date?: string;
}

export interface AssessmentWeight {
    AC: number; // Peso das avaliações contínuas (0-1)
    PT: number; // Peso da prova trimestral (0-1)
}

export interface ReportSettings {
    assessmentWeights: AssessmentWeight;
    passingGrade: number;
    maxAbsences: number;
    useAdvancedCalculations: boolean;
}export type LessonPlanStatus = 'rascunho' | 'ativo' | 'arquivado';

export interface Exercise {
    id: string;
    question: string;
    type: 'multiple_choice' | 'open_ended' | 'true_false';
    options?: string[]; // para multiple_choice
    correctAnswer?: string | number; // string para open_ended, índice para multiple_choice, boolean para true_false
}

export interface LessonPlan {
    id: string;
    teacherId: string;
    title: string;
    discipline: string;
    class: string; // turma, ex: "10ª A"
    thematicUnit: string; // unidade temática
    subject: string; // assunto/tema
    date: string; // YYYY-MM-DD
    generalObjective: string;
    specificObjectives: string[]; // objetivos específicos
    methods: string[]; // métodos de ensino
    materials: string[]; // materiais
    resources: string[]; // recursos
    phases: {
        introduction: {
            description: string;
            duration: number; // em minutos
            activities: string[];
        };
        development: {
            description: string;
            duration: number;
            activities: string[];
        };
        conclusion: {
            description: string;
            duration: number;
            activities: string[];
        };
    };
    homework: string; // tarefa para casa
    exercises: Exercise[]; // lista de exercícios
    status: LessonPlanStatus;
    duration: number; // duração total em minutos
    competencies?: string[]; // competências a desenvolver
    evaluationMethods?: string[]; // métodos de avaliação
    references?: string[]; // referências bibliográficas
    note?: string;
    createdAt: Date | string;
    updatedAt: Date | string;
    createdOffline?: boolean;
    synced?: boolean;
    localId?: string;
}

export type CreateLessonPlanDTO = Omit<LessonPlan, 'id' | 'createdAt' | 'updatedAt' | 'synced' | 'localId'>;
export type UpdateLessonPlanDTO = Partial<CreateLessonPlanDTO>;


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

    classLevel: number;
    course: string;
    subject: string;
    academicYear: string;

    teacherId: string;

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



// types/attendance.ts
export type AttendanceStatus = "present" | "absent" | "justified";

export interface Attendance {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  note?: string;
  teacherId: string;

  // Sincronização
  synced?: boolean;
  syncStatus: 'pending' | 'synced' | 'failed';
  lastSyncAttempt?: string;

  // Soft delete
  isDeleted?: boolean;
  deletedAt?: string;

  createdAt: string;
  updatedAt: string;
}

export type CreateAttendanceDTO = Omit<
  Attendance,
  "id" | "synced" | "syncStatus" | "createdAt" | "updatedAt" | "isDeleted"
>;

export type UpdateAttendanceDTO = Partial<Omit<Attendance, "id" | "studentId" | "classId" | "date">>;

export interface AttendanceSummary {
  date: string;
  totalStudents: number;
  present: number;
  absent: number;
  justified: number;
  percentage: number;
}

export interface StudentAttendance {
  studentId: string;
  studentName: string;
  photoUrl?: string;
  status?: AttendanceStatus;
  note?: string;
  lastUpdated?: string;
  syncStatus?: 'pending' | 'synced' | 'failed';
}

// types/attendance.ts - Adicione estas interfaces

export interface ClassAttendanceSummary {
  classId: string;
  totalStudents: number;
  totalClasses: number;
  overallAttendance: number;
  averageAttendance: number;
  absentTrend: number;
  mostAbsentStudents: StudentAttendanceSummary[];
  attendanceByMonth: Array<{
    month: string;
    attendance: number;
  }>;
}

export interface StudentAttendanceSummary {
  studentId: string;
  studentName: string;
  totalClasses: number;
  present: number;
  absent: number;
  justified: number;
  attendancePercentage: number;
  lastAttendance?: string;
  status: 'good' | 'warning' | 'critical';
}




// types/assessment.ts
export type AssessmentType =
  | "avaliacao_continua"
  | "trabalho"
  | "teste"
  | "PT"
  | "prova_trimestral";

export interface Assessment {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  discipline: string;
  type: AssessmentType;
  title: string;
  score: number;
  maxScore: number;
  weight: number;
  date: string;
  trimester?: 1 | 2 | 3 | null;
  note?: string | null;
  teacherId: string;

  // Sincronização
  synced?: boolean;
  syncStatus: 'pending' | 'synced' | 'failed';
  lastSyncAttempt?: string;

  // Soft delete
  isDeleted?: boolean;
  deletedAt?: string;

  createdAt: string;
  updatedAt: string;
}

export type CreateAssessmentDTO = Omit<
  Assessment,
  "id" | "synced" | "syncStatus" | "createdAt" | "updatedAt" | "isDeleted"
>;

export type UpdateAssessmentDTO = Partial<Omit<Assessment, "id" | "studentId" | "classId" | "discipline">>;

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
