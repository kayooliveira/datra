import { Plus, Database } from "lucide-react";
import { useTranslation } from "react-i18next";
import styles from "./empty-state-sidebar.module.css";

interface EmptyStateSidebarProps {
  onCreate: () => void;
}

export function EmptyStateSidebar({ onCreate }: EmptyStateSidebarProps) {
  const { t } = useTranslation();

  return (
    <div className={styles.container}>
      <div className={styles.iconContainer}>
        <Database size={18} />
      </div>
      <p className={styles.text}>{t("app.sidebar.no_connections")}</p>
      <button
        onClick={onCreate}
        className={styles.button}
      >
        <Plus size={12} />
        {t("app.sidebar.create_connection")}
      </button>
    </div>
  );
}
