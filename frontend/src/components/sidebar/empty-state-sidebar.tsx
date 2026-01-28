import { Plus, Database } from "lucide-react";
import { useTranslation } from "react-i18next";

interface EmptyStateSidebarProps {
  onCreate: () => void;
}

export function EmptyStateSidebar({ onCreate }: EmptyStateSidebarProps) {
  const { t } = useTranslation();

  return (
    <div className="empty-state-sidebar">
      <div className="empty-state-icon-container">
        <Database size={20} style={{ opacity: 0.5 }} />
      </div>
      <p style={{ fontSize: '0.75rem', marginBottom: '0.5rem' }}>{t("app.sidebar.no_connections")}</p>
      <button
        onClick={onCreate}
        className="create-btn-small"
      >
        <Plus size={14} />
        {t("app.sidebar.create_connection")}
      </button>
    </div>
  );
}