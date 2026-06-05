// types/academic.ts
export interface Grade {
  id: string;
  studentId: string;
  subject: string;
  subjectCode?: string;
  teacherName?: string;

  // Notas
  mac1?: number;  // Avaliação contínua 1
  mac2?: number;  // Avaliação contínua 2
  mac3?: number;  // Avaliação contínua 3
  exam?: number;  // Prova/exame

  // Cálculos
  macAverage?: number;  // Média das MACs
  finalGrade?: number;  // Nota final

  // Informações
  term: '1º Trimestre' | '2º Trimestre' | '3º Trimestre' | 'Anual';
  year: number;
  classLevel: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Attendance {
  id: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  subject: string;
  status: 'present' | 'absent' | 'justified' | 'late';
  period: 'morning' | 'afternoon' | 'full';
  teacherId?: string;
  notes?: string;
}

export interface AcademicPerformance {
  studentId: string;
  term: string;
  year: number;

  // Estatísticas
  overallAverage: number;
  bestSubject: {
    subject: string;
    grade: number;
  };
  worstSubject: {
    subject: string;
    grade: number;
  };

  // Ranking
  schoolRank?: number;
  schoolTotal?: number;
  municipalRank?: number;
  municipalTotal?: number;
  nationalRank?: number;
  nationalTotal?: number;

  // Progresso
  improvement?: number; // % de melhoria vs período anterior
  attendanceRate: number; // % de presenças
}

export interface SubjectPerformance {
  subject: string;
  currentGrade: number;
  lastGrade?: number;
  trend: 'up' | 'down' | 'stable';
  teacher: string;
}

export interface RankingLevel {
  level: 'school' | 'municipal' | 'national' | 'global';
  position: number;
  totalParticipants: number;
  score: number;
  lastUpdated: string;
}




// types/academic.ts

export type AssessmentSystem = 'portuguese' | 'angolan' | 'custom';
export type GradingScale = '0-10' |'0-20' | '0-100' | 'letter' | 'percentage';
export type AcademicPeriod = 'trimestre' | 'semestre' | 'ano' | 'bimestre';
export type ApprovalStatus = 'approved' | 'failed' | 'incomplete' | 'exempt';
export type DisciplineType = 'core' | 'elective' | 'vocational' | 'extracurricular';

export interface AssessmentWeight {
  continuous: number;    // Peso das avaliações contínuas (0-1)
  project: number;       // Peso de trabalhos/projetos (0-1)
  exam: number;          // Peso da prova trimestral (0-1)
  participation: number; // Peso da participação (0-1)
}

export interface GradingRules {
  minContinuousAssessments: number;     // Mínimo de avaliações contínuas
  minPassingGrade: number;              // Nota mínima para aprovação
  minAttendancePercentage: number;      // Percentual mínimo de presença
  finalExamRequired: boolean;           // Prova final obrigatória?
  allowExamRetake: boolean;             // Permite recuperação?
  maxExamRetakes: number;               // Máximo de recuperações
  useWeightedAverage: boolean;          // Usa média ponderada?
  automaticPromotion: boolean;          // Promoção automática?
  exemptionCriteria: {
    minAverage: number;                 // Média mínima para isenção
    minAttendance: number;              // Frequência mínima para isenção
    behaviorRequirement: boolean;       // Requer bom comportamento
  };
}

export interface AcademicCalendar {
  academicYear: string;                   // Ex: "2024-2025"
  startDate: string;                      // Data de início
  endDate: string;                        // Data de término
  terms: {
    term: number;                         // 1º, 2º, 3º trimestre
    name: string;                         // "1º Trimestre"
    startDate: string;
    endDate: string;
    examPeriod: {
      start: string;
      end: string;
    };
    breakPeriod?: {
      start: string;
      end: string;
      reason: string;
    };
  }[];
  holidays: {
    date: string;
    name: string;
    description?: string;
  }[];
  importantDates: {
    date: string;
    event: string;
    description?: string;
  }[];
}

export interface ClassSchedule {
  classId: string;
  discipline: string;
  schedule: {
    dayOfWeek: number;          // 0-6 (Domingo-Sábado)
    startTime: string;          // "08:00"
    endTime: string;            // "09:30"
    room?: string;
    teacherId?: string;
    isActive: boolean;
  }[];
  totalHoursPerWeek: number;
  totalHoursPerTerm: number;
}

export interface DisciplineConfig {
  id: string;
  code: string;
  name: string;
  type: DisciplineType;
  description?: string;
  objectives: string[];
  competencies: string[];
  syllabus: {
    unit: number;
    title: string;
    topics: string[];
    hours: number;
    objectives: string[];
  }[];
  bibliography: {
    basic: string[];
    complementary: string[];
  };
  assessmentMethods: string[];   // ["Testes", "Trabalhos", "Participação"]
  resources: string[];           // ["Livro didático", "Quadro", "Projetor"]
  prerequisites?: string[];      // IDs de disciplinas pré-requisito
}

// Tipos para operações
export type CreateAcademicConfigDTO = Omit<
  AcademicConfig,
  'id' | 'createdAt' | 'updatedAt' | 'version'
>;

export type UpdateAcademicConfigDTO = Partial<Omit<AcademicConfig, 'id' | 'createdAt' | 'updatedAt'>>;

// Tipos para relatórios
export interface ClassAcademicSummary {
  classId: string;
  disciplineId: string;
  period: number;
  studentsCount: number;
  averageMAC: number;
  averageFinal: number;
  passRate: number;
  attendanceRate: number;
  topStudents: {
    studentId: string;
    studentName: string;
    finalGrade: number;
    status: ApprovalStatus;
  }[];
  studentsAtRisk: {
    studentId: string;
    studentName: string;
    reason: string;
    suggestedAction: string;
  }[];
  recommendations: string[];
}

// Tipos para configurações padrão
export interface SystemDefaults {
  assessmentSystems: Record<AssessmentSystem, {
    name: string;
    description: string;
    weights: AssessmentWeight;
    rules: Partial<GradingRules>;
  }>;
  gradingScales: Record<GradingScale, {
    name: string;
    min: number;
    max: number;
    passingGrade: number;
    conversionTable?: Record<string, number>;
  }>;
  periodConfigs: Record<AcademicPeriod, {
    name: string;
    periodsPerYear: number;
    defaultWeights: number[];
  }>;
}


// types/academic.ts - Adicione estas interfaces

export type TeachingMethod = 'expositive' | 'dialogue' | 'demonstration' | 'practical' | 'group' | 'project' | 'problem';
export type AssessmentMethod = 'written' | 'oral' | 'practical' | 'project' | 'portfolio' | 'observation' | 'self';
export type LearningStyle = 'visual' | 'auditory' | 'kinesthetic' | 'reading';
export type DifficultyLevel = 'basic' | 'intermediate' | 'advanced' | 'enrichment';

export interface PedagogicalStrategies {
  // Métodos de ensino preferenciais
  preferredTeachingMethods: TeachingMethod[];

