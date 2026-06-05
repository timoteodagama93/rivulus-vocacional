"use client";
// ============================================================
// GAMA VOCACIONAL — PageHeader
// Header superior reutilizável em todas as páginas
// ============================================================
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  breadcrumb?: { label: string; href?: string }[];
}

export default function PageHeader({ title, subtitle, actions, breadcrumb }: PageHeaderProps) {
  return (
    <header style={{
      height: "var(--header-h)",
      background: "var(--bg-card)",
      borderBottom: "1px solid var(--border)",
      display: "flex", alignItems: "center",
      padding: "0 24px",
      position: "sticky", top: 0, zIndex: 30,
      gap: 16,
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        {breadcrumb && breadcrumb.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
            {breadcrumb.map((crumb, i) => (
              <span key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {i > 0 && (
                  <i className="ti ti-chevron-right" style={{
                    fontSize: 10, color: "var(--text-muted)",
                  }} aria-hidden="true" />
                )}
                {crumb.href ? (
                  <a href={crumb.href} style={{
                    fontSize: 11, color: "var(--text-muted)",
                    textDecoration: "none",
                  }}>{crumb.label}</a>
                ) : (
                  <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{crumb.label}</span>
                )}
              </span>
            ))}
          </div>
        )}
        <h1 style={{
          fontSize: subtitle ? 16 : 17, fontWeight: 600,
          color: "var(--text-primary)", lineHeight: 1.2,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>{title}</h1>
        {subtitle && (
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 1 }}>{subtitle}</p>
        )}
      </div>
      {actions && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          {actions}
        </div>
      )}
    </header>
  );
}
