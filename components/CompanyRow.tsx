"use client";

import { useState } from "react";
import { AlertTriangle, CalendarClock, ChevronDown, ChevronRight, Clock, ExternalLink, Linkedin, Mail, MessageSquare, Phone } from "lucide-react";
import Field from "./Field";
import EditableBlock from "./EditableBlock";
import TeamNote from "./TeamNote";
import { Company, Note, Profile, StatusChange, STATUSES, FIT_STYLES, STATUS_STYLES, isDNC, cleanPhoneDisplay, formatAge, isOverdue, isStale } from "@/lib/types";

export default function CompanyRow({
  company,
  notes,
  history,
  profiles,
  expanded,
  selected,
  onToggleSelect,
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
  history: StatusChange[];
  profiles: Profile[];
  expanded: boolean;
  selected: boolean;
  onToggleSelect: () => void;
  onToggle: () => void;
  currentUserEmail: string;
  onUpdateField: (field: keyof Company, value: string | null) => void;
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
  const [noteDraft, setNoteDraft] = useState("");
  const age = formatAge(company.created_at);
  const overdue = isOverdue(company.follow_up_date);
  const stale = !overdue && isStale(company.updated_at);
  // The assignee might be a legacy free-text value that doesn't match any registered teammate — keep it selectable so it isn't silently dropped.
  const assigneeOptions =
    company.assignee_email && !profiles.some((p) => p.email === company.assignee_email)
      ? [{ id: company.assignee_email, email: company.assignee_email, created_at: "" }, ...profiles]
      : profiles;

  return (
    <div
      style={{
        border: "1px solid #E4DDC9",
        borderLeft: overdue ? "4px solid #B84C4C" : stale ? "4px solid #C99A3B" : "1px solid #E4DDC9",
        borderRadius: 10,
        background: "#FFFDF8",
        overflow: "hidden",
        minWidth: 820,
      }}
    >
      <div
        className="row-hover"
        onClick={onToggle}
        style={{
          display: "grid",
          gridTemplateColumns: "18px 20px 1.3fr 0.85fr 0.55fr 0.45fr 0.6fr 0.8fr 0.7fr 0.45fr",
          gap: 12,
          alignItems: "center",
          padding: "13px 16px",
          cursor: "pointer",
        }}
      >
        <input
          type="checkbox"
          checked={selected}
          onClick={(e) => e.stopPropagation()}
          onChange={onToggleSelect}
          style={{ cursor: "pointer" }}
        />
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

        <div className="mono" style={{ fontSize: 11, color: "#8A8471" }} title={`Added ${age.full}`}>
          {age.short}
        </div>

        <div onClick={(e) => e.stopPropagation()}>
          <input
            type="date"
            value={company.follow_up_date || ""}
            onChange={(e) => onUpdateField("follow_up_date", e.target.value || null)}
            className="mono"
            title={overdue ? "Follow-up overdue" : "Next follow-up date"}
            style={{
              width: "100%",
              border: overdue ? "1px solid #B84C4C" : "1px solid #E4DDC9",
              background: overdue ? "#F1DEDD" : "#FFFDF8",
              color: overdue ? "#8A2E2E" : "#4A4A3F",
              borderRadius: 6,
              padding: "5px 4px",
              fontSize: 10,
            }}
          />
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
          <select
            value={company.assignee_email || ""}
            onChange={(e) => onUpdateAssignee(e.target.value)}
            className="mono"
            style={{
              width: "100%",
              border: "1px solid #E4DDC9",
              background: "#FFFDF8",
              borderRadius: 6,
              padding: "5px 8px",
              fontSize: 11,
              color: company.assignee_email ? "#232323" : "#B8B09A",
            }}
          >
            <option value="">Unassigned</option>
            {assigneeOptions.map((p) => (
              <option key={p.id} value={p.email}>
                {p.email}
              </option>
            ))}
          </select>
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
            <Field label="Added to board" value={`${age.full} · ${age.days === 0 ? "today" : `${age.days} day${age.days === 1 ? "" : "s"} in pipeline`}`} />
            <Field
              label="Last updated"
              value={`${formatAge(company.updated_at).full}${stale ? " · no activity in 14+ days" : ""}`}
              warn={stale}
            />
          </div>

          {stale && (
            <div
              style={{
                display: "flex",
                gap: 8,
                alignItems: "flex-start",
                background: "#F3ECD9",
                color: "#7A5C1E",
                padding: "10px 12px",
                borderRadius: 8,
                fontSize: 12,
                marginBottom: 16,
                lineHeight: 1.5,
              }}
            >
              <Clock size={14} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>This company hasn't been touched in 14+ days — might be worth a follow-up.</span>
            </div>
          )}

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

          {history.length > 0 && (
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid #EDE7D6" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: "#4A4A3F", marginBottom: 10 }}>
                <CalendarClock size={13} /> Status history
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {history.map((h) => (
                  <div key={h.id} className="mono" style={{ fontSize: 11, color: "#8A8471" }}>
                    {h.old_status ? `${h.old_status} → ${h.new_status}` : h.new_status}
                    {h.changed_by ? ` · ${h.changed_by}` : ""} · {new Date(h.changed_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
