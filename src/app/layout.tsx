// ============================================================
// RIVULUS VOCACIONAL — Layout Raiz (Next.js App Router)
// ============================================================
import type { Metadata } from "next";
import { AuthProvider } from "@/lib/hooks/useAuth";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    template: "%s | Rivulus Vocacional",
    default: "Rivulus Vocacional — Academia Gama",
  },
  description: "Plataforma de orientação vocacional e profissional para estudantes angolanos.",
  applicationName: "Rivulus Vocacional",
  keywords: ["orientação vocacional", "Angola", "Academia Gama", "carreira", "RIASEC"],
  authors: [{ name: "Academia Gama" }],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
