"use client";
// ============================================================
// GAMA VOCACIONAL — Estatísticas do Administrador
// /admin/estatisticas
// ============================================================
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { COLLECTIONS } from "@/lib/firebase/collections";
import PageHeader from "@/components/layout/PageHeader";
import StatCard from "@/components/ui/StatCard";
import type { Estudante, Escola } from "@/types";

function formatPercent(value: number) {
  return `${value.toFixed(0)}%`;
}

export default function AdminEstatisticasPage() {
  const [alunos, setAlunos] = useState<Estudante[]>([]);
  const [escolas, setEscolas] = useState<Escola[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [filtroEscola, setFiltroEscola] = useState("");
  const [filtroNivel, setFiltroNivel] = useState("");
  const [filtroMunicipio, setFiltroMunicipio] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [alunosSnap, escolasSnap] = await Promise.all([
          getDocs(collection(db, COLLECTIONS.ESTUDANTES)),
          getDocs(collection(db, COLLECTIONS.ESCOLAS)),
        ]);

        setAlunos(alunosSnap.docs.map((doc) => ({ id: doc.id, ...(doc.data() as Estudante) })));
        setEscolas(escolasSnap.docs.map((doc) => ({ ...(doc.data() as Escola) })));
      } catch (err) {
        console.error(err);
        setErro("Não foi possível carregar as estatísticas. Tente novamente mais tarde.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const escolasDisponiveis = useMemo(() => {
    return Array.from(new Set(alunos.map((aluno) => aluno.escola ?? ""))).filter(Boolean).sort();
  }, [alunos]);

  const niveisDisponiveis = useMemo(() => {
    return Array.from(new Set(alunos.map((aluno) => aluno.nivelEnsino ?? ""))).filter(Boolean).sort();
  }, [alunos]);

  const municipiosDisponiveis = useMemo(() => {
    return Array.from(new Set(alunos.map((aluno) => aluno.municipio ?? ""))).filter(Boolean).sort();
  }, [alunos]);

  const alunosFiltrados = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return alunos.filter((aluno) => {
      const matchesSearch =
        !q ||
        [aluno.nome, aluno.documento, aluno.email, aluno.escola, aluno.classe, aluno.curso, aluno.municipio, aluno.provincia]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(q));

      return (
        matchesSearch &&
        (!filtroEscola || aluno.escola === filtroEscola) &&
        (!filtroNivel || aluno.nivelEnsino === filtroNivel) &&
        (!filtroMunicipio || aluno.municipio === filtroMunicipio)
      );
    });
  }, [alunos, filtroEscola, filtroNivel, filtroMunicipio, searchTerm]);

  const totalAlunos = alunos.length;
  const perfisCompletos = alunos.filter((aluno) => aluno.nome && aluno.documento && aluno.escola && aluno.curso && aluno.nivelEnsino).length;

  const alunosPorEscola = useMemo(() => {
    const counts = new Map<string, number>();
    alunos.forEach((aluno) => {
      const key = aluno.escola || "Sem escola";
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [alunos]);

  const alunosPorCurso = useMemo(() => {
    const counts = new Map<string, number>();
    alunos.forEach((aluno) => {
      const key = aluno.curso?.trim() || "Não especificado";
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [alunos]);

  const alunosPorMunicipio = useMemo(() => {
    const counts = new Map<string, number>();
    alunos.forEach((aluno) => {
      const key = aluno.municipio || "Sem município";
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [alunos]);

  const escolasComCursos = useMemo(() => {
    return escolas.map((escola) => ({
      id: escola.id,
      nome: escola.nome,
      municipio: escola.municipio,
      provincia: escola.provincia,
      totalCursos: escola.cursos?.length ?? 0,
    })).sort((a, b) => b.totalCursos - a.totalCursos);
  }, [escolas]);

  const imprimirRelatorio = () => {
    const agora = new Date().toLocaleString("pt-PT", { dateStyle: "long", timeStyle: "short" });
    const rowsAlunos = alunosFiltrados.map((aluno) => (
      `<tr>
        <td>${aluno.nome ?? "-"}</td>
        <td>${aluno.documento ?? "-"}</td>
        <td>${aluno.escola ?? "-"}</td>
        <td>${aluno.curso ?? "-"}</td>
        <td>${aluno.nivelEnsino ?? "-"}</td>
        <td>${aluno.municipio ?? "-"}</td>
      </tr>`
    )).join("");

    const rowsEscolas = escolasComCursos.slice(0, 20).map((escola) => (
      `<tr>
        <td>${escola.nome}</td>
        <td>${escola.municipio}</td>
        <td>${escola.provincia}</td>
        <td>${escola.totalCursos}</td>
      </tr>`
    )).join("");

    const novaJanela = window.open("", "_blank", "width=1000,height=800,resizable=yes,scrollbars=yes");
    if (!novaJanela) return;

    novaJanela.document.write(`
      <html>
        <head>
          <title>Relatório de Estatísticas — Rivulus</title>
          <style>
            body { font-family: Arial, sans-serif; color: #111; margin: 24px; }
            h1, h2, h3 { margin: 0; }
            h1 { font-size: 28px; margin-bottom: 4px; }
            p { margin: 4px 0 16px; color: #4b5563; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            th, td { padding: 10px 12px; border: 1px solid #d1d5db; text-align: left; }
            th { background: #f3f4f6; }
            .section { margin-bottom: 28px; }
            .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-top: 18px; }
            .summary-card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 14px; }
            .summary-card strong { display: block; font-size: 24px; margin-bottom: 8px; }
          </style>
        </head>
        <body>
          <h1>Relatório de Estatísticas</h1>
          <p>${agora}</p>

          <div class="section">
            <h2>Resumo geral</h2>
            <div class="summary-grid">
              <div class="summary-card"><strong>${totalAlunos}</strong>Alunos cadastrados</div>
              <div class="summary-card"><strong>${escolas.length}</strong>Escolas cadastradas</div>
              <div class="summary-card"><strong>${new Set(alunos.map((aluno) => aluno.curso).filter(Boolean)).size}</strong>Cursos únicos</div>
              <div class="summary-card"><strong>${perfisCompletos}</strong>Perfis completos</div>
            </div>
          </div>

          <div class="section">
            <h2>Cruzamento: alunos por escola</h2>
            <table>
              <thead><tr><th>Escola</th><th>Alunos</th></tr></thead>
              <tbody>${alunosPorEscola.slice(0, 30).map(([escola, total]) => `<tr><td>${escola}</td><td>${total}</td></tr>`).join("")}</tbody>
            </table>
          </div>

          <div class="section">
            <h2>Cruzamento: alunos por curso</h2>
            <table>
              <thead><tr><th>Curso</th><th>Alunos</th></tr></thead>
              <tbody>${alunosPorCurso.slice(0, 30).map(([curso, total]) => `<tr><td>${curso}</td><td>${total}</td></tr>`).join("")}</tbody>
            </table>
          </div>

          <div class="section">
            <h2>Lista de alunos filtrados</h2>
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Documento</th>
                  <th>Escola</th>
                  <th>Curso</th>
                  <th>Nível</th>
                  <th>Município</th>
                </tr>
              </thead>
              <tbody>${rowsAlunos}</tbody>
            </table>
          </div>
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
        title="Estatísticas e Relatórios"
        subtitle="Visão dos alunos, escolas e cruzamentos entre perfis, cursos e localizações."
        actions={(
          <button className="btn btn-primary btn-sm" onClick={imprimirRelatorio} disabled={loading || alunosFiltrados.length === 0}>
            <i className="ti ti-printer" aria-hidden="true" />
            Imprimir relatório
          </button>
        )}
      />

      <div style={{ marginTop: 24, display: "grid", gap: 18 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
          <StatCard label="Alunos cadastrados" value={loading ? "..." : totalAlunos} icon="ti-users" color="#E8F0FA" iconColor="#1B4F8A" />
          <StatCard label="Escolas cadastradas" value={loading ? "..." : escolas.length} icon="ti-school" color="#EAF3DE" iconColor="#0F5E3F" />
          <StatCard label="Cursos únicos" value={loading ? "..." : new Set(alunos.map((aluno) => aluno.curso).filter(Boolean)).size} icon="ti-book" color="#FEF3C7" iconColor="#B45309" />
          <StatCard label="Perfis completos" value={loading ? "..." : perfisCompletos} icon="ti-user-check" color="#FAEDEA" iconColor="#C53030" />
        </div>

        <div style={{ display: "grid", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 16 }}>
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: 20 }}>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Alunos por escola</h2>
              <div style={{ marginTop: 16, display: "grid", gap: 10 }}>
                {loading ? (
                  <div>Carregando...</div>
                ) : alunosPorEscola.slice(0, 8).map(([escola, total]) => (
                  <div key={escola} style={{ display: "flex", justifyContent: "space-between", gap: 10, padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                    <span style={{ color: "var(--text-primary)", fontSize: 13 }}>{escola}</span>
                    <strong style={{ color: "var(--text-secondary)" }}>{total}</strong>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: 20 }}>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Cursos mais procurados</h2>
              <div style={{ marginTop: 16, display: "grid", gap: 10 }}>
                {loading ? (
                  <div>Carregando...</div>
                ) : alunosPorCurso.slice(0, 8).map(([curso, total]) => (
                  <div key={curso} style={{ display: "flex", justifyContent: "space-between", gap: 10, padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                    <span style={{ color: "var(--text-primary)", fontSize: 13 }}>{curso}</span>
                    <strong style={{ color: "var(--text-secondary)" }}>{total}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: 20 }}>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Alunos por município</h2>
              <div style={{ marginTop: 16, display: "grid", gap: 10 }}>
                {alunosPorMunicipio.slice(0, 8).map(([municipio, total]) => (
                  <div key={municipio} style={{ display: "flex", justifyContent: "space-between", gap: 10, padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                    <span style={{ color: "var(--text-primary)", fontSize: 13 }}>{municipio}</span>
                    <strong style={{ color: "var(--text-secondary)" }}>{total}</strong>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: 20 }}>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Escolas e cursos</h2>
              <div style={{ marginTop: 16, display: "grid", gap: 10 }}>
                {escolasComCursos.slice(0, 8).map((escola) => (
                  <div key={escola.id} style={{ display: "flex", justifyContent: "space-between", gap: 10, padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                    <span style={{ color: "var(--text-primary)", fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{escola.nome}</span>
                    <strong style={{ color: "var(--text-secondary)" }}>{escola.totalCursos}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gap: 16, background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: 20 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
            <div style={{ minWidth: 200 }}>
              <label style={{ display: "block", fontSize: 12, marginBottom: 6, color: "var(--text-secondary)" }}>Pesquisar e filtrar</label>
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar nome, escola, curso, município..."
                style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border)" }}
              />
            </div>
            <select value={filtroEscola} onChange={(e) => setFiltroEscola(e.target.value)} style={{ minWidth: 180, padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border)" }}>
              <option value="">Todas as escolas</option>
              {escolasDisponiveis.map((escola) => (
                <option key={escola} value={escola}>{escola}</option>
              ))}
            </select>
            <select value={filtroNivel} onChange={(e) => setFiltroNivel(e.target.value)} style={{ minWidth: 180, padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border)" }}>
              <option value="">Todos os níveis</option>
              {niveisDisponiveis.map((nivel) => (
                <option key={nivel} value={nivel}>{nivel}</option>
              ))}
            </select>
            <select value={filtroMunicipio} onChange={(e) => setFiltroMunicipio(e.target.value)} style={{ minWidth: 180, padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border)" }}>
              <option value="">Todos os municípios</option>
              {municipiosDisponiveis.map((municipio) => (
                <option key={municipio} value={municipio}>{municipio}</option>
              ))}
            </select>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 840 }}>
              <thead>
                <tr style={{ background: "var(--bg-page)", color: "var(--text-secondary)", textAlign: "left" }}>
                  <th style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)" }}>Nome</th>
                  <th style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)" }}>Escola</th>
                  <th style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)" }}>Curso</th>
                  <th style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)" }}>Nível</th>
                  <th style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)" }}>Município</th>
                  <th style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)" }}>Perfil</th>
                  <th style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)" }}></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(6)].map((_, index) => (
                    <tr key={index}>
                      {Array.from({ length: 7 }).map((_, tdIndex) => (
                        <td key={tdIndex} style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)" }}>
                          <div className="skeleton" style={{ height: 12, width: "80%", borderRadius: 4 }} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : alunosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: 24, textAlign: "center", color: "var(--text-muted)" }}>
                      Nenhum aluno corresponde aos filtros.
                    </td>
                  </tr>
                ) : (
                  alunosFiltrados.slice(0, 20).map((aluno) => (
                    <tr key={aluno.id}>
                      <td style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)" }}>{aluno.nome}</td>
                      <td style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)" }}>{aluno.escola}</td>
                      <td style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)" }}>{aluno.curso}</td>
                      <td style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)" }}>{aluno.nivelEnsino}</td>
                      <td style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)" }}>{aluno.municipio}</td>
                      <td style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)" }}>
                        {aluno.nome && aluno.documento && aluno.escola && aluno.curso && aluno.nivelEnsino ? "Completo" : "Incompleto"}
                      </td>
                      <td style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)" }}>
                        <Link href={`/admin/alunos/${aluno.id}`} style={{ color: "#1B4F8A", textDecoration: "none", fontSize: 13 }}>
                          Ver perfil
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
            <div style={{ color: "var(--text-muted)", fontSize: 13 }}>
              {alunosFiltrados.length} aluno(s) exibido(s) — mostrando os 20 primeiros resultados.
            </div>
            <Link href="/admin/alunos" style={{ textDecoration: "none" }}>
              <button className="btn btn-secondary btn-sm">Ver todos os alunos</button>
            </Link>
          </div>
        </div>
      </div>

      {erro && (
        <div style={{ marginTop: 18, color: "#B91C1C" }}>{erro}</div>
      )}
    </div>
  );
}
