"use client";
// ============================================================
// RIVULUS VOCACIONAL — Detalhes da Escola
// /admin/escolas/[id]
// ============================================================
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { collection, deleteDoc, doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { COLLECTIONS } from "@/lib/firebase/collections";
import PageHeader from "@/components/layout/PageHeader";
import type { CursoEscola, Docente, Escola, InfraestruturaEscola } from "@/types";

const fabricaCurso = (): CursoEscola => ({
    id: crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
    nome: "",
    nivelEnsino: "medio",
    duracao: "",
    vagas: undefined,
    requisitos: [],
    competencias: [],
    descricao: "",
    areasRelacionadas: [],
    ativo: true,
});

const fabricaDocente = (): Docente => ({
    nome: "",
    cargo: "",
    qualificacao: "",
    especialidades: [],
});

export default function AdminEscolaDetalhesPage() {
    const params = useParams();

    const id = Array.isArray(params?.id)
        ? params.id[0]
        : params?.id;
    const router = useRouter();
    const [escola, setEscola] = useState<Escola | null>(null);
    const [loading, setLoading] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState<string | null>(null);
    const [form, setForm] = useState<Partial<Escola>>({});
    const [infraText, setInfraText] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!id) return;
        async function load() {
            try {
                const snap = await getDoc(doc(db, COLLECTIONS.ESCOLAS, id));
                if (!snap.exists()) {
                    setErro("Escola não encontrada.");
                    return;
                }
                const data = snap.data() as Escola;
                setEscola(data);
                setForm(data);
                setInfraText({
                    laboratorios: data.infraestrutura?.laboratorios?.join(", ") ?? "",
                    bibliotecas: data.infraestrutura?.bibliotecas?.join(", ") ?? "",
                    residencias: data.infraestrutura?.residencias?.join(", ") ?? "",
                    internet: data.infraestrutura?.internet ?? "",
                    transporte: data.infraestrutura?.transporte ?? "",
                    oficinas: data.infraestrutura?.oficinas?.join(", ") ?? "",
                    salasMultimedia: data.infraestrutura?.salasMultimedia?.join(", ") ?? "",
                    polosTecnologicos: data.infraestrutura?.polosTecnologicos?.join(", ") ?? "",
                    outros: data.infraestrutura?.outros?.join(", ") ?? "",
                });
            } catch (err) {
                console.error(err);
                setErro("Erro ao carregar a escola.");
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [id]);

    const atualizarCampo = (campo: keyof Escola, valor: string | number | boolean) => {
        setForm((prev) => ({ ...prev, [campo]: valor }));
    };

    const atualizarInfra = (campo: string, valor: string) => {
        setInfraText((prev) => ({ ...prev, [campo]: valor }));
    };

    const atualizarCurso = (index: number, campo: keyof CursoEscola, valor: string | number | boolean) => {
        const cursos = (form.cursos ?? []) as CursoEscola[];
        const atualizados = cursos.map((curso, i) => i === index ? { ...curso, [campo]: valor } : curso);
        setForm((prev) => ({ ...prev, cursos: atualizados }));
    };

    const atualizarDocente = (index: number, campo: keyof Docente, valor: string) => {
        const docentes = (form.corpoDocente ?? []) as Docente[];
        const atualizados = docentes.map((docente, i) => i === index ? { ...docente, [campo]: campo === "especialidades" ? valor.split(",").map((item) => item.trim()).filter(Boolean) : valor } : docente);
        setForm((prev) => ({ ...prev, corpoDocente: atualizados }));
    };

    const adicionarCurso = () => {
        setForm((prev) => ({ ...prev, cursos: [...(prev.cursos ?? []), fabricaCurso()] }));
    };

    const adicionarDocente = () => {
        setForm((prev) => ({ ...prev, corpoDocente: [...(prev.corpoDocente ?? []), fabricaDocente()] }));
    };

    const salvar = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!id) return;
        setSalvando(true);
        try {
            await setDoc(doc(db, COLLECTIONS.ESCOLAS, id), {
                ...escola,
                ...form,
                infraestrutura: {
                    laboratorios: (infraText.laboratorios ?? "").split(",").map((item) => item.trim()).filter(Boolean),
                    bibliotecas: (infraText.bibliotecas ?? "").split(",").map((item) => item.trim()).filter(Boolean),
                    residencias: (infraText.residencias ?? "").split(",").map((item) => item.trim()).filter(Boolean),
                    internet: infraText.internet ?? "",
                    transporte: infraText.transporte ?? "",
                    oficinas: (infraText.oficinas ?? "").split(",").map((item) => item.trim()).filter(Boolean),
                    salasMultimedia: (infraText.salasMultimedia ?? "").split(",").map((item) => item.trim()).filter(Boolean),
                    polosTecnologicos: (infraText.polosTecnologicos ?? "").split(",").map((item) => item.trim()).filter(Boolean),
                    outros: (infraText.outros ?? "").split(",").map((item) => item.trim()).filter(Boolean),
                },
                tags: (form.tags ?? []).map((tag) => String(tag).trim()).filter(Boolean),
                atualizadoEm: serverTimestamp(),
            }, { merge: true });
            router.refresh();
        } catch (err) {
            console.error(err);
            setErro("Erro ao salvar a escola.");
        } finally {
            setSalvando(false);
        }
    };

    const excluir = async () => {
        if (!id) return;
        const confirmacao = window.confirm("Tem certeza que deseja excluir esta escola?");
        if (!confirmacao) return;
        try {
            await deleteDoc(doc(db, COLLECTIONS.ESCOLAS, id));
            router.push("/admin/escolas");
        } catch (err) {
            console.error(err);
            setErro("Erro ao excluir a escola.");
        }
    };

    if (loading) {
        return (
            <div style={{ padding: 24 }}>
                <PageHeader title="Carregando escola..." />
            </div>
        );
    }

    return (
        <div style={{ padding: 24 }}>
            <PageHeader
                title={escola?.nome ? `Escola: ${escola.nome}` : "Escola"}
                subtitle="Edite o perfil da escola ou consulte detalhes completos para estudantes."
                breadcrumb={[
                    { label: "Escolas", href: "/admin/escolas" },
                    { label: escola?.nome ?? "Detalhes" },
                ]}
                actions={(
                    <Link href="/admin/escolas" style={{ textDecoration: "none" }}>
                        <button className="btn btn-secondary btn-sm">
                            <i className="ti ti-arrow-left" aria-hidden="true" /> Voltar
                        </button>
                    </Link>
                )}
            />

            <form onSubmit={salvar} style={{ marginTop: 24, display: "grid", gap: 18 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
                    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        Nome
                        <input value={form.nome ?? ""} onChange={(e) => atualizarCampo("nome", e.target.value)} required />
                    </label>
                    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        Código
                        <input value={form.codigo ?? ""} onChange={(e) => atualizarCampo("codigo", e.target.value)} />
                    </label>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 18 }}>
                    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        Tipo
                        <select value={form.tipo ?? "colegio"} onChange={(e) => atualizarCampo("tipo", e.target.value)}>
                            <option value="colegio">Colégio</option>
                            <option value="instituto">Instituto</option>
                            <option value="universidade">Universidade</option>
                            <option value="centro_formacao">Centro de formação</option>
                        </select>
                    </label>
                    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        Município
                        <input value={form.municipio ?? ""} onChange={(e) => atualizarCampo("municipio", e.target.value)} required />
                    </label>
                    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        Província
                        <input value={form.provincia ?? ""} onChange={(e) => atualizarCampo("provincia", e.target.value)} required />
                    </label>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
                    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        Localidade
                        <input value={form.localidade ?? ""} onChange={(e) => atualizarCampo("localidade", e.target.value)} required />
                    </label>
                    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        Endereço
                        <input value={form.endereco ?? ""} onChange={(e) => atualizarCampo("endereco", e.target.value)} />
                    </label>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 18 }}>
                    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        Telefone
                        <input value={form.telefone ?? ""} onChange={(e) => atualizarCampo("telefone", e.target.value)} />
                    </label>
                    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        Email
                        <input type="email" value={form.email ?? ""} onChange={(e) => atualizarCampo("email", e.target.value)} />
                    </label>
                    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        Website
                        <input value={form.website ?? ""} onChange={(e) => atualizarCampo("website", e.target.value)} />
                    </label>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
                    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        Coordenador
                        <input value={form.coordenador ?? ""} onChange={(e) => atualizarCampo("coordenador", e.target.value)} />
                    </label>
                    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        Contato administrativo
                        <input value={form.contato ?? ""} onChange={(e) => atualizarCampo("contato", e.target.value)} />
                    </label>
                </div>

                <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    Resumo
                    <input value={form.resumo ?? ""} onChange={(e) => atualizarCampo("resumo", e.target.value)} />
                </label>

                <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    Descrição completa
                    <textarea value={form.descricao ?? ""} onChange={(e) => atualizarCampo("descricao", e.target.value)} rows={5} required />
                </label>

                <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    Tags
                    <input value={(form.tags ?? []).join(", ")} onChange={(e) => atualizarCampo("tags", e.target.value.split(",").map((tag) => tag.trim()).filter(Boolean))} placeholder="Separadas por vírgula" />
                </label>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
                    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        Avaliação média
                        <input type="number" min={0} max={5} value={form.avaliacaoMedia ?? 0} onChange={(e) => atualizarCampo("avaliacaoMedia", Number(e.target.value))} />
                    </label>
                    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        Código
                        <input value={form.codigo ?? ""} onChange={(e) => atualizarCampo("codigo", e.target.value)} />
                    </label>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
                    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        Laboratórios
                        <textarea value={infraText.laboratorios ?? ""} onChange={(e) => atualizarInfra("laboratorios", e.target.value)} rows={2} />
                    </label>
                    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        Bibliotecas
                        <textarea value={infraText.bibliotecas ?? ""} onChange={(e) => atualizarInfra("bibliotecas", e.target.value)} rows={2} />
                    </label>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
                    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        Residências
                        <textarea value={infraText.residencias ?? ""} onChange={(e) => atualizarInfra("residencias", e.target.value)} rows={2} />
                    </label>
                    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        Salas multimédia
                        <textarea value={infraText.salasMultimedia ?? ""} onChange={(e) => atualizarInfra("salasMultimedia", e.target.value)} rows={2} />
                    </label>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
                    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        Transporte
                        <textarea value={infraText.transporte ?? ""} onChange={(e) => atualizarInfra("transporte", e.target.value)} rows={2} />
                    </label>
                    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        Internet
                        <textarea value={infraText.internet ?? ""} onChange={(e) => atualizarInfra("internet", e.target.value)} rows={2} />
                    </label>
                </div>

                <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    Outros
                    <textarea value={infraText.outros ?? ""} onChange={(e) => atualizarInfra("outros", e.target.value)} rows={2} />
                </label>

                <div style={{ display: "grid", gap: 14, background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14, padding: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <strong>Cursos</strong>
                        <button type="button" className="btn btn-secondary btn-sm" onClick={adicionarCurso}>
                            Adicionar curso
                        </button>
                    </div>
                    {(form.cursos ?? []).map((curso, index) => (
                        <div key={curso.id} style={{ border: "1px solid var(--border)", borderRadius: 12, padding: 14, display: "grid", gap: 12 }}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                    Nome do curso
                                    <input value={curso.nome} onChange={(e) => atualizarCurso(index, "nome", e.target.value)} />
                                </label>
                                <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                    Nível
                                    <select value={curso.nivelEnsino} onChange={(e) => atualizarCurso(index, "nivelEnsino", e.target.value)}>
                                        <option value="primario">Primário</option>
                                        <option value="i_ciclo">I Ciclo</option>
                                        <option value="medio">Ensino Médio</option>
                                        <option value="universitario">Universitário</option>
                                        <option value="profissional">Profissional</option>
                                    </select>
                                </label>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                    Duração
                                    <input value={curso.duracao} onChange={(e) => atualizarCurso(index, "duracao", e.target.value)} />
                                </label>
                                <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                    Vagas
                                    <input type="number" value={curso.vagas ?? ""} onChange={(e) => atualizarCurso(index, "vagas", Number(e.target.value))} />
                                </label>
                            </div>
                            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                Descrição
                                <textarea value={curso.descricao} onChange={(e) => atualizarCurso(index, "descricao", e.target.value)} rows={3} />
                            </label>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                    Requisitos
                                    <input value={(curso.requisitos ?? []).join(", ")} onChange={(e) => atualizarCurso(index, "requisitos", e.target.value)} />
                                </label>
                                <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                    Competências
                                    <input value={(curso.competencias ?? []).join(", ")} onChange={(e) => atualizarCurso(index, "competencias", e.target.value)} />
                                </label>
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ display: "grid", gap: 14, background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14, padding: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <strong>Corpo docente</strong>
                        <button type="button" className="btn btn-secondary btn-sm" onClick={adicionarDocente}>
                            Adicionar docente
                        </button>
                    </div>
                    {(form.corpoDocente ?? []).map((docente, index) => (
                        <div key={`${docente.nome}-${index}`} style={{ border: "1px solid var(--border)", borderRadius: 12, padding: 14, display: "grid", gap: 12 }}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                    Nome
                                    <input value={docente.nome} onChange={(e) => atualizarDocente(index, "nome", e.target.value)} />
                                </label>
                                <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                    Cargo
                                    <input value={docente.cargo} onChange={(e) => atualizarDocente(index, "cargo", e.target.value)} />
                                </label>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                    Qualificação
                                    <input value={docente.qualificacao} onChange={(e) => atualizarDocente(index, "qualificacao", e.target.value)} />
                                </label>
                                <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                    Especialidades
                                    <input value={(docente.especialidades ?? []).join(", ")} onChange={(e) => atualizarDocente(index, "especialidades", e.target.value)} />
                                </label>
                            </div>
                        </div>
                    ))}
                </div>

                {erro && <div style={{ color: "#B91C1C" }}>{erro}</div>}

                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <button type="submit" className="btn btn-primary btn-sm" disabled={salvando}>
                        {salvando ? "A salvar..." : "Salvar alterações"}
                    </button>
                    <button type="button" className="btn btn-danger btn-sm" onClick={excluir}>
                        Excluir escola
                    </button>
                </div>
            </form>
        </div>
    );
}