  // Estratégias didáticas
  didacticStrategies: {
    differentiation: boolean;        // Diferenciação pedagógica
    scaffolding: boolean;            // Andamiaje
    cooperativeLearning: boolean;    // Aprendizagem cooperativa
    flippedClassroom: boolean;      // Sala de aula invertida
    gamification: boolean;          // Gamificação
    projectBased: boolean;          // Baseado em projetos
    inquiryBased: boolean;          // Baseado em investigação
  };

  // Recursos didáticos disponíveis
  availableResources: {
    type: 'textbook' | 'digital' | 'laboratory' | 'audiovisual' | 'manipulative';
    name: string;
    quantity?: number;
    notes?: string;
  }[];

  // Tecnologia educacional
  educationalTechnology: {
    usesTechnology: boolean;
    platforms: string[];            // Google Classroom, Moodle, etc.
    software: string[];             // Software específico
    hardware: string[];             // Tablets, projetores, etc.
  };

  // Adaptações curriculares
  curriculumAdaptations: {
    forSpecialNeeds: boolean;
    acceleration: boolean;          // Aceleração para alunos avançados
    enrichment: boolean;            // Enriquecimento curricular
    remediation: boolean;           // Recuperação paralela
    flexibleGrouping: boolean;      // Agrupamento flexível
  };
}

export interface LearningObjectives {
  // Objetivos gerais da disciplina
  generalObjectives: string[];

  // Competências específicas
  specificCompetencies: {
    code: string;
    description: string;
    level: DifficultyLevel;
    indicators: string[];           // Indicadores de desempenho
  }[];

