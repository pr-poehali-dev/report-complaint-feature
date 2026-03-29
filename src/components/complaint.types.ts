// ─── Types ────────────────────────────────────────────────────────────────────

export type ComplaintStatus = "new" | "in_progress" | "resolved" | "rejected" | "hidden";
export type ComplaintPriority = "high" | "medium" | "low";
export type ComplaintTab = "events" | "users" | "chats";
export type MainSection = "log" | "archive";

export interface Complaint {
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

export interface FilterState {
  dateFrom: string;
  dateTo: string;
  statuses: ComplaintStatus[];
  priorities: ComplaintPriority[];
  types: ComplaintTab[];
}

// ─── Config ───────────────────────────────────────────────────────────────────

export const STATUS_CONFIG: Record<ComplaintStatus, { label: string; color: string; bg: string; border: string; icon: string }> = {
  new: { label: "Новая", color: "#818cf8", bg: "rgba(129,140,248,0.12)", border: "rgba(129,140,248,0.25)", icon: "Sparkles" },
  in_progress: { label: "В работе", color: "#fbbf24", bg: "rgba(251,191,36,0.10)", border: "rgba(251,191,36,0.22)", icon: "Loader" },
  resolved: { label: "Решена", color: "#34d399", bg: "rgba(52,211,153,0.10)", border: "rgba(52,211,153,0.22)", icon: "CheckCircle2" },
  rejected: { label: "Отклонена", color: "#94a3b8", bg: "rgba(148,163,184,0.10)", border: "rgba(148,163,184,0.18)", icon: "XCircle" },
  hidden: { label: "Скрыто системой", color: "#6b7280", bg: "rgba(107,114,128,0.08)", border: "rgba(107,114,128,0.15)", icon: "EyeOff" },
};

export const PRIORITY_CONFIG: Record<ComplaintPriority, { label: string; color: string; dot: string }> = {
  high: { label: "Высокий", color: "#ef4444", dot: "#ef4444" },
  medium: { label: "Средний", color: "#f59e0b", dot: "#f59e0b" },
  low: { label: "Низкий", color: "#6b7280", dot: "#6b7280" },
};

export const TAB_CONFIG: { key: ComplaintTab; label: string; icon: string }[] = [
  { key: "events", label: "Жалобы на мероприятия", icon: "Calendar" },
  { key: "users", label: "Жалобы на пользователей", icon: "UserX" },
  { key: "chats", label: "Жалобы на чаты", icon: "MessageSquareX" },
];

export const DEFAULT_FILTER: FilterState = { dateFrom: "", dateTo: "", statuses: [], priorities: [], types: [] };

export const ARCHIVE_STATUSES: ComplaintStatus[] = ["resolved", "rejected"];

// ─── Mock Data ────────────────────────────────────────────────────────────────

export const MOCK_COMPLAINTS: Complaint[] = [
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
