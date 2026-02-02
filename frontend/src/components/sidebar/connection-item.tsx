import { connection } from "../../../wailsjs/go/models";
import {
  Database,
  Settings,
  Power,
  PowerOff,
  Trash2,
  ChevronRight,
  ChevronDown,
  Loader2,
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
import { useTabStore } from "../../stores/tabStore";

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
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const { data: sessions } = useActiveSessions();
  const connectMutation = useConnect();
  const disconnectMutation = useDisconnect();
  const deleteMutation = useDeleteProfile();
  const { setActiveSessionId, activeSessionId, setIsConnectingSession } =
    useSessionStore();
  const { initializeMainTab, clearTabs } = useTabStore();

  const { setError } = useNotificationStore();

  const session = sessions?.find((s) => s.profile_id === connection.id);
  const isConnected = !!session;

  useEffect(() => {
    if (isConnected) {
      setIsExpanded(true);
    } else {
      // Reset disconnecting state when actually disconnected
      setIsDisconnecting(false);
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

    if (isConnecting) return; // Prevent double clicks

    setIsConnecting(true);
    setIsConnectingSession(true);
    navigate({ to: "/" });

    try {
      const sessionId = await connectMutation.mutateAsync(connection.id);
      setActiveSessionId(sessionId);
      initializeMainTab(sessionId, connection.name, connection.id);
      setIsExpanded(true);
    } catch (err: any) {
      setError(t("app.connections.test.error"), err.message || String(err));
    } finally {
      setIsConnecting(false);
      setIsConnectingSession(false);
    }
  };

  const handleDisconnect = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    e?.preventDefault();
    
    if (!session || isDisconnecting) return; // Prevent double clicks

    // Close menu immediately and set states
    setShowMenu(false);
    setIsDisconnecting(true);
    setIsExpanded(false);

    try {
      await disconnectMutation.mutateAsync(session.id);

      // If this was the active session, clear it
      if (activeSessionId === session.id) {
        setActiveSessionId(null);
        clearTabs();
      }
    } catch (err: any) {
      setError(
        t("app.connections.disconnect.error", "Disconnect failed"),
        err.message || String(err),
      );
      // Re-expand on error
      setIsExpanded(true);
    } finally {
      // Don't set to false here - let useEffect handle it when isConnected changes
      // This prevents the flickering where it shows as disconnected before it actually is
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
          className={`${styles.button} ${isConnecting || isDisconnecting ? styles.loading : ""}`}
          title={connection.name}
          disabled={isConnecting || isDisconnecting}
        >
          <div
            className={`${styles.statusDot} ${
              isConnected ? styles.online : ""
            } ${isConnecting ? styles.connecting : ""} ${isDisconnecting ? styles.disconnecting : ""}`}
          />
          {isConnecting || isDisconnecting ? (
            <Loader2 size={14} className={styles.spinner} />
          ) : (
            <Database size={14} className={styles.icon} />
          )}
          <span className={styles.name}>
            {isConnecting
              ? t("app.connections.connecting", "Connecting...")
              : isDisconnecting
                ? t("app.connections.disconnecting", "Disconnecting...")
                : connection.name}
          </span>
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
              <button
                onClick={handleDisconnect}
                className={styles.menuItem}
                disabled={isDisconnecting}
              >
                {isDisconnecting ? (
                  <Loader2 size={14} className={styles.menuSpinner} />
                ) : (
                  <PowerOff size={14} />
                )}
                {t("app.sidebar.disconnect")}
              </button>
            ) : (
              <button
                onClick={handleConnect}
                className={styles.menuItem}
                disabled={isConnecting}
              >
                {isConnecting ? (
                  <Loader2 size={14} className={styles.menuSpinner} />
                ) : (
                  <Power size={14} />
                )}
                {t("app.sidebar.connect")}
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
