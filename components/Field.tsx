"use client";

export default function Field({
  label,
  value,
  icon,
  link,
  warn,
}: {
  label: string;
  value: string | null | undefined;
  icon?: React.ReactNode;
  link?: boolean;
  warn?: boolean;
}) {
  if (!value) {
    return (
      <div>
        <div className="mono" style={{ fontSize: 10, color: "#B8B09A", marginBottom: 3 }}>
          {label.toUpperCase()}
        </div>
        <div style={{ fontSize: 13, color: "#C9C2AC" }}>—</div>
      </div>
    );
  }
  return (
    <div>
      <div className="mono" style={{ fontSize: 10, color: "#B8B09A", marginBottom: 3, display: "flex", alignItems: "center", gap: 4 }}>
        {icon} {label.toUpperCase()}
      </div>
      {link ? (
        <a href={value} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: "#2F5233", wordBreak: "break-all" }}>
          {value.length > 50 ? value.slice(0, 50) + "…" : value}
        </a>
      ) : (
        <div style={{ fontSize: 13, color: warn ? "#8A2E2E" : "#232323", fontWeight: warn ? 600 : 400 }}>{value}</div>
      )}
    </div>
  );
}
