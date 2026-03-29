import { useState } from "react";
import Icon from "@/components/ui/icon";
import AdminPanel from "@/components/AdminPanel";

type ReportReason =
  | "fraud"
  | "spam"
  | "inaccurate"
  | "illegal"
  | "harassment"
  | "other"
  | "";

interface Complaint {
  id: string;
  eventId: string;
  eventTitle: string;
  reason: ReportReason;
  reasonLabel: string;
  comment: string;
  status: "pending" | "reviewed" | "rejected";
  date: string;
}

interface ToastData {
  id: string;
  message: string;
}

const REASONS: { value: ReportReason; label: string }[] = [
  { value: "fraud", label: "Мошенничество" },
  { value: "spam", label: "Спам / Нежелательная реклама" },
  { value: "inaccurate", label: "Недостоверный контент / Несоответствие описанию" },
  { value: "illegal", label: "Противозаконная деятельность" },
  { value: "harassment", label: "Домогательства / Насилие" },
  { value: "other", label: "Другое" },
];

const MOCK_EVENTS = [
  {
    id: "evt-001",
    title: "Tech Meetup 2024",
    subtitle: "Конференция по современным технологиям",
    date: "15 апреля 2024",
    location: "Москва, Центр Digital",
    participants: 142,
    tag: "Технологии",
    gradient: "from-indigo-500 via-purple-500 to-violet-600",
    shadowColor: "rgba(99,102,241,0.3)",
  },
  {
    id: "evt-002",
    title: "Design Summit",
    subtitle: "Встреча дизайнеров и UX-специалистов",
    date: "22 апреля 2024",
    location: "Санкт-Петербург, Loft Space",
    participants: 89,
    tag: "Дизайн",
    gradient: "from-rose-500 via-pink-500 to-fuchsia-600",
    shadowColor: "rgba(244,63,94,0.3)",
  },
  {
    id: "evt-003",
    title: "Startup Pitch Night",
    subtitle: "Питч-сессия для стартапов и инвесторов",
    date: "28 апреля 2024",
    location: "Онлайн",
    participants: 310,
    tag: "Бизнес",
    gradient: "from-amber-500 via-orange-500 to-red-500",
    shadowColor: "rgba(245,158,11,0.3)",
  },
];

function generateId(): string {
  return "CMP-" + Math.random().toString(36).substring(2, 8).toUpperCase();
}

