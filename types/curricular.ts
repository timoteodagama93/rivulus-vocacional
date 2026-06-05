// types/curricular.ts
// DEPRECATED: use canonical.ts (re-export here for compatibility)
export {
  ProgramaCurricular,
  UnidadeCurricular,
  Dosificacao,
  TemaCurricular,
  HorarioSemanal,
  HorarioAulaSlot,
  DiaSemana,
  CriarProgramaCurricularDTO as CreateProgramaCurricularDTO,
  AtualizarProgramaCurricularDTO as UpdateProgramaCurricularDTO,
  CriarUnidadeCurricularDTO as CreateUnidadeCurricularDTO,
  AtualizarUnidadeCurricularDTO as UpdateUnidadeCurricularDTO,
  CriarDosificacaoDTO as CreateDosificacaoDTO,
  AtualizarDosificacaoDTO as UpdateDosificacaoDTO
} from './canonical';
