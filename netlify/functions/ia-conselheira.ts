// ============================================================
// RIVULUS VOCACIONAL — Netlify Function: IA Conselheira
// POST /api/ia-conselheira
// Body: { pergunta: string, contexto?: object }
// ============================================================
import type { Handler } from "@netlify/functions";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const SYSTEM_PROMPT = `Você é a IA Conselheira do Rivulus Vocacional, plataforma especializada
de orientação vocacional da Academia Gama, em Angola.

Missão: Apoiar estudantes angolanos a descobrirem o seu caminho académico e profissional.

Funções principais:
- Explicar resultados de testes vocacionais de forma clara, positiva e encorajadora
- Sugerir cursos, profissões e percursos compatíveis com o perfil do estudante
- Apoiar no planeamento académico e profissional
- Responder dúvidas sobre carreiras, mercado de trabalho angolano e africano
- Orientar sobre universidades e institutos em Angola e no exterior

Princípios:
- Linguagem acessível e motivadora, adaptada ao nível de ensino do estudante
- Contexto angolano e africano como referência central
- Nunca fazer diagnósticos clínicos ou psicológicos formais
- Sempre encorajar a exploração e autodescoberta
- Ser honesto sobre desafios sem desmotivar
- Respeitar as aspirações do estudante mesmo que ambiciosas`;

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  try {
    const { pergunta, contexto } = JSON.parse(event.body || "{}");

    if (!pergunta) {
      return { statusCode: 400, body: JSON.stringify({ error: "Pergunta obrigatória" }) };
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: SYSTEM_PROMPT,
    });

    const chat = model.startChat();

    const prompt = contexto
      ? `Contexto do estudante:\n${JSON.stringify(contexto, null, 2)}\n\nPergunta: ${pergunta}`
      : pergunta;

    const result = await chat.sendMessage(prompt);
    const resposta = result.response.text();

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resposta }),
    };
  } catch (err) {
    console.error("Erro na IA Conselheira:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Erro ao processar resposta da IA" }),
    };
  }
};
