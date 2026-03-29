import { useState, useMemo } from "react";
import Icon from "@/components/ui/icon";

// ─── Types ────────────────────────────────────────────────────────────────────

type ComplaintStatus = "new" | "in_progress" | "resolved" | "rejected" | "hidden";
type ComplaintPriority = "high" | "medium" | "low";
type ComplaintTab = "events" | "users" | "chats";
type MainSection = "log" | "archive";

interface Complaint {
  id: string;
  objectId: string;
  objectTitle: string;
  reason: string;
  comment: string;
  status: ComplaintStatus;
  priority: ComplaintPriority;
  date: string;
  type: ComplaintTab;
  reporterName: string;
  history: { date: string; action: string }[];
}

interface FilterState {
  dateFrom: string;
  dateTo: string;
  statuses: ComplaintStatus[];
  priorities: ComplaintPriority[];
  types: ComplaintTab[];
}

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<ComplaintStatus, { label: string; color: string; bg: string; border: string; icon: string }> = {
  new: { label: "Новая", color: "#818cf8", bg: "rgba(129,140,248,0.12)", border: "rgba(129,140,248,0.25)", icon: "Sparkles" },
  in_progress: { label: "В работе", color: "#fbbf24", bg: "rgba(251,191,36,0.10)", border: "rgba(251,191,36,0.22)", icon: "Loader" },
  resolved: { label: "Решена", color: "#34d399", bg: "rgba(52,211,153,0.10)", border: "rgba(52,211,153,0.22)", icon: "CheckCircle2" },
  rejected: { label: "Отклонена", color: "#94a3b8", bg: "rgba(148,163,184,0.10)", border: "rgba(148,163,184,0.18)", icon: "XCircle" },
  hidden: { label: "Скрыто системой", color: "#6b7280", bg: "rgba(107,114,128,0.08)", border: "rgba(107,114,128,0.15)", icon: "EyeOff" },
};

const PRIORITY_CONFIG: Record<ComplaintPriority, { label: string; color: string; dot: string }> = {
  high: { label: "Высокий", color: "#ef4444", dot: "#ef4444" },
  medium: { label: "Средний", color: "#f59e0b", dot: "#f59e0b" },
  low: { label: "Низкий", color: "#6b7280", dot: "#6b7280" },
};

