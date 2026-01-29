import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { GetConnections } from "../../wailsjs/go/main/App";
import EmptyState from "../components/empty-state";
import { useTranslation } from "react-i18next";
import { connection } from "../../wailsjs/go/models";
import { ConnectionCard } from "../components/connections/connection-card";
import styles from "./dashboard.module.css";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
  const [connections, setConnections] = useState<connection.Connection[]>([]);
  const [loadingConnections, setLoadingConnections] = useState(true);
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    try {
      const result = await GetConnections();
      setConnections(result || []);
    } catch (error) {
      console.error("Failed to fetch connections:", error);
    } finally {
      setLoadingConnections(false);
    }
  };

  const handleCreateConnection = () => {
    navigate({ to: "/connections/new" });
  };

  const handleSelectConnection = (id: string) => {
    console.log("Selected connection:", id);
  };

  if (loadingConnections) {
    return <div className={styles.loading}>{t("app.loading")}</div>;
  }

  if (connections.length === 0) {
    return <EmptyState onCreateConnection={handleCreateConnection} />;
  }

  return (
    <div className={styles.content}>
      <div className={styles.header}>
        <h1 className={styles.title}>{t("app.connections.title")}</h1>
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