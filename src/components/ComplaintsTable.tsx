import { useState, useMemo } from "react";
import Icon from "@/components/ui/icon";
import {
  Complaint,
  ComplaintPriority,
  FilterState,
  STATUS_CONFIG,
  PRIORITY_CONFIG,
  DEFAULT_FILTER,
} from "@/components/complaint.types";
import { FilterModal } from "@/components/ComplaintModals";

// ─── StatusBadge ──────────────────────────────────────────────────────────────

export function StatusBadge({ status }: { status: Complaint["status"] }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap"
      style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
    >
      <Icon name={cfg.icon} size={11} />
      {cfg.label}
    </span>
  );
}

// ─── PriorityBadge ────────────────────────────────────────────────────────────

export function PriorityBadge({ priority }: { priority: ComplaintPriority }) {
  const cfg = PRIORITY_CONFIG[priority];
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium" style={{ color: cfg.color }}>
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: cfg.dot }} />
      {cfg.label}
    </span>
  );
}

// ─── ComplaintsTable ──────────────────────────────────────────────────────────

export function ComplaintsTable({
  data, isArchive, onRowClick,
}: {
  data: Complaint[];
  isArchive: boolean;
  onRowClick: (c: Complaint) => void;
}) {
  if (data.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: "rgba(255,255,255,0.04)" }}>
          <Icon name="Inbox" size={24} className="text-gray-600" />
        </div>
        <p className="text-gray-500 font-medium">Жалоб нет</p>
        <p className="text-gray-700 text-sm mt-1">Записи отсутствуют</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
      <table className="w-full text-sm">
        <thead>
          <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}>
            {["ID", "Дата", "Статус", "Объект жалобы", "Причина", ...(isArchive ? [] : ["Приоритет"])].map((col) => (
              <th key={col} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-widest whitespace-nowrap">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((c, i) => (
            <tr
              key={c.id}
              onClick={() => onRowClick(c)}
              className="cursor-pointer transition-colors hover:bg-white/[0.03] group"
              style={{ borderBottom: i < data.length - 1 ? "1px solid rgba(255,255,255,0.05)" : undefined }}
            >
              <td className="px-4 py-3.5 font-mono text-xs text-indigo-400 font-semibold whitespace-nowrap">{c.id}</td>
              <td className="px-4 py-3.5 text-gray-500 text-xs whitespace-nowrap">{c.date}</td>
              <td className="px-4 py-3.5"><StatusBadge status={c.status} /></td>
              <td className="px-4 py-3.5">
                <span className="text-white font-medium group-hover:text-indigo-300 transition-colors">{c.objectTitle}</span>
              </td>
              <td className="px-4 py-3.5 text-gray-400 text-xs max-w-[180px] truncate">{c.reason}</td>
              {!isArchive && (
                <td className="px-4 py-3.5"><PriorityBadge priority={c.priority} /></td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── SectionView ──────────────────────────────────────────────────────────────

export function SectionView({
  data, isArchive, onRowClick,
}: {
  data: Complaint[];
  isArchive: boolean;
  onRowClick: (c: Complaint) => void;
}) {
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTER);

  const activeFilterCount = [
    filters.dateFrom || filters.dateTo ? 1 : 0,
    filters.statuses.length,
    filters.priorities.length,
  ].reduce((a, b) => a + b, 0);

  const filtered = useMemo(() => {
    return data.filter((c) => {
      if (filters.statuses.length && !filters.statuses.includes(c.status)) return false;
      if (filters.priorities.length && !filters.priorities.includes(c.priority)) return false;
      return true;
    });
  }, [data, filters]);

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-400">
            {filtered.length} {filtered.length === 1 ? "запись" : "записей"}
          </span>
          {activeFilterCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-xs font-bold text-indigo-400" style={{ background: "rgba(99,102,241,0.15)" }}>
              {activeFilterCount} фильтра
            </span>
          )}
        </div>
        <button
          onClick={() => setFilterOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:opacity-90"
          style={activeFilterCount > 0
            ? { background: "rgba(99,102,241,0.15)", color: "#818cf8", border: "1px solid rgba(99,102,241,0.25)" }
            : { background: "rgba(255,255,255,0.05)", color: "#9ca3af", border: "1px solid rgba(255,255,255,0.08)" }
          }
        >
          <Icon name="SlidersHorizontal" size={13} />
          Фильтры
        </button>
      </div>
      <ComplaintsTable data={filtered} isArchive={isArchive} onRowClick={onRowClick} />
      <FilterModal
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={filters}
        onChange={setFilters}
        isArchive={isArchive}
      />
    </>
  );
}