export default function Index() {
  const [view, setView] = useState<"events" | "admin">("events");
  const [joinedEvents, setJoinedEvents] = useState<Set<string>>(new Set());
  const [reportModal, setReportModal] = useState<{
    open: boolean;
    eventId: string;
    eventTitle: string;
  }>({ open: false, eventId: "", eventTitle: "" });
  const [reason, setReason] = useState<ReportReason>("");
  const [comment, setComment] = useState("");
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([
    {
      id: "CMP-A1B2C3",
      eventId: "evt-001",
      eventTitle: "Tech Meetup 2024",
      reason: "spam",
      reasonLabel: "Спам / Нежелательная реклама",
      comment: "",
      status: "pending",
      date: "12 апр 2024, 14:32",
    },
    {
      id: "CMP-D4E5F6",
      eventId: "evt-002",
      eventTitle: "Design Summit",
      reason: "inaccurate",
      reasonLabel: "Недостоверный контент / Несоответствие описанию",
      comment: "Программа мероприятия не соответствует опубликованной",
      status: "reviewed",
      date: "13 апр 2024, 09:15",
    },
    {
      id: "CMP-G7H8I9",
      eventId: "evt-003",
      eventTitle: "Startup Pitch Night",
      reason: "fraud",
      reasonLabel: "Мошенничество",
      comment: "Организатор требует предоплату без гарантий",
      status: "rejected",
      date: "14 апр 2024, 18:44",
    },
  ]);

  const showToast = (message: string) => {
    const id = Math.random().toString(36).substring(2);
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5500);
  };

  const handleJoin = (eventId: string) => {
    setJoinedEvents((prev) => {
      const next = new Set(prev);
      next.add(eventId);
      return next;
    });
  };

  const openReport = (eventId: string, eventTitle: string) => {
    setReason("");
    setComment("");
    setReportModal({ open: true, eventId, eventTitle });
  };

  const closeReport = () => {
    setReportModal({ open: false, eventId: "", eventTitle: "" });
  };

  const isSubmitDisabled = !reason || (reason === "other" && !comment.trim());

  const handleSubmitReport = () => {
    if (isSubmitDisabled) return;
    const id = generateId();
    const reasonObj = REASONS.find((r) => r.value === reason);
    const newComplaint: Complaint = {
      id,
      eventId: reportModal.eventId,
      eventTitle: reportModal.eventTitle,
      reason,
      reasonLabel: reasonObj?.label || "",
      comment,
      status: "pending",
      date: new Date().toLocaleString("ru-RU", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setComplaints((prev) => [newComplaint, ...prev]);
    closeReport();
    showToast(`Ваша жалоба ${id} отправлена и будет рассмотрена модератором.`);
  };

  const pendingCount = complaints.filter((c) => c.status === "pending").length;

  return (
    <div
      className="min-h-screen bg-[#080810] font-golos text-white"
      style={{
        backgroundImage:
          "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(99,102,241,0.18) 0%, transparent 65%), radial-gradient(ellipse 50% 40% at 85% 85%, rgba(139,92,246,0.10) 0%, transparent 60%)",
      }}
    >
      {/* Header */}
      <header
        className="border-b border-white/5 sticky top-0 z-40"
        style={{ background: "rgba(8,8,16,0.85)", backdropFilter: "blur(20px)" }}
      >
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Icon name="Zap" size={15} className="text-white" />
            </div>
            <span className="font-montserrat font-bold text-base tracking-tight">EventHub</span>
          </div>

          <nav className="flex items-center gap-1 p-1 rounded-2xl" style={{ background: "rgba(255,255,255,0.05)" }}>
            <button
              onClick={() => setView("events")}
              className={`px-5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                view === "events"
                  ? "bg-white text-gray-900 shadow-md"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Мероприятия
            </button>
            <button
              onClick={() => setView("admin")}
              className={`px-5 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                view === "admin"
                  ? "bg-white text-gray-900 shadow-md"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Icon name="Shield" size={13} />
              Модерация
              {pendingCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold">
                  {pendingCount}
                </span>
              )}
            </button>
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        {view === "events" ? (
          <div className="animate-fade-in">
            <div className="mb-10">
              <p className="text-indigo-400 text-xs font-semibold tracking-[0.2em] uppercase mb-3">
                Актуальные события
              </p>
              <h1 className="font-montserrat text-[2.5rem] font-extrabold tracking-tight leading-tight">
                Мероприятия
              </h1>
              <p className="text-gray-500 mt-2 text-base">
                Присоединяйтесь и взаимодействуйте с участниками
              </p>
            </div>

            <div className="flex flex-col gap-4">
              {MOCK_EVENTS.map((event, i) => (
                <EventCard
                  key={event.id}
                  event={event}
                  index={i}
                  joined={joinedEvents.has(event.id)}
                  onJoin={() => handleJoin(event.id)}
                  onReport={() => openReport(event.id, event.title)}
                />
              ))}
            </div>
          </div>
        ) : (
          <AdminPanel
            complaints={complaints}
            onUpdateStatus={(id, status) =>
              setComplaints((prev) =>
                prev.map((c) => (c.id === id ? { ...c, status } : c))
              )
            }
          />
        )}
      </main>

      {/* Report Modal */}
      {reportModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0"
            style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(12px)" }}
            onClick={closeReport}
          />
          <div className="relative z-10 w-full max-w-md animate-scale-in">
            <div
              className="rounded-[28px] border border-white/8 overflow-hidden"
              style={{
                background: "linear-gradient(145deg, #13132a 0%, #0e0e1e 100%)",
                boxShadow: "0 50px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)",
              }}
            >
              {/* Modal Header */}
              <div className="px-7 pt-7 pb-5 flex items-start justify-between border-b border-white/5">
                <div className="flex items-center gap-3.5">
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center"
                    style={{
                      background: "rgba(239,68,68,0.12)",
                      border: "1px solid rgba(239,68,68,0.2)",
                    }}
                  >
                    <Icon name="Flag" size={19} className="text-rose-400" />
                  </div>
                  <div>
                    <h2 className="font-montserrat font-bold text-[1.1rem] text-white leading-tight">
                      Пожаловаться
                    </h2>
                    <p className="text-gray-500 text-xs mt-0.5 max-w-[190px] truncate">
                      {reportModal.eventTitle}
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeReport}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-500 hover:text-white transition-colors"
                  style={{ background: "rgba(255,255,255,0.06)" }}
                >
                  <Icon name="X" size={14} />
                </button>
              </div>

              {/* Body */}
              <div className="px-7 py-6 space-y-5">
                {/* Reason */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2.5">
                    Причина жалобы <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={reason}
                      onChange={(e) => setReason(e.target.value as ReportReason)}
                      className="w-full appearance-none rounded-2xl px-4 py-3 pr-10 text-sm text-white focus:outline-none transition-all cursor-pointer"
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.10)",
                        boxShadow: reason ? "0 0 0 2px rgba(99,102,241,0.2)" : "none",
                        borderColor: reason ? "rgba(99,102,241,0.4)" : "rgba(255,255,255,0.10)",
                      }}
                    >
                      <option value="" disabled style={{ background: "#13132a", color: "#6b7280" }}>
                        Выберите причину...
                      </option>
                      {REASONS.map((r) => (
                        <option key={r.value} value={r.value} style={{ background: "#13132a", color: "#fff" }}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2">
                      <Icon name="ChevronDown" size={15} className="text-gray-500" />
                    </div>
                  </div>
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2.5">
                    Комментарий
                    {reason === "other" ? (
                      <span className="text-rose-400 ml-1">*</span>
                    ) : (
                      <span className="text-gray-600 ml-2 font-normal text-xs">необязательно</span>
                    )}
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder={
                      reason === "other"
                        ? "Опишите проблему подробно..."
                        : "Дополнительные детали (необязательно)..."
                    }
                    rows={4}
                    className="w-full rounded-2xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none transition-all resize-none"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.10)",
                      borderColor:
                        reason === "other" && !comment.trim()
                          ? "rgba(239,68,68,0.3)"
                          : comment
                          ? "rgba(99,102,241,0.4)"
                          : "rgba(255,255,255,0.10)",
                      boxShadow: comment ? "0 0 0 2px rgba(99,102,241,0.15)" : "none",
                    }}
                  />
                  {reason === "other" && !comment.trim() && (
                    <p className="text-rose-400/80 text-xs mt-1.5 flex items-center gap-1.5">
                      <Icon name="AlertCircle" size={11} />
                      Обязательно при выборе причины «Другое»
                    </p>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="px-7 pb-7 flex gap-3">
                <button
                  onClick={closeReport}
                  className="flex-1 py-3 rounded-2xl text-sm font-medium text-gray-400 hover:text-white transition-all"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  Отмена
                </button>
                <button
                  onClick={handleSubmitReport}
                  disabled={isSubmitDisabled}
                  className={`flex-1 py-3 rounded-2xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                    isSubmitDisabled
                      ? "cursor-not-allowed"
                      : "hover:opacity-90 active:scale-[0.97]"
                  }`}
                  style={
                    isSubmitDisabled
                      ? { background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.2)" }
                      : {
                          background: "linear-gradient(135deg, #f43f5e 0%, #ec4899 100%)",
                          color: "#fff",
                          boxShadow: "0 8px 24px rgba(244,63,94,0.35)",
                        }
                  }
                >
                  <Icon name="Send" size={14} />
                  Отправить
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none" style={{ maxWidth: "380px" }}>
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="animate-toast-slide rounded-2xl px-5 py-4 flex items-start gap-3.5 pointer-events-auto"
            style={{
              background: "linear-gradient(135deg, rgba(6,28,22,0.97) 0%, rgba(4,20,16,0.97) 100%)",
              border: "1px solid rgba(16,185,129,0.18)",
              boxShadow: "0 24px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(16,185,129,0.08)",
            }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(16,185,129,0.15)" }}
            >
              <Icon name="CheckCircle" size={17} className="text-emerald-400" />
            </div>
            <div className="pt-0.5">
              <p className="text-emerald-300 text-[11px] font-bold tracking-widest uppercase mb-1">
                Жалоба отправлена
              </p>
              <p className="text-gray-300 text-sm leading-relaxed">{toast.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface EventCardProps {
  event: (typeof MOCK_EVENTS)[0];
  index: number;
  joined: boolean;
  onJoin: () => void;
  onReport: () => void;
}

function EventCard({ event, index, joined, onJoin, onReport }: EventCardProps) {
  return (
    <div
      className="group rounded-[24px] p-6 transition-all duration-300 hover:translate-y-[-2px] animate-fade-in"
      style={{
        animationDelay: `${index * 0.1}s`,
        animationFillMode: "both",
        background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)",
        border: "1px solid rgba(255,255,255,0.07)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          `0 12px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.10)`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 20px rgba(0,0,0,0.25)";
      }}
    >
      <div className="flex items-center gap-5">
        {/* Icon */}
        <div
          className={`w-[52px] h-[52px] rounded-2xl bg-gradient-to-br ${event.gradient} flex-shrink-0 flex items-center justify-center`}
          style={{ boxShadow: `0 8px 20px ${event.shadowColor}` }}
        >
          <Icon name="Calendar" size={21} className="text-white" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-gradient-to-r ${event.gradient} text-white`}
            >
              {event.tag}
            </span>
            <span className="text-gray-600 text-xs">{event.date}</span>
          </div>
          <h3 className="font-montserrat font-extrabold text-[1.15rem] text-white mb-0.5 truncate">
            {event.title}
          </h3>
          <p className="text-gray-500 text-[13px] truncate">{event.subtitle}</p>
          <div className="flex items-center gap-4 mt-2 text-[12px] text-gray-600">
            <span className="flex items-center gap-1.5">
              <Icon name="MapPin" size={11} />
              {event.location}
            </span>
            <span className="flex items-center gap-1.5">
              <Icon name="Users" size={11} />
              {event.participants}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {!joined ? (
            <button
              onClick={onJoin}
              className={`px-5 py-2.5 rounded-[14px] text-sm font-semibold text-white bg-gradient-to-r ${event.gradient} hover:opacity-90 hover:scale-[1.03] active:scale-[0.97] transition-all duration-150`}
              style={{ boxShadow: `0 6px 18px ${event.shadowColor}` }}
            >
              Участвовать
            </button>
          ) : (
            <button
              disabled
              className="px-5 py-2.5 rounded-[14px] text-sm font-semibold flex items-center gap-1.5 cursor-default"
              style={{
                background: "rgba(16,185,129,0.10)",
                border: "1px solid rgba(16,185,129,0.20)",
                color: "#34d399",
              }}
            >
              <Icon name="Check" size={13} />
              Вы участвуете
            </button>
          )}

          {joined && (
            <button
              className="px-4 py-2.5 rounded-[14px] text-sm font-semibold flex items-center gap-1.5 animate-fade-in hover:opacity-80 transition-all"
              style={{
                background: "rgba(99,102,241,0.12)",
                border: "1px solid rgba(99,102,241,0.22)",
                color: "#a5b4fc",
              }}
            >
              <Icon name="MessageCircle" size={14} />
              Чат
            </button>
          )}

          <button
            onClick={onReport}
            title="Пожаловаться"
            className="w-10 h-10 rounded-[14px] flex items-center justify-center transition-all duration-200 hover:scale-[1.08]"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#6b7280",
            }}
            onMouseEnter={(e) => {
              const btn = e.currentTarget as HTMLButtonElement;
              btn.style.background = "rgba(239,68,68,0.12)";
              btn.style.borderColor = "rgba(239,68,68,0.22)";
              btn.style.color = "#f87171";
            }}
            onMouseLeave={(e) => {
              const btn = e.currentTarget as HTMLButtonElement;
              btn.style.background = "rgba(255,255,255,0.04)";
              btn.style.borderColor = "rgba(255,255,255,0.08)";
              btn.style.color = "#6b7280";
            }}
          >
            <Icon name="Flag" size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
