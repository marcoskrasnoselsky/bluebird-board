"use client";

import { useState } from "react";
import { Linkedin, Mail, Pencil, Phone, Trash2 } from "lucide-react";
import { Contact, normalizeUrl } from "@/lib/types";

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "6px 8px",
  borderRadius: 6,
  border: "1px solid #DCD5C3",
  background: "#FFFDF8",
  fontSize: 12,
};

export default function ContactCard({
  contact,
  onSave,
  onDelete,
}: {
  contact: Contact;
  onSave: (fields: Partial<Contact>) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({
    name: contact.name || "",
    title: contact.title || "",
    phone: contact.phone || "",
    email: contact.email || "",
    linkedin_profile: contact.linkedin_profile || "",
  });

  const save = () => {
    onSave(draft);
    setEditing(false);
  };

  const cancel = () => {
    setDraft({
      name: contact.name || "",
      title: contact.title || "",
      phone: contact.phone || "",
      email: contact.email || "",
      linkedin_profile: contact.linkedin_profile || "",
    });
    setEditing(false);
  };

  if (editing) {
    return (
      <div style={{ background: "#FFFDF8", border: "1px solid #E4DDC9", borderRadius: 8, padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <input placeholder="Name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} style={inputStyle} autoFocus />
          <input placeholder="Title" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} style={inputStyle} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <input placeholder="Phone" value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} style={inputStyle} />
          <input placeholder="Email" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} style={inputStyle} />
        </div>
        <input
          placeholder="LinkedIn"
          value={draft.linkedin_profile}
          onChange={(e) => setDraft({ ...draft, linkedin_profile: e.target.value })}
          style={inputStyle}
        />
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={save} style={{ background: "#232323", color: "#F6F3EC", border: "none", borderRadius: 6, padding: "6px 14px", fontSize: 11, fontWeight: 600 }}>
            Save
          </button>
          <button onClick={cancel} style={{ background: "none", border: "1px solid #DCD5C3", borderRadius: 6, padding: "6px 14px", fontSize: 11 }}>
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#FFFDF8", border: "1px solid #E4DDC9", borderRadius: 8, padding: 12 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: 13 }}>{contact.name || "Unnamed contact"}</div>
          {contact.title && (
            <div className="mono" style={{ fontSize: 11, color: "#6B6656", marginTop: 1 }}>
              {contact.title}
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
          <button onClick={() => setEditing(true)} title="Edit contact" style={{ background: "none", border: "none", padding: 3, color: "#6B6656", display: "flex" }}>
            <Pencil size={12} />
          </button>
          <button onClick={onDelete} title="Delete contact" style={{ background: "none", border: "none", padding: 3, color: "#B84C4C", display: "flex" }}>
            <Trash2 size={12} />
          </button>
        </div>
      </div>
      {(contact.phone || contact.email || contact.linkedin_profile) && (
        <div style={{ display: "flex", flexDirection: "column", gap: 3, marginTop: 8 }}>
          {contact.phone && (
            <span className="mono" style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 5 }}>
              <Phone size={11} color="#6B6656" /> {contact.phone}
            </span>
          )}
          {contact.email && (
            <span className="mono" style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 5 }}>
              <Mail size={11} color="#6B6656" /> {contact.email}
            </span>
          )}
          {contact.linkedin_profile && (
            <a
              href={normalizeUrl(contact.linkedin_profile)}
              target="_blank"
              rel="noreferrer"
              className="mono"
              style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 5, color: "#2F5233" }}
            >
              <Linkedin size={11} /> {contact.linkedin_profile}
            </a>
          )}
        </div>
      )}
    </div>
  );
}
