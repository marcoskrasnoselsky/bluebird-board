"use client";

import { Filter, PanelLeftClose, PanelLeftOpen, Search, User, X } from "lucide-react";
import { FIT_STYLES, STATUSES, emailLocalPart } from "@/lib/types";

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
  myCompaniesActive,
  onToggleMyCompanies,
  onClearAll,
  hasActiveFilters,
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
  myCompaniesActive: boolean;
  onToggleMyCompanies: () => void;
  onClearAll: () => void;
  hasActiveFilters: boolean;
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
    </div>
  );
}
