import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Connect } from "../../wailsjs/go/connection/ConnectionService";
import EmptyState from "../components/empty-state";
import { useTranslation } from "react-i18next";
import { ConnectionCard } from "../components/connections/connection-card";
import styles from "./dashboard.module.css";
import { useSessionStore } from "../stores/sessionStore";
import { SqlEditor } from "../components/editor/SqlEditor";
import { Loader2, Database } from "lucide-react";
import { useProfiles } from "../hooks/useConnections";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
  const { data: connections = [], isLoading: loadingConnections } = useProfiles();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { activeSessionId, setActiveSessionId, isConnectingSession, setIsConnectingSession } = useSessionStore();

  const handleCreateConnection = () => {
    navigate({ to: "/connections/new" });
  };

  const handleSelectConnection = async (id: string) => {
    setIsConnectingSession(true);
    try {
        const sessionId = await Connect(id);
        setActiveSessionId(sessionId);
    } catch (err) {
        console.error("Failed to connect:", err);
        alert("Failed to connect: " + err);
    } finally {
        setIsConnectingSession(false);
    }
  };

  if (isConnectingSession) {
      return (
          <div className={styles.connectingContainer}>
              <div className={styles.iconWrapper}>
                  <div className={styles.iconGlow} />
                  <div className={styles.iconBox}>
                      <Database className={styles.dbIcon} />
                      <div className={styles.spinningRing} />
                  </div>
              </div>
              
              <div className={styles.textCenter}>
                  <h2 className={styles.connectingTitle}>
                      {t("app.connections.connecting")}
                  </h2>
                  <div className={styles.dots}>
                      <span className={styles.dot} />
                      <span className={styles.dot} />
                      <span className={styles.dot} />
                  </div>
                  <p className={styles.connectingDetail}>
                      {t("app.connections.connecting_detail")}
                  </p>
              </div>
          </div>
      );
  }

  if (activeSessionId) {
      return <SqlEditor sessionId={activeSessionId} />;
  }

  if (loadingConnections) {
    return (
        <div className="flex items-center justify-center h-full bg-gray-900">
            <Loader2 className="w-6 h-6 animate-spin text-gray-700" />
        </div>
    );
  }

  if (connections.length === 0) {
    return <EmptyState onCreateConnection={handleCreateConnection} />;
  }

  return (
    <div className={styles.content}>
      <div className={styles.header}>
        <div>
            <h1 className={styles.title}>{t("app.connections.title")}</h1>
            <p className="text-sm text-gray-500 mt-1">{t("app.dashboard.select_hint")}</p>
        </div>
        <button className={styles.primaryBtn} onClick={handleCreateConnection}>
          {t("app.sidebar.new_connection")}
        </button>
      </div>
      <div className={styles.grid}>
        {connections.map((conn) => (
          <ConnectionCard
            key={conn.id}
            connection={conn}
            onSelect={handleSelectConnection}
          />
        ))}
      </div>
    </div>
  );
}