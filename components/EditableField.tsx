"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Pencil } from "lucide-react";
import { normalizeUrl } from "@/lib/types";

export default function EditableField({
  label,
  value,
  onSave,
  placeholder,
  link,
  warn,
}: {
  label: string;
  value: string | null | undefined;
  onSave: (next: string) => void;
  placeholder?: string;
  link?: boolean;
  warn?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value || "");
  const [justSaved, setJustSaved] = useState(false);
  const savedTimeout = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => setDraft(value || ""), [value]);
  useEffect(() => () => clearTimeout(savedTimeout.current), []);

  const save = () => {
    onSave(draft.trim());
    setEditing(false);
    setJustSaved(true);
    clearTimeout(savedTimeout.current);
    savedTimeout.current = setTimeout(() => setJustSaved(false), 1600);
  };

  return (
    <div>
      <div className="mono" style={{ fontSize: 10, color: "#8A8471", marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
        {label.toUpperCase()}
        {!editing && (
          <button onClick={() => setEditing(true)} title={`Edit ${label}`} style={{ background: "none", border: "none", padding: 0, color: "#6B6656", display: "flex" }}>
            <Pencil size={10} />
          </button>
        )}
        {!editing && justSaved && (
          <span style={{ display: "flex", alignItems: "center", gap: 2, color: "#4A7C59" }}>
            <Check size={10} /> Saved
          </span>
        )}
      </div>
      {editing ? (
        <div style={{ display: "flex", gap: 6 }}>
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") save();
              if (e.key === "Escape") {
                setDraft(value || "");
                setEditing(false);
              }
            }}
            placeholder={placeholder}
            style={{ flex: 1, padding: "6px 8px", borderRadius: 6, border: "1px solid #DCD5C3", background: "#FFFDF8", fontSize: 13 }}
          />
          <button onClick={save} style={{ background: "#232323", color: "#F6F3EC", border: "none", borderRadius: 6, padding: "0 10px", fontSize: 11, fontWeight: 600 }}>
            Save
          </button>
        </div>
      ) : value ? (
        link ? (
          <a href={normalizeUrl(value)} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: "#2F5233", wordBreak: "break-all" }}>
            {value}
          </a>
        ) : (
          <div style={{ fontSize: 13, color: warn ? "#8A2E2E" : "#232323", fontWeight: warn ? 600 : 400, wordBreak: "break-word" }}>{value}</div>
        )
      ) : (
        <div style={{ fontSize: 13, color: "#8A8471" }}>—</div>
      )}
    </div>
  );
}
