import React from "react";
import { useTranslation } from "react-i18next";
import { connection } from "../../../wailsjs/go/models";
import {
  Database,
  Server,
  Shield,
  Zap,
  Info,
  Plus,
  Loader2,
} from "lucide-react";
import { useTabStore } from "../../stores/tabStore";
import { format, parseISO } from "date-fns";
import styles from "./connection-overview.module.css";

interface ConnectionOverviewProps {
  sessionInfo: connection.SessionSummary | null;
  connectionProfile: connection.Connection | null;
}

export const ConnectionOverview: React.FC<ConnectionOverviewProps> = ({
  sessionInfo,
  connectionProfile,
}) => {
  const { t } = useTranslation();
  const { addTab } = useTabStore();
  const [timeoutError, setTimeoutError] = React.useState(false);

  React.useEffect(() => {
    setTimeoutError(false);

    if (!sessionInfo) {
      const timer = setTimeout(() => {
        setTimeoutError(true);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [sessionInfo]);

  const handleNewQuery = () => {
    if (sessionInfo?.id) {
      const connName = connectionProfile?.name;
      const profId = sessionInfo.profile_id;
      addTab(sessionInfo.id, connName, profId);
    }
  };

  if (!sessionInfo || !connectionProfile) {
    if (timeoutError) {
      return (
        <div className={styles.container}>
          <div className="flex flex-col items-center justify-center h-full text-[var(--text-muted)] space-y-2">
            <div className="text-red-400 font-medium">
              Unable to load session details
            </div>
            <p className="text-sm opacity-70">
              The session may have been closed or lost.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="text-xs bg-[var(--bg-panel)] px-3 py-1 rounded border border-[var(--border-subtle)] hover:bg-[var(--bg-hover)]"
            >
              Reload App
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className={styles.container}>
        <div className="flex flex-col items-center justify-center h-full text-[var(--text-muted)] animate-in fade-in duration-500">
          <Loader2 size={32} className="animate-spin text-blue-500 mb-4" />
          <p className="font-medium">{t("app.loading")}</p>
        </div>
      </div>
    );
  }

  const formatConnectedAt = () => {
    if (!sessionInfo.connected_at) return "-";
    try {
      return format(parseISO(sessionInfo.connected_at), "HH:mm:ss dd/MM/yyyy");
    } catch {
      return sessionInfo.connected_at;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <div className={styles.heroIcon}>
          <Database size={32} />
        </div>
        <div className={styles.heroText}>
          <h1 className={styles.heroTitle}>{connectionProfile.name}</h1>
          <p className={styles.heroSubtitle}>
            {connectionProfile.driver.toUpperCase()} • {connectionProfile.host}:
            {connectionProfile.port}
          </p>
        </div>
      </div>

      <div className={styles.quickActions}>
        <button className={styles.actionButton} onClick={handleNewQuery}>
          <Plus size={16} />
          {t("app.overview.new_query", "New Query")}
        </button>
      </div>

      <div className={styles.cardsGrid}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <Server size={16} className={styles.cardIcon} />
            <h3 className={styles.cardTitle}>
              {t("app.overview.connection_info", "Connection Info")}
            </h3>
          </div>
          <div className={styles.cardContent}>
            <div className={styles.infoRow}>
              <span className={styles.label}>
                {t("app.overview.host", "Host")}
              </span>
              <span className={styles.value}>{connectionProfile.host}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>
                {t("app.overview.port", "Port")}
              </span>
              <span className={styles.value}>{connectionProfile.port}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>
                {t("app.overview.database", "Database")}
              </span>
              <span className={styles.value}>
                {connectionProfile.database || "-"}
              </span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>
                {t("app.overview.username", "Username")}
              </span>
              <span className={styles.value}>{connectionProfile.username}</span>
            </div>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <Zap size={16} className={styles.cardIcon} />
            <h3 className={styles.cardTitle}>
              {t("app.overview.session_info", "Session Info")}
            </h3>
          </div>
          <div className={styles.cardContent}>
            <div className={styles.infoRow}>
              <span className={styles.label}>
                {t("app.overview.status", "Status")}
              </span>
              <span className={`${styles.value} ${styles.statusConnected}`}>
                {sessionInfo.status}
              </span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>
                {t("app.overview.connected_at", "Connected At")}
              </span>
              <span className={styles.value}>{formatConnectedAt()}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>
                {t("app.overview.session_id", "Session ID")}
              </span>
              <span className={`${styles.value} ${styles.mono}`}>
                {sessionInfo.id.slice(0, 8)}...
              </span>
            </div>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <Shield size={16} className={styles.cardIcon} />
            <h3 className={styles.cardTitle}>
              {t("app.overview.security", "Security")}
            </h3>
          </div>
          <div className={styles.cardContent}>
            <div className={styles.infoRow}>
              <span className={styles.label}>
                {t("app.overview.ssl_mode", "SSL Mode")}
              </span>
              <span className={styles.value}>
                {connectionProfile.ssl_mode || "disabled"}
              </span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>
                {t("app.overview.tunnel", "SSH Tunnel")}
              </span>
              <span className={styles.value}>
                {connectionProfile.tunnel?.enabled
                  ? t("app.overview.enabled", "Enabled")
                  : t("app.overview.disabled", "Disabled")}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.tips}>
        <div className={styles.tipHeader}>
          <Info size={14} />
          <span>{t("app.overview.tips_title", "Quick Tips")}</span>
        </div>
        <ul className={styles.tipList}>
          <li>
            {t(
              "app.overview.tip_1",
              "Press Cmd/Ctrl + T to open a new query tab",
            )}
          </li>
          <li>
            {t(
              "app.overview.tip_2",
              "Press Shift + Enter to execute the current query",
            )}
          </li>
          <li>{t("app.overview.tip_3", "Double-click a tab to rename it")}</li>
        </ul>
      </div>
    </div>
  );
};
