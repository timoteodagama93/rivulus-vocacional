"use client";
// ============================================================
// GAMA VOCACIONAL — Sidebar do Estudante
// ============================================================
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard/estudante",  label: "Início",          icon: "ti-home"          },
  { href: "/avaliacoes",           label: "Avaliações",      icon: "ti-clipboard-list" },
  { href: "/perfil",               label: "Meu Perfil",      icon: "ti-user-circle"   },
  { href: "/relatorios",           label: "Relatórios",      icon: "ti-file-text"     },
  { href: "/planeamento",          label: "Planeamento",     icon: "ti-target"        },
  { href: "/ia-conselheira",       label: "IA Conselheira",  icon: "ti-message-circle" },
];

export default function SidebarEstudante() {
  const pathname = usePathname();
  const { profile, logout } = useAuth();

  const initials = (profile as any)?.nome
    ? (profile as any).nome.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase()
    : "EU";

  return (
    <aside style={{
      width: "var(--sidebar-w)",
      background: "var(--bg-sidebar)",
      height: "100vh",
      position: "fixed",
      top: 0, left: 0,
      display: "flex",
      flexDirection: "column",
      zIndex: 40,
      borderRight: "1px solid rgba(255,255,255,0.06)",
    }}>
      {/* Logo */}
      <div style={{
        padding: "20px 20px 16px",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: "#1B4F8A",
            border: "1px solid rgba(255,255,255,0.15)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <span style={{ color: "#fff", fontSize: 11, fontWeight: 700, letterSpacing: 0.5 }}>RV</span>
          </div>
          <div>
            <div style={{ color: "#fff", fontSize: 13, fontWeight: 600, lineHeight: 1.2 }}>
              GAMA VOCACIONAL
            </div>
            <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 10 }}>Academia Gama</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "12px 10px", overflowY: "auto" }}>
        <div style={{ marginBottom: 6 }}>
          <span style={{
            fontSize: 9, fontWeight: 600, letterSpacing: ".1em",
            color: "rgba(255,255,255,0.25)", textTransform: "uppercase",
            paddingLeft: 10, display: "block", marginBottom: 4,
          }}>Menu</span>
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link key={item.href} href={item.href} style={{ textDecoration: "none" }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 9,
                  padding: "8px 10px", borderRadius: 7, marginBottom: 1,
                  background: active ? "rgba(255,255,255,0.1)" : "transparent",
                  borderLeft: active ? "2px solid #4A87D4" : "2px solid transparent",
                  transition: "all .15s",
                  cursor: "pointer",
                }}>
                  <i className={`ti ${item.icon}`} style={{
                    fontSize: 16,
                    color: active ? "#7AAEE8" : "rgba(255,255,255,0.45)",
                  }} aria-hidden="true" />
                  <span style={{
                    fontSize: 13, fontWeight: active ? 500 : 400,
                    color: active ? "#fff" : "rgba(255,255,255,0.55)",
                  }}>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Utilizador */}
      <div style={{
        padding: "12px 10px",
        borderTop: "1px solid rgba(255,255,255,0.07)",
      }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 9,
          padding: "8px 10px", borderRadius: 8,
          background: "rgba(255,255,255,0.05)",
        }}>
          <div style={{
            width: 30, height: 30, borderRadius: "50%",
            background: "#1B4F8A", border: "1px solid rgba(255,255,255,0.15)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <span style={{ color: "#fff", fontSize: 10, fontWeight: 600 }}>{initials}</span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              color: "#fff", fontSize: 12, fontWeight: 500,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {(profile as any)?.nome || "Estudante"}
            </div>
            <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 10 }}>Estudante</div>
          </div>
          <button
            onClick={() => logout()}
            title="Sair"
            style={{
              background: "none", border: "none", cursor: "pointer",
              padding: 4, borderRadius: 4,
              color: "rgba(255,255,255,0.35)",
              display: "flex", alignItems: "center",
              transition: "color .15s",
            }}
          >
            <i className="ti ti-logout" style={{ fontSize: 15 }} aria-hidden="true" />
          </button>
        </div>
      </div>
    </aside>
  );
}