  // Habilidades do século 21
  twentyFirstCenturySkills: {
    criticalThinking: boolean;
    creativity: boolean;
    collaboration: boolean;
    communication: boolean;
    digitalLiteracy: boolean;
    problemSolving: boolean;
  };

  // Metas de aprendizagem por período
  periodGoals: {
    period: number;
    objectives: string[];
    successCriteria: string[];      // Critérios de sucesso
  }[];
}

export interface AssessmentFramework {
  // Métodos de avaliação
  assessmentMethods: AssessmentMethod[];

  // Instrumentos de avaliação
  instruments: {
    type: 'test' | 'quiz' | 'essay' | 'presentation' | 'portfolio' | 'rubric';
    description: string;
    weight?: number;
    frequency?: 'weekly' | 'biweekly' | 'monthly' | 'termly';
  }[];

  // Rubricas de avaliação
  rubrics: {
    name: string;
    criteria: {
      criterion: string;
      levels: {
        level: string;
        description: string;
        points: number;
      }[];
    }[];
  }[];

  // Feedback e correção
  feedbackPolicy: {
    providesTimelyFeedback: boolean;
    feedbackMethods: string[];      // "escrito", "oral", "digital"
    correctionTime: number;         // Dias para correção
    allowsResubmission: boolean;
    revisionPolicy: string;
  };

  // Avaliação formativa vs somativa
  formativeAssessment: {
    usesFormative: boolean;
    frequency: string;
    methods: string[];
  };

  somativeAssessment: {
    usesSummative: boolean;
    schedule: string[];
    weight: number;
  };
}

export interface ClassroomManagement {
  // Normas da sala de aula
  classroomRules: string[];

  // Sistema de recompensas
  rewardSystem: {
    hasSystem: boolean;
    types: string[];                // "pontos", "selos", "privilégios"
    criteria: string[];
  };

  // Gestão de comportamento
  behaviorManagement: {
    positiveReinforcement: boolean;
    restorativePractices: boolean;
    consequences: string[];
    interventionStrategies: string[];
  };

  // Ambiente de aprendizagem
  learningEnvironment: {
    seatingArrangement: 'rows' | 'groups' | 'u-shape' | 'circle';
    classroomOrganization: string;
    displayStudentWork: boolean;
    learningCenters: boolean;
  };
}

export interface ParentalInvolvement {
  // Comunicação com famílias
  communication: {
    frequency: 'weekly' | 'biweekly' | 'monthly' | 'termly';
    methods: string[];              // "agenda", "plataforma", "reuniões"
    platform?: string;
  };

  // Reuniões e encontros
  meetings: {
    parentTeacherConferences: boolean;
    frequency: number;              // Número por período
    studentLedConferences: boolean;
  };

  // Acompanhamento em casa
  homeSupport: {
    homeworkPolicy: string;
    expectedStudyTime: number;      // Horas por semana
    resourcesForParents: string[];
  };
}

// Atualize a interface AcademicConfig para incluir as novas seções
export interface AcademicConfig {
  id: string;
  classId: string;
  disciplineId: string;
  teacherId: string;
  schoolId?: string;

  // Sistema de avaliação (existente)
  assessmentSystem: AssessmentSystem;
  gradingScale: GradingScale;
  periodType: AcademicPeriod;

  // Regras específicas (existente)
  weights: AssessmentWeight;
  rules: GradingRules;

  // Configurações de calendário (existente)
  calendar: AcademicCalendar;
  schedule: ClassSchedule;

  // Configurações da disciplina (existente)
  discipline: DisciplineConfig;

  // Metas e objetivos (existente)
  academicGoals: {
    minimumPassRate: number;
    targetAverage: number;
    improvementTarget: number;
    focusAreas: string[];
  };

  // NOVAS SEÇÕES PEDAGÓGICAS
  pedagogicalStrategies: PedagogicalStrategies;
  learningObjectives: LearningObjectives;
  assessmentFramework: AssessmentFramework;
  classroomManagement: ClassroomManagement;
  parentalInvolvement: ParentalInvolvement;

  // Personalização
  customRules?: {
    formula?: string;
    specialCases?: {
      condition: string;
      action: string;
      description: string;
    }[];
  };

  // Status e controle
  isActive: boolean;
  requiresApproval: boolean;
  approvedBy?: string;
  approvedAt?: string;

  // Metadados
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  version: number;
  notes?: string;
}