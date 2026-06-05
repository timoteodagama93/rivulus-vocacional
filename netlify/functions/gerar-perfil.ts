// ============================================================
// GAMA VOCACIONAL — Netlify Function: Gerar Perfil Vocacional
// POST /api/gerar-perfil
// Body: { estudanteId: string, resultadosIds: string[] }
// ============================================================
import type { Handler } from "@netlify/functions";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

if (!getApps().length) {
  initializeApp({
    credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT!)),
  });
}

const db = getFirestore();

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  try {
    const { estudanteId, resultadosIds } = JSON.parse(event.body || "{}");

    if (!estudanteId || !Array.isArray(resultadosIds)) {
      return { statusCode: 400, body: JSON.stringify({ error: "Parâmetros inválidos" }) };
    }

    // Busca todos os resultados em paralelo
    const resultadosSnaps = await Promise.all(
      resultadosIds.map((id: string) =>
        db
          .collection("estudantes")
          .doc(estudanteId)
          .collection("resultados")
          .doc(id)
          .get()
      )
    );

    const resultados = resultadosSnaps
      .filter((s) => s.exists)
      .map((s) => s.data()!);

    // Calcular completude (18 testes no total)
    const completude = Math.round((resultados.length / 18) * 100);

    const perfil = {
      estudanteId,
      completude,
      geradoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
      // TODO: algoritmos de scoring por teste serão adicionados
      // em módulos separados (riasec.scorer.ts, bigfive.scorer.ts, etc.)
    };

    await db
      .collection("perfis_vocacionais")
      .doc(estudanteId)
      .set(perfil, { merge: true });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success: true, perfil }),
    };
  } catch (err) {
    console.error("Erro ao gerar perfil:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Erro interno ao gerar perfil" }),
    };
  }
};
