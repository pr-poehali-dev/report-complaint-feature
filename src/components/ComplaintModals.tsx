import { useState } from "react";
import Icon from "@/components/ui/icon";
import {
  Complaint,
  ComplaintStatus,
  ComplaintPriority,
  FilterState,
  STATUS_CONFIG,
  PRIORITY_CONFIG,
  DEFAULT_FILTER,
} from "@/components/complaint.types";

// ─── Filter Modal ─────────────────────────────────────────────────────────────

export function FilterModal({
  open, onClose, filters, onChange, isArchive,
}: {
  open: boolean;
  onClose: () => void;
  filters: FilterState;
  onChange: (f: FilterState) => void;
  isArchive: boolean;
}) {
  const [local, setLocal] = useState<FilterState>(filters);

  if (!open) return null;

  const toggleArr = <T extends string>(arr: T[], val: T): T[] =>
    arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];

  const availableStatuses: ComplaintStatus[] = isArchive
    ? ["resolved", "rejected"]
    : ["new", "in_progress", "resolved", "rejected", "hidden"];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-md rounded-3xl p-6 animate-scale-in"
        style={{
          background: "linear-gradient(145deg, #1a1d2e 0%, #151722 100%)",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(129,140,248,0.15)", border: "1px solid rgba(129,140,248,0.25)" }}>
              <Icon name="SlidersHorizontal" size={14} className="text-indigo-400" />
            </div>
            <h3 className="font-semibold text-white">Фильтры</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors hover:bg-white/10">
            <Icon name="X" size={16} className="text-gray-400" />
          </button>
        </div>

        <div className="space-y-5">
          {/* Date range */}
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-2.5 font-medium">Дата</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-600 mb-1 block">С</label>
                <input
                  type="date"
                  value={local.dateFrom}
                  onChange={(e) => setLocal({ ...local, dateFrom: e.target.value })}
                  className="w-full rounded-xl px-3 py-2 text-sm text-white"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", outline: "none" }}
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-1 block">По</label>
                <input
                  type="date"
                  value={local.dateTo}
                  onChange={(e) => setLocal({ ...local, dateTo: e.target.value })}
                  className="w-full rounded-xl px-3 py-2 text-sm text-white"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", outline: "none" }}
                />
              </div>
            </div>
          </div>

          {/* Status */}
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-2.5 font-medium">Статус</p>
            <div className="flex flex-wrap gap-2">
              {availableStatuses.map((s) => {
                const active = local.statuses.includes(s);
                const cfg = STATUS_CONFIG[s];
                return (
                  <button
                    key={s}
                    onClick={() => setLocal({ ...local, statuses: toggleArr(local.statuses, s) })}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                    style={active
                      ? { background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }
                      : { background: "rgba(255,255,255,0.04)", color: "#6b7280", border: "1px solid rgba(255,255,255,0.08)" }
                    }
                  >
                    <Icon name={cfg.icon} size={11} />
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Priority */}
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-2.5 font-medium">Приоритет</p>
            <div className="flex gap-2">
              {(["high", "medium", "low"] as ComplaintPriority[]).map((p) => {
                const active = local.priorities.includes(p);
                const cfg = PRIORITY_CONFIG[p];
                return (
                  <button
                    key={p}
                    onClick={() => setLocal({ ...local, priorities: toggleArr(local.priorities, p) })}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex-1"
                    style={active
                      ? { background: `${cfg.color}20`, color: cfg.color, border: `1px solid ${cfg.color}40` }
                      : { background: "rgba(255,255,255,0.04)", color: "#6b7280", border: "1px solid rgba(255,255,255,0.08)" }
                    }
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: active ? cfg.dot : "#6b7280" }} />
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => setLocal(DEFAULT_FILTER)}
            className="flex-1 py-2.5 rounded-2xl text-sm font-medium text-gray-500 transition-colors hover:text-gray-300"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            Сбросить
          </button>
          <button
            onClick={() => { onChange(local); onClose(); }}
            className="flex-1 py-2.5 rounded-2xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.97]"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
          >
            Применить
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Block Modal ──────────────────────────────────────────────────────────────

export function BlockModal({
  open, onClose, onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (d: string) => void;
}) {
  const [duration, setDuration] = useState("1d");
  if (!open) return null;
  const options = [
    { v: "1d", l: "1 день" },
    { v: "7d", l: "7 дней" },
    { v: "30d", l: "Месяц" },
    { v: "forever", l: "Навсегда" },
  ];
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.8)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-xs rounded-3xl p-6 animate-scale-in"
        style={{
          background: "#1a1d2e",
          border: "1px solid rgba(239,68,68,0.25)",
          boxShadow: "0 32px 80px rgba(239,68,68,0.15)",
        }}
      >
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.25)" }}>
            <Icon name="ShieldBan" size={14} style={{ color: "#ef4444" }} />
          </div>
          <h3 className="font-semibold text-white">Заблокировать пользователя</h3>
        </div>
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-3 font-medium">Срок блокировки</p>
        <div className="grid grid-cols-2 gap-2 mb-6">
          {options.map((o) => (
            <button
              key={o.v}
              onClick={() => setDuration(o.v)}
              className="py-2.5 rounded-xl text-sm font-medium transition-all"
              style={duration === o.v
                ? { background: "rgba(239,68,68,0.15)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)" }
                : { background: "rgba(255,255,255,0.04)", color: "#9ca3af", border: "1px solid rgba(255,255,255,0.08)" }
              }
            >
              {o.l}
            </button>
          ))}
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-2xl text-sm text-gray-500"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            Отмена
          </button>
          <button
            onClick={() => { onConfirm(duration); onClose(); }}
            className="flex-1 py-2.5 rounded-2xl text-sm font-bold text-white"
            style={{ background: "linear-gradient(135deg, #dc2626, #b91c1c)" }}
          >
            Подтвердить
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Complaint Card Modal ─────────────────────────────────────────────────────

export function ComplaintCardModal({
  complaint, open, onClose, onAction,
}: {
  complaint: Complaint | null;
  open: boolean;
  onClose: () => void;
  onAction: (id: string, action: "reject" | "warn" | "delete" | "block", payload?: string) => void;
}) {
  const [rejectMode, setRejectMode] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [blockOpen, setBlockOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  if (!open || !complaint) return null;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const cfg = STATUS_CONFIG[complaint.status];

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.75)" }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div
          className="w-full max-w-xl rounded-3xl overflow-hidden animate-scale-in"
          style={{
            background: "linear-gradient(145deg, #1c1f32 0%, #151722 100%)",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 32px 80px rgba(0,0,0,0.7)",
            maxHeight: "90vh",
            overflowY: "auto",
          }}
        >
          {/* Header */}
          <div className="px-6 pt-6 pb-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xs text-indigo-400 font-bold tracking-widest uppercase mb-1">{complaint.id}</p>
                <h2 className="font-montserrat text-xl font-extrabold text-white">{complaint.objectTitle}</h2>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors hover:bg-white/10 flex-shrink-0"
              >
                <Icon name="X" size={16} className="text-gray-400" />
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap"
                style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
              >
                <Icon name={cfg.icon} size={11} />
                {cfg.label}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium" style={{ color: PRIORITY_CONFIG[complaint.priority].color }}>
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: PRIORITY_CONFIG[complaint.priority].dot }} />
                {PRIORITY_CONFIG[complaint.priority].label}
              </span>
              <span className="text-xs text-gray-600">
                <Icon name="Clock" size={11} className="inline mr-1" />
                {complaint.date}
              </span>
            </div>
          </div>

          <div className="px-6 py-5 space-y-5">
            {/* Reason */}
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-2 font-medium">Причина нарушения</p>
              <div className="rounded-2xl px-4 py-3 flex items-center gap-3" style={{ background: "rgba(129,140,248,0.08)", border: "1px solid rgba(129,140,248,0.15)" }}>
                <Icon name="Flag" size={14} className="text-indigo-400 flex-shrink-0" />
                <p className="text-white text-sm font-medium">{complaint.reason}</p>
              </div>
            </div>

            {/* Comment */}
            {complaint.comment && (
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-widest mb-2 font-medium">Комментарий заявителя</p>
                <div className="rounded-2xl px-4 py-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <p className="text-gray-300 text-sm leading-relaxed">{complaint.comment}</p>
                </div>
              </div>
            )}

            {/* Link */}
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-2 font-medium">Объект жалобы</p>
              <button
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-indigo-400 font-medium transition-all hover:bg-indigo-400/10"
                style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)" }}
                onClick={() => showToast("Переход к объекту жалобы")}
              >
                <Icon name="ExternalLink" size={13} />
                Перейти к объекту — {complaint.objectTitle}
              </button>
            </div>

            {/* History */}
            {complaint.history.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-widest mb-2 font-medium">История нарушений</p>
                <div className="rounded-2xl px-4 py-3 space-y-2" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  {complaint.history.map((h, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: "#6366f1" }} />
                      <div>
                        <p className="text-xs text-gray-600">{h.date}</p>
                        <p className="text-sm text-gray-400">{h.action}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reject input */}
            {rejectMode && (
              <div className="animate-fade-in">
                <p className="text-xs text-gray-500 uppercase tracking-widest mb-2 font-medium">Причина отклонения</p>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Укажите внутреннюю причину отклонения..."
                  rows={3}
                  className="w-full rounded-2xl px-4 py-3 text-sm text-white resize-none"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", outline: "none" }}
                />
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => { setRejectMode(false); setRejectReason(""); }}
                    className="flex-1 py-2 rounded-xl text-sm text-gray-500"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                  >
                    Отмена
                  </button>
                  <button
                    onClick={() => {
                      if (rejectReason.trim()) {
                        onAction(complaint.id, "reject", rejectReason);
                        setRejectMode(false);
                        setRejectReason("");
                        showToast("Жалоба отклонена");
                      }
                    }}
                    className="flex-1 py-2 rounded-xl text-sm font-bold text-white"
                    style={{ background: "rgba(148,163,184,0.2)", border: "1px solid rgba(148,163,184,0.3)", opacity: rejectReason.trim() ? 1 : 0.5 }}
                  >
                    Подтвердить
                  </button>
                </div>
              </div>
            )}

            {/* Actions */}
            {complaint.status !== "resolved" && complaint.status !== "rejected" && (
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: "1.25rem" }}>
                <p className="text-xs text-gray-500 uppercase tracking-widest mb-3 font-medium">Действия модератора</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setRejectMode(true)}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-90"
                    style={{ background: "rgba(148,163,184,0.10)", color: "#94a3b8", border: "1px solid rgba(148,163,184,0.2)" }}
                  >
                    <Icon name="XCircle" size={14} />
                    Отклонить
                  </button>
                  <button
                    onClick={() => { onAction(complaint.id, "warn"); showToast("Предупреждение отправлено пользователю"); }}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-90"
                    style={{ background: "rgba(251,191,36,0.10)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.2)" }}
                  >
                    <Icon name="AlertTriangle" size={14} />
                    Предупреждение
                  </button>
                  <button
                    onClick={() => { onAction(complaint.id, "delete"); showToast("Контент скрыт из публичного доступа"); }}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
                    style={{ background: "rgba(239,68,68,0.12)", color: "#f87171", border: "1px solid rgba(239,68,68,0.25)" }}
                  >
                    <Icon name="Trash2" size={14} />
                    Удалить контент
                  </button>
                  <button
                    onClick={() => setBlockOpen(true)}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90"
                    style={{ background: "linear-gradient(135deg, rgba(239,68,68,0.2), rgba(185,28,28,0.2))", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)" }}
                  >
                    <Icon name="ShieldBan" size={14} />
                    Заблокировать
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <BlockModal
        open={blockOpen}
        onClose={() => setBlockOpen(false)}
        onConfirm={(d) => { onAction(complaint.id, "block", d); showToast("Пользователь заблокирован"); }}
      />

      {/* Mini toast inside modal */}
      {toast && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[70] animate-fade-in px-5 py-3 rounded-2xl text-sm font-medium text-white"
          style={{ background: "rgba(30,32,48,0.97)", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}
        >
          <div className="flex items-center gap-2">
            <Icon name="Check" size={14} className="text-green-400" />
            {toast}
          </div>
        </div>
      )}
    </>
  );
}
