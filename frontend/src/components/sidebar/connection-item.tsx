import { connection } from "../../../wailsjs/go/models";
import {
  Database,
  Settings,
  Power,
  PowerOff,
  Trash2,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import styles from "./connection-item.module.css";
import { useState, useEffect } from "react";
import {
  useActiveSessions,
  useConnect,
  useDisconnect,
  useDeleteProfile,
} from "../../hooks/useConnections";
import { useSessionStore } from "../../stores/sessionStore";
import { MetadataTree } from "../connections/MetadataTree";
import { useTranslation } from "react-i18next";
import { useNotificationStore } from "../../stores/notificationStore";

interface ConnectionItemProps {
  connection: connection.Connection;
  onSelect: (id: string) => void;
}

export function ConnectionItem({ connection, onSelect }: ConnectionItemProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const [isExpanded, setIsExpanded] = useState(false);

  const { data: sessions } = useActiveSessions();
  const connectMutation = useConnect();
  const disconnectMutation = useDisconnect();
  const deleteMutation = useDeleteProfile();
  const { setActiveSessionId, activeSessionId, setIsConnectingSession } =
    useSessionStore();
  
  const { setError } = useNotificationStore();

  const session = sessions?.find((s) => s.profile_id === connection.id);
  const isConnected = !!session;

  useEffect(() => {
    if (isConnected) {
      setIsExpanded(true);
    }
  }, [isConnected]);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setMenuPos({ x: e.clientX, y: e.clientY });
    setShowMenu(true);
  };

  const handleConnect = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    e?.preventDefault();
    setShowMenu(false);

    // Navegar para a home para garantir que o usuário veja a conexão acontecendo
    navigate({ to: "/" });
    setIsConnectingSession(true);

    try {
      const sessionId = await connectMutation.mutateAsync(connection.id);
      setActiveSessionId(sessionId);
      setIsExpanded(true);
    } catch (err: any) {
      setError(t("app.connections.test.error"), err.message || String(err));
    } finally {
      setIsConnectingSession(false);
    }
  };

  const handleDisconnect = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setShowMenu(false);
    if (session) {
      await disconnectMutation.mutateAsync(session.id);
      if (activeSessionId === session.id) {
        setActiveSessionId(null);
      }
    }
  };

  const handleEdit = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setShowMenu(false);
    navigate({ to: "/connections/$id", params: { id: connection.id } });
  };

  const handleDelete = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setShowMenu(false);
    if (confirm(`Delete connection "${connection.name}"?`)) {
      await deleteMutation.mutateAsync(connection.id);
    }
  };

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isConnected) {
      setIsExpanded(!isExpanded);
    } else {
      handleConnect();
    }
  };

  return (
    <div className={styles.wrapper} onContextMenu={handleContextMenu}>
      <div
        className={`${styles.container} ${isConnected ? styles.connected : ""}`}
      >
        <button onClick={toggleExpand} className={styles.expandBtn}>
          {isConnected ? (
            isExpanded ? (
              <ChevronDown size={12} />
            ) : (
              <ChevronRight size={12} />
            )
          ) : (
            <div style={{ width: 12 }} />
          )}
        </button>
        <button
          onClick={() => onSelect(connection.id)}
          className={styles.button}
          title={connection.name}
        >
          <div
            className={`${styles.statusDot} ${isConnected ? styles.online : ""}`}
          />
          <Database size={14} className={styles.icon} />
          <span className={styles.name}>{connection.name}</span>
        </button>
        <div className={styles.actions}>
          <button
            className={styles.actionBtn}
            onClick={handleEdit}
            title="Settings"
          >
            <Settings size={12} />
          </button>
        </div>
      </div>

      {isConnected && isExpanded && (
        <div className={styles.metadataContainer}>
          <MetadataTree sessionId={session.id} />
        </div>
      )}

      {showMenu && (
        <>
          <div
            className={styles.menuOverlay}
            onClick={() => setShowMenu(false)}
          />
          <div
            className={styles.contextMenu}
            style={{ top: menuPos.y, left: menuPos.x }}
          >
            {isConnected ? (
              <button onClick={handleDisconnect} className={styles.menuItem}>
                <PowerOff size={14} /> {t("app.sidebar.disconnect")}
              </button>
            ) : (
              <button onClick={handleConnect} className={styles.menuItem}>
                <Power size={14} /> {t("app.sidebar.connect")}
              </button>
            )}
            <button onClick={handleEdit} className={styles.menuItem}>
              <Settings size={14} /> {t("app.sidebar.edit")}
            </button>
            <div className={styles.menuDivider} />
            <button
              onClick={handleDelete}
              className={`${styles.menuItem} ${styles.menuDanger}`}
            >
              <Trash2 size={14} /> {t("app.sidebar.delete")}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
