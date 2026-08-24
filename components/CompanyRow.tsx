"use client";

import { useRouter } from "next/navigation";
import { AlertTriangle, Phone } from "lucide-react";
import { Company, Profile, STATUSES, FIT_STYLES, STATUS_STYLES, isDNC, cleanPhoneDisplay, formatAge, isOverdue, isStale, emailLocalPart } from "@/lib/types";

export default function CompanyRow({
  company,
  profiles,
  selected,
  onToggleSelect,
  onUpdateStatus,
  onUpdateFit,
  onUpdateAssignee,
  onUpdateFollowUp,
}: {
  company: Company;
  profiles: Profile[];
  selected: boolean;
  onToggleSelect: () => void;
  onUpdateStatus: (status: string) => void;
  onUpdateFit: (fit: string) => void;
  onUpdateAssignee: (email: string) => void;
  onUpdateFollowUp: (date: string | null) => void;
}) {
  const router = useRouter();
  const fit = FIT_STYLES[company.fit || ""] || { bg: "#EEEAE0", fg: "#666", dot: "#999" };
  const statusStyle = STATUS_STYLES[company.status] || STATUS_STYLES["New"];
  const dnc = isDNC(company.phone);
  const phoneDisplay = cleanPhoneDisplay(company.phone);
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
      onClick={() => router.push(`/board/${company.id}`)}
      className="row-hover"
      style={{
        border: "1px solid #E4DDC9",
        borderLeft: overdue ? "4px solid #B84C4C" : stale ? "4px solid #C99A3B" : "1px solid #E4DDC9",
        borderRadius: 10,
        background: "#FFFDF8",
        overflow: "hidden",
        minWidth: 700,
        cursor: "pointer",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "18px 1.4fr 0.8fr 0.5fr 0.4fr 0.55fr 0.65fr 0.5fr 0.45fr",
          gap: 8,
          alignItems: "center",
          padding: "13px 14px",
        }}
      >
        <input type="checkbox" checked={selected} onClick={(e) => e.stopPropagation()} onChange={onToggleSelect} style={{ cursor: "pointer" }} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 14 }}>{company.company}</div>
          <div
            className="mono"
            title={`${company.industry || ""} · ${company.location || ""}`}
            style={{ fontSize: 11, color: "#8A8471", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
          >
            {company.industry} · {company.location}
          </div>
        </div>
        <div style={{ fontSize: 13, minWidth: 0 }}>
          {company.decision_maker && company.decision_maker !== "Not identified" ? (
            <>
              <div style={{ fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={company.decision_maker}>
                {company.decision_maker.split(" (")[0]}
              </div>
              <div
                className="mono"
                title={company.title || ""}
                style={{ fontSize: 11, color: "#8A8471", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
              >
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
            onChange={(e) => onUpdateFollowUp(e.target.value || null)}
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

        <div onClick={(e) => e.stopPropagation()} title={company.assignee_email || "Unassigned"}>
          <select
            value={company.assignee_email || ""}
            onChange={(e) => onUpdateAssignee(e.target.value)}
            className="mono"
            style={{
              width: "100%",
              border: "1px solid #E4DDC9",
              background: "#FFFDF8",
              borderRadius: 6,
              padding: "5px 4px",
              fontSize: 11,
              color: company.assignee_email ? "#232323" : "#B8B09A",
            }}
          >
            <option value="">Unassigned</option>
            {assigneeOptions.map((p) => (
              <option key={p.id} value={p.email}>
                {emailLocalPart(p.email)}
              </option>
            ))}
          </select>
        </div>

        <div onClick={(e) => e.stopPropagation()}>
          <select
            value={company.fit || ""}
            onChange={(e) => onUpdateFit(e.target.value)}
            className="mono"
            style={{ background: fit.bg, color: fit.fg, border: "none", borderRadius: 6, padding: "5px 6px", fontSize: 10, fontWeight: 700, width: "100%" }}
          >
            <option value="">—</option>
            {Object.keys(FIT_STYLES).map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
