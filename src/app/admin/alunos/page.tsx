"use client";
// ============================================================
// RIVULUS VOCACIONAL — Gestão de Alunos
// /admin/alunos
// ============================================================
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { COLLECTIONS } from "@/lib/firebase/collections";
import PageHeader from "@/components/layout/PageHeader";
import type { Estudante } from "@/types";

const colunasDisponiveis = [
  "nome",
  "documento",
  "email",
  "escola",
  "classe",
  "curso",
  "nivelEnsino",
  "bairro",
  "municipio",
  "provincia",
] as const;

type ColunaAluno = (typeof colunasDisponiveis)[number];

const legendaColunas: Record<ColunaAluno, string> = {
  nome: "Nome",
  documento: "BI / Documento",
  email: "Email",
  escola: "Escola",
  classe: "Classe",
  curso: "Curso",
  nivelEnsino: "Nível",
  bairro: "Bairro",
  municipio: "Município",
  provincia: "Província",
};

export default function AdminAlunosPage() {
  const [alunos, setAlunos] = useState<Estudante[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [filtroEscola, setFiltroEscola] = useState("");
  const [filtroClasse, setFiltroClasse] = useState("");
  const [filtroNivel, setFiltroNivel] = useState("");
  const [filtroBairro, setFiltroBairro] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [colunas, setColunas] = useState<ColunaAluno[]>(["nome", "documento", "escola", "classe", "curso"]);

  useEffect(() => {
    async function load() {
      try {
        const snap = await getDocs(collection(db, COLLECTIONS.ESTUDANTES));
        const docs = snap.docs.map((doc) => ({ id: doc.id, ...(doc.data() as Estudante) }));
        setAlunos(docs);
      } catch (err) {
        console.error(err);
        setErro("Não foi possível carregar a lista de alunos.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const escolas = useMemo(() => {
    return Array.from(new Set(alunos.map((aluno) => aluno.escola ?? ""))).filter(Boolean).sort();
  }, [alunos]);

  const classes = useMemo(() => {
    return Array.from(new Set(alunos.map((aluno) => aluno.classe ?? ""))).filter(Boolean).sort();
  }, [alunos]);

  const bairros = useMemo(() => {
    return Array.from(new Set(alunos.map((aluno) => aluno.bairro ?? ""))).filter(Boolean).sort();
  }, [alunos]);

  const alunosFiltrados = useMemo(() => {
    return alunos.filter((aluno) => {
      const search = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !search ||
        [aluno.nome, aluno.documento, aluno.email, aluno.escola, aluno.classe, aluno.curso]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(search));

      return (
        matchesSearch &&
        (!filtroEscola || aluno.escola === filtroEscola) &&
        (!filtroClasse || aluno.classe === filtroClasse) &&
        (!filtroNivel || aluno.nivelEnsino === filtroNivel) &&
        (!filtroBairro || aluno.bairro === filtroBairro)
      );
    });
  }, [alunos, filtroEscola, filtroClasse, filtroNivel, filtroBairro, searchTerm]);

  const imprimirLista = () => {
    const novaJanela = window.open("", "_blank", "width=900,height=700,resizable=yes,scrollbars=yes");
    if (!novaJanela) return;
    const rows = alunosFiltrados.map((aluno) => {
      return `<tr>${colunas
        .map((col) => `<td style="padding:8px;border:1px solid #ccc;">${String(aluno[col] ?? "-")}</td>`)
        .join("")}</tr>`;
    }).join("");

    novaJanela.document.write(`
      <html>
        <head>
          <title>Lista de Alunos</title>
          <style>
            body { font-family: Arial, sans-serif; color: #111; padding: 24px; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
            th { background: #f4f4f4; }
          </style>
        </head>
        <body>
          <h1>Lista de Alunos</h1>
          <p>Filtros aplicados: ${filtroEscola || "Todas as escolas"}, ${filtroClasse || "Todas as classes"}, ${filtroNivel || "Todos os níveis"}, ${filtroBairro || "Todos os bairros"}</p>
          <table>
            <thead><tr>${colunas.map((col) => `<th>${legendaColunas[col]}</th>`).join("")}</tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </body>
      </html>
    `);
    novaJanela.document.close();
    novaJanela.focus();
    novaJanela.print();
  };

  return (
    <div style={{ padding: 24 }}>
      <PageHeader
        title="Gestão de Alunos"
        subtitle="Filtre, edite e imprima listas reais de alunos diretamente do Firestore."
        actions={(
          <Link href="/admin/alunos/novo" style={{ textDecoration: "none" }}>
            <button className="btn btn-primary btn-sm">
              <i className="ti ti-user-plus" aria-hidden="true" />
              Novo aluno
            </button>
          </Link>
        )}
      />

      <div style={{ marginTop: 24, display: "grid", gap: 16 }}>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            Pesquisa
            <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Nome, documento, email..." />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            Escola
            <select value={filtroEscola} onChange={(e) => setFiltroEscola(e.target.value)}>
              <option value="">Todas</option>
              {escolas.map((escola) => (
                <option key={escola} value={escola}>{escola}</option>
              ))}
            </select>
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            Classe
            <select value={filtroClasse} onChange={(e) => setFiltroClasse(e.target.value)}>
              <option value="">Todas</option>
              {classes.map((classe) => (
                <option key={classe} value={classe}>{classe}</option>
              ))}
            </select>
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            Nível
            <select value={filtroNivel} onChange={(e) => setFiltroNivel(e.target.value)}>
              <option value="">Todos</option>
              {Array.from(new Set(alunos.map((aluno) => aluno.nivelEnsino ?? ""))).filter(Boolean).map((nivel) => (
                <option key={nivel} value={nivel}>{nivel}</option>
              ))}
            </select>
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            Bairro
            <select value={filtroBairro} onChange={(e) => setFiltroBairro(e.target.value)}>
              <option value="">Todos</option>
              {bairros.map((bairro) => (
                <option key={bairro} value={bairro}>{bairro}</option>
              ))}
            </select>
          </label>
        </div>

        <div style={{ display: "grid", gap: 10, padding: 16, background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
            <strong>Colunas visíveis:</strong>
            {colunasDisponiveis.map((col) => (
              <label key={col} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12 }}>
                <input
                  type="checkbox"
                  checked={colunas.includes(col)}
                  onChange={(event) => {
                    if (event.target.checked) {
                      setColunas((prev) => Array.from(new Set([...prev, col])) as ColunaAluno[]);
                    } else {
                      setColunas((prev) => prev.filter((item) => item !== col));
                    }
                  }}
                />
                {legendaColunas[col]}
              </label>
            ))}
            <button type="button" className="btn btn-secondary btn-sm" onClick={imprimirLista} style={{ marginLeft: "auto" }}>
              <i className="ti ti-printer" aria-hidden="true" /> Imprimir lista
            </button>
          </div>
        </div>

        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>Alunos</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                {loading ? "A carregar..." : `${alunosFiltrados.length} de ${alunos.length} alunos exibidos`}
              </div>
            </div>
          </div>

          {erro ? (
            <div style={{ padding: 20, color: "#B91C1C" }}>{erro}</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 720 }}>
                <thead>
                  <tr style={{ background: "var(--bg-page)", color: "var(--text-secondary)", textAlign: "left" }}>
                    {colunas.map((col) => (
                      <th key={col} style={{ padding: "12px 14px", borderBottom: "1px solid var(--border)", fontSize: 12, textTransform: "uppercase", letterSpacing: ".03em" }}>
                        {legendaColunas[col]}
                      </th>
                    ))}
                    <th style={{ padding: "12px 14px", borderBottom: "1px solid var(--border)", width: 180 }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    [...Array(6)].map((_, index) => (
                      <tr key={index}>
                        {colunas.map((col) => (
                          <td key={col} style={{ padding: "12px 14px", borderBottom: "1px solid var(--border)", minWidth: 120 }}>
                            <div className="skeleton" style={{ height: 12, width: "80%", borderRadius: 4 }} />
                          </td>
                        ))}
                        <td style={{ padding: "12px 14px", borderBottom: "1px solid var(--border)" }} />
                      </tr>
                    ))
                  ) : alunosFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan={colunas.length + 1} style={{ padding: 24, textAlign: "center", color: "var(--text-muted)" }}>
                        Nenhum aluno corresponde aos filtros.
                      </td>
                    </tr>
                  ) : (
                    alunosFiltrados.map((aluno) => (
                      <tr key={aluno.id} style={{ borderTop: "1px solid var(--border)" }}>
                        {colunas.map((col) => (
                          <td key={col} style={{ padding: "12px 14px", borderBottom: "1px solid var(--border)", verticalAlign: "top" }}>
                            {aluno[col] ?? "-"}
                          </td>
                        ))}
                        <td style={{ padding: "12px 14px", borderBottom: "1px solid var(--border)", whiteSpace: "nowrap" }}>
                          <Link href={`/admin/alunos/${aluno.id}`} style={{ marginRight: 10, color: "#1B4F8A", textDecoration: "none", fontSize: 13 }}>
                            Ver / Editar
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
