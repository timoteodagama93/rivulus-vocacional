export const STUDENT_DOCUMENT_EMAIL_DOMAIN = "alunos.rivulus.vocacional";

export function normalizeStudentLoginIdentifier(login: string) {
  const trimmed = String(login || "").trim();
  if (trimmed.includes("@")) {
    return trimmed.toLowerCase();
  }
  return getStudentEmailFromDocumento(trimmed);
}

export function getStudentEmailFromDocumento(documento: string) {
  const normalized = String(documento || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  const local = normalized || "aluno";
  return `${local}@${STUDENT_DOCUMENT_EMAIL_DOMAIN}`;
}
