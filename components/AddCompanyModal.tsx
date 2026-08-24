"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Company } from "@/lib/types";

const inputStyle: React.CSSProperties = {
  width: "100%",
  marginTop: 4,
  padding: "9px 10px",
  borderRadius: 8,
  border: "1px solid #DCD5C3",
  background: "#FFFDF8",
  fontSize: 13,
};

const labelStyle: React.CSSProperties = { fontSize: 11, color: "#6B6656" };

export default function AddCompanyModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (company: Partial<Company>) => Promise<void>;
}) {
  const [form, setForm] = useState({
    company: "",
    website: "",
    industry: "",
    location: "",
    phone: "",
    email: "",
    decision_maker: "",
    title: "",
    linkedin_profile: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.company.trim()) {
      setError("Company name is required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onCreate(form);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(35,35,35,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16 }}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
        style={{ width: "100%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto", background: "#FFFDF8", border: "1px solid #E4DDC9", borderRadius: 14, padding: 28 }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <h2 className="fraunces" style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>
            Add a company
          </h2>
          <button type="button" onClick={onClose} style={{ background: "none", border: "none", color: "#6B6656", display: "flex" }}>
            <X size={18} />
          </button>
        </div>
        <p style={{ fontSize: 12, color: "#6B6656", margin: "0 0 20px" }}>It'll be assigned to you — you can fill in the rest of the details afterward.</p>

        <label className="mono" style={labelStyle}>
          COMPANY NAME *
        </label>
        <input required value={form.company} onChange={set("company")} style={inputStyle} placeholder="Acme Health" />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
          <div>
            <label className="mono" style={labelStyle}>
              WEBSITE
            </label>
            <input value={form.website} onChange={set("website")} style={inputStyle} placeholder="acmehealth.com" />
          </div>
          <div>
            <label className="mono" style={labelStyle}>
              INDUSTRY
            </label>
            <input value={form.industry} onChange={set("industry")} style={inputStyle} placeholder="Urgent Care" />
          </div>
        </div>

        <label className="mono" style={{ ...labelStyle, marginTop: 12, display: "block" }}>
          LOCATION
        </label>
        <input value={form.location} onChange={set("location")} style={inputStyle} placeholder="Austin, TX" />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
          <div>
            <label className="mono" style={labelStyle}>
              PHONE
            </label>
            <input value={form.phone} onChange={set("phone")} style={inputStyle} placeholder="(555) 123-4567" />
          </div>
          <div>
            <label className="mono" style={labelStyle}>
              EMAIL
            </label>
            <input type="email" value={form.email} onChange={set("email")} style={inputStyle} placeholder="contact@acmehealth.com" />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
          <div>
            <label className="mono" style={labelStyle}>
              DECISION MAKER
            </label>
            <input value={form.decision_maker} onChange={set("decision_maker")} style={inputStyle} placeholder="Jane Smith" />
          </div>
          <div>
            <label className="mono" style={labelStyle}>
              TITLE
            </label>
            <input value={form.title} onChange={set("title")} style={inputStyle} placeholder="Director of Operations" />
          </div>
        </div>

        <label className="mono" style={{ ...labelStyle, marginTop: 12, display: "block" }}>
          CONTACT'S LINKEDIN
        </label>
        <input value={form.linkedin_profile} onChange={set("linkedin_profile")} style={inputStyle} placeholder="linkedin.com/in/janesmith" />

        {error && (
          <div style={{ marginTop: 14, fontSize: 12, color: "#8A2E2E", background: "#F1DEDD", padding: "8px 12px", borderRadius: 8 }}>{error}</div>
        )}

        <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
          <button
            type="submit"
            disabled={saving}
            style={{ flex: 1, background: "#C9743B", color: "#FFFDF8", border: "none", borderRadius: 8, padding: "11px 0", fontSize: 13, fontWeight: 600 }}
          >
            {saving ? "Adding..." : "Add company"}
          </button>
          <button type="button" onClick={onClose} style={{ background: "none", border: "1px solid #DCD5C3", borderRadius: 8, padding: "11px 18px", fontSize: 13 }}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
