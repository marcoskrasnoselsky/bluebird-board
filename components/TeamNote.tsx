"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import type { Note } from "@/lib/types";

export default function TeamNote({
  note,
  currentUserEmail,
  onEdit,
  onDelete,
}: {
  note: Note;
  currentUserEmail: string;
  onEdit: (text: string) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(note.text);
  const canManage = note.author_email === currentUserEmail;

  return (
    <div style={{ background: "#FFFDF8", border: "1px solid #EDE7D6", borderRadius: 8, padding: "8px 12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <div className="mono" style={{ fontSize: 10, color: "#8A8471", marginBottom: 3 }}>
          {note.author_email} ·{" "}
          {new Date(note.created_at).toLocaleString("en-US", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
          {note.edited_at && <span style={{ fontStyle: "italic" }}> · edited</span>}
        </div>
        {!editing && canManage && (
          <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
            <button onClick={() => setEditing(true)} title="Edit note" style={{ background: "none", border: "none", padding: 3, color: "#8A8471", display: "flex" }}>
              <Pencil size={12} />
            </button>
            <button onClick={onDelete} title="Delete note" style={{ background: "none", border: "none", padding: 3, color: "#B84C4C", display: "flex" }}>
              <Trash2 size={12} />
            </button>
          </div>
        )}
      </div>
      {editing ? (
        <div>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={2}
            style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #DCD5C3", fontSize: 13, resize: "vertical" }}
          />
          <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
            <button
              onClick={() => {
                onEdit(draft);
                setEditing(false);
              }}
              style={{ background: "#232323", color: "#F6F3EC", border: "none", borderRadius: 6, padding: "5px 12px", fontSize: 11, fontWeight: 600 }}
            >
              Save
            </button>
            <button
              onClick={() => {
                setDraft(note.text);
                setEditing(false);
              }}
              style={{ background: "none", border: "1px solid #DCD5C3", borderRadius: 6, padding: "5px 12px", fontSize: 11 }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div style={{ fontSize: 13, lineHeight: 1.4 }}>{note.text}</div>
      )}
    </div>
  );
}
