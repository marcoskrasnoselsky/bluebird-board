"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowDown, ArrowUp, Download, LogOut, Search, Upload, User, UserCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabaseClient";
import { Company, Note, Profile, FIT_STYLES, STATUSES, isDNC } from "@/lib/types";
import CompanyRow from "@/components/CompanyRow";
import UploadZone from "@/components/UploadZone";

type SortField = "company" | "fit" | "status" | "assignee_email" | "created_at";

const supabase = createClient();

export default function BoardPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [companies, setCompanies] = useState<Company[] | null>(null);
  const [notesByCompany, setNotesByCompany] = useState<Record<string, Note[]>>({});
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [fitFilter, setFitFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [assigneeFilter, setAssigneeFilter] = useState("All");
  const [industryFilter, setIndustryFilter] = useState("All");
  const [pageSize, setPageSize] = useState(25);
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>("company");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  // Auth guard + initial load
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

  const loadData = useCallback(async () => {
    setLoading(true);
    const { data: companyRows } = await supabase.from("companies").select("*").order("company", { ascending: true });
    const { data: noteRows } = await supabase.from("notes").select("*").order("created_at", { ascending: true });
    const { data: profileRows } = await supabase.from("profiles").select("*").order("email", { ascending: true });
    setCompanies(companyRows || []);
    const grouped: Record<string, Note[]> = {};
    (noteRows || []).forEach((n: Note) => {
      grouped[n.company_id] = grouped[n.company_id] || [];
      grouped[n.company_id].push(n);
    });
    setNotesByCompany(grouped);
    setProfiles(profileRows || []);
    setLoading(false);
  }, []);

  // Realtime: reflect changes made by teammates without a manual refresh
  useEffect(() => {
    const channel = supabase
      .channel("board-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "companies" }, () => loadData())
      .on("postgres_changes", { event: "*", schema: "public", table: "notes" }, () => loadData())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadData]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  const normalizeName = (name: string | null | undefined) => (name || "").trim().toLowerCase();

  const handleImport = async (rows: Partial<Company>[]) => {
    if (rows.length === 0) return;

    const existingNames = new Set((companies || []).map((c) => normalizeName(c.company)));
    const seenInBatch = new Set<string>();
    const toInsert: Partial<Company>[] = [];
    let skipped = 0;

    for (const row of rows) {
      const key = normalizeName(row.company);
      if (!key || existingNames.has(key) || seenInBatch.has(key)) {
        skipped++;
        continue;
      }
      seenInBatch.add(key);
      toInsert.push(row);
    }

    if (toInsert.length > 0) {
      await supabase.from("companies").insert(toInsert as any);
    }
    await loadData();

    if (skipped > 0) {
      alert(`Imported ${toInsert.length} new companies. Skipped ${skipped} already on the board.`);
    }
  };

  const updateField = async (id: string, field: keyof Company, value: string) => {
    setCompanies((prev) => (prev ? prev.map((c) => (c.id === id ? { ...c, [field]: value } : c)) : prev));
    await supabase.from("companies").update({ [field]: value }).eq("id", id);
  };

  const addNote = async (companyId: string, text: string) => {
    if (!userEmail) return;
    await supabase.from("notes").insert({ company_id: companyId, author_email: userEmail, text });
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

  const assigneeOptions = useMemo(() => {
    const set = new Set<string>(profiles.map((p) => p.email));
    (companies || []).forEach((c) => c.assignee_email && set.add(c.assignee_email));
    return Array.from(set).sort();
  }, [companies, profiles]);

  const industryOptions = useMemo(() => {
    const set = new Set<string>();
    (companies || []).forEach((c) => c.industry && set.add(c.industry));
    return Array.from(set).sort();
  }, [companies]);

  const filtered = useMemo(() => {
    if (!companies) return [];
    return companies.filter((c) => {
      if (fitFilter !== "All" && c.fit !== fitFilter) return false;
      if (statusFilter !== "All" && (c.status || "New") !== statusFilter) return false;
      if (assigneeFilter !== "All" && (c.assignee_email || "") !== assigneeFilter) return false;
      if (industryFilter !== "All" && (c.industry || "") !== industryFilter) return false;
      if (!search.trim()) return true;
      const s = search.toLowerCase();
      return (
        (c.company || "").toLowerCase().includes(s) ||
        (c.decision_maker || "").toLowerCase().includes(s) ||
        (c.industry || "").toLowerCase().includes(s) ||
        (c.location || "").toLowerCase().includes(s)
      );
    });
  }, [companies, search, fitFilter, statusFilter, assigneeFilter, industryFilter]);

  const sorted = useMemo(() => {
    const copy = [...filtered];
    copy.sort((a, b) => {
      let av: string | number = "";
      let bv: string | number = "";
      if (sortField === "created_at") {
        av = new Date(a.created_at).getTime();
        bv = new Date(b.created_at).getTime();
      } else {
        av = (a[sortField] || "").toString().toLowerCase();
        bv = (b[sortField] || "").toString().toLowerCase();
      }
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return copy;
  }, [filtered, sortField, sortDir]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const exportToExcel = async () => {
    const XLSX = await import("xlsx");
    const rows = sorted.map((c) => ({
      Company: c.company,
      Website: c.website,
      Industry: c.industry,
      Location: c.location,
      Fit: c.fit,
      Status: c.status,
      Assignee: c.assignee_email,
      "Decision Maker": c.decision_maker,
      Title: c.title,
      Phone: c.phone,
      Email: c.email,
      "Buying Signal": c.buying_signal,
      "Added": c.created_at,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Prospects");
    XLSX.writeFile(wb, `bluebird-prospects-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // Reset to page 1 whenever the filtered set or page size changes
  useEffect(() => {
    setPage(1);
  }, [search, fitFilter, statusFilter, assigneeFilter, industryFilter, pageSize]);

  const totalPages = pageSize === Infinity ? 1 : Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginated = useMemo(() => {
    if (pageSize === Infinity) return sorted;
    const start = (currentPage - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, currentPage, pageSize]);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    (companies || []).forEach((row) => {
      if (row.fit) c[row.fit] = (c[row.fit] || 0) + 1;
    });
    return c;
  }, [companies]);

  const dncCount = useMemo(() => (companies || []).filter((c) => isDNC(c.phone)).length, [companies]);

  if (loading || !userEmail) {
    return <div style={{ padding: 60, textAlign: "center", color: "#8A8471" }}>Loading...</div>;
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F6F3EC" }}>
      <div style={{ background: "#1F2E2B", color: "#F6F3EC", padding: "20px 28px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
            <span className="fraunces" style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.01em" }}>
              Bluebird
            </span>
            <span className="mono" style={{ fontSize: 12, opacity: 0.6, letterSpacing: "0.04em" }}>
              PROSPECT BOARD
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

      {!companies || companies.length === 0 ? (
        <UploadZone onParsed={handleImport} />
      ) : (
        <div style={{ padding: "24px 28px 60px" }}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
            <StatChip label="Total" value={companies.length} onClick={() => setFitFilter("All")} active={fitFilter === "All"} />
            {Object.entries(FIT_STYLES).map(([fit, style]) =>
              counts[fit] ? (
                <StatChip key={fit} label={fit} value={counts[fit]} color={style.dot} onClick={() => setFitFilter(fit)} active={fitFilter === fit} />
              ) : null
            )}
            {dncCount > 0 && (
              <div className="mono" style={{ display: "flex", alignItems: "center", gap: 6, background: "#F1DEDD", color: "#8A2E2E", padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600 }}>
                <AlertTriangle size={13} /> {dncCount} on DNC — do not call
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
            <div style={{ position: "relative", flex: "1 1 240px" }}>
              <Search size={15} style={{ position: "absolute", left: 12, top: 11, color: "#8A8471" }} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search company, contact, industry, location..."
                style={{ width: "100%", padding: "9px 12px 9px 34px", borderRadius: 8, border: "1px solid #DCD5C3", background: "#FFFDF8", fontSize: 13 }}
              />
            </div>
            <select value={fitFilter} onChange={(e) => setFitFilter(e.target.value)} className="mono" style={selectStyle}>
              <option value="All">All fits</option>
              {Object.keys(FIT_STYLES).map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="mono" style={selectStyle}>
              <option value="All">All statuses</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <select value={assigneeFilter} onChange={(e) => setAssigneeFilter(e.target.value)} className="mono" style={selectStyle}>
              <option value="All">All assignees</option>
              <option value="">Unassigned</option>
              {assigneeOptions.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
            <select value={industryFilter} onChange={(e) => setIndustryFilter(e.target.value)} className="mono" style={selectStyle}>
              <option value="All">All industries</option>
              {industryOptions.map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
            <button
              onClick={() => setAssigneeFilter(assigneeFilter === userEmail ? "All" : userEmail || "All")}
              className="mono"
              style={{
                ...selectStyle,
                display: "flex",
                alignItems: "center",
                gap: 6,
                cursor: "pointer",
                border: assigneeFilter === userEmail ? "1.5px solid #232323" : selectStyle.border,
                background: assigneeFilter === userEmail ? "#232323" : selectStyle.background,
                color: assigneeFilter === userEmail ? "#F6F3EC" : selectStyle.color,
              }}
            >
              <User size={13} /> My companies
            </button>
            <button onClick={exportToExcel} className="mono" style={{ ...selectStyle, display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
              <Download size={13} /> Export
            </button>
            <label className="mono" style={{ ...selectStyle, display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
              <Upload size={13} /> Import more
              <input
                type="file"
                accept=".xlsx,.xls"
                style={{ display: "none" }}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const XLSX = await import("xlsx");
                  const { EXCEL_TO_DB } = await import("@/lib/types");
                  const buf = await file.arrayBuffer();
                  const wb = XLSX.read(buf, { type: "array" });
                  const sheetName = wb.SheetNames.includes("Prospects") ? "Prospects" : wb.SheetNames[0];
                  const ws = wb.Sheets[sheetName];
                  const rows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
                  const headers = rows[0] as string[];
                  const dataRows = rows.slice(1).filter((r) => r[0]);
                  const parsed = dataRows.map((r) => {
                    const obj: any = { status: "New" };
                    headers.forEach((h, i) => {
                      const dbField = (EXCEL_TO_DB as any)[h];
                      if (dbField) obj[dbField] = r[i] !== undefined ? String(r[i]) : "";
                    });
                    return obj;
                  });
                  await handleImport(parsed);
                }}
              />
            </label>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, flexWrap: "wrap", gap: 10 }}>
            <span className="mono" style={{ fontSize: 11, color: "#8A8471" }}>
              {filtered.length === 0 ? "0 results" : `Showing ${(currentPage - 1) * (pageSize === Infinity ? filtered.length : pageSize) + 1}–${Math.min(currentPage * (pageSize === Infinity ? filtered.length : pageSize), filtered.length)} of ${filtered.length}`}
            </span>
            <label className="mono" style={{ fontSize: 11, color: "#8A8471", display: "flex", alignItems: "center", gap: 6 }}>
              Per page
              <select
                value={pageSize === Infinity ? "All" : pageSize}
                onChange={(e) => setPageSize(e.target.value === "All" ? Infinity : Number(e.target.value))}
                className="mono"
                style={{ ...selectStyle, padding: "5px 8px" }}
              >
                {[25, 50, 100].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
                <option value="All">All</option>
              </select>
            </label>
          </div>

          <div
            className="mono"
            style={{
              display: "grid",
              gridTemplateColumns: "20px 1.4fr 0.9fr 0.65fr 0.5fr 0.85fr 0.75fr 0.5fr",
              gap: 12,
              padding: "0 16px 8px",
              fontSize: 10,
              color: "#8A8471",
              letterSpacing: "0.03em",
            }}
          >
            <span />
            <SortHeader label="COMPANY" field="company" sortField={sortField} sortDir={sortDir} onSort={toggleSort} />
            <span>CONTACT</span>
            <span>PHONE</span>
            <SortHeader label="ADDED" field="created_at" sortField={sortField} sortDir={sortDir} onSort={toggleSort} />
            <SortHeader label="STATUS" field="status" sortField={sortField} sortDir={sortDir} onSort={toggleSort} />
            <SortHeader label="ASSIGNEE" field="assignee_email" sortField={sortField} sortDir={sortDir} onSort={toggleSort} />
            <div style={{ textAlign: "right" }}>
              <SortHeader label="FIT" field="fit" sortField={sortField} sortDir={sortDir} onSort={toggleSort} align="right" />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {paginated.map((c) => (
              <CompanyRow
                key={c.id}
                company={c}
                notes={notesByCompany[c.id] || []}
                profiles={profiles}
                expanded={expanded === c.id}
                onToggle={() => setExpanded(expanded === c.id ? null : c.id)}
                currentUserEmail={userEmail}
                onUpdateField={(field, value) => updateField(c.id, field, value)}
                onUpdateStatus={(status) => updateField(c.id, "status", status)}
                onUpdateAssignee={(email) => updateField(c.id, "assignee_email", email)}
                onAddNote={(text) => addNote(c.id, text)}
                onEditNote={(noteId, text) => editNote(noteId, text)}
                onDeleteNote={(noteId) => deleteNote(noteId)}
              />
            ))}
            {filtered.length === 0 && <div style={{ padding: 40, textAlign: "center", color: "#8A8471", fontSize: 13 }}>Nothing matches those filters.</div>}
          </div>

          {totalPages > 1 && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginTop: 20 }}>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="mono"
                style={{ ...selectStyle, cursor: currentPage === 1 ? "default" : "pointer", opacity: currentPage === 1 ? 0.5 : 1 }}
              >
                Previous
              </button>
              <span className="mono" style={{ fontSize: 12, color: "#4A4A3F" }}>
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="mono"
                style={{ ...selectStyle, cursor: currentPage === totalPages ? "default" : "pointer", opacity: currentPage === totalPages ? 0.5 : 1 }}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatChip({ label, value, color, onClick, active }: { label: string; value: number; color?: string; onClick: () => void; active: boolean }) {
  return (
    <button
      onClick={onClick}
      className="mono"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 14px",
        borderRadius: 8,
        border: active ? "1.5px solid #232323" : "1px solid #DCD5C3",
        background: active ? "#232323" : "#FFFDF8",
        color: active ? "#F6F3EC" : "#4A4A3F",
        fontSize: 12,
        fontWeight: 600,
      }}
    >
      {color && <span style={{ width: 8, height: 8, borderRadius: 99, background: color, display: "inline-block" }} />}
      {label} <span style={{ opacity: 0.6 }}>{value}</span>
    </button>
  );
}

function SortHeader({
  label,
  field,
  sortField,
  sortDir,
  onSort,
  align,
}: {
  label: string;
  field: SortField;
  sortField: SortField;
  sortDir: "asc" | "desc";
  onSort: (field: SortField) => void;
  align?: "right";
}) {
  const active = sortField === field;
  return (
    <button
      onClick={() => onSort(field)}
      className="mono"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 3,
        justifyContent: align === "right" ? "flex-end" : "flex-start",
        background: "none",
        border: "none",
        padding: 0,
        fontSize: 10,
        letterSpacing: "0.03em",
        color: active ? "#232323" : "#8A8471",
        fontWeight: active ? 700 : 400,
        cursor: "pointer",
      }}
    >
      {label}
      {active && (sortDir === "asc" ? <ArrowUp size={10} /> : <ArrowDown size={10} />)}
    </button>
  );
}

const selectStyle: React.CSSProperties = {
  border: "1px solid #DCD5C3",
  background: "#FFFDF8",
  borderRadius: 8,
  padding: "9px 10px",
  fontSize: 12,
  color: "#4A4A3F",
};