const TAB_CONFIG: { key: ComplaintTab; label: string; icon: string }[] = [
  { key: "events", label: "Жалобы на мероприятия", icon: "Calendar" },
  { key: "users", label: "Жалобы на пользователей", icon: "UserX" },
  { key: "chats", label: "Жалобы на чаты", icon: "MessageSquareX" },
];

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_COMPLAINTS: Complaint[] = [
  {
    id: "CMP-E00001", objectId: "evt-101", objectTitle: "Tech Meetup Moscow #12", type: "events",
    reason: "Спам / Нежелательная реклама", comment: "Организатор рассылает рекламу сторонних сервисов участникам.",
    status: "new", priority: "high", date: "28 мар 2026, 14:30", reporterName: "@maria_dev",
    history: [],
  },
  {
    id: "CMP-E00002", objectId: "evt-87", objectTitle: "Йога в парке — воскресенье", type: "events",
    reason: "Недостоверная информация", comment: "Адрес мероприятия указан неверно.",
    status: "in_progress", priority: "medium", date: "27 мар 2026, 10:15", reporterName: "@user_88",
    history: [{ date: "28 мар 2026, 09:00", action: "Жалоба взята в работу модератором" }],
  },
  {
    id: "CMP-E00003", objectId: "evt-55", objectTitle: "Нетворкинг для стартапов", type: "events",
    reason: "Мошенничество", comment: "Организатор собирает деньги без намерения провести встречу.",
    status: "new", priority: "high", date: "26 мар 2026, 18:45", reporterName: "@startup_fan",
    history: [],
  },
  {
    id: "CMP-E00004", objectId: "evt-23", objectTitle: "Фотопрогулка по центру", type: "events",
    reason: "Неприемлемый контент", comment: "Фото на обложке неприемлемого характера.",
    status: "resolved", priority: "low", date: "24 мар 2026, 08:00", reporterName: "@photo_lover",
    history: [{ date: "25 мар 2026", action: "Контент удалён" }, { date: "25 мар 2026", action: "Статус: Решена" }],
  },
  {
    id: "CMP-U00001", objectId: "usr-045", objectTitle: "@alex_99", type: "users",
    reason: "Домогательства / Насилие", comment: "Агрессивные сообщения в личных переписках.",
    status: "new", priority: "high", date: "28 мар 2026, 11:20", reporterName: "@victim_user",
    history: [],
  },
  {
    id: "CMP-U00002", objectId: "usr-177", objectTitle: "@promo_bot_2026", type: "users",
    reason: "Спам", comment: "Массовая рассылка рекламных ссылок в чаты.",
    status: "in_progress", priority: "medium", date: "27 мар 2026, 16:00", reporterName: "@chat_admin",
    history: [{ date: "28 мар 2026", action: "Профиль проверяется" }],
  },
  {
    id: "CMP-U00003", objectId: "usr-302", objectTitle: "@fake_organizer", type: "users",
    reason: "Фейковый аккаунт", comment: "Выдаёт себя за известного организатора.",
    status: "rejected", priority: "low", date: "22 мар 2026, 09:30", reporterName: "@real_org",
    history: [{ date: "23 мар 2026", action: "Проверка пройдена, нарушений не выявлено" }],
  },
  {
    id: "CMP-C00001", objectId: "chat-12", objectTitle: 'Чат "Tech Meetup General"', type: "chats",
    reason: "Спам / Нежелательная реклама", comment: "Массовая рассылка рекламных ссылок.",
    status: "resolved", priority: "medium", date: "25 мар 2026, 22:05", reporterName: "@mod_helper",
    history: [{ date: "26 мар 2026", action: "Сообщения удалены, автор предупреждён" }],
  },
  {
    id: "CMP-C00002", objectId: "chat-34", objectTitle: 'Сообщение в чате "Йога"', type: "chats",
    reason: "Оскорбительный контент", comment: "Пользователь оставил оскорбительный комментарий.",
    status: "new", priority: "high", date: "28 мар 2026, 07:45", reporterName: "@peace_user",
    history: [],
  },
  {
    id: "CMP-C00003", objectId: "chat-56", objectTitle: 'Сообщение в чате "Нетворкинг"', type: "chats",
    reason: "Угрозы", comment: "Угрозы в адрес другого участника.",
    status: "hidden", priority: "high", date: "20 мар 2026, 15:30", reporterName: "@safe_space",
    history: [{ date: "20 мар 2026", action: "Скрыто системой: превышен лимит жалоб" }],
  },
];

const DEFAULT_FILTER: FilterState = { dateFrom: "", dateTo: "", statuses: [], priorities: [], types: [] };

const ARCHIVE_STATUSES: ComplaintStatus[] = ["resolved", "rejected"];

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: ComplaintStatus }) {
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

function PriorityBadge({ priority }: { priority: ComplaintPriority }) {
  const cfg = PRIORITY_CONFIG[priority];
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium" style={{ color: cfg.color }}>
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: cfg.dot }} />
      {cfg.label}
    </span>
  );
}

// ─── Filter Modal ─────────────────────────────────────────────────────────────

