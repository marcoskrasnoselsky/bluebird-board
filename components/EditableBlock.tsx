"use client";

import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";

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
  const [justSaved, setJustSaved] = useState(false);
  const savedTimeout = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => setDraft(value || ""), [value]);
  useEffect(() => () => clearTimeout(savedTimeout.current), []);

  const save = () => {
    onSave(draft);
    setEditing(false);
    setJustSaved(true);
    clearTimeout(savedTimeout.current);
    savedTimeout.current = setTimeout(() => setJustSaved(false), 1600);
  };

  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 5 }}>
        <div className="mono" style={{ fontSize: 10, color: "#8A8471", display: "flex", alignItems: "center", gap: 8 }}>
          {label.toUpperCase()}
          {!editing && justSaved && (
            <span style={{ display: "flex", alignItems: "center", gap: 2, color: "#4A7C59", textTransform: "none" }}>
              <Check size={10} /> Saved
            </span>
          )}
        </div>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            style={{ background: "none", border: "none", fontSize: 11, color: "#6B6656", textDecoration: "underline" }}
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
              onClick={save}
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
