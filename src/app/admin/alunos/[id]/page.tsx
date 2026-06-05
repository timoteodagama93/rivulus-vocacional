"use client";
// ============================================================
// RIVULUS VOCACIONAL — Detalhes do Aluno
// /admin/alunos/[id]
// ============================================================
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/config";
import { COLLECTIONS } from "@/lib/firebase/collections";
import PageHeader from "@/components/layout/PageHeader";
import { recomendarEscolasParaAluno } from "@/lib/escolas/recomendacoes";
import type { Escola, Estudante, ResultadoTeste } from "@/types";

const campos = [
    { name: "nome", label: "Nome completo", type: "text" },
    { name: "email", label: "Email", type: "email" },
    { name: "documento", label: "Documento / BI", type: "text" },
    { name: "escola", label: "Escola", type: "text" },
    { name: "classe", label: "Classe", type: "text" },
    { name: "curso", label: "Curso atual", type: "text" },
    { name: "nivelEnsino", label: "Nível de ensino", type: "select" },
    { name: "bairro", label: "Bairro", type: "text" },
    { name: "municipio", label: "Município", type: "text" },
    { name: "provincia", label: "Província", type: "text" },
    { name: "endereco", label: "Endereço", type: "text" },
    { name: "telefone", label: "Telefone", type: "text" },
    { name: "encarregado", label: "Encarregado", type: "text" },
    { name: "telefoneEncarregado", label: "Telefone do encarregado", type: "text" },
    { name: "emailEncarregado", label: "Email do encarregado", type: "email" },
];

