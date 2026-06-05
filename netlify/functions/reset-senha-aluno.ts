import type { Handler } from "@netlify/functions";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { getStudentEmailFromDocumento } from "../../src/lib/auth/auth-utils";

if (!getApps().length) {
  initializeApp({
    credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT!)),
  });
}

const db = getFirestore();
const auth = getAuth();

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  try {
    const authHeader = event.headers.authorization || event.headers.Authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.replace("Bearer ", "") : "";
    if (!token) {
      return { statusCode: 401, body: JSON.stringify({ error: "Unauthorized" }) };
    }

    const decoded = await auth.verifyIdToken(token);
    const adminSnap = await db.collection("admins").doc(decoded.uid).get();
    if (!adminSnap.exists) {
      return { statusCode: 403, body: JSON.stringify({ error: "Forbidden" }) };
    }

    const body = JSON.parse(event.body || "{}") as Record<string, any>;
    const estudanteId = String(body.estudanteId || "").trim();
    const novoPassword = String(body.novoPassword || body.password || "").trim();
    const loginMethod = body.loginMethod === "documento" ? "documento" : "email";
    const email = String(body.email || "").trim();
    const documento = String(body.documento || "").trim();

    if (!estudanteId) {
      return { statusCode: 400, body: JSON.stringify({ error: "estudanteId é obrigatório." }) };
    }

    if (!novoPassword || novoPassword.length < 6) {
      return { statusCode: 400, body: JSON.stringify({ error: "Senha deve ter pelo menos 6 caracteres." }) };
    }

    const estudanteSnap = await db.collection("estudantes").doc(estudanteId).get();
    if (!estudanteSnap.exists) {
      return { statusCode: 404, body: JSON.stringify({ error: "Aluno não encontrado." }) };
    }

    const estudante = estudanteSnap.data() || {};
    const atualLoginMethod = estudante.loginMethod === "documento" ? "documento" : "email";
    const atualDocumento = String(estudante.documento || "").trim();
    const atualEmail = String(estudante.email || "").trim();
    let novoEmail = String(estudante.authEmail || atualEmail || "").trim();
    let metodoAtualizado = atualLoginMethod;

    if (body.loginMethod) {
      if (loginMethod === "email") {
        if (!email && !atualEmail) {
          return { statusCode: 400, body: JSON.stringify({ error: "Email é obrigatório para login por email." }) };
        }
        novoEmail = email || atualEmail;
        metodoAtualizado = "email";
      } else {
        const documentoParaGerar = documento || atualDocumento;
        if (!documentoParaGerar) {
          return { statusCode: 400, body: JSON.stringify({ error: "Documento é obrigatório para login por documento." }) };
        }
        novoEmail = getStudentEmailFromDocumento(documentoParaGerar);
        metodoAtualizado = "documento";
      }
    }

    const updatePayload: Record<string, any> = { password: novoPassword };
    if (novoEmail) {
      updatePayload.email = novoEmail;
    }

    await auth.updateUser(estudanteId, updatePayload);

    await db.collection("estudantes").doc(estudanteId).set(
      {
        authEmail: novoEmail,
        loginMethod: metodoAtualizado,
        email: loginMethod === "email" ? (email || atualEmail) : atualEmail,
        documento: loginMethod === "documento" ? (documento || atualDocumento) : atualDocumento,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success: true, authEmail: novoEmail, loginMethod: metodoAtualizado }),
    };
  } catch (error: any) {
    console.error("Erro ao redefinir senha do aluno:", error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: error.message || "Erro interno" }),
    };
  }
};
