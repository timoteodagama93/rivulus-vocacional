"use client";
// ============================================================
// RIVULUS VOCACIONAL — Hook de Autenticação
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

      const [estudanteSnap, orientadorSnap, adminSnap] = await Promise.all([
        getDoc(doc(db, COLLECTIONS.ESTUDANTES, user.uid)),
        getDoc(doc(db, COLLECTIONS.ORIENTADORES, user.uid)),
        getDoc(doc(db, COLLECTIONS.ADMINS, user.uid)),
      ]);

      let profile: UserProfile | null = null;
      let role: UserRole | null = null;

      if (adminSnap.exists()) {
        profile = adminSnap.data() as UserProfile;
        role = "administrador";
      } else if (orientadorSnap.exists()) {
        profile = orientadorSnap.data() as UserProfile;
        role = "orientador";
      } else if (estudanteSnap.exists()) {
        profile = estudanteSnap.data() as UserProfile;
        role = "estudante";
      }

      setState({ user, profile, role, loading: false });
    });

    return unsub;
  }, []);

  const signIn = async (identifier: string, password: string) => {
    const login = normalizeStudentLoginIdentifier(identifier);
    const credential = await signInWithEmailAndPassword(auth, login, password);
    const user = credential.user;

    const [estudanteSnap, orientadorSnap, adminSnap] = await Promise.all([
      getDoc(doc(db, COLLECTIONS.ESTUDANTES, user.uid)),
      getDoc(doc(db, COLLECTIONS.ORIENTADORES, user.uid)),
      getDoc(doc(db, COLLECTIONS.ADMINS, user.uid)),
    ]);

    let role: UserRole | null = null;
    if (adminSnap.exists()) role = "administrador";
    else if (orientadorSnap.exists()) role = "orientador";
    else if (estudanteSnap.exists()) role = "estudante";

    if (!role) {
      await signOut(auth);
      throw new Error("Conta autenticada, mas não encontrada no Rivulus. Contacte o administrador do sistema.");
    }

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
