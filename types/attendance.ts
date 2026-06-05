// types/attendance.ts
// ============================================================================
// COMPATIBILIDADE: Re-export de tipos canônicos
// Este arquivo existe apenas para COMPATIBILIDADE durante a migração.
// NOVO PADRÃO: Importar de @/types (canonical)
// 
// O canonical.ts é a FONTE ÚNICA DE VERDADE.
// ============================================================================

// Re-exportar tipos principais com aliases para compatibilidade
export {
  Presenca as Attendance, StatusPresenca as AttendanceStatus, CriarPresencaDTO as CreateAttendanceDTO,
  AtualizarPresencaDTO as UpdateAttendanceDTO
} from './canonical';

// ============================================================================
// TIPOS DE SUPORTE (ainda mantidos aqui)
// ============================================================================

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
  status?: 'present' | 'absent' | 'justified';
  note?: string;
  lastUpdated?: string;
  syncStatus?: 'pending' | 'synced' | 'failed';
}

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
  attendance: number;
}
