"use client";

import { Bookmark, Filter, PanelLeftClose, PanelLeftOpen, Save, Search, Trash2, User, X } from "lucide-react";
import { FIT_STYLES, STATUSES, SavedView, emailLocalPart } from "@/lib/types";

const selectStyle: React.CSSProperties = {
  width: "100%",
  border: "1px solid #DCD5C3",
  background: "#FFFDF8",
  borderRadius: 8,
  padding: "9px 10px",
  fontSize: 12,
  color: "#4A4A3F",
};

export default function FilterSidebar({
  open,
  onToggle,
  search,
  onSearch,
  fitFilter,
  onFitFilter,
  statusFilter,
  onStatusFilter,
  assigneeFilter,
  onAssigneeFilter,
  assigneeOptions,
  industryFilter,
  onIndustryFilter,
  industryOptions,
  phoneFilter,
  onPhoneFilter,
  emailFilter,
  onEmailFilter,
  myCompaniesActive,
  onToggleMyCompanies,
  onClearAll,
  hasActiveFilters,
  savedViews,
  onSaveView,
  onApplyView,
  onDeleteView,
}: {
  open: boolean;
  onToggle: () => void;
  search: string;
  onSearch: (v: string) => void;
  fitFilter: string;
  onFitFilter: (v: string) => void;
  statusFilter: string;
  onStatusFilter: (v: string) => void;
  assigneeFilter: string;
  onAssigneeFilter: (v: string) => void;
  assigneeOptions: string[];
  industryFilter: string;
  onIndustryFilter: (v: string) => void;
  industryOptions: string[];
  phoneFilter: string;
  onPhoneFilter: (v: string) => void;
  emailFilter: string;
  onEmailFilter: (v: string) => void;
  myCompaniesActive: boolean;
  onToggleMyCompanies: () => void;
  onClearAll: () => void;
  hasActiveFilters: boolean;
  savedViews: SavedView[];
  onSaveView: () => void;
  onApplyView: (view: SavedView) => void;
  onDeleteView: (name: string) => void;
}) {
  if (!open) {
    return (
      <button
        onClick={onToggle}
        title="Show filters"
        style={{
          flexShrink: 0,
          width: 40,
          height: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#FFFDF8",
          border: "1px solid #DCD5C3",
          borderRadius: 8,
          color: "#4A4A3F",
        }}
      >
        <PanelLeftOpen size={16} />
      </button>
    );
  }

  return (
    <div
      style={{
        flexShrink: 0,
        width: 200,
        display: "flex",
        flexDirection: "column",
        gap: 14,
        background: "#FFFDF8",
        border: "1px solid #E4DDC9",
        borderRadius: 12,
        padding: 16,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div className="mono" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700, color: "#4A4A3F", letterSpacing: "0.03em" }}>
          <Filter size={12} /> FILTERS
        </div>
        <button onClick={onToggle} title="Hide filters" style={{ background: "none", border: "none", color: "#6B6656", display: "flex" }}>
          <PanelLeftClose size={15} />
        </button>
      </div>

      <div style={{ position: "relative" }}>
        <Search size={14} style={{ position: "absolute", left: 10, top: 10, color: "#6B6656" }} />
        <input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search..."
          style={{ width: "100%", padding: "8px 10px 8px 30px", borderRadius: 8, border: "1px solid #DCD5C3", background: "#FFFDF8", fontSize: 13 }}
        />
      </div>

      <div>
        <label className="mono" style={{ fontSize: 10, color: "#6B6656" }}>
          FIT
        </label>
        <select value={fitFilter} onChange={(e) => onFitFilter(e.target.value)} className="mono" style={{ ...selectStyle, marginTop: 4 }}>
          <option value="All">All fits</option>
          {Object.keys(FIT_STYLES).map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mono" style={{ fontSize: 10, color: "#6B6656" }}>
          STATUS
        </label>
        <select value={statusFilter} onChange={(e) => onStatusFilter(e.target.value)} className="mono" style={{ ...selectStyle, marginTop: 4 }}>
          <option value="All">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mono" style={{ fontSize: 10, color: "#6B6656" }}>
          ASSIGNEE
        </label>
        <select value={assigneeFilter} onChange={(e) => onAssigneeFilter(e.target.value)} className="mono" style={{ ...selectStyle, marginTop: 4 }}>
          <option value="All">All assignees</option>
          <option value="">Unassigned</option>
          {assigneeOptions.map((a) => (
            <option key={a} value={a}>
              {emailLocalPart(a)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mono" style={{ fontSize: 10, color: "#6B6656" }}>
          INDUSTRY
        </label>
        <select value={industryFilter} onChange={(e) => onIndustryFilter(e.target.value)} className="mono" style={{ ...selectStyle, marginTop: 4 }}>
          <option value="All">All industries</option>
          {industryOptions.map((i) => (
            <option key={i} value={i}>
              {i}
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <div>
          <label className="mono" style={{ fontSize: 10, color: "#6B6656" }}>
            PHONE
          </label>
          <select value={phoneFilter} onChange={(e) => onPhoneFilter(e.target.value)} className="mono" style={{ ...selectStyle, marginTop: 4, padding: "9px 4px" }}>
            <option value="All">Any</option>
            <option value="Has">Has phone</option>
            <option value="Missing">Missing</option>
          </select>
        </div>
        <div>
          <label className="mono" style={{ fontSize: 10, color: "#6B6656" }}>
            EMAIL
          </label>
          <select value={emailFilter} onChange={(e) => onEmailFilter(e.target.value)} className="mono" style={{ ...selectStyle, marginTop: 4, padding: "9px 4px" }}>
            <option value="All">Any</option>
            <option value="Has">Has email</option>
            <option value="Missing">Missing</option>
          </select>
        </div>
      </div>

      <button
        onClick={onToggleMyCompanies}
        className="mono"
        style={{
          ...selectStyle,
          display: "flex",
          alignItems: "center",
          gap: 6,
          cursor: "pointer",
          border: myCompaniesActive ? "1.5px solid #232323" : selectStyle.border,
          background: myCompaniesActive ? "#232323" : selectStyle.background,
          color: myCompaniesActive ? "#F6F3EC" : selectStyle.color,
        }}
      >
        <User size={13} /> My companies
      </button>

      {hasActiveFilters && (
        <button
          onClick={onClearAll}
          className="mono"
          style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: "none", color: "#6B6656", fontSize: 11, padding: 0, textDecoration: "underline" }}
        >
          <X size={11} /> Clear all filters
        </button>
      )}

      <div style={{ borderTop: "1px solid #EDE7D6", paddingTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div className="mono" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700, color: "#4A4A3F", letterSpacing: "0.03em" }}>
            <Bookmark size={12} /> SAVED VIEWS
          </div>
          <button onClick={onSaveView} title="Save current filters as a view" style={{ background: "none", border: "none", color: "#6B6656", display: "flex" }}>
            <Save size={13} />
          </button>
        </div>

        {savedViews.length === 0 ? (
          <div style={{ fontSize: 11, color: "#8A8471" }}>No saved views yet.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {savedViews.map((v) => (
              <div key={v.name} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <button
                  onClick={() => onApplyView(v)}
                  className="mono"
                  style={{ flex: 1, textAlign: "left", background: "#FFFDF8", border: "1px solid #E4DDC9", borderRadius: 6, padding: "6px 8px", fontSize: 11.5, color: "#232323", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                >
                  {v.name}
                </button>
                <button onClick={() => onDeleteView(v.name)} title={`Delete "${v.name}"`} style={{ background: "none", border: "none", color: "#B84C4C", display: "flex", flexShrink: 0 }}>
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
