"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, ChevronDown, ChevronRight, ExternalLink, Linkedin, Mail, MessageSquare, Phone } from "lucide-react";
import Field from "./Field";
import EditableBlock from "./EditableBlock";
import TeamNote from "./TeamNote";
import { Company, Note, STATUSES, FIT_STYLES, STATUS_STYLES, isDNC, cleanPhoneDisplay } from "@/lib/types";

export default function CompanyRow({
  company,
  notes,
  expanded,
  onToggle,
  currentUserEmail,
  onUpdateField,
  onUpdateStatus,
  onUpdateAssignee,
  onAddNote,
  onEditNote,
  onDeleteNote,
}: {
  company: Company;
  notes: Note[];
  expanded: boolean;
  onToggle: () => void;
  currentUserEmail: string;
  onUpdateField: (field: keyof Company, value: string) => void;
  onUpdateStatus: (status: string) => void;
  onUpdateAssignee: (email: string) => void;
  onAddNote: (text: string) => void;
  onEditNote: (noteId: string, text: string) => void;
  onDeleteNote: (noteId: string) => void;
}) {
  const fit = FIT_STYLES[company.fit || ""] || { bg: "#EEEAE0", fg: "#666", dot: "#999" };
  const statusStyle = STATUS_STYLES[company.status] || STATUS_STYLES["New"];
  const dnc = isDNC(company.phone);
  const phoneDisplay = cleanPhoneDisplay(company.phone);
  const [assigneeDraft, setAssigneeDraft] = useState(company.assignee_email || "");
  const [noteDraft, setNoteDraft] = useState("");
  useEffect(() => setAssigneeDraft(company.assignee_email || ""), [company.assignee_email]);

  return (
    <div style={{ border: "1px solid #E4DDC9", borderRadius: 10, background: "#FFFDF8", overflow: "hidden" }}>
      <div
        className="row-hover"
        onClick={onToggle}
        style={{
          display: "grid",
          gridTemplateColumns: "20px 1.5fr 1fr 1.1fr 0.7fr 0.9fr 0.55fr",
          gap: 12,
          alignItems: "center",
          padding: "13px 16px",
          cursor: "pointer",
        }}
      >
        {expanded ? <ChevronDown size={15} color="#8A8471" /> : <ChevronRight size={15} color="#8A8471" />}
        <div>
          <div style={{ fontWeight: 600, fontSize: 14 }}>{company.company}</div>
          <div className="mono" style={{ fontSize: 11, color: "#8A8471", marginTop: 2 }}>
            {company.industry} · {company.location}
          </div>
        </div>
        <div style={{ fontSize: 13 }}>
          {company.decision_maker && company.decision_maker !== "Not identified" ? (
            <>
              <div style={{ fontWeight: 500 }}>{company.decision_maker.split(" (")[0]}</div>
              <div className="mono" style={{ fontSize: 11, color: "#8A8471" }}>
                {company.title}
              </div>
            </>
          ) : (
            <span style={{ color: "#B8B09A", fontSize: 12 }}>No name found</span>
          )}
        </div>
        <div className="mono" style={{ fontSize: 12 }}>
          {dnc ? (
            <span style={{ display: "flex", alignItems: "center", gap: 5, color: "#8A2E2E", fontWeight: 600 }}>
              <AlertTriangle size={12} /> DNC
            </span>
          ) : phoneDisplay ? (
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <Phone size={11} color="#8A8471" /> {phoneDisplay}
            </span>
          ) : (
            <span style={{ color: "#B8B09A" }}>—</span>
          )}
        </div>

        <div onClick={(e) => e.stopPropagation()}>
          <select
            value={company.status || "New"}
            onChange={(e) => onUpdateStatus(e.target.value)}
            className="mono"
            style={{ background: statusStyle.bg, color: statusStyle.fg, border: "none", borderRadius: 6, padding: "5px 8px", fontSize: 11, fontWeight: 700, width: "100%" }}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div onClick={(e) => e.stopPropagation()}>
          <input
            value={assigneeDraft}
            onChange={(e) => setAssigneeDraft(e.target.value)}
            onBlur={() => onUpdateAssignee(assigneeDraft.trim())}
            onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
            placeholder="Unassigned"
            className="mono"
            style={{ width: "100%", border: "1px solid #E4DDC9", background: "#FFFDF8", borderRadius: 6, padding: "5px 8px", fontSize: 11, color: assigneeDraft ? "#232323" : "#B8B09A" }}
          />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <span className="mono" style={{ background: fit.bg, color: fit.fg, fontSize: 10, fontWeight: 700, padding: "4px 9px", borderRadius: 6, whiteSpace: "nowrap" }}>
            {company.fit}
          </span>
        </div>
      </div>

      {expanded && (
        <div style={{ borderTop: "1px solid #EDE7D6", padding: "18px 16px 20px", background: "#FBF8F0" }}>
          {dnc && (
            <div
              style={{
                display: "flex",
                gap: 8,
                alignItems: "flex-start",
                background: "#F1DEDD",
                color: "#7A2424",
                padding: "10px 12px",
                borderRadius: 8,
                fontSize: 12,
                marginBottom: 16,
                lineHeight: 1.5,
              }}
            >
              <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>
                This number is on a Do Not Call registry. Review applicable telemarketing regulations (TCPA and others) before contacting. Do not
                include in active dialing sequences.
              </span>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px", marginBottom: 18 }}>
            <Field label="Email" value={company.email} icon={<Mail size={12} />} />
            <Field label="Phone" value={phoneDisplay} icon={<Phone size={12} />} warn={dnc} />
            <Field label="Contact's LinkedIn" value={company.linkedin_profile} icon={<Linkedin size={12} />} link />
            <Field label="Job posting" value={company.job_posting_url} icon={<ExternalLink size={12} />} link />
          </div>

          <EditableBlock label="Buying signal" value={company.buying_signal} onSave={(v) => onUpdateField("buying_signal", v)} />
          <EditableBlock label="Opportunity intelligence summary" value={company.opportunity_summary} onSave={(v) => onUpdateField("opportunity_summary", v)} />
          <EditableBlock label="Research notes" value={company.research_notes} onSave={(v) => onUpdateField("research_notes", v)} />

          <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid #EDE7D6" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: "#4A4A3F", marginBottom: 10 }}>
              <MessageSquare size={13} /> Team notes ({notes.length})
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
              {notes.map((n) => (
                <TeamNote key={n.id} note={n} currentUserEmail={currentUserEmail} onEdit={(text) => onEditNote(n.id, text)} onDelete={() => onDeleteNote(n.id)} />
              ))}
              {notes.length === 0 && <div style={{ fontSize: 12, color: "#B8B09A" }}>No notes yet.</div>}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && noteDraft.trim()) {
                    onAddNote(noteDraft.trim());
                    setNoteDraft("");
                  }
                }}
                placeholder="Add a note..."
                style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: "1px solid #DCD5C3", background: "#FFFDF8", fontSize: 13 }}
              />
              <button
                onClick={() => {
                  if (noteDraft.trim()) {
                    onAddNote(noteDraft.trim());
                    setNoteDraft("");
                  }
                }}
                style={{ background: "#C9743B", color: "#FFFDF8", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 12, fontWeight: 600 }}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
