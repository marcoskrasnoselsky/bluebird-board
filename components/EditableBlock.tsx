"use client";

import { useEffect, useState } from "react";

export default function EditableBlock({
  label,
  value,
  onSave,
}: {
  label: string;
  value: string | null | undefined;
  onSave: (next: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value || "");
  useEffect(() => setDraft(value || ""), [value]);

  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 5 }}>
        <div className="mono" style={{ fontSize: 10, color: "#B8B09A" }}>
          {label.toUpperCase()}
        </div>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            style={{ background: "none", border: "none", fontSize: 11, color: "#8A8471", textDecoration: "underline" }}
          >
            edit
          </button>
        )}
      </div>
      {editing ? (
        <div>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={4}
            style={{
              width: "100%",
              padding: 10,
              borderRadius: 8,
              border: "1px solid #DCD5C3",
              background: "#FFFDF8",
              fontSize: 13,
              lineHeight: 1.5,
              resize: "vertical",
            }}
          />
          <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
            <button
              onClick={() => {
                onSave(draft);
                setEditing(false);
              }}
              style={{ background: "#232323", color: "#F6F3EC", border: "none", borderRadius: 6, padding: "6px 14px", fontSize: 12, fontWeight: 600 }}
            >
              Save
            </button>
            <button
              onClick={() => {
                setDraft(value || "");
                setEditing(false);
              }}
              style={{ background: "none", border: "1px solid #DCD5C3", borderRadius: 6, padding: "6px 14px", fontSize: 12 }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div style={{ fontSize: 13, lineHeight: 1.55, color: "#3A3A32", whiteSpace: "pre-wrap" }}>{value || "—"}</div>
      )}
    </div>
  );
}
