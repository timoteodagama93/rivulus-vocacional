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
    const nome = String(body.nome || "").trim();
    const documento = String(body.documento || "").trim();
    const email = String(body.email || "").trim();
    const password = String(body.password || "").trim();
    const loginMethod = body.loginMethod === "documento" ? "documento" : "email";
    const nivelEnsino = String(body.nivelEnsino || "medio").trim() || "medio";

    if (!nome) {
      return { statusCode: 400, body: JSON.stringify({ error: "Nome é obrigatório." }) };
    }

    if (!password || password.length < 6) {
      return { statusCode: 400, body: JSON.stringify({ error: "Senha deve ter pelo menos 6 caracteres." }) };
    }

    if (loginMethod === "email" && !email) {
      return { statusCode: 400, body: JSON.stringify({ error: "Email é obrigatório para login por email." }) };
    }

    if (loginMethod === "documento" && !documento) {
      return { statusCode: 400, body: JSON.stringify({ error: "Documento é obrigatório para login por documento." }) };
    }

    const authEmail = loginMethod === "email" ? email.toLowerCase() : getStudentEmailFromDocumento(documento);

    const userRecord = await auth.createUser({
      email: authEmail,
      password,
      displayName: nome,
    });

    const estudanteDoc = {
      uid: userRecord.uid,
      nome,
      nomeBusca: nome.toLowerCase(),
      email: email || "",
      documento: documento || "",
      authEmail,
      loginMethod,
      escola: String(body.escola || "").trim(),
      classe: String(body.classe || "").trim(),
      curso: String(body.curso || "").trim(),
      nivelEnsino,
      bairro: String(body.bairro || "").trim(),
      municipio: String(body.municipio || "").trim(),
      provincia: String(body.provincia || "").trim(),
      endereco: String(body.endereco || "").trim(),
      telefone: String(body.telefone || "").trim(),
      encarregado: String(body.encarregado || "").trim(),
      telefoneEncarregado: String(body.telefoneEncarregado || "").trim(),
      emailEncarregado: String(body.emailEncarregado || "").trim(),
      role: "estudante",
      ativo: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.collection("estudantes").doc(userRecord.uid).set(estudanteDoc);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success: true, uid: userRecord.uid }),
    };
  } catch (error: any) {
    console.error("Erro ao criar aluno:", error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: error.message || "Erro interno" }),
    };
  }
};
