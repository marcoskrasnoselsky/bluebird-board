"use client";

import { Loader2 } from "lucide-react";

export default function Spinner({ label }: { label?: string }) {
  return (
    <div style={{ padding: 60, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, color: "#6B6656" }}>
      <Loader2 size={22} style={{ animation: "spin 0.8s linear infinite" }} />
      {label && <span style={{ fontSize: 13 }}>{label}</span>}
    </div>
  );
}
