import { useState } from "react";
import Icon from "@/components/ui/icon";
import {
  Complaint,
  ComplaintStatus,
  ComplaintTab,
  MainSection,
  TAB_CONFIG,
  MOCK_COMPLAINTS,
  ARCHIVE_STATUSES,
} from "@/components/complaint.types";
import { ComplaintCardModal } from "@/components/ComplaintModals";
import { SectionView } from "@/components/ComplaintsTable";

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
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))", border: "1px solid rgba(99,102,241,0.25)" }}
          >
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
          const newCount = complaints.filter((c) => c.type === tab.key && c.status === "new").length;
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
                <span
                  className="w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center"
                  style={isActive ? { background: "#ef4444", color: "#fff" } : { background: "rgba(239,68,68,0.7)", color: "#fff" }}
                >
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
