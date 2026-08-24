"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, CalendarClock, X } from "lucide-react";
import { createClient } from "@/lib/supabaseClient";
import {
  Company,
  Note,
  Profile,
  ActivityLogEntry,
  STATUSES,
  FIT_STYLES,
  STATUS_STYLES,
  isDNC,
  cleanPhoneDisplay,
  formatAge,
  isOverdue,
  isStale,
  describeActivity,
} from "@/lib/types";
import EditableField from "@/components/EditableField";
import EditableBlock from "@/components/EditableBlock";
import TeamNote from "@/components/TeamNote";
import Spinner from "@/components/Spinner";

const supabase = createClient();

export default function CompanyDetail({ companyId, onClose }: { companyId: string; onClose: () => void }) {
  const router = useRouter();

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [company, setCompany] = useState<Company | null | undefined>(undefined);
  const [notes, setNotes] = useState<Note[]>([]);
  const [activity, setActivity] = useState<ActivityLogEntry[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [noteDraft, setNoteDraft] = useState("");

  const loadData = useCallback(async () => {
    const { data: companyRow } = await supabase.from("companies").select("*").eq("id", companyId).maybeSingle();
    const { data: noteRows } = await supabase.from("notes").select("*").eq("company_id", companyId).order("created_at", { ascending: true });
    const { data: activityRows } = await supabase
      .from("activity_log")
      .select("*")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false });
    const { data: profileRows } = await supabase.from("profiles").select("*").order("email", { ascending: true });
    setCompany(companyRow ?? null);
    setNotes(noteRows || []);
    setActivity(activityRows || []);
    setProfiles(profileRows || []);
  }, [companyId]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.replace("/login");
        return;
      }
      setUserEmail(data.session.user.email ?? "");
      loadData();
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.replace("/login");
    });
    return () => sub.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId]);

  useEffect(() => {
    const channel = supabase
      .channel(`company-${companyId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "companies", filter: `id=eq.${companyId}` }, () => loadData())
      .on("postgres_changes", { event: "*", schema: "public", table: "notes", filter: `company_id=eq.${companyId}` }, () => loadData())
      .on("postgres_changes", { event: "*", schema: "public", table: "activity_log", filter: `company_id=eq.${companyId}` }, () => loadData())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [companyId, loadData]);

  // Let Escape close the modal (harmless no-op-ish on the full page — onClose just navigates to /board there too)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const updateField = async (field: keyof Company, value: string | null) => {
    if (!company) return;
    setCompany({ ...company, [field]: value } as Company);
    await supabase.from("companies").update({ [field]: value }).eq("id", companyId);
  };

  const addNote = async () => {
    if (!noteDraft.trim() || !userEmail) return;
    await supabase.from("notes").insert({ company_id: companyId, author_email: userEmail, text: noteDraft.trim() });
    setNoteDraft("");
    await loadData();
  };

  const editNote = async (noteId: string, text: string) => {
    await supabase.from("notes").update({ text, edited_at: new Date().toISOString() }).eq("id", noteId);
    await loadData();
  };

  const deleteNote = async (noteId: string) => {
    await supabase.from("notes").delete().eq("id", noteId);
    await loadData();
  };

  if (company === undefined || !userEmail) {
    return <Spinner label="Loading company..." />;
  }

  if (company === null) {
    return (
      <div style={{ padding: 60, textAlign: "center" }}>
        <div style={{ color: "#6B6656", marginBottom: 12 }}>That company doesn't exist (or was removed).</div>
        <button onClick={onClose} style={{ background: "#232323", color: "#F6F3EC", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13 }}>
          Back to board
        </button>
      </div>
    );
  }

  const fit = FIT_STYLES[company.fit || ""] || { bg: "#EEEAE0", fg: "#666", dot: "#999" };
  const statusStyle = STATUS_STYLES[company.status] || STATUS_STYLES["New"];
  const dnc = isDNC(company.phone);
  const phoneDisplay = cleanPhoneDisplay(company.phone);
  const age = formatAge(company.created_at);
  const overdue = isOverdue(company.follow_up_date);
  const stale = !overdue && isStale(company.updated_at);
  const assigneeOptions =
    company.assignee_email && !profiles.some((p) => p.email === company.assignee_email)
      ? [{ id: company.assignee_email, email: company.assignee_email, created_at: "" }, ...profiles]
      : profiles;

  return (
    <>
      <div className="board-header" style={{ background: "#1F2E2B", color: "#F6F3EC", padding: "20px 28px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
          <span className="fraunces" style={{ fontSize: 20, fontWeight: 600 }}>
            {company.company}
          </span>
          <button
            onClick={onClose}
            title="Close"
            style={{ background: "none", border: "1px solid #4A5D56", borderRadius: 8, padding: "6px 8px", color: "#F6F3EC", display: "flex" }}
          >
            <X size={15} />
          </button>
        </div>
      </div>

      <div className="board-content" style={{ padding: "28px", maxWidth: 900, margin: "0 auto" }}>
        {dnc && (
          <div
            style={{
              display: "flex",
              gap: 8,
              alignItems: "flex-start",
              background: "#F1DEDD",
              color: "#7A2424",
              padding: "12px 14px",
              borderRadius: 10,
              fontSize: 13,
              marginBottom: 18,
              lineHeight: 1.5,
            }}
          >
            <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>
              This number is on a Do Not Call registry. Review applicable telemarketing regulations (TCPA and others) before contacting. Do not
              include in active dialing sequences.
            </span>
          </div>
        )}

        {stale && (
          <div
            style={{
              display: "flex",
              gap: 8,
              alignItems: "flex-start",
              background: "#F3ECD9",
              color: "#7A5C1E",
              padding: "10px 14px",
              borderRadius: 10,
              fontSize: 13,
              marginBottom: 18,
              lineHeight: 1.5,
            }}
          >
            <CalendarClock size={15} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>This company hasn't been touched in 14+ days — might be worth a follow-up.</span>
          </div>
        )}

        {/* Pipeline controls */}
        <div className="detail-grid-4" style={{ background: "#FFFDF8", border: "1px solid #E4DDC9", borderRadius: 12, padding: 18, marginBottom: 20 }}>
          <div>
            <div className="mono" style={{ fontSize: 10, color: "#8A8471", marginBottom: 5 }}>
              STATUS
            </div>
            <select
              value={company.status || "New"}
              onChange={(e) => updateField("status", e.target.value)}
              className="mono"
              style={{ background: statusStyle.bg, color: statusStyle.fg, border: "none", borderRadius: 6, padding: "7px 8px", fontSize: 12, fontWeight: 700, width: "100%" }}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <div className="mono" style={{ fontSize: 10, color: "#8A8471", marginBottom: 5 }}>
              FIT
            </div>
            <select
              value={company.fit || ""}
              onChange={(e) => updateField("fit", e.target.value)}
              className="mono"
              style={{ background: fit.bg, color: fit.fg, border: "none", borderRadius: 6, padding: "7px 8px", fontSize: 12, fontWeight: 700, width: "100%" }}
            >
              <option value="">Unset</option>
              {Object.keys(FIT_STYLES).map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
          <div>
            <div className="mono" style={{ fontSize: 10, color: "#8A8471", marginBottom: 5 }}>
              ASSIGNEE
            </div>
            <select
              value={company.assignee_email || ""}
              onChange={(e) => updateField("assignee_email", e.target.value)}
              className="mono"
              style={{ border: "1px solid #E4DDC9", background: "#FFFDF8", borderRadius: 6, padding: "7px 8px", fontSize: 12, width: "100%" }}
            >
              <option value="">Unassigned</option>
              {assigneeOptions.map((p) => (
                <option key={p.id} value={p.email}>
                  {p.email}
                </option>
              ))}
            </select>
          </div>
          <div>
            <div className="mono" style={{ fontSize: 10, color: "#8A8471", marginBottom: 5 }}>
              FOLLOW-UP DATE
            </div>
            <input
              type="date"
              value={company.follow_up_date || ""}
              onChange={(e) => updateField("follow_up_date", e.target.value || null)}
              className="mono"
              style={{
                width: "100%",
                border: overdue ? "1px solid #B84C4C" : "1px solid #E4DDC9",
                background: overdue ? "#F1DEDD" : "#FFFDF8",
                color: overdue ? "#8A2E2E" : "#4A4A3F",
                borderRadius: 6,
                padding: "7px 8px",
                fontSize: 12,
              }}
            />
          </div>
        </div>

        {/* Company info */}
        <Section title="Company info">
          <div className="detail-grid-2">
            <EditableField label="Company name" value={company.company} onSave={(v) => updateField("company", v)} />
            <EditableField label="Website" value={company.website} onSave={(v) => updateField("website", v)} link />
            <EditableField label="Industry" value={company.industry} onSave={(v) => updateField("industry", v)} />
            <EditableField label="Employees" value={company.employees} onSave={(v) => updateField("employees", v)} />
            <EditableField label="Location" value={company.location} onSave={(v) => updateField("location", v)} />
            <EditableField label="Company LinkedIn" value={company.linkedin} onSave={(v) => updateField("linkedin", v)} link />
          </div>
        </Section>

        {/* Contact */}
        <Section title="Contact">
          <div className="detail-grid-2">
            <EditableField label="Decision maker" value={company.decision_maker} onSave={(v) => updateField("decision_maker", v)} />
            <EditableField label="Title" value={company.title} onSave={(v) => updateField("title", v)} />
            <EditableField label="Phone" value={phoneDisplay} onSave={(v) => updateField("phone", v)} warn={dnc} />
            <EditableField label="Email" value={company.email} onSave={(v) => updateField("email", v)} />
            <EditableField label="Contact's LinkedIn" value={company.linkedin_profile} onSave={(v) => updateField("linkedin_profile", v)} link />
          </div>
        </Section>

        {/* Sales intelligence */}
        <Section title="Sales intelligence">
          <EditableBlock label="Buying signal" value={company.buying_signal} onSave={(v) => updateField("buying_signal", v)} />
          <EditableBlock label="Opportunity intelligence summary" value={company.opportunity_summary} onSave={(v) => updateField("opportunity_summary", v)} />
          <EditableBlock label="Hiring roles" value={company.hiring_roles} onSave={(v) => updateField("hiring_roles", v)} />
          <EditableBlock label="Research notes" value={company.research_notes} onSave={(v) => updateField("research_notes", v)} />
          <div className="detail-grid-2" style={{ marginTop: 4 }}>
            <EditableField label="Job posting" value={company.job_posting_url} onSave={(v) => updateField("job_posting_url", v)} link />
            <EditableField label="Research source" value={company.research_source} onSave={(v) => updateField("research_source", v)} />
          </div>
        </Section>

        {/* Team notes */}
        <Section title={`Team notes (${notes.length})`}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
            {notes.map((n) => (
              <TeamNote key={n.id} note={n} currentUserEmail={userEmail} onEdit={(text) => editNote(n.id, text)} onDelete={() => deleteNote(n.id)} />
            ))}
            {notes.length === 0 && <div style={{ fontSize: 12, color: "#8A8471" }}>No notes yet.</div>}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              value={noteDraft}
              onChange={(e) => setNoteDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addNote()}
              placeholder="Add a note..."
              style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: "1px solid #DCD5C3", background: "#FFFDF8", fontSize: 13 }}
            />
            <button onClick={addNote} style={{ background: "#C9743B", color: "#FFFDF8", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 12, fontWeight: 600 }}>
              Add
            </button>
          </div>
        </Section>

        {/* Activity log */}
        <Section title="Activity log" icon={<CalendarClock size={14} />}>
          <div style={{ fontSize: 11, color: "#8A8471", marginBottom: 10 }}>
            Added to the board {age.full} ({age.days === 0 ? "today" : `${age.days} day${age.days === 1 ? "" : "s"} ago`}) · source: {company.source}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {activity.map((entry) => (
              <div key={entry.id} style={{ display: "flex", gap: 8, fontSize: 12.5, lineHeight: 1.5 }}>
                <span className="mono" style={{ color: "#8A8471", flexShrink: 0, minWidth: 110 }}>
                  {new Date(entry.created_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                </span>
                <span>
                  <strong>{entry.actor_email || "Someone"}</strong> {describeActivity(entry)}
                </span>
              </div>
            ))}
            {activity.length === 0 && <div style={{ fontSize: 12, color: "#8A8471" }}>No activity recorded yet.</div>}
          </div>
        </Section>
      </div>
    </>
  );
}

function Section({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ background: "#FFFDF8", border: "1px solid #E4DDC9", borderRadius: 12, padding: 18, marginBottom: 16 }}>
      <div className="mono" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700, color: "#4A4A3F", marginBottom: 14, letterSpacing: "0.03em" }}>
        {icon} {title.toUpperCase()}
      </div>
      {children}
    </div>
  );
}
