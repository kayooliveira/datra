import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { GetConnections } from "../../../wailsjs/go/main/App";
import { ConnectionList } from "./connection-list";
import { useNavigate } from "@tanstack/react-router";
import { EmptyStateSidebar } from "./empty-state-sidebar";
import { Plus } from "lucide-react";
import { useSettings } from "../../contexts/settings-context";

interface SidebarProps {
  className?: string;
}

interface Connection {
  id: string;
  name: string;
  [key: string]: any;
}

export function Sidebar({ className = "" }: SidebarProps) {
  const { t } = useTranslation();
  const [connections, setConnections] = useState<Connection[]>([]);
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
    console.log("Selected connection:", id);
    navigate({ to: "/" });
  };

  const handleCreateConnection = () => {
    console.log("Create new connection triggered");
    // TODO: Trigger create connection dialog
  };

  return (
    <div className={`sidebar ${className}`}>
      <div className="sidebar-header">
        <h2 className="sidebar-title">
          {t("app.connections", "Connections")}
        </h2>
        {connections.length > 0 && (
          <button
            onClick={handleCreateConnection}
            className="create-icon-btn"
            title={t("app.sidebar.new_connection_tooltip") + ` (${platformModifier} + N)`}
          >
            <Plus size={16} />
          </button>
        )}
      </div>
      <div className="sidebar-content">
        {connections.length === 0 ? (
          <EmptyStateSidebar onCreate={handleCreateConnection} />
        ) : (
          <ConnectionList connections={connections} onSelect={handleSelectConnection} />
        )}
      </div>
      <div className="sidebar-footer">
        {/* Additional actions or info can go here */}
      </div>
    </div>
  );
}