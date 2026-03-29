import { useState } from "react";
import Icon from "@/components/ui/icon";

type ComplaintStatus = "pending" | "reviewed" | "rejected";
type ComplaintTab = "events" | "users" | "chats";

interface Complaint {
  id: string;
  eventId: string;
  eventTitle: string;
  reason: string;
  reasonLabel: string;
  comment: string;
  status: ComplaintStatus;
  date: string;
}

interface Props {
  complaints: Complaint[];
  onUpdateStatus: (id: string, status: ComplaintStatus) => void;
}

const TAB_CONFIG: { key: ComplaintTab; label: string; icon: string }[] = [
  { key: "events", label: "Жалобы на мероприятия", icon: "Calendar" },
  { key: "users", label: "Жалобы на пользователей", icon: "UserX" },
  { key: "chats", label: "Жалобы на чаты", icon: "MessageSquareX" },
];

const STATUS_CONFIG: Record<
  ComplaintStatus,
  { label: string; color: string; bg: string; border: string; icon: string }
> = {
  pending: {
    label: "Ожидает",
    color: "#fbbf24",
    bg: "rgba(251,191,36,0.10)",
    border: "rgba(251,191,36,0.20)",
    icon: "Clock",
  },
  reviewed: {
    label: "Рассмотрена",
    color: "#34d399",
    bg: "rgba(52,211,153,0.10)",
    border: "rgba(52,211,153,0.20)",
    icon: "CheckCircle",
  },
  rejected: {
    label: "Отклонена",
    color: "#94a3b8",
    bg: "rgba(148,163,184,0.10)",
    border: "rgba(148,163,184,0.18)",
    icon: "XCircle",
  },
};

const MOCK_USER_COMPLAINTS: Complaint[] = [
  {
    id: "CMP-U00001",
    eventId: "usr-045",
    eventTitle: "Пользователь @alex_99",
    reason: "harassment",
    reasonLabel: "Домогательства / Насилие",
    comment: "Агрессивные сообщения в личке",
    status: "pending",
    date: "14 апр 2024, 11:20",
  },
];

const MOCK_CHAT_COMPLAINTS: Complaint[] = [
  {
    id: "CMP-C00001",
    eventId: "chat-12",
    eventTitle: 'Чат "Tech Meetup General"',
    reason: "spam",
    reasonLabel: "Спам / Нежелательная реклама",
    comment: "Массовая рассылка рекламных ссылок",
    status: "reviewed",
    date: "13 апр 2024, 22:05",
  },
];

