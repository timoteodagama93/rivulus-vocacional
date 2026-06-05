"use client";
// ============================================================
// GAMA VOCACIONAL — Gestão de Escolas
// /admin/escolas
// ============================================================
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { COLLECTIONS } from "@/lib/firebase/collections";
import PageHeader from "@/components/layout/PageHeader";
import type { Escola } from "@/types";

const tipos = ["colegio", "instituto", "universidade", "centro_formacao"];

export default function AdminEscolasPage() {
  const [escolas, setEscolas] = useState<Escola[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroMunicipio, setFiltroMunicipio] = useState("");
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const snap = await getDocs(collection(db, COLLECTIONS.ESCOLAS));
        setEscolas(snap.docs.map((doc) => ({ ...(doc.data() as Escola) })));
      } catch (err) {
        console.error(err);
        setErro("Não foi possível carregar as escolas.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const municipios = useMemo(() => {
    return Array.from(new Set(escolas.map((escola) => escola.municipio ?? ""))).filter(Boolean).sort();
  }, [escolas]);

  const escolasFiltradas = useMemo(() => {
    return escolas.filter((escola) => {
      return (
        (!filtroTipo || escola.tipo === filtroTipo) &&
        (!filtroMunicipio || escola.municipio === filtroMunicipio)
      );
    });
  }, [escolas, filtroTipo, filtroMunicipio]);

  return (
    <div style={{ padding: 24 }}>
      <PageHeader
        title="Gestão de Escolas"
        subtitle="Cadastre instituições com perfil completo e publique para estudantes."
        actions={(
          <Link href="/admin/escolas/novo" style={{ textDecoration: "none" }}>
            <button className="btn btn-primary btn-sm">
              <i className="ti ti-school" aria-hidden="true" />
              Nova escola
            </button>
          </Link>
        )}
      />

      <div style={{ marginTop: 24, display: "grid", gap: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            Tipo de escola
            <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
              <option value="">Todos</option>
              {tipos.map((tipo) => (
                <option key={tipo} value={tipo}>{tipo}</option>
              ))}
            </select>
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            Município
            <select value={filtroMunicipio} onChange={(e) => setFiltroMunicipio(e.target.value)}>
              <option value="">Todos</option>
              {municipios.map((municipio) => (
                <option key={municipio} value={municipio}>{municipio}</option>
              ))}
            </select>
          </label>
        </div>

        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>Escolas cadastradas</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                {loading ? "A carregar..." : `${escolasFiltradas.length} de ${escolas.length} escolas`}
              </div>
            </div>
          </div>

          {erro ? (
            <div style={{ padding: 20, color: "#B91C1C" }}>{erro}</div>
          ) : (
            <div style={{ display: "grid", gap: 12, padding: 16 }}>
              {loading
                ? [...Array(4)].map((_, index) => (
                    <div key={index} style={{ background: "var(--bg-page)", borderRadius: 12, minHeight: 86 }} />
                  ))
                : escolasFiltradas.length === 0 ? (
                    <div style={{ padding: 24, textAlign: "center", color: "var(--text-muted)" }}>
                      Nenhuma escola encontrada com os filtros atuais.
                    </div>
                  ) : (
                    escolasFiltradas.map((escola) => (
                      <div key={escola.id} style={{ border: "1px solid var(--border)", borderRadius: 14, padding: 18, display: "grid", gap: 10 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                          <div>
                            <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>{escola.nome}</div>
                            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{escola.tipo} · {escola.municipio}, {escola.provincia}</div>
                          </div>
                          <Link href={`/admin/escolas/${escola.id}`} style={{ color: "#1B4F8A", textDecoration: "none", fontSize: 13 }}>
                            Ver / Editar
                          </Link>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                          <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>{escola.resumo ?? escola.descricao?.substring(0, 160) + "..."}</div>
                          <div style={{ display: "grid", gap: 6, fontSize: 12, color: "var(--text-muted)" }}>
                            <div><strong>Cursos ativos:</strong> {escola.cursos?.length ?? 0}</div>
                            <div><strong>Infraestrutura:</strong> {escola.infraestrutura?.laboratorios?.length ?? 0} laboratórios</div>
                            <div><strong>Docentes:</strong> {escola.corpoDocente?.length ?? 0}</div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
