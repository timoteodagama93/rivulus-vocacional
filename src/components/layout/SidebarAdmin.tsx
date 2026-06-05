"use client";
// ============================================================
// RIVULUS VOCACIONAL — Sidebar do Administrador
// ============================================================
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";

interface NavGroup {
  label: string;
  items: { href: string; label: string; icon: string }[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Visão Geral",
    items: [
      { href: "/dashboard/admin",        label: "Dashboard",       icon: "ti-layout-dashboard" },
      { href: "/admin/estatisticas",     label: "Estatísticas",    icon: "ti-chart-bar"        },
    ],
  },
  {
    label: "Gestão",
    items: [
      { href: "/admin/alunos",           label: "Alunos",          icon: "ti-users"            },
      { href: "/admin/orientadores",     label: "Orientadores",    icon: "ti-user-check"       },
      { href: "/admin/escolas",          label: "Escolas",         icon: "ti-school"           },
    ],
  },
  {
    label: "Conteúdo",
    items: [
      { href: "/admin/testes",           label: "Testes",          icon: "ti-clipboard-list"   },
      { href: "/admin/relatorios",       label: "Relatórios",      icon: "ti-file-text"        },
    ],
  },
  {
    label: "Encaminhamento",
    items: [
      { href: "/admin/parceiros",        label: "Parceiros",       icon: "ti-building"         },
      { href: "/admin/encaminhamentos",  label: "Encaminhamentos", icon: "ti-arrow-right-circle" },
    ],
  },
];

export default function SidebarAdmin() {
  const pathname = usePathname();
  const { logout } = useAuth();

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
            <span style={{ color: "#fff", fontSize: 11, fontWeight: 700 }}>RV</span>
          </div>
          <div>
            <div style={{ color: "#fff", fontSize: 13, fontWeight: 600, lineHeight: 1.2 }}>
              Rivulus Vocacional
            </div>
            <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 10 }}>Academia Gama · Admin</div>
          </div>
        </div>
      </div>

      {/* Nav agrupada */}
      <nav style={{ flex: 1, padding: "12px 10px", overflowY: "auto" }}>
        {NAV_GROUPS.map((group) => (
          <div key={group.label} style={{ marginBottom: 12 }}>
            <span style={{
              fontSize: 9, fontWeight: 600, letterSpacing: ".1em",
              color: "rgba(255,255,255,0.25)", textTransform: "uppercase",
              paddingLeft: 10, display: "block", marginBottom: 4,
            }}>{group.label}</span>
            {group.items.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link key={item.href} href={item.href} style={{ textDecoration: "none" }}>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 9,
                    padding: "7px 10px", borderRadius: 7, marginBottom: 1,
                    background: active ? "rgba(255,255,255,0.1)" : "transparent",
                    borderLeft: active ? "2px solid #4A87D4" : "2px solid transparent",
                    transition: "all .15s",
                    cursor: "pointer",
                  }}>
                    <i className={`ti ${item.icon}`} style={{
                      fontSize: 15,
                      color: active ? "#7AAEE8" : "rgba(255,255,255,0.4)",
                    }} aria-hidden="true" />
                    <span style={{
                      fontSize: 13, fontWeight: active ? 500 : 400,
                      color: active ? "#fff" : "rgba(255,255,255,0.5)",
                    }}>{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Rodapé */}
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
            background: "#2D6BB5", border: "1px solid rgba(255,255,255,0.15)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <i className="ti ti-shield-check" style={{ fontSize: 14, color: "#fff" }} aria-hidden="true" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: "#fff", fontSize: 12, fontWeight: 500 }}>Administrador</div>
            <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 10 }}>Acesso total</div>
          </div>
          <button
            onClick={() => logout()}
            title="Sair"
            style={{
              background: "none", border: "none", cursor: "pointer",
              padding: 4, borderRadius: 4,
              color: "rgba(255,255,255,0.35)",
              display: "flex", alignItems: "center",
            }}
          >
            <i className="ti ti-logout" style={{ fontSize: 15 }} aria-hidden="true" />
          </button>
        </div>
      </div>
    </aside>
  );
}
