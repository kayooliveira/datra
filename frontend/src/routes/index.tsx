import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { GetConnections } from "../../wailsjs/go/main/App";
import EmptyState from "../components/empty-state";
import { useTranslation } from "react-i18next";

interface Connection {
  id: string;
  name: string;
  [key: string]: any;
}

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loadingConnections, setLoadingConnections] = useState(true);
  const { t } = useTranslation();

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
    console.log("Create Connection Clicked");
    // TODO: Implement connection creation dialog
  };

  if (loadingConnections) {
    return <div className="loading">{t("app.loading")}</div>;
  }

  if (connections.length === 0) {
    return <EmptyState onCreateConnection={handleCreateConnection} />;
  }

  return (
    <div className="connection-list">
      <h1>{t("app.connections")}</h1>
      <ul>
        {connections.map((conn) => (
          <li key={conn.id}>{conn.name}</li>
        ))}
      </ul>
    </div>
  );
}
