// ============================================================
// RIVULUS VOCACIONAL — StatCard
// Cartão de estatística reutilizável nos dashboards
// ============================================================
interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  color?: string;       // cor de fundo do ícone
  iconColor?: string;   // cor do ícone
  trend?: { value: string; positive: boolean };
  subtitle?: string;
}

export default function StatCard({
  label, value, icon, color, iconColor, trend, subtitle,
}: StatCardProps) {
  return (
    <div style={{
      background: "var(--bg-card)",
      border: "1px solid var(--border)",
      borderRadius: 12,
      padding: "18px 20px",
      display: "flex",
      flexDirection: "column",
      gap: 12,
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div style={{
          width: 38, height: 38, borderRadius: 9,
          background: color ?? "var(--ag-blue-50)",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <i className={`ti ${icon}`} style={{
            fontSize: 18,
            color: iconColor ?? "var(--ag-blue-600)",
          }} aria-hidden="true" />
        </div>
        {trend && (
          <span style={{
            fontSize: 11, fontWeight: 500,
            color: trend.positive ? "var(--success)" : "var(--danger)",
            background: trend.positive ? "#E6F4EE" : "#FED7D7",
            padding: "2px 7px", borderRadius: 20,
          }}>
            {trend.positive ? "↑" : "↓"} {trend.value}
          </span>
        )}
      </div>
      <div>
        <div style={{
          fontSize: 26, fontWeight: 700,
          color: "var(--text-primary)", lineHeight: 1,
          letterSpacing: "-0.5px",
        }}>{value}</div>
        <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>{label}</div>
        {subtitle && (
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2, opacity: 0.7 }}>
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
}