export default function AdminPanel({ complaints, onUpdateStatus }: Props) {
  const [activeTab, setActiveTab] = useState<ComplaintTab>("events");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const dataMap: Record<ComplaintTab, Complaint[]> = {
    events: complaints,
    users: MOCK_USER_COMPLAINTS,
    chats: MOCK_CHAT_COMPLAINTS,
  };

  const currentData = dataMap[activeTab];
  const pendingCount = (data: Complaint[]) => data.filter((c) => c.status === "pending").length;

  return (
    <div className="animate-fade-in">
      {/* Admin Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(139,92,246,0.2) 100%)",
              border: "1px solid rgba(99,102,241,0.25)",
            }}
          >
            <Icon name="Shield" size={16} className="text-indigo-400" />
          </div>
          <div>
            <p className="text-indigo-400 text-xs font-bold tracking-[0.18em] uppercase">Панель управления</p>
          </div>
        </div>
        <h1 className="font-montserrat text-[2.2rem] font-extrabold tracking-tight mt-2">
          Журнал жалоб
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          Управление и модерация поступивших обращений
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          {
            label: "Всего жалоб",
            value: complaints.length + MOCK_USER_COMPLAINTS.length + MOCK_CHAT_COMPLAINTS.length,
            icon: "FileText",
            color: "#a5b4fc",
            gradient: "rgba(99,102,241,0.12)",
          },
          {
            label: "Ожидают рассмотрения",
            value:
              pendingCount(complaints) +
              pendingCount(MOCK_USER_COMPLAINTS) +
              pendingCount(MOCK_CHAT_COMPLAINTS),
            icon: "Clock",
            color: "#fbbf24",
            gradient: "rgba(251,191,36,0.10)",
          },
          {
            label: "Рассмотрено",
            value: [...complaints, ...MOCK_USER_COMPLAINTS, ...MOCK_CHAT_COMPLAINTS].filter(
              (c) => c.status === "reviewed"
            ).length,
            icon: "CheckCircle",
            color: "#34d399",
            gradient: "rgba(52,211,153,0.10)",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl px-5 py-4"
            style={{
              background: stat.gradient,
              border: `1px solid ${stat.color}22`,
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Icon name={stat.icon} size={14} style={{ color: stat.color }} />
              <span className="text-gray-500 text-xs">{stat.label}</span>
            </div>
            <p className="font-montserrat font-extrabold text-2xl" style={{ color: stat.color }}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div
        className="flex gap-1 p-1 rounded-2xl mb-6 w-fit"
        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
      >
        {TAB_CONFIG.map((tab) => {
          const count = pendingCount(dataMap[tab.key]);
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
              style={
                isActive
                  ? {
                      background: "rgba(255,255,255,0.92)",
                      color: "#111",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                    }
                  : { color: "#9ca3af" }
              }
            >
              <Icon name={tab.icon} size={13} />
              {tab.label}
              {count > 0 && (
                <span
                  className="w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center"
                  style={
                    isActive
                      ? { background: "#ef4444", color: "#fff" }
                      : { background: "rgba(239,68,68,0.7)", color: "#fff" }
                  }
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Complaints List */}
      {currentData.length === 0 ? (
        <div className="text-center py-20">
          <div
            className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.04)" }}
          >
            <Icon name="Inbox" size={28} className="text-gray-600" />
          </div>
          <p className="text-gray-500 font-medium">Жалоб нет</p>
          <p className="text-gray-700 text-sm mt-1">В этом разделе пока пусто</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {currentData.map((complaint, i) => {
            const statusCfg = STATUS_CONFIG[complaint.status];
            const isExpanded = expandedId === complaint.id;

            return (
              <div
                key={complaint.id}
                className="rounded-2xl overflow-hidden transition-all duration-200 animate-fade-in"
                style={{
                  animationDelay: `${i * 0.06}s`,
                  animationFillMode: "both",
                  background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  boxShadow: isExpanded ? "0 8px 32px rgba(0,0,0,0.3)" : "none",
                }}
              >
                {/* Row */}
                <div
                  className="px-5 py-4 flex items-center gap-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : complaint.id)}
                >
                  {/* ID */}
                  <div className="flex-shrink-0 w-[110px]">
                    <span className="font-mono text-xs font-bold text-indigo-400">{complaint.id}</span>
                    <p className="text-gray-600 text-[11px] mt-0.5">{complaint.date}</p>
                  </div>

                  {/* Event */}
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{complaint.eventTitle}</p>
                    <p className="text-gray-500 text-xs truncate mt-0.5">{complaint.reasonLabel}</p>
                  </div>

                  {/* Status badge */}
                  <div
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold flex-shrink-0"
                    style={{
                      background: statusCfg.bg,
                      border: `1px solid ${statusCfg.border}`,
                      color: statusCfg.color,
                    }}
                  >
                    <Icon name={statusCfg.icon} size={11} />
                    {statusCfg.label}
                  </div>

                  {/* Expand arrow */}
                  <div
                    className="flex-shrink-0 transition-transform duration-200"
                    style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }}
                  >
                    <Icon name="ChevronDown" size={15} className="text-gray-600" />
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div
                    className="px-5 pb-5 border-t border-white/5"
                    style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
                  >
                    <div className="pt-4 grid grid-cols-2 gap-4 mb-5">
                      <div>
                        <p className="text-gray-600 text-xs mb-1 uppercase tracking-wider">Объект жалобы</p>
                        <p className="text-white text-sm font-medium">{complaint.eventTitle}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-xs mb-1 uppercase tracking-wider">Причина</p>
                        <p className="text-white text-sm">{complaint.reasonLabel}</p>
                      </div>
                      {complaint.comment && (
                        <div className="col-span-2">
                          <p className="text-gray-600 text-xs mb-1 uppercase tracking-wider">Комментарий</p>
                          <p
                            className="text-gray-300 text-sm rounded-xl px-3 py-2.5"
                            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
                          >
                            {complaint.comment}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    {activeTab === "events" && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => onUpdateStatus(complaint.id, "reviewed")}
                          disabled={complaint.status === "reviewed"}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:scale-[1.02] active:scale-[0.97]"
                          style={
                            complaint.status === "reviewed"
                              ? { background: "rgba(52,211,153,0.10)", border: "1px solid rgba(52,211,153,0.15)", color: "#34d399", opacity: 0.5 }
                              : { background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.22)", color: "#34d399" }
                          }
                        >
                          <Icon name="CheckCircle" size={12} />
                          Рассмотрена
                        </button>
                        <button
                          onClick={() => onUpdateStatus(complaint.id, "rejected")}
                          disabled={complaint.status === "rejected"}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:scale-[1.02] active:scale-[0.97]"
                          style={
                            complaint.status === "rejected"
                              ? { background: "rgba(148,163,184,0.08)", border: "1px solid rgba(148,163,184,0.15)", color: "#94a3b8", opacity: 0.5 }
                              : { background: "rgba(148,163,184,0.08)", border: "1px solid rgba(148,163,184,0.15)", color: "#94a3b8" }
                          }
                        >
                          <Icon name="XCircle" size={12} />
                          Отклонить
                        </button>
                        <button
                          onClick={() => onUpdateStatus(complaint.id, "pending")}
                          disabled={complaint.status === "pending"}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:scale-[1.02] active:scale-[0.97]"
                          style={
                            complaint.status === "pending"
                              ? { background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.15)", color: "#fbbf24", opacity: 0.5 }
                              : { background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.15)", color: "#fbbf24" }
                          }
                        >
                          <Icon name="RotateCcw" size={12} />
                          Вернуть
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}