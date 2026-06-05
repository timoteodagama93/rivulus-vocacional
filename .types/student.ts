// types/student.ts - DEPRECATED: Use canonical.ts (Aluno) instead
// This file exists only for backward compatibility during migration

import { Aluno as StudentType } from './canonical';

export type Gender = "M" | "F" | "Outro";

export interface Identification {
    type: "BI" | "Passaporte" | "Cedula" | "Outro";
    number: string;
}

/**
 * @deprecated Use Aluno from canonical.ts
 */
export type Student = StudentType;

/**
 * @deprecated Use Aluno from canonical.ts
 */
export type CreateStudentDTO = Omit<
    StudentType,
    "id" | "criadoEm" | "atualizadoEm" | "usuarioId"
>;

/**
 * @deprecated Use Partial<Aluno> instead
 */
export type UpdateStudentDTO = Partial<CreateStudentDTO>;

// Re-exports for backward compatibility
export type { Aluno as StudentCanonical } from './canonical';