function FilterModal({
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

function BlockModal({ open, onClose, onConfirm }: { open: boolean; onClose: () => void; onConfirm: (d: string) => void }) {
  const [duration, setDuration] = useState("1d");
  if (!open) return null;
  const options = [{ v: "1d", l: "1 день" }, { v: "7d", l: "7 дней" }, { v: "30d", l: "Месяц" }, { v: "forever", l: "Навсегда" }];
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.8)" }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-xs rounded-3xl p-6 animate-scale-in" style={{ background: "#1a1d2e", border: "1px solid rgba(239,68,68,0.25)", boxShadow: "0 32px 80px rgba(239,68,68,0.15)" }}>
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.25)" }}>
            <Icon name="ShieldBan" size={14} style={{ color: "#ef4444" }} />
          </div>
          <h3 className="font-semibold text-white">Заблокировать пользователя</h3>
        </div>
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-3 font-medium">Срок блокировки</p>
        <div className="grid grid-cols-2 gap-2 mb-6">
          {options.map((o) => (
            <button key={o.v} onClick={() => setDuration(o.v)}
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
          <button onClick={onClose} className="flex-1 py-2.5 rounded-2xl text-sm text-gray-500" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>Отмена</button>
          <button onClick={() => { onConfirm(duration); onClose(); }} className="flex-1 py-2.5 rounded-2xl text-sm font-bold text-white" style={{ background: "linear-gradient(135deg, #dc2626, #b91c1c)" }}>Подтвердить</button>
        </div>
      </div>
    </div>
  );
}

// ─── Complaint Card Modal ─────────────────────────────────────────────────────

function ComplaintCardModal({
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
              <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors hover:bg-white/10 flex-shrink-0">
                <Icon name="X" size={16} className="text-gray-400" />
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={complaint.status} />
              <PriorityBadge priority={complaint.priority} />
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
                  <button onClick={() => { setRejectMode(false); setRejectReason(""); }} className="flex-1 py-2 rounded-xl text-sm text-gray-500" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>Отмена</button>
                  <button
                    onClick={() => { if (rejectReason.trim()) { onAction(complaint.id, "reject", rejectReason); setRejectMode(false); setRejectReason(""); showToast("Жалоба отклонена"); } }}
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
                    onClick={() => { setRejectMode(true); }}
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

      <BlockModal open={blockOpen} onClose={() => setBlockOpen(false)} onConfirm={(d) => { onAction(complaint.id, "block", d); showToast(`Пользователь заблокирован`); }} />

      {/* Mini toast inside modal */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[70] animate-fade-in px-5 py-3 rounded-2xl text-sm font-medium text-white" style={{ background: "rgba(30,32,48,0.97)", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}>
          <div className="flex items-center gap-2">
            <Icon name="Check" size={14} className="text-green-400" />
            {toast}
          </div>
        </div>
      )}
    </>
  );
}

// ─── Table ────────────────────────────────────────────────────────────────────

function ComplaintsTable({
  data, isArchive, onRowClick,
}: { data: Complaint[]; isArchive: boolean; onRowClick: (c: Complaint) => void }) {
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
              <th key={col} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-widest whitespace-nowrap">{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((c, i) => (
            <tr
              key={c.id}
              onClick={() => onRowClick(c)}
              className="cursor-pointer transition-colors hover:bg-white/[0.03] group"
              style={{ borderBottom: i < data.length - 1 ? "1px solid rgba(255,255,255,0.05)" : undefined, animationDelay: `${i * 0.04}s` }}
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

// ─── Section View ─────────────────────────────────────────────────────────────

function SectionView({
  tab, data, isArchive, onRowClick,
}: {
  tab: ComplaintTab; data: Complaint[]; isArchive: boolean; onRowClick: (c: Complaint) => void;
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
      <FilterModal open={filterOpen} onClose={() => setFilterOpen(false)} filters={filters} onChange={setFilters} isArchive={isArchive} />
    </>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminPanel() {
  const [section, setSection] = useState<MainSection>("log");
  const [activeTab, setActiveTab] = useState<ComplaintTab>("events");
  const [complaints, setComplaints] = useState<Complaint[]>(MOCK_COMPLAINTS);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [cardOpen, setCardOpen] = useState(false);

  const isArchive = section === "archive";

  const getTabData = (tab: ComplaintTab) => {
    const byType = complaints.filter((c) => c.type === tab);
    if (isArchive) return byType.filter((c) => ARCHIVE_STATUSES.includes(c.status));
    return byType;
  };

  const pendingCountAll = complaints.filter((c) => c.status === "new").length;

  const handleAction = (id: string, action: "reject" | "warn" | "delete" | "block", payload?: string) => {
    setComplaints((prev) => prev.map((c) => {
      if (c.id !== id) return c;
      if (action === "reject") return { ...c, status: "rejected" as ComplaintStatus, history: [...c.history, { date: "Сейчас", action: `Отклонена: ${payload}` }] };
      if (action === "delete") return { ...c, status: "resolved" as ComplaintStatus, history: [...c.history, { date: "Сейчас", action: "Контент удалён" }] };
      if (action === "warn") return { ...c, history: [...c.history, { date: "Сейчас", action: "Предупреждение отправлено" }] };
      if (action === "block") return { ...c, status: "resolved" as ComplaintStatus, history: [...c.history, { date: "Сейчас", action: `Пользователь заблокирован: ${payload}` }] };
      return c;
    }));
    setCardOpen(false);
  };

  const handleRowClick = (c: Complaint) => {
    setSelectedComplaint(c);
    setCardOpen(true);
    if (c.status === "new") {
      setComplaints((prev) => prev.map((x) => x.id === c.id ? { ...x, status: "in_progress" } : x));
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-7">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))", border: "1px solid rgba(99,102,241,0.25)" }}>
            <Icon name="Shield" size={16} className="text-indigo-400" />
          </div>
          <p className="text-indigo-400 text-xs font-bold tracking-[0.18em] uppercase">Модерация</p>
          {pendingCountAll > 0 && (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold text-white" style={{ background: "#ef4444" }}>
              {pendingCountAll} новых
            </span>
          )}
        </div>
        <h1 className="font-montserrat text-[2rem] font-extrabold tracking-tight">Журнал жалоб</h1>
        <p className="text-gray-500 mt-1 text-sm">Управление и модерация поступивших обращений</p>
      </div>

      {/* Section Toggle */}
      <div className="flex gap-2 mb-6">
        {([
          { key: "log", label: "Журнал жалоб", icon: "ClipboardList" },
          { key: "archive", label: "Архив жалоб", icon: "Archive" },
        ] as { key: MainSection; label: string; icon: string }[]).map((s) => (
          <button
            key={s.key}
            onClick={() => setSection(s.key)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all"
            style={section === s.key
              ? { background: "linear-gradient(135deg, rgba(99,102,241,0.25), rgba(139,92,246,0.2))", color: "#a5b4fc", border: "1px solid rgba(99,102,241,0.3)", boxShadow: "0 4px 16px rgba(99,102,241,0.15)" }
              : { background: "rgba(255,255,255,0.04)", color: "#6b7280", border: "1px solid rgba(255,255,255,0.07)" }
            }
          >
            <Icon name={s.icon} size={14} />
            {s.label}
          </button>
        ))}
      </div>

      {/* Sub-tabs */}
      <div
        className="flex gap-1 p-1 rounded-2xl mb-6 w-fit"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
      >
        {TAB_CONFIG.map((tab) => {
          const tabData = complaints.filter((c) => c.type === tab.key);
          const newCount = tabData.filter((c) => c.status === "new").length;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
              style={isActive
                ? { background: "rgba(255,255,255,0.92)", color: "#111", boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }
                : { color: "#9ca3af" }
              }
            >
              <Icon name={tab.icon} size={13} />
              {tab.label}
              {newCount > 0 && !isArchive && (
                <span className="w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center" style={isActive ? { background: "#ef4444", color: "#fff" } : { background: "rgba(239,68,68,0.7)", color: "#fff" }}>
                  {newCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Section label */}
      <div className="flex items-center gap-2 mb-4">
        <Icon name={isArchive ? "Archive" : "ClipboardList"} size={14} className="text-gray-600" />
        <p className="text-xs text-gray-600 uppercase tracking-widest font-semibold">
          {isArchive ? "Архив" : "Журнал"} — {TAB_CONFIG.find((t) => t.key === activeTab)?.label}
        </p>
      </div>

      {/* Table */}
      <SectionView
        tab={activeTab}
        data={getTabData(activeTab)}
        isArchive={isArchive}
        onRowClick={handleRowClick}
      />

      {/* Complaint Card Modal */}
      <ComplaintCardModal
        complaint={selectedComplaint}
        open={cardOpen}
        onClose={() => setCardOpen(false)}
        onAction={handleAction}
      />
    </div>
  );
}
