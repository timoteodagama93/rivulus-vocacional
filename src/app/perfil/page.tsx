"use client";
// ============================================================
// RIVULUS VOCACIONAL — Página de Perfil do Estudante
// ============================================================
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { collection, doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { COLLECTIONS } from "@/lib/firebase/collections";
import type { Estudante } from "@/types";

export default function PerfilPage() {
    const { user, profile } = useAuth();
    const [estudante, setEstudante] = useState<Partial<Estudante>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    useEffect(() => {
        const uid = user?.uid;
        if (!uid) return;

        async function load() {
            setLoading(true);
            try {
                if (!uid || typeof uid !== "string") {
                    throw new Error("UID inválido");
                }

                const ref = doc(db, COLLECTIONS.ESTUDANTES, uid);
                const snap = await getDoc(ref);
                if (snap.exists()) {
                    setEstudante(snap.data() as Estudante);
                } else {
                    setEstudante({ uid, email: user?.email ?? "", role: "estudante" });
                }
            } catch (err) {
                console.error(err);
                setMessage("Erro ao carregar o perfil. Tente novamente mais tarde.");
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [user]);

    const updateField = (field: keyof Estudante, value: string) => {
        setEstudante((prev) => ({ ...prev, [field]: value }));
    };

    const handleSave = async (event: React.FormEvent) => {
        event.preventDefault();
        const uid = user?.uid;
        if (!uid) return;

        setSaving(true);
        setMessage(null);
        try {
            const estudanteRef = doc(db, COLLECTIONS.ESTUDANTES, uid);
            await setDoc(
                estudanteRef,
                {
                    ...estudante,
                    uid,
                    role: "estudante",
                    updatedAt: serverTimestamp(),
                },
                { merge: true }
            );
            setMessage("Perfil salvo com sucesso.");
        } catch (err) {
            console.error(err);
            setMessage("Não foi possível salvar o perfil. Verifique a conexão e tente novamente.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="page-body" style={{ padding: 24 }}>
                <div className="text-slate-500">A carregar o perfil...</div>
            </div>
        );
    }

    return (
        <div className="page-body" style={{ padding: 24, maxWidth: 920 }}>
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>Meu Perfil</h1>
                <p style={{ marginTop: 10, color: "var(--text-muted)" }}>
                    Complete suas informações pessoais e de educação. Isso ajuda o Rivulus a recomendar melhores opções.
                </p>
            </div>

            <form onSubmit={handleSave} style={{ display: "grid", gap: 18 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
                    <label style={{ display: "grid", gap: 6 }}>
                        Nome completo
                        <input
                            type="text"
                            value={estudante.nome ?? ""}
                            onChange={(e) => updateField("nome", e.target.value)}
                        />
                    </label>
                    <label style={{ display: "grid", gap: 6 }}>
                        Documento / BI
                        <input
                            type="text"
                            value={estudante.documento ?? ""}
                            onChange={(e) => updateField("documento", e.target.value)}
                        />
                    </label>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
                    <label style={{ display: "grid", gap: 6 }}>
                        Email
                        <input
                            type="email"
                            value={estudante.email ?? ""}
                            onChange={(e) => updateField("email", e.target.value)}
                        />
                    </label>
                    <label style={{ display: "grid", gap: 6 }}>
                        Telefone
                        <input
                            type="text"
                            value={estudante.telefone ?? ""}
                            onChange={(e) => updateField("telefone", e.target.value)}
                        />
                    </label>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
                    <label style={{ display: "grid", gap: 6 }}>
                        Escola
                        <input
                            type="text"
                            value={estudante.escola ?? ""}
                            onChange={(e) => updateField("escola", e.target.value)}
                        />
                    </label>
                    <label style={{ display: "grid", gap: 6 }}>
                        Classe
                        <input
                            type="text"
                            value={estudante.classe ?? ""}
                            onChange={(e) => updateField("classe", e.target.value)}
                        />
                    </label>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
                    <label style={{ display: "grid", gap: 6 }}>
                        Curso atual
                        <input
                            type="text"
                            value={estudante.curso ?? ""}
                            onChange={(e) => updateField("curso", e.target.value)}
                        />
                    </label>
                    <label style={{ display: "grid", gap: 6 }}>
                        Nível de ensino
                        <select
                            value={estudante.nivelEnsino ?? ""}
                            onChange={(e) => updateField("nivelEnsino", e.target.value as any)}
                        >
                            <option value="">Selecione</option>
                            <option value="primario">Primário</option>
                            <option value="i_ciclo">I Ciclo</option>
                            <option value="medio">Ensino Médio</option>
                            <option value="universitario">Universitário</option>
                            <option value="profissional">Profissional</option>
                        </select>
                    </label>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 18 }}>
                    <label style={{ display: "grid", gap: 6 }}>
                        Município
                        <input
                            type="text"
                            value={estudante.municipio ?? ""}
                            onChange={(e) => updateField("municipio", e.target.value)}
                        />
                    </label>
                    <label style={{ display: "grid", gap: 6 }}>
                        Província
                        <input
                            type="text"
                            value={estudante.provincia ?? ""}
                            onChange={(e) => updateField("provincia", e.target.value)}
                        />
                    </label>
                    <label style={{ display: "grid", gap: 6 }}>
                        Bairro
                        <input
                            type="text"
                            value={estudante.bairro ?? ""}
                            onChange={(e) => updateField("bairro", e.target.value)}
                        />
                    </label>
                </div>

                {message && (
                    <div style={{ padding: 14, borderRadius: 12, background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)" }}>
                        {message}
                    </div>
                )}

                <button
                    type="submit"
                    className="btn btn-primary btn-sm"
                    disabled={saving}
                    style={{ width: 180 }}
                >
                    {saving ? "Salvando..." : "Salvar perfil"}
                </button>
            </form>
        </div>
    );
}