export default function AdminAlunoDetalhesPage() {
    const params = useParams();

    const id = Array.isArray(params?.id)
        ? params.id[0]
        : params?.id;
    const router = useRouter();
    const [aluno, setAluno] = useState<Estudante | null>(null);
    const [form, setForm] = useState<Partial<Estudante>>({});
    const [loading, setLoading] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [recommendations, setRecommendations] = useState<{ escola: Escola; pontuacao: number; motivos: string[] }[]>([]);
    const [resultados, setResultados] = useState<ResultadoTeste[]>([]);
    const [senhaNova, setSenhaNova] = useState("");
    const [senhaConfirm, setSenhaConfirm] = useState("");
    const [loginMethodOverride, setLoginMethodOverride] = useState<"email" | "documento">("email");
    const [overrideEmail, setOverrideEmail] = useState("");
    const [overrideDocumento, setOverrideDocumento] = useState("");
    const [loginStatusMessage, setLoginStatusMessage] = useState<string | null>(null);
    const [atualizandoLogin, setAtualizandoLogin] = useState(false);

    useEffect(() => {
        if (!id) return;
        async function load() {
            try {
                const alunoSnap = await getDoc(doc(db, COLLECTIONS.ESTUDANTES, id));
                if (!alunoSnap.exists()) {
                    setError("Aluno não encontrado.");
                    return;
                }
                const alunoData = alunoSnap.data() as Estudante;
                setAluno(alunoData);
                setForm(alunoData);
                setLoginMethodOverride(alunoData.loginMethod ?? "email");
                setOverrideEmail(alunoData.email ?? "");
                setOverrideDocumento(alunoData.documento ?? "");

                const [resultadosSnap, escolasSnap] = await Promise.all([
                    getDocs(collection(db, COLLECTIONS.ESTUDANTES, id, "resultados")),
                    getDocs(collection(db, COLLECTIONS.ESCOLAS)),
                ]);

                const resultadosList = resultadosSnap.docs.map((doc) => ({ id: doc.id, ...(doc.data() as ResultadoTeste) }));
                const escolas = escolasSnap.docs.map((doc) => ({ id: doc.id, ...(doc.data() as Escola) }));

                setResultados(resultadosList);
                setRecommendations(recomendarEscolasParaAluno(alunoData, escolas, resultadosList, 4));
            } catch (err) {
                console.error(err);
                setError("Erro ao carregar os dados do aluno.");
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [id]);

    const atualizarCampo = (campo: keyof Estudante, valor: string) => {
        setForm((prev) => ({ ...prev, [campo]: valor }));
    };

    const atualizarLoginAluno = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoginStatusMessage(null);

        if (!id) {
            setLoginStatusMessage("Aluno inválido.");
            return;
        }

        if (!senhaNova || senhaNova.length < 6) {
            setLoginStatusMessage("A senha deve ter pelo menos 6 caracteres.");
            return;
        }

        if (senhaNova !== senhaConfirm) {
            setLoginStatusMessage("A senha e a confirmação devem coincidir.");
            return;
        }

        if (loginMethodOverride === "email" && !overrideEmail) {
            setLoginStatusMessage("O email é obrigatório para login por email.");
            return;
        }

        if (loginMethodOverride === "documento" && !overrideDocumento) {
            setLoginStatusMessage("O documento é obrigatório para login por documento.");
            return;
        }

        setAtualizandoLogin(true);

        try {
            const token = auth.currentUser ? await auth.currentUser.getIdToken() : null;
            const response = await fetch("/.netlify/functions/reset-senha-aluno", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token ? `Bearer ${token}` : "",
                },
                body: JSON.stringify({
                    estudanteId: id,
                    novoPassword: senhaNova,
                    loginMethod: loginMethodOverride,
                    email: overrideEmail,
                    documento: overrideDocumento,
                }),
            });

            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.error || "Erro ao atualizar login do aluno.");
            }

            setLoginStatusMessage("Login atualizado com sucesso.");
            setSenhaNova("");
            setSenhaConfirm("");
            router.refresh();
        } catch (err: any) {
            console.error(err);
            setLoginStatusMessage(err.message || "Erro ao atualizar login do aluno.");
        } finally {
            setAtualizandoLogin(false);
        }
    };

    const salvar = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!id) return;
        setSalvando(true);
        try {
            await setDoc(doc(db, COLLECTIONS.ESTUDANTES, id), {
                ...aluno,
                ...form,
                updatedAt: serverTimestamp(),
            }, { merge: true });
            router.refresh();
        } catch (err) {
            console.error(err);
            setError("Erro ao salvar o aluno.");
        } finally {
            setSalvando(false);
        }
    };

    const excluir = async () => {
        if (!id) return;
        const confirmacao = window.confirm("Tem certeza que deseja excluir este aluno? Esta ação não pode ser desfeita.");
        if (!confirmacao) return;
        try {
            await deleteDoc(doc(db, COLLECTIONS.ESTUDANTES, id));
            router.push("/admin/alunos");
        } catch (err) {
            console.error(err);
            setError("Erro ao excluir o aluno.");
        }
    };

    if (loading) {
        return (
            <div style={{ padding: 24 }}>
                <PageHeader title="Carregando aluno..." />
            </div>
        );
    }

    return (
        <div style={{ padding: 24 }}>
            <PageHeader
                title={aluno?.nome ? `Aluno: ${aluno.nome}` : "Aluno"}
                subtitle="Atualize informações do estudante ou veja recomendações de escolas e resultados."
                breadcrumb={[
                    { label: "Alunos", href: "/admin/alunos" },
                    { label: aluno?.nome ?? "Detalhes" },
                ]}
                actions={(
                    <Link href="/admin/alunos" style={{ textDecoration: "none" }}>
                        <button className="btn btn-secondary btn-sm">
                            <i className="ti ti-arrow-left" aria-hidden="true" /> Voltar
                        </button>
                    </Link>
                )}
            />

            <div style={{ marginTop: 24, display: "grid", gap: 18 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                    <span style={{ padding: "10px 14px", borderRadius: 14, background: "var(--bg-card)", border: "1px solid var(--border)", display: "inline-flex", alignItems: "center", gap: 8 }}>
                        <strong>Status de login:</strong>
                        {aluno?.authEmail ? (
                            <span style={{ color: "#166534" }}>
                                Criado ({aluno.loginMethod === "documento" ? "Documento" : "Email"})
                            </span>
                        ) : (
                            <span style={{ color: "#B91C1C" }}>Sem login</span>
                        )}
                    </span>
                    {aluno?.authEmail && (
                        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                            Identificador de login: {aluno.authEmail}
                        </span>
                    )}
                </div>

                <form onSubmit={atualizarLoginAluno} style={{ display: "grid", gap: 12, background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14, padding: 18 }}>
                    <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Redefinir login do aluno</h2>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            Método de login
                            <select value={loginMethodOverride} onChange={(e) => setLoginMethodOverride(e.target.value as "email" | "documento")}>
                                <option value="email">Email</option>
                                <option value="documento">Documento</option>
                            </select>
                        </label>
                        {loginMethodOverride === "email" ? (
                            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                Email de login
                                <input
                                    type="email"
                                    value={overrideEmail}
                                    onChange={(e) => setOverrideEmail(e.target.value)}
                                    placeholder="email@exemplo.com"
                                />
                            </label>
                        ) : (
                            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                Documento de login
                                <input
                                    type="text"
                                    value={overrideDocumento}
                                    onChange={(e) => setOverrideDocumento(e.target.value)}
                                    placeholder="Número do BI ou documento"
                                />
                            </label>
                        )}
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            Nova senha
                            <input
                                type="password"
                                value={senhaNova}
                                onChange={(e) => setSenhaNova(e.target.value)}
                                placeholder="Min. 6 caracteres"
                            />
                        </label>
                        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            Confirmar senha
                            <input
                                type="password"
                                value={senhaConfirm}
                                onChange={(e) => setSenhaConfirm(e.target.value)}
                                placeholder="Repita a senha"
                            />
                        </label>
                    </div>

                    {loginStatusMessage && (
                        <div style={{ color: loginStatusMessage.includes("sucesso") ? "#166534" : "#B91C1C", fontSize: 13 }}>
                            {loginStatusMessage}
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary btn-sm" disabled={atualizandoLogin}>
                        {atualizandoLogin ? "Atualizando login..." : "Redefinir login"}
                    </button>
                </form>
            </div>

            <div style={{ marginTop: 24, display: "grid", gap: 18, gridTemplateColumns: "1fr 340px" }}>
                <div style={{ display: "grid", gap: 18 }}>
                    <form onSubmit={salvar} style={{ display: "grid", gap: 18, background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14, padding: 20 }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
                            {campos.slice(0, 8).map((campo) => (
                                <label key={campo.name} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                    {campo.label}
                                    {campo.type === "select" ? (
                                        <select value={(form[campo.name as keyof Estudante] as string) ?? ""} onChange={(e) => atualizarCampo(campo.name as keyof Estudante, e.target.value)}>
                                            <option value="primario">Primário</option>
                                            <option value="i_ciclo">I Ciclo</option>
                                            <option value="medio">Ensino Médio</option>
                                            <option value="universitario">Universitário</option>
                                            <option value="profissional">Profissional</option>
                                        </select>
                                    ) : (
                                        <input
                                            type={campo.type}
                                            value={(form[campo.name as keyof Estudante] as string) ?? ""}
                                            onChange={(e) => atualizarCampo(campo.name as keyof Estudante, e.target.value)}
                                        />
                                    )}
                                </label>
                            ))}
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
                            {campos.slice(8).map((campo) => (
                                <label key={campo.name} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                    {campo.label}
                                    <input
                                        type={campo.type}
                                        value={(form[campo.name as keyof Estudante] as string) ?? ""}
                                        onChange={(e) => atualizarCampo(campo.name as keyof Estudante, e.target.value)}
                                    />
                                </label>
                            ))}
                        </div>
                        {error && <div style={{ color: "#B91C1C" }}>{error}</div>}
                        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                            <button type="submit" className="btn btn-primary btn-sm" disabled={salvando}>
                                {salvando ? "A salvar..." : "Salvar alterações"}
                            </button>
                            <button type="button" className="btn btn-danger btn-sm" onClick={excluir}>
                                Excluir aluno
                            </button>
                            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                                Última atualização: {aluno?.updatedAt ? new Date(aluno.updatedAt as any).toLocaleString() : "-"}
                            </span>
                        </div>
                    </form>
                </div>

                <aside style={{ display: "grid", gap: 18 }}>
                    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14, padding: 20 }}>
                        <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Resultados recentes</h2>
                        {resultados.length === 0 ? (
                            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Nenhum resultado encontrado.</p>
                        ) : (
                            <ul style={{ display: "grid", gap: 10, paddingLeft: 0, margin: 0, listStyle: "none" }}>
                                {resultados.slice(0, 5).map((resultado) => (
                                    <li key={resultado.id} style={{ padding: 12, border: "1px solid var(--border)", borderRadius: 12 }}>
                                        <div style={{ fontSize: 13, fontWeight: 600 }}>{resultado.testeTipo}</div>
                                        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                                            {resultado.questoesRespondidas}/{resultado.totalQuestoes} perguntas · {resultado.pontuacaoGeral ?? 0}%
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14, padding: 20 }}>
                        <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Escolas recomendadas</h2>
                        {recommendations.length === 0 ? (
                            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Carregando recomendações com base nos perfis.</p>
                        ) : (
                            recommendations.map((item) => (
                                <div key={item.escola.id} style={{ marginBottom: 14 }}>
                                    <div style={{ fontSize: 13, fontWeight: 600 }}>{item.escola.nome}</div>
                                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>
                                        {item.escola.municipio} · {item.escola.tipo}
                                    </div>
                                    <div style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 6 }}>
                                        Score: {item.pontuacao}
                                    </div>
                                    <div style={{ fontSize: 11, color: "var(--text-muted)", display: "grid", gap: 3 }}>
                                        {item.motivos.slice(0, 2).map((motivo, index) => (
                                            <span key={index}>• {motivo}</span>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </aside>
            </div>
        </div>
    );
}
