import type { Questao, TipoTeste } from "@/types";

export const OPCOES_LIKERT = [
  { valor: 1, texto: "Discordo totalmente" },
  { valor: 2, texto: "Discordo" },
  { valor: 3, texto: "Neutro" },
  { valor: 4, texto: "Concordo" },
  { valor: 5, texto: "Concordo totalmente" },
];

type BancoDimensao = {
  nome: string;
  itens: string[];
  inversa?: boolean;
};

const contextoAngolano = [
  "nas aulas da escola, instituto ou universidade",
  "em trabalhos de grupo com colegas",
  "quando penso nas oportunidades em Angola",
  "em actividades da comunidade, igreja, associação ou família",
  "quando preciso resolver um problema com poucos recursos",
  "ao imaginar cursos, profissões e projectos para o meu futuro",
];

const criarItens = (acoes: string[], contextos = contextoAngolano) =>
  acoes.flatMap((acao) => contextos.map((contexto) => `${acao} ${contexto}.`));

const tomar = (itens: string[], total: number) =>
  Array.from({ length: total }, (_, i) => {
    const texto = itens[i % itens.length];
    return i < itens.length ? texto : `${texto} (${i + 1})`;
  });

const montarQuestoes = (tipo: TipoTeste, dimensoes: BancoDimensao[], total: number): Questao[] => {
  const questoes: Questao[] = [];
  const usadasPorDimensao = new Map<string, number>();

  while (questoes.length < total) {
    for (const dimensao of dimensoes) {
      if (questoes.length >= total) break;
      const usadas = usadasPorDimensao.get(dimensao.nome) ?? 0;
      const textoBase = dimensao.itens[usadas % dimensao.itens.length];
      usadasPorDimensao.set(dimensao.nome, usadas + 1);

      questoes.push({
        id: `${tipo}_q${questoes.length + 1}`,
        texto: usadas < dimensao.itens.length ? textoBase : `${textoBase} (${usadas + 1})`,
        tipo: "escala_likert",
        opcoes: OPCOES_LIKERT,
        dimensao: dimensao.nome,
        inversa: dimensao.inversa,
        ordem: questoes.length + 1,
      });
    }
  }

  return questoes;
};

const dim = (nome: string, acoes: string[], total: number, inversa = false): BancoDimensao => ({
  nome,
  itens: tomar(criarItens(acoes), total),
  inversa,
});

const viaForca = (nome: string, descricao: string): BancoDimensao => ({
  nome,
  itens: [
    `Uso ${descricao} para aprender melhor e apoiar colegas.`,
    `As pessoas próximas reconhecem em mim ${descricao}.`,
    `Mesmo sob pressão, tento agir com ${descricao}.`,
    `Procuro desenvolver ${descricao} no meu percurso académico e profissional.`,
  ],
});

export const DIMENSOES_TESTES: Record<TipoTeste, string[]> = {
  riasec: ["Realista", "Investigativo", "Artístico", "Social", "Empreendedor", "Convencional"],
  inteligencias_multiplas: ["Linguística", "Lógica-matemática", "Espacial", "Musical", "Corporal", "Interpessoal", "Intrapessoal", "Naturalista"],
  vak: ["Visual", "Auditivo", "Cinestésico"],
  valores_carreira: ["Segurança", "Autonomia", "Reconhecimento", "Serviço", "Rendimento", "Crescimento"],
  motivadores_profissionais: ["Realização", "Aprendizagem", "Impacto social", "Estabilidade", "Liderança"],
  interesses_academicos: ["Ciências e Tecnologia", "Saúde", "Gestão e Economia", "Humanidades", "Artes e Comunicação", "Serviços e Comunidade"],
  big_five: ["Abertura", "Conscienciosidade", "Extroversão", "Amabilidade", "Estabilidade emocional"],
  keirsey: ["Artesão", "Guardião", "Idealista", "Racional"],
  via_character: [
    "Criatividade", "Curiosidade", "Julgamento", "Amor pela aprendizagem", "Perspectiva", "Bravura",
    "Perseverança", "Honestidade", "Vitalidade", "Amor", "Bondade", "Inteligência social",
    "Trabalho em equipa", "Justiça", "Liderança", "Perdão", "Humildade", "Prudência",
    "Autocontrolo", "Apreciação da beleza", "Gratidão", "Esperança", "Humor", "Espiritualidade",
  ],
  resiliencia: ["Adaptação", "Persistência", "Apoio social", "Optimismo", "Gestão da pressão"],
  autorregulacao: ["Gestão emocional", "Disciplina", "Controlo de impulsos", "Organização"],
  comunicacao: ["Assertivo", "Escuta", "Clareza", "Gestão de conflitos"],
  autoconfianca: ["Autoeficácia", "Iniciativa", "Coragem social", "Autovalorização"],
  ancoras_carreira: ["Competência técnica", "Gestão", "Autonomia", "Segurança", "Criatividade empreendedora", "Serviço", "Desafio", "Estilo de vida"],
  clareza_vocacional: ["Autoconhecimento", "Informação sobre cursos", "Objectivos", "Confiança na escolha"],
  maturidade_vocacional: ["Exploração", "Planeamento", "Responsabilidade", "Realismo", "Compromisso"],
  tomada_decisao: ["Analítico", "Intuitivo", "Dependente", "Evitante", "Espontâneo"],
  planeamento_futuro: ["Objectivos", "Passos concretos", "Gestão do tempo", "Flexibilidade"],
};

