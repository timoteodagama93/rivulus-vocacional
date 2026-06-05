"use client";
// ============================================================
// GAMA VOCACIONAL — Hook de Autenticação
// ============================================================
import { useState, useEffect, createContext, useContext, createElement } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/config";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { normalizeStudentLoginIdentifier } from "@/lib/auth/auth-utils";
import type { UserProfile, UserRole } from "@/types";

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  role: UserRole | null;
  loading: boolean;
}

interface AuthContextType extends AuthState {
  signIn: (identifier: string, password: string) => Promise<UserRole>;
  signUp: (email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

async function resolveUserProfile(uid: string): Promise<{ profile: UserProfile | null; role: UserRole | null }>{
  const [adminSnap, orientadorSnap, estudanteSnap, studentsSnap, usersSnap] = await Promise.all([
    getDoc(doc(db, COLLECTIONS.ADMINS, uid)),
    getDoc(doc(db, COLLECTIONS.ORIENTADORES, uid)),
    getDoc(doc(db, COLLECTIONS.ESTUDANTES, uid)),
    getDoc(doc(db, COLLECTIONS.STUDENTS, uid)),
    getDoc(doc(db, "users", uid)),
  ]);

  function mapExternalRole(external?: string | null): UserRole | null {
    if (!external) return null;
    const r = String(external).toLowerCase();
    if (r === "admin" || r === "administrador") return "administrador";
    if (r === "professor" || r === "orientador") return "orientador";
    if (r === "aluno" || r === "estudante") return "estudante";
    if (r === "encarregado") return "estudante";
    return null;
  }

  if (adminSnap.exists()) {
    const p = adminSnap.data() as Partial<UserProfile>;
    const profile: UserProfile = {
      uid: p.uid || uid,
      email: p.email || "",
      role: "administrador",
      createdAt: (p.createdAt as any) ? new Date(p.createdAt as any) : new Date(),
      updatedAt: (p.updatedAt as any) ? new Date(p.updatedAt as any) : new Date(),
      ativo: (p.ativo as any) ?? true,
    };
    return { profile, role: "administrador" };
  }
  if (orientadorSnap.exists()) {
    const p = orientadorSnap.data() as Partial<UserProfile>;
    const profile: UserProfile = {
      uid: p.uid || uid,
      email: p.email || "",
      role: "orientador",
      createdAt: (p.createdAt as any) ? new Date(p.createdAt as any) : new Date(),
      updatedAt: (p.updatedAt as any) ? new Date(p.updatedAt as any) : new Date(),
      ativo: (p.ativo as any) ?? true,
    };
    return { profile, role: "orientador" };
  }
  if (estudanteSnap.exists()) {
    const p = estudanteSnap.data() as Partial<UserProfile> & Record<string, any>;
    const profile: UserProfile = {
      uid: p.uid || uid,
      email: p.email || "",
      role: "estudante",
      createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
      updatedAt: p.updatedAt ? new Date(p.updatedAt) : new Date(),
      ativo: p.ativo ?? true,
    };
    return { profile, role: "estudante" };
  }
  if (studentsSnap.exists()) {
    const p = studentsSnap.data() as Partial<UserProfile> & Record<string, any>;
    const profile: UserProfile = {
      uid: p.uid || uid,
      email: p.email || "",
      role: "estudante",
      createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
      updatedAt: p.updatedAt ? new Date(p.updatedAt) : new Date(),
      ativo: p.ativo ?? true,
    };
    return { profile, role: "estudante" };
  }

  if (usersSnap.exists()) {
    const data = usersSnap.data() as Partial<UserProfile> & { role?: string } & Record<string, any>;
    const mapped = mapExternalRole(data.role);
    if (mapped) {
      const profile: UserProfile = {
        uid: data.uid || uid,
        email: data.email || "",
        role: mapped,
        createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
        updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date(),
        ativo: data.ativo ?? data.isActive ?? true,
      };
      return { profile, role: mapped };
    }
  }

  return { profile: null, role: null };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    role: null,
    loading: true,
  });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setState({ user: null, profile: null, role: null, loading: false });
        return;
      }

      const { profile, role } = await resolveUserProfile(user.uid);
      setState({ user, profile, role, loading: false });
    });

    return unsub;
  }, []);

  const signIn = async (identifier: string, password: string) => {
    const login = normalizeStudentLoginIdentifier(identifier);
    const credential = await signInWithEmailAndPassword(auth, login, password);
    const user = credential.user;

    const { profile, role } = await resolveUserProfile(user.uid);
    if (!role) {
      await signOut(auth);
      throw new Error("Conta autenticada, mas não encontrada no Rivulus. Contacte o administrador do sistema.");
    }

    setState({ user, profile, role, loading: false });
    return role;
  };

  const signUp = async (email: string, password: string, role: UserRole) => {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    const collection =
      role === "administrador" ? COLLECTIONS.ADMINS :
      role === "orientador"    ? COLLECTIONS.ORIENTADORES :
                                 COLLECTIONS.ESTUDANTES;

    await setDoc(doc(db, collection, user.uid), {
      uid: user.uid,
      email,
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
      ativo: true,
    });
  };

  const logout = () => signOut(auth);

  return createElement(
    AuthContext.Provider,
    { value: { ...state, signIn, signUp, logout } },
    children
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return ctx;
}
