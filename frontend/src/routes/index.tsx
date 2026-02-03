import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Connect } from "../../wailsjs/go/connection/ConnectionService";
import EmptyState from "../components/empty-state";
import { useTranslation } from "react-i18next";
import { ConnectionCard } from "../components/connections/connection-card";
import styles from "./dashboard.module.css";
import editorStyles from "../components/editor/sql-editor.module.css";
import { useSessionStore } from "../stores/sessionStore";
import { SqlEditor } from "../components/editor/SqlEditor";
import { Loader2 } from "lucide-react";
import { useProfiles } from "../hooks/useConnections";
import { useTabStore } from "../stores/tabStore";

import { SqlEditorTabs } from "../components/editor/SqlEditorTabs";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
  const { data: connections = [], isLoading: loadingConnections } =
    useProfiles();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setActiveSessionId, isConnectingSession, setIsConnectingSession } =
    useSessionStore();
  const { activeTabId, tabs, initializeMainTab, clearTabs } = useTabStore();

  const activeTab = tabs.find((t) => t.id === activeTabId);
  const activeSessionId = activeTab?.context?.connectionId;

  const handleCreateConnection = () => {
    navigate({ to: "/connections/new" });
  };

  const handleSelectConnection = async (id: string) => {
    setIsConnectingSession(true);
    try {
      const sessionId = await Connect(id);
      setActiveSessionId(sessionId);
      const connection = connections.find((c) => c.id === id);
      initializeMainTab(sessionId, connection?.name, id);
    } catch (err) {
      console.error("Failed to connect:", err);
      // Toast error is handled by interceptors usually, but we can alert here
    } finally {
      setIsConnectingSession(false);
    }
  };

  if (isConnectingSession) {
    return (
      <div className={styles.connectingContainer}>
        <Loader2 size={32} className={styles.connectingSpinner} />
        <h2 className={styles.connectingTitle}>
          {t("app.connections.connecting")}
        </h2>
        <p className={styles.connectingDetail}>
          {t("app.connections.connecting_detail")}
        </p>
      </div>
    );
  }

  // If there are tabs and one is active, show the SQL Editor
  // If activeTabId is null (user clicked 'Home' or similar), show dashboard
  if (tabs.length > 0 && activeTabId) {
    return (
      <div className={editorStyles.editorWrapper}>
        {activeSessionId ? (
          <SqlEditor sessionId={activeSessionId} />
        ) : (
          <>
            <SqlEditorTabs />
            <div className={editorStyles.noConnectionPane}>
              <p className={editorStyles.noConnectionText}>
                No active connection for this tab.
              </p>
              <button
                onClick={() => clearTabs()}
                className={editorStyles.returnButton}
              >
                Return to Dashboard
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  if (loadingConnections) {
    return (
      <div className={styles.loadingContainer}>
        <Loader2 className={styles.loadingSpinner} />
      </div>
    );
  }

  if (connections.length === 0) {
    return <EmptyState onCreateConnection={handleCreateConnection} />;
  }

  return (
    <div className={styles.dashboardWrapper}>
      {tabs.length > 0 && <SqlEditorTabs />}
      <div className={styles.content}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>{t("app.connections.title")}</h1>
            <p className={styles.subtitle}>{t("app.dashboard.select_hint")}</p>
          </div>
          <button
            className={styles.primaryBtn}
            onClick={handleCreateConnection}
          >
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
    </div>
  );
}
