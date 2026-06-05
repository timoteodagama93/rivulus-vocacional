"use client";
// ============================================================
// GAMA VOCACIONAL — Admin: Seleção de aluno e iniciação de testes
// ============================================================
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useAuth } from "@/lib/hooks/useAuth";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { CATALOGO_TESTES } from "@/constants/testes";
import PageHeader from "@/components/layout/PageHeader";
import Link from "next/link";
import type { Estudante } from "@/types";

export default function AdminTestesPage() {
  const router = useRouter();
  const { logout } = useAuth();
  const [students, setStudents] = useState<Estudante[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStudents() {
      try {
        const alunosRef = query(collection(db, COLLECTIONS.ESTUDANTES), orderBy("nome"));
        const snapshot = await getDocs(alunosRef);
        setStudents(snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as any) } as Estudante)));
        if (snapshot.docs.length > 0) {
          setSelectedStudentId(snapshot.docs[0].id);
        }
      } finally {
        setLoading(false);
      }
    }
    loadStudents();
  }, []);

  const selectedStudent = students.find((aluno) => aluno.id === selectedStudentId);

  return (
    <div>
      <PageHeader
        title="Testes do Admin"
        subtitle="Selecione um aluno e depois escolha o teste a iniciar."
        actions={
          <button
            className="btn btn-secondary btn-sm"
            onClick={async () => {
              await logout();
              router.push("/auth/login");
            }}
          >
            <i className="ti ti-logout" aria-hidden="true" />
            Sair
          </button>
        }
      />

      <div className="page-body">
        <div style={{ display: "grid", gap: 24 }}>
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, padding: 20 }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>1. Selecione o aluno</h2>
            {loading ? (
              <p style={{ color: "var(--text-muted)" }}>A carregar alunos...</p>
            ) : students.length === 0 ? (
              <p style={{ color: "var(--text-muted)" }}>
                Não há alunos registados. Crie um novo aluno em <Link href="/admin/alunos/novo">/admin/alunos/novo</Link>.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <select
                  value={selectedStudentId}
                  onChange={(event) => setSelectedStudentId(event.target.value)}
                  style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg-page)" }}
                >
                  {students.map((aluno) => (
                    <option key={aluno.id} value={aluno.id}>
                      {aluno.nome} — {aluno.email || aluno.documento || aluno.authEmail}
                    </option>
                  ))}
                </select>
                {selectedStudent && (
                  <small style={{ color: "var(--text-muted)" }}>
                    Aluno selecionado: <strong>{selectedStudent.nome}</strong> ({selectedStudent.email || selectedStudent.documento || selectedStudent.authEmail})
                  </small>
                )}
              </div>
            )}
          </div>

          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, padding: 20 }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>2. Escolha um teste</h2>
            <div style={{ display: "grid", gap: 14 }}>
              {CATALOGO_TESTES.map((teste) => (
                <div key={teste.tipo} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12, alignItems: "center", padding: 16, border: "1px solid var(--border)", borderRadius: 12, background: "var(--bg-page)" }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>{teste.nome}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{teste.descricao}</div>
                  </div>
                  <button
                    className="btn btn-primary btn-sm"
                    disabled={!selectedStudentId}
                    onClick={() => {
                      if (!selectedStudentId) return;
                      router.push(`/avaliacoes/${teste.tipo}?studentId=${selectedStudentId}`);
                    }}
                  >
                    Iniciar
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
