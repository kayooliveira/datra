import { useTranslation } from "react-i18next";
import { ConnectionItem } from "./connection-item";
import { useNavigate } from "@tanstack/react-router";
import { EmptyStateSidebar } from "./empty-state-sidebar";
import { Plus } from "lucide-react";
import { useSettings } from "../../contexts/settings-context";
import styles from "./sidebar.module.css";
import { useProfiles } from "../../hooks/useConnections";
import { Connect } from "../../../wailsjs/go/connection/ConnectionService";
import { useSessionStore } from "../../stores/sessionStore";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className = "" }: SidebarProps) {
  const { t } = useTranslation();
  const { data: connections = [], isLoading } = useProfiles();
  const navigate = useNavigate();
  const { platformModifier } = useSettings();
  const { setActiveSessionId, setIsConnectingSession } = useSessionStore();

  const handleSelectConnection = async (id: string) => {
    setIsConnectingSession(true);
    try {
        const sessionId = await Connect(id);
        setActiveSessionId(sessionId);
        navigate({ to: "/" });
    } catch (err) {
        console.error("Failed to connect from sidebar:", err);
    } finally {
        setIsConnectingSession(false);
    }
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
        {!isLoading && connections.length > 0 && (
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
        {isLoading ? (
          <div className="p-4 text-xs opacity-50">Loading...</div>
        ) : connections.length === 0 ? (
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