const BANCOS: Record<TipoTeste, { total: number; dimensoes: BancoDimensao[] }> = {
  riasec: {
    total: 42,
    dimensoes: [
      dim("Realista", ["Gosto de construir, reparar ou manusear materiais", "Sinto-me motivado por tarefas práticas"], 7),
      dim("Investigativo", ["Gosto de investigar causas, dados e explicações", "Tenho curiosidade por ciência, tecnologia e pesquisa"], 7),
      dim("Artístico", ["Gosto de criar, escrever, desenhar, representar ou inovar", "Procuro formas originais de expressar ideias"], 7),
      dim("Social", ["Gosto de ensinar, orientar ou ajudar pessoas", "Sinto satisfação quando contribuo para o bem-estar dos outros"], 7),
      dim("Empreendedor", ["Gosto de liderar, negociar ou apresentar ideias", "Tenho vontade de iniciar projectos e convencer pessoas"], 7),
      dim("Convencional", ["Gosto de organizar informação, contas e processos", "Prefiro regras claras, registos e tarefas bem estruturadas"], 7),
    ],
  },
  inteligencias_multiplas: {
    total: 40,
    dimensoes: [
      dim("Linguística", ["Aprendo bem lendo, escrevendo ou explicando por palavras"], 5),
      dim("Lógica-matemática", ["Gosto de números, padrões, cálculos e problemas lógicos"], 5),
      dim("Espacial", ["Entendo melhor usando imagens, mapas, esquemas e desenhos"], 5),
      dim("Musical", ["Percebo ritmos, sons e músicas com facilidade"], 5),
      dim("Corporal", ["Aprendo melhor fazendo, praticando ou usando movimento"], 5),
      dim("Interpessoal", ["Compreendo bem as emoções e necessidades dos outros"], 5),
      dim("Intrapessoal", ["Reconheço os meus sentimentos, limites e motivações"], 5),
      dim("Naturalista", ["Tenho interesse por natureza, ambiente, agricultura ou animais"], 5),
    ],
  },
  vak: {
    total: 30,
    dimensoes: [
      dim("Visual", ["Aprendo melhor quando vejo imagens, quadros, vídeos ou esquemas"], 10),
      dim("Auditivo", ["Aprendo melhor ouvindo explicações, debates ou gravações"], 10),
      dim("Cinestésico", ["Aprendo melhor quando pratico, experimento ou manipulo materiais"], 10),
    ],
  },
  valores_carreira: {
    total: 24,
    dimensoes: [
      dim("Segurança", ["Valorizo estabilidade, contrato claro e previsibilidade"], 4),
      dim("Autonomia", ["Valorizo liberdade para decidir como executar o trabalho"], 4),
      dim("Reconhecimento", ["Valorizo ser reconhecido pelo esforço e pelos resultados"], 4),
      dim("Serviço", ["Valorizo profissões que ajudam pessoas e comunidades"], 4),
      dim("Rendimento", ["Valorizo uma carreira com boa remuneração e progresso financeiro"], 4),
      dim("Crescimento", ["Valorizo aprender continuamente e subir de responsabilidade"], 4),
    ],
  },
  motivadores_profissionais: {
    total: 20,
    dimensoes: [
      dim("Realização", ["Sinto-me motivado por metas difíceis e resultados concretos"], 4),
      dim("Aprendizagem", ["Sinto-me motivado quando desenvolvo novas competências"], 4),
      dim("Impacto social", ["Sinto-me motivado quando o meu trabalho melhora a vida de alguém"], 4),
      dim("Estabilidade", ["Sinto-me motivado por ambientes previsíveis e seguros"], 4),
      dim("Liderança", ["Sinto-me motivado quando posso coordenar pessoas ou projectos"], 4),
    ],
  },
  interesses_academicos: {
    total: 30,
    dimensoes: [
      dim("Ciências e Tecnologia", ["Tenho interesse por matemática, informática, engenharia ou ciências"], 5),
      dim("Saúde", ["Tenho interesse por medicina, enfermagem, psicologia, nutrição ou cuidados"], 5),
      dim("Gestão e Economia", ["Tenho interesse por negócios, contabilidade, gestão ou economia"], 5),
      dim("Humanidades", ["Tenho interesse por direito, história, línguas, educação ou ciências sociais"], 5),
      dim("Artes e Comunicação", ["Tenho interesse por design, música, teatro, jornalismo ou comunicação"], 5),
      dim("Serviços e Comunidade", ["Tenho interesse por turismo, serviço social, segurança ou apoio comunitário"], 5),
    ],
  },
  big_five: {
    total: 44,
    dimensoes: [
      dim("Abertura", ["Gosto de ideias novas, culturas diferentes e formas criativas de aprender"], 9),
      dim("Conscienciosidade", ["Sou organizado, pontual e cuidadoso com responsabilidades"], 9),
      dim("Extroversão", ["Ganho energia ao conversar, participar e apresentar ideias"], 9),
      dim("Amabilidade", ["Procuro cooperar, respeitar e apoiar as pessoas à minha volta"], 8),
      dim("Estabilidade emocional", ["Consigo manter equilíbrio quando há pressão, críticas ou incerteza"], 9),
    ],
  },
  keirsey: {
    total: 70,
    dimensoes: [
      dim("Artesão", ["Prefiro agir, experimentar e resolver problemas no momento"], 18),
      dim("Guardião", ["Prefiro cumprir deveres, preservar regras e proteger o grupo"], 18),
      dim("Idealista", ["Procuro sentido, relações autênticas e desenvolvimento pessoal"], 17),
      dim("Racional", ["Procuro competência, estratégia e explicações consistentes"], 17),
    ],
  },
  via_character: {
    total: 96,
    dimensoes: DIMENSOES_TESTES.via_character.map((nome) =>
      viaForca(nome, nome.toLowerCase())
    ),
  },
  resiliencia: {
    total: 25,
    dimensoes: [
      dim("Adaptação", ["Consigo ajustar-me quando a escola, a família ou os planos mudam"], 5),
      dim("Persistência", ["Continuo a tentar mesmo quando uma disciplina ou tarefa é difícil"], 5),
      dim("Apoio social", ["Procuro apoio de colegas, família, professores ou orientadores quando preciso"], 5),
      dim("Optimismo", ["Acredito que posso melhorar a minha situação com esforço e apoio"], 5),
      dim("Gestão da pressão", ["Mantenho alguma calma perante avaliações, conflitos ou problemas"], 5),
    ],
  },
  autorregulacao: {
    total: 20,
    dimensoes: [
      dim("Gestão emocional", ["Consigo reconhecer emoções antes de reagir"], 5),
      dim("Disciplina", ["Cumpro tarefas mesmo quando não estou com vontade"], 5),
      dim("Controlo de impulsos", ["Penso nas consequências antes de responder ou agir"], 5),
      dim("Organização", ["Organizo horários, materiais e prioridades de estudo"], 5),
    ],
  },
  comunicacao: {
    total: 20,
    dimensoes: [
      dim("Assertivo", ["Digo o que penso com respeito e firmeza"], 5),
      dim("Escuta", ["Escuto com atenção antes de responder"], 5),
      dim("Clareza", ["Explico ideias de forma simples e compreensível"], 5),
      dim("Gestão de conflitos", ["Procuro resolver desacordos sem humilhar nem fugir"], 5),
    ],
  },
  autoconfianca: {
    total: 16,
    dimensoes: [
      dim("Autoeficácia", ["Acredito que consigo aprender competências exigentes"], 4),
      dim("Iniciativa", ["Dou o primeiro passo quando uma oportunidade aparece"], 4),
      dim("Coragem social", ["Consigo falar ou pedir ajuda mesmo quando tenho receio"], 4),
      dim("Autovalorização", ["Reconheço qualidades pessoais sem depender só da opinião dos outros"], 4),
    ],
  },
  ancoras_carreira: {
    total: 40,
    dimensoes: [
      dim("Competência técnica", ["Quero ser reconhecido pela qualidade técnica do que faço"], 5),
      dim("Gestão", ["Quero coordenar equipas, recursos e decisões importantes"], 5),
      dim("Autonomia", ["Quero trabalhar com liberdade e responsabilidade própria"], 5),
      dim("Segurança", ["Quero uma carreira estável e previsível"], 5),
      dim("Criatividade empreendedora", ["Quero criar negócios, produtos ou soluções novas"], 5),
      dim("Serviço", ["Quero servir pessoas, instituições ou comunidades"], 5),
      dim("Desafio", ["Quero enfrentar problemas difíceis e metas ambiciosas"], 5),
      dim("Estilo de vida", ["Quero equilibrar profissão, família, saúde e interesses pessoais"], 5),
    ],
  },
  clareza_vocacional: {
    total: 20,
    dimensoes: [
      dim("Autoconhecimento", ["Consigo identificar interesses, talentos e valores pessoais"], 5),
      dim("Informação sobre cursos", ["Conheço cursos, requisitos e saídas profissionais em Angola"], 5),
      dim("Objectivos", ["Tenho objectivos académicos e profissionais definidos"], 5),
      dim("Confiança na escolha", ["Sinto confiança para defender as minhas escolhas vocacionais"], 5),
    ],
  },
  maturidade_vocacional: {
    total: 30,
    dimensoes: [
      dim("Exploração", ["Procuro informação antes de escolher curso ou profissão"], 6),
      dim("Planeamento", ["Organizo passos para chegar ao percurso desejado"], 6),
      dim("Responsabilidade", ["Assumo a minha parte nas decisões sobre o futuro"], 6),
      dim("Realismo", ["Considero notas, recursos, mercado e contexto familiar nas escolhas"], 6),
      dim("Compromisso", ["Mantenho foco depois de escolher uma meta importante"], 6),
    ],
  },
  tomada_decisao: {
    total: 22,
    dimensoes: [
      dim("Analítico", ["Comparo opções, vantagens e riscos antes de decidir"], 5),
      dim("Intuitivo", ["Uso sinais internos e experiência pessoal para decidir"], 4),
      dim("Dependente", ["Preciso muito da opinião de outras pessoas para decidir"], 4),
      dim("Evitante", ["Adio decisões quando tenho medo de errar"], 4, true),
      dim("Espontâneo", ["Decido rapidamente quando surge uma oportunidade"], 5),
    ],
  },
  planeamento_futuro: {
    total: 20,
    dimensoes: [
      dim("Objectivos", ["Defino metas claras para estudo, curso e profissão"], 5),
      dim("Passos concretos", ["Transformo metas em actividades e prazos possíveis"], 5),
      dim("Gestão do tempo", ["Distribuo tempo entre estudo, família, descanso e projectos"], 5),
      dim("Flexibilidade", ["Revejo planos quando surgem obstáculos ou novas oportunidades"], 5),
    ],
  },
};

export function gerarQuestoesTeste(tipo: TipoTeste, totalEsperado: number): Questao[] {
  const banco = BANCOS[tipo];
  if (!banco) return [];
  return montarQuestoes(tipo, banco.dimensoes, totalEsperado || banco.total);
}
