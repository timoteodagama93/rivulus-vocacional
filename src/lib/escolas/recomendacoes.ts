import type { Escola, Estudante, ResultadoTeste } from "@/types";

export interface EscolaRecomendada {
  escola: Escola;
  pontuacao: number;
  motivos: string[];
}

const termMatch = (texto: string, termos: string[]) => {
  const lower = texto.toLowerCase();
  return termos.some((termo) => termo && lower.includes(termo.toLowerCase()));
};

const normalizarTermos = (strings: (string | undefined)[]) =>
  strings
    .filter(Boolean)
    .flatMap((valor) => valor!.split(/[,;\/\-]/g))
    .map((valor) => valor.trim())
    .filter(Boolean)
    .map((valor) => valor.toLowerCase());

export function recomendarEscolasParaAluno(
  aluno: Estudante,
  escolas: Escola[],
  resultados: ResultadoTeste[] = [],
  limite = 5
): EscolaRecomendada[] {
  const busca = normalizarTermos([
    aluno.curso,
    aluno.escola,
    aluno.bairro,
    aluno.municipio,
    aluno.provincia,
    ...(aluno.areasInteresse ?? []),
    ...(aluno.carreirasPretendidas ?? []),
  ]);

  const melhoresDimensoes = resultados
    .flatMap((resultado) => resultado.dimensoes ?? [])
    .sort((a, b) => (b.pontuacao ?? 0) - (a.pontuacao ?? 0))
    .slice(0, 3)
    .map((dim) => dim.nome.toLowerCase());

  return escolas
    .map((escola) => {
      let pontuacao = 0;
      const motivos: string[] = [];

      if (aluno.municipio && escola.municipio?.toLowerCase() === aluno.municipio.toLowerCase()) {
        pontuacao += 15;
        motivos.push("Localização próxima");
      }
      if (aluno.provincia && escola.provincia?.toLowerCase() === aluno.provincia.toLowerCase()) {
        pontuacao += 10;
        motivos.push("Mesmo distrito/província");
      }

      const cursoAluno = aluno.curso?.toLowerCase() ?? "";
      escola.cursos.forEach((curso) => {
        const nomeCurso = curso.nome.toLowerCase();
        if (cursoAluno && nomeCurso.includes(cursoAluno)) {
          pontuacao += 40;
          motivos.push(`Curso compatível: ${curso.nome}`);
        }
        if (termMatch(nomeCurso, aluno.carreirasPretendidas ?? [])) {
          pontuacao += 20;
          motivos.push(`Curso alinhado com aspirações: ${curso.nome}`);
        }
        if (termMatch(nomeCurso, aluno.areasInteresse ?? [])) {
          pontuacao += 15;
          motivos.push(`Interesse e curso relacionados: ${curso.nome}`);
        }
      });

      if (termMatch(escola.nome, busca) || termMatch(escola.resumo ?? "", busca)) {
        pontuacao += 10;
        motivos.push("Perfil da escola corresponde ao interesse do aluno");
      }

      const palavrasEscola = normalizarTermos([...(escola.tags ?? []), escola.descricao, escola.resumo, escola.localidade]);
      if (termMatch(palavrasEscola.join(" "), busca)) {
        pontuacao += 10;
        motivos.push("A instituição parece relevante para o perfil informado");
      }

      if (melhoresDimensoes.length > 0) {
        const dimensoesMatch = melhoresDimensoes.filter((dim) =>
          termMatch(escola.tags?.join(" ") ?? "", [dim]) || termMatch(escola.descricao ?? "", [dim])
        );
        if (dimensoesMatch.length) {
          pontuacao += dimensoesMatch.length * 10;
          motivos.push(`Combinação de perfil e capacidades para: ${dimensoesMatch.join(", ")}`);
        }
      }

      if (escola.avaliacaoMedia && escola.avaliacaoMedia >= 4) {
        pontuacao += 5;
      }

      if (pontuacao === 0) {
        motivos.push("Ainda não existem correspondências muito fortes; verifique as ofertas e a localização.");
      }

      return { escola, pontuacao, motivos };
    })
    .sort((a, b) => b.pontuacao - a.pontuacao)
    .slice(0, limite);
}
