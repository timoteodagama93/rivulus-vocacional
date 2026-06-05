"use client";
// ============================================================
// GAMA VOCACIONAL — Novo Aluno
// /admin/alunos/novo
// ============================================================
import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase/config";
import PageHeader from "@/components/layout/PageHeader";
import Link from "next/link";

const camposIniciais = {
  nome: "",
  email: "",
  documento: "",
  escola: "",
  classe: "",
  curso: "",
  nivelEnsino: "medio",
  bairro: "",
  municipio: "",
  provincia: "",
  endereco: "",
  telefone: "",
  encarregado: "",
  telefoneEncarregado: "",
  emailEncarregado: "",
};

export default function AdminAlunoNovoPage() {
  const router = useRouter();
  const [form, setForm] = useState(camposIniciais);
  const [loginMethod, setLoginMethod] = useState<"email" | "documento">("email");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const atualizarCampo = (campo: string, valor: string) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  };

  const criarAluno = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.nome) {
      setErro("Nome é obrigatório.");
      return;
    }

    if (!password || password.length < 6) {
      setErro("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (password !== passwordConfirm) {
      setErro("A senha e a confirmação devem coincidir.");
      return;
    }

    if (loginMethod === "email" && !form.email) {
      setErro("O email é obrigatório para criação de login por email.");
      return;
    }

    if (loginMethod === "documento" && !form.documento) {
      setErro("O documento é obrigatório para criação de login por documento.");
      return;
    }

    setSubmitting(true);
    try {
      const token = auth.currentUser ? await auth.currentUser.getIdToken() : null;
      const response = await fetch("/.netlify/functions/criar-aluno", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          ...form,
          senha: password,
          password,
          loginMethod,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Erro ao criar aluno.");
      }

      router.push(`/admin/alunos/${result.uid}`);
    } catch (err: any) {
      console.error(err);
      setErro(err.message || "Erro ao criar aluno. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <PageHeader
        title="Adicionar novo aluno"
        subtitle="Registe um estudante com dados completos para gestão e recomendação."
        breadcrumb={[
          { label: "Alunos", href: "/admin/alunos" },
          { label: "Novo" },
        ]}
        actions={(
          <Link href="/admin/alunos" style={{ textDecoration: "none" }}>
            <button className="btn btn-secondary btn-sm">
              <i className="ti ti-arrow-left" aria-hidden="true" /> Voltar
            </button>
          </Link>
        )}
      />

      <form onSubmit={criarAluno} style={{ marginTop: 24, display: "grid", gap: 18, maxWidth: 760 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            Nome completo
            <input
              type="text"
              value={form.nome}
              onChange={(e) => atualizarCampo("nome", e.target.value)}
              required
            />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            Email
            <input
              type="email"
              value={form.email}
              onChange={(e) => atualizarCampo("email", e.target.value)}
              required={loginMethod === "email"}
              placeholder={loginMethod === "documento" ? "Opcional para login por documento" : "seuemail@exemplo.com"}
            />
          </label>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 18 }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            Documento / BI
            <input
              type="text"
              value={form.documento}
              onChange={(e) => atualizarCampo("documento", e.target.value)}
            />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            Escola
            <input
              type="text"
              value={form.escola}
              onChange={(e) => atualizarCampo("escola", e.target.value)}
            />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            Classe
            <input
              type="text"
              value={form.classe}
              onChange={(e) => atualizarCampo("classe", e.target.value)}
            />
          </label>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            Método de login
            <select value={loginMethod} onChange={(e) => setLoginMethod(e.target.value as "email" | "documento") }>
              <option value="email">Email + senha</option>
              <option value="documento">Documento + senha</option>
            </select>
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            Senha de acesso
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              required
            />
          </label>
        </div>

        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          Confirmar senha
          <input
            type="password"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            required
          />
        </label>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 18 }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            Curso atual
            <input
              type="text"
              value={form.curso}
              onChange={(e) => atualizarCampo("curso", e.target.value)}
            />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            Nível de ensino
            <select value={form.nivelEnsino} onChange={(e) => atualizarCampo("nivelEnsino", e.target.value)}>
              <option value="primario">Primário</option>
              <option value="i_ciclo">I Ciclo</option>
              <option value="medio">Ensino Médio</option>
              <option value="universitario">Universitário</option>
              <option value="profissional">Profissional</option>
            </select>
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            Telefone
            <input
              type="text"
              value={form.telefone}
              onChange={(e) => atualizarCampo("telefone", e.target.value)}
            />
          </label>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 18 }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            Bairro
            <input
              type="text"
              value={form.bairro}
              onChange={(e) => atualizarCampo("bairro", e.target.value)}
            />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            Município
            <input
              type="text"
              value={form.municipio}
              onChange={(e) => atualizarCampo("municipio", e.target.value)}
            />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            Província
            <input
              type="text"
              value={form.provincia}
              onChange={(e) => atualizarCampo("provincia", e.target.value)}
            />
          </label>
        </div>

        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          Endereço
          <input
            type="text"
            value={form.endereco}
            onChange={(e) => atualizarCampo("endereco", e.target.value)}
          />
        </label>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 18 }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            Encarregado
            <input
              type="text"
              value={form.encarregado}
              onChange={(e) => atualizarCampo("encarregado", e.target.value)}
            />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            Telefone do encarregado
            <input
              type="text"
              value={form.telefoneEncarregado}
              onChange={(e) => atualizarCampo("telefoneEncarregado", e.target.value)}
            />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            Email do encarregado
            <input
              type="email"
              value={form.emailEncarregado}
              onChange={(e) => atualizarCampo("emailEncarregado", e.target.value)}
            />
          </label>
        </div>

        {erro && <div style={{ color: "#B91C1C", fontWeight: 600 }}>{erro}</div>}

        <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
          {submitting ? "A criar..." : "Criar aluno"}
        </button>
      </form>
    </div>
  );
}
