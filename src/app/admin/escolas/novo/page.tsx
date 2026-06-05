"use client";
// ============================================================
// GAMA VOCACIONAL — Nova Escola
// /admin/escolas/novo
// ============================================================
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { addDoc, collection, doc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { COLLECTIONS } from "@/lib/firebase/collections";
import PageHeader from "@/components/layout/PageHeader";
import Link from "next/link";
import type { CursoEscola, Docente, InfraestruturaEscola } from "@/types";

const defaultInfraestrutura: InfraestruturaEscola = {
  laboratorios: [],
  bibliotecas: [],
  residencias: [],
  internet: "",
  transporte: "",
  oficinas: [],
  salasMultimedia: [],
  polosTecnologicos: [],
  outros: [],
};

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

export default function AdminEscolaNovaPage() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [codigo, setCodigo] = useState("");
  const [tipo, setTipo] = useState("colegio");
  const [descricao, setDescricao] = useState("");
  const [resumo, setResumo] = useState("");
  const [localidade, setLocalidade] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [provincia, setProvincia] = useState("");
  const [bairro, setBairro] = useState("");
  const [endereco, setEndereco] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [coordenador, setCoordenador] = useState("");
  const [contato, setContato] = useState("");
  const [tags, setTags] = useState("");
  const [avaliacaoMedia, setAvaliacaoMedia] = useState(4);
  const [infra, setInfra] = useState({
    laboratorios: "",
    bibliotecas: "",
    residencias: "",
    internet: "",
    transporte: "",
    oficinas: "",
    salasMultimedia: "",
    polosTecnologicos: "",
    outros: "",
  });
  const [cursos, setCursos] = useState<CursoEscola[]>([fabricaCurso()]);
  const [docentes, setDocentes] = useState<Docente[]>([fabricaDocente()]);
  const [submitting, setSubmitting] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const atualizarInfra = useCallback((campo: keyof InfraestruturaEscola, valor: string) => {
    setInfra((prev) => ({ ...prev, [campo]: valor }));
  }, []);

  const atualizarCurso = (index: number, campo: keyof CursoEscola, valor: string | number | boolean) => {
    setCursos((prev) => prev.map((curso, i) => i === index ? { ...curso, [campo]: valor } : curso));
  };

  const atualizarDocente = (index: number, campo: keyof Docente, valor: string) => {
    setDocentes((prev) => prev.map((docente, i) => i === index ? { ...docente, [campo]: campo === "especialidades" ? valor.split(",").map((item) => item.trim()).filter(Boolean) : valor } : docente));
  };

  const criarEscola = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!nome || !descricao || !localidade || !municipio || !provincia) {
      setErro("Os campos obrigatórios devem ser preenchidos.");
      return;
    }
    setSubmitting(true);
    try {
      const ref = await addDoc(collection(db, COLLECTIONS.ESCOLAS), {
        nome,
        codigo,
        tipo,
        descricao,
        resumo,
        localidade,
        municipio,
        provincia,
        bairro,
        endereco,
        telefone,
        email,
        website,
        coordenador,
        contato,
        imagemCapa: "",
        infraestrutura: {
          laboratorios: infra.laboratorios.split(",").map((item) => item.trim()).filter(Boolean),
          bibliotecas: infra.bibliotecas.split(",").map((item) => item.trim()).filter(Boolean),
          residencias: infra.residencias.split(",").map((item) => item.trim()).filter(Boolean),
          internet: infra.internet,
          transporte: infra.transporte,
          oficinas: infra.oficinas.split(",").map((item) => item.trim()).filter(Boolean),
          salasMultimedia: infra.salasMultimedia.split(",").map((item) => item.trim()).filter(Boolean),
          polosTecnologicos: infra.polosTecnologicos.split(",").map((item) => item.trim()).filter(Boolean),
          outros: infra.outros.split(",").map((item) => item.trim()).filter(Boolean),
        },
        corpoDocente: docentes.map((docente) => ({
          nome: docente.nome,
          cargo: docente.cargo,
          qualificacao: docente.qualificacao,
          especialidades: docente.especialidades ?? [],
        })),
        cursos: cursos.map((curso) => ({
          id: curso.id,
          nome: curso.nome,
          nivelEnsino: curso.nivelEnsino,
          duracao: curso.duracao,
          vagas: curso.vagas,
          requisitos: curso.requisitos ?? [],
          competencias: curso.competencias ?? [],
          descricao: curso.descricao,
          areasRelacionadas: curso.areasRelacionadas ?? [],
          ativo: true,
        })),
        tags: tags.split(",").map((tag) => tag.trim()).filter(Boolean),
        avaliacaoMedia,
        ativo: true,
        geradoEm: serverTimestamp(),
        atualizadoEm: serverTimestamp(),
      });
      await setDoc(doc(db, COLLECTIONS.ESCOLAS, ref.id), { id: ref.id }, { merge: true });
      router.push(`/admin/escolas/${ref.id}`);
    } catch (err) {
      console.error(err);
      setErro("Erro ao criar escola. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <PageHeader
        title="Adicionar nova escola"
        subtitle="Cadastre perfis detalhados completos para tomada de decisão de estudantes e encarregados."
        breadcrumb={[
          { label: "Escolas", href: "/admin/escolas" },
          { label: "Nova" },
        ]}
        actions={(
          <Link href="/admin/escolas" style={{ textDecoration: "none" }}>
            <button className="btn btn-secondary btn-sm">
              <i className="ti ti-arrow-left" aria-hidden="true" /> Voltar
            </button>
          </Link>
        )}
      />

      <form onSubmit={criarEscola} style={{ marginTop: 24, display: "grid", gap: 18 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            Nome da escola
            <input value={nome} onChange={(e) => setNome(e.target.value)} required />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            Código
            <input value={codigo} onChange={(e) => setCodigo(e.target.value)} />
          </label>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 18 }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            Tipo
            <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
              <option value="colegio">Colégio</option>
              <option value="instituto">Instituto</option>
              <option value="universidade">Universidade</option>
              <option value="centro_formacao">Centro de formação</option>
            </select>
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            Município
            <input value={municipio} onChange={(e) => setMunicipio(e.target.value)} required />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            Província
            <input value={provincia} onChange={(e) => setProvincia(e.target.value)} required />
          </label>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            Localidade / Bairro
            <input value={localidade} onChange={(e) => setLocalidade(e.target.value)} required placeholder="Ex: Luanda / Talatona" />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            Endereço
            <input value={endereco} onChange={(e) => setEndereco(e.target.value)} />
          </label>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 18 }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            Telefone
            <input value={telefone} onChange={(e) => setTelefone(e.target.value)} />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            Email
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            Website
            <input value={website} onChange={(e) => setWebsite(e.target.value)} />
          </label>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            Coordenador
            <input value={coordenador} onChange={(e) => setCoordenador(e.target.value)} />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            Contato administrativo
            <input value={contato} onChange={(e) => setContato(e.target.value)} />
          </label>
        </div>

        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          Resumo curto
          <input value={resumo} onChange={(e) => setResumo(e.target.value)} placeholder="Breve perfil para listagens" />
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          Descrição completa
          <textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} rows={5} required />
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          Tags / Áreas de destaque
          <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Separadas por vírgula" />
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          Avaliação média
          <input type="number" min={0} max={5} value={avaliacaoMedia} onChange={(e) => setAvaliacaoMedia(Number(e.target.value))} />
        </label>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            Laboratórios
            <textarea value={infra.laboratorios} onChange={(e) => atualizarInfra("laboratorios", e.target.value)} rows={2} placeholder="Separe por vírgula" />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            Bibliotecas
            <textarea value={infra.bibliotecas} onChange={(e) => atualizarInfra("bibliotecas", e.target.value)} rows={2} placeholder="Separe por vírgula" />
          </label>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            Residências
            <textarea value={infra.residencias} onChange={(e) => atualizarInfra("residencias", e.target.value)} rows={2} placeholder="Separe por vírgula" />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            Salas multimédia
            <textarea value={infra.salasMultimedia} onChange={(e) => atualizarInfra("salasMultimedia", e.target.value)} rows={2} placeholder="Separe por vírgula" />
          </label>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            Transporte
            <textarea value={infra.transporte} onChange={(e) => atualizarInfra("transporte", e.target.value)} rows={2} placeholder="Ônibus escolar, táxi, etc." />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            Internet
            <textarea value={infra.internet} onChange={(e) => atualizarInfra("internet", e.target.value)} rows={2} placeholder="Ex: fibra, Wi-Fi, laboratório" />
          </label>
        </div>

        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          Outros destaques de infraestrutura
          <textarea value={infra.outros} onChange={(e) => atualizarInfra("outros", e.target.value)} rows={3} placeholder="Separe por vírgula" />
        </label>

        <div style={{ display: "grid", gap: 14, background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14, padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <strong>Cursos oferecidos</strong>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setCursos((prev) => [...prev, fabricaCurso()])}>
              Adicionar curso
            </button>
          </div>
          {cursos.map((curso, index) => (
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
                  <input value={curso.duracao} onChange={(e) => atualizarCurso(index, "duracao", e.target.value)} placeholder="Ex: 2 anos" />
                </label>
                <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  Vagas
                  <input type="number" value={curso.vagas ?? ""} onChange={(e) => atualizarCurso(index, "vagas", Number(e.target.value))} />
                </label>
              </div>
              <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                Descrição do curso
                <textarea value={curso.descricao} onChange={(e) => atualizarCurso(index, "descricao", e.target.value)} rows={3} />
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  Requisitos
                  <input value={(curso.requisitos ?? []).join(", ")} onChange={(e) => atualizarCurso(index, "requisitos", e.target.value)} placeholder="Digite itens separados por vírgula" />
                </label>
                <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  Competências
                  <input value={(curso.competencias ?? []).join(", ")} onChange={(e) => atualizarCurso(index, "competencias", e.target.value)} placeholder="Digite itens separados por vírgula" />
                </label>
              </div>
              <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                Áreas relacionadas
                <input value={(curso.areasRelacionadas ?? []).join(", ")} onChange={(e) => atualizarCurso(index, "areasRelacionadas", e.target.value)} placeholder="Digite termos separados por vírgula" />
              </label>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gap: 14, background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14, padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <strong>Corpo docente</strong>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setDocentes((prev) => [...prev, fabricaDocente()])}>
              Adicionar docente
            </button>
          </div>
          {docentes.map((docente, index) => (
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

        {erro && <div style={{ color: "#B91C1C", fontWeight: 600 }}>{erro}</div>}

        <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
          {submitting ? "A criar escola..." : "Criar escola"}
        </button>
      </form>
    </div>
  );
}
