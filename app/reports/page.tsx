"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, LogOut, UserCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabaseClient";
import { Company, ActivityLogEntry, Profile, emailLocalPart } from "@/lib/types";
import Spinner from "@/components/Spinner";

const supabase = createClient();

const RANGE_OPTIONS = [
  { label: "Last 7 days", days: 7 },
  { label: "Last 30 days", days: 30 },
  { label: "Last 90 days", days: 90 },
  { label: "All time", days: Infinity },
];

export default function ReportsPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [activity, setActivity] = useState<ActivityLogEntry[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [rangeIdx, setRangeIdx] = useState(1); // default: last 30 days

  const loadData = useCallback(async () => {
    const { data: companyRows } = await supabase.from("companies").select("*");
    const { data: activityRows } = await supabase.from("activity_log").select("*").order("created_at", { ascending: false });
    const { data: profileRows } = await supabase.from("profiles").select("*").order("email", { ascending: true });
    setCompanies(companyRows || []);
    setActivity(activityRows || []);
    setProfiles(profileRows || []);
    setLoading(false);
  }, []);

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
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  const rangeDays = RANGE_OPTIONS[rangeIdx].days;
  const cutoff = rangeDays === Infinity ? null : Date.now() - rangeDays * 24 * 60 * 60 * 1000;

  const companiesInRange = useMemo(
    () => (cutoff ? companies.filter((c) => new Date(c.created_at).getTime() >= cutoff) : companies),
    [companies, cutoff]
  );
  const activityInRange = useMemo(
    () => (cutoff ? activity.filter((a) => new Date(a.created_at).getTime() >= cutoff) : activity),
    [activity, cutoff]
  );

  const addedBySource = useMemo(() => {
    const counts: Record<string, number> = { import: 0, manual: 0 };
    companiesInRange.forEach((c) => {
      counts[c.source] = (counts[c.source] || 0) + 1;
    });
    return counts;
  }, [companiesInRange]);

  const addedByDay = useMemo(() => {
    const byDay: Record<string, { import: number; manual: number }> = {};
    companiesInRange.forEach((c) => {
      const day = new Date(c.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      byDay[day] = byDay[day] || { import: 0, manual: 0 };
      byDay[day][c.source === "manual" ? "manual" : "import"] += 1;
    });
    return Object.entries(byDay)
      .map(([day, counts]) => ({ day, ...counts, total: counts.import + counts.manual }))
      .sort((a, b) => new Date(b.day).getTime() - new Date(a.day).getTime())
      .slice(0, 14);
  }, [companiesInRange]);

  type RepStats = {
    email: string;
    companiesCreated: number;
    notes: number;
    statusChanges: number;
    fitChanges: number;
    assignmentsMade: number;
    otherEdits: number;
    currentlyAssigned: number;
    total: number;
  };

  const repStats = useMemo(() => {
    const emails = new Set<string>(profiles.map((p) => p.email));
    activityInRange.forEach((a) => a.actor_email && emails.add(a.actor_email));
    companies.forEach((c) => c.assignee_email && emails.add(c.assignee_email));

    const stats: Record<string, RepStats> = {};
    emails.forEach((email) => {
      stats[email] = {
        email,
        companiesCreated: 0,
        notes: 0,
        statusChanges: 0,
        fitChanges: 0,
        assignmentsMade: 0,
        otherEdits: 0,
        currentlyAssigned: 0,
        total: 0,
      };
    });

    activityInRange.forEach((a) => {
      if (!a.actor_email || !stats[a.actor_email]) return;
      const s = stats[a.actor_email];
      switch (a.action) {
        case "created":
          s.companiesCreated++;
          break;
        case "note_added":
        case "note_edited":
        case "note_deleted":
          s.notes++;
          break;
        case "status_changed":
          s.statusChanges++;
          break;
        case "fit_changed":
          s.fitChanges++;
          break;
        case "assignee_changed":
          s.assignmentsMade++;
          break;
        case "field_updated":
          s.otherEdits++;
          break;
      }
      s.total++;
    });

    companies.forEach((c) => {
      if (c.assignee_email && stats[c.assignee_email]) {
        stats[c.assignee_email].currentlyAssigned++;
      }
    });

    return Object.values(stats)
      .filter((s) => s.total > 0 || s.currentlyAssigned > 0)
      .sort((a, b) => b.total - a.total);
  }, [activityInRange, companies, profiles]);

  if (loading || !userEmail) {
    return <Spinner />;
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F6F3EC" }}>
      <div className="board-header" style={{ background: "#1F2E2B", color: "#F6F3EC", padding: "20px 28px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ background: "#FFFDF8", borderRadius: 8, padding: "5px 10px", display: "flex", alignItems: "center" }}>
              <Image src="/bluebird-logo.png" alt="Bluebird" width={100} height={19} priority />
            </div>
            <button
              onClick={() => router.push("/board")}
              className="mono"
              style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "1px solid #4A5D56", borderRadius: 8, padding: "6px 12px", color: "#F6F3EC", fontSize: 12 }}
            >
              <ArrowLeft size={13} /> Board
            </button>
            <span className="fraunces" style={{ fontSize: 20, fontWeight: 600 }}>
              Reports
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span className="mono" style={{ fontSize: 12, background: "#33453F", padding: "6px 12px", borderRadius: 20, display: "flex", alignItems: "center", gap: 6 }}>
              <UserCircle2 size={13} /> {userEmail}
            </span>
            <button
              onClick={handleSignOut}
              title="Sign out"
              style={{ background: "none", border: "1px solid #4A5D56", borderRadius: 8, padding: "6px 10px", color: "#F6F3EC", display: "flex" }}
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </div>

      <div className="board-content" style={{ padding: "24px 28px 60px", maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          {RANGE_OPTIONS.map((opt, i) => (
            <button
              key={opt.label}
              onClick={() => setRangeIdx(i)}
              className="mono"
              style={{
                border: i === rangeIdx ? "1.5px solid #232323" : "1px solid #DCD5C3",
                background: i === rangeIdx ? "#232323" : "#FFFDF8",
                color: i === rangeIdx ? "#F6F3EC" : "#4A4A3F",
                borderRadius: 8,
                padding: "8px 14px",
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Summary cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 24 }}>
          <SummaryCard label="Companies added" value={companiesInRange.length} />
          <SummaryCard label="Added from Excel import" value={addedBySource.import || 0} />
          <SummaryCard label="Added manually" value={addedBySource.manual || 0} />
        </div>

        {/* Companies added by day */}
        <Section title="Companies added, by day">
          {addedByDay.length === 0 ? (
            <div style={{ fontSize: 12, color: "#8A8471" }}>Nothing added in this range.</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr className="mono" style={{ fontSize: 10, color: "#6B6656", textAlign: "left" }}>
                  <th style={thStyle}>DATE</th>
                  <th style={thStyle}>IMPORTED</th>
                  <th style={thStyle}>MANUAL</th>
                  <th style={thStyle}>TOTAL</th>
                </tr>
              </thead>
              <tbody>
                {addedByDay.map((row) => (
                  <tr key={row.day} style={{ borderTop: "1px solid #EDE7D6" }}>
                    <td style={tdStyle}>{row.day}</td>
                    <td style={tdStyle}>{row.import}</td>
                    <td style={tdStyle}>{row.manual}</td>
                    <td style={{ ...tdStyle, fontWeight: 600 }}>{row.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Section>

        {/* Rep activity */}
        <Section title="Rep activity">
          {repStats.length === 0 ? (
            <div style={{ fontSize: 12, color: "#8A8471" }}>No activity in this range.</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 700 }}>
                <thead>
                  <tr className="mono" style={{ fontSize: 10, color: "#6B6656", textAlign: "left" }}>
                    <th style={thStyle}>REP</th>
                    <th style={thStyle}>COMPANIES ADDED</th>
                    <th style={thStyle}>NOTES</th>
                    <th style={thStyle}>STATUS CHANGES</th>
                    <th style={thStyle}>FIT CHANGES</th>
                    <th style={thStyle}>ASSIGNMENTS MADE</th>
                    <th style={thStyle}>OTHER EDITS</th>
                    <th style={thStyle}>TOTAL ACTIVITY</th>
                    <th style={thStyle}>CURRENTLY ASSIGNED</th>
                  </tr>
                </thead>
                <tbody>
                  {repStats.map((s) => (
                    <tr key={s.email} style={{ borderTop: "1px solid #EDE7D6" }}>
                      <td style={{ ...tdStyle, fontWeight: 600 }} title={s.email}>
                        {emailLocalPart(s.email)}
                      </td>
                      <td style={tdStyle}>{s.companiesCreated}</td>
                      <td style={tdStyle}>{s.notes}</td>
                      <td style={tdStyle}>{s.statusChanges}</td>
                      <td style={tdStyle}>{s.fitChanges}</td>
                      <td style={tdStyle}>{s.assignmentsMade}</td>
                      <td style={tdStyle}>{s.otherEdits}</td>
                      <td style={{ ...tdStyle, fontWeight: 700 }}>{s.total}</td>
                      <td style={tdStyle}>{s.currentlyAssigned}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Section>
      </div>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ background: "#FFFDF8", border: "1px solid #E4DDC9", borderRadius: 12, padding: "16px 18px" }}>
      <div className="mono" style={{ fontSize: 10, color: "#6B6656", marginBottom: 6, letterSpacing: "0.03em" }}>
        {label.toUpperCase()}
      </div>
      <div className="fraunces" style={{ fontSize: 28, fontWeight: 600 }}>
        {value}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "#FFFDF8", border: "1px solid #E4DDC9", borderRadius: 12, padding: 18, marginBottom: 18 }}>
      <div className="mono" style={{ fontSize: 11, fontWeight: 700, color: "#4A4A3F", marginBottom: 14, letterSpacing: "0.03em" }}>
        {title.toUpperCase()}
      </div>
      {children}
    </div>
  );
}

const thStyle: React.CSSProperties = { padding: "6px 10px 8px", whiteSpace: "nowrap" };
const tdStyle: React.CSSProperties = { padding: "8px 10px" };
