import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { GetConnections } from "../../../wailsjs/go/main/App";
import { ConnectionItem } from "./connection-item";
import { useNavigate } from "@tanstack/react-router";
import { EmptyStateSidebar } from "./empty-state-sidebar";
import { Plus } from "lucide-react";
import { useSettings } from "../../contexts/settings-context";
import { connection } from "../../../wailsjs/go/models";
import styles from "./sidebar.module.css";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className = "" }: SidebarProps) {
  const { t } = useTranslation();
  const [connections, setConnections] = useState<connection.Connection[]>([]);
  const navigate = useNavigate();
  const { platformModifier } = useSettings();

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    try {
      const result = await GetConnections();
      setConnections(result || []);
    } catch (error) {
      console.error("Failed to fetch connections:", error);
    }
  };

  const handleSelectConnection = (id: string) => {
    navigate({ to: "/" });
  };

  const handleCreateConnection = () => {
    navigate({ to: "/connections/new" });
  };

  return (
    <div className={`${styles.container} ${className}`}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          {t("app.connections.title", "Connections")}
        </h2>
        {connections.length > 0 && (
          <div className={styles.actions}>
            <button
              onClick={handleCreateConnection}
              className={styles.iconBtn}
              title={`${t("app.sidebar.new_connection_tooltip")} (${platformModifier} + N)`}
            >
              <Plus size={14} />
            </button>
          </div>
        )}
      </div>
      <div className={styles.content}>
        {connections.length === 0 ? (
          <EmptyStateSidebar onCreate={handleCreateConnection} />
        ) : (
          <ul className={styles.list}>
            {connections.map((conn) => (
              <li key={conn.id} className={styles.listItem}>
                <ConnectionItem
                  connection={conn}
                  onSelect={handleSelectConnection}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className={styles.footer}>{/* Footer content if needed */}</div>
    </div>
  );
}
