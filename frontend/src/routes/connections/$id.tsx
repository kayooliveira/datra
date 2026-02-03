import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ConnectionForm } from "../../components/connections/connection-form";
import { GetConnections, TestConnection } from "../../../wailsjs/go/main/App";
import { connection } from "../../../wailsjs/go/models";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { ArrowLeft, Trash2 } from "lucide-react";
import styles from "./connection-page.module.css";
import { useSaveProfile, useDeleteProfile } from "../../hooks/useConnections";
import { useNotificationStore } from "../../stores/notificationStore";

export const Route = createFileRoute("/connections/$id")({
  component: EditConnectionComponent,
});

function EditConnectionComponent() {
  const { id } = Route.useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState<connection.Connection | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const saveProfileMutation = useSaveProfile();
  const deleteProfileMutation = useDeleteProfile();
  const { setLoading, showSuccess, setError } = useNotificationStore();

  useEffect(() => {
    fetchConnection();
  }, [id]);

  const fetchConnection = async () => {
    // We fetch fresh data for editing
    const connections = await GetConnections();
    const conn = connections.find((c) => c.id === id);
    if (conn) {
      setInitialData(conn);
    } else {
      navigate({ to: "/" });
    }
  };

  const handleSubmit = async (conn: connection.Connection, password: string, tunnelPassword: string) => {
    setIsSubmitting(true);
    setLoading(t("app.connections.save.loading", "Saving connection..."));
    try {
      // Tunnel password is ignored by backend currently, matching legacy behavior
      await saveProfileMutation.mutateAsync({ profile: conn, password });
      showSuccess(t("app.connections.save.success", "Connection saved successfully"));
      navigate({ to: "/" });
    } catch (error: any) {
      setError(t("app.connections.save.error", "Failed to save connection"), error.message || String(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setLoading(t("app.connections.delete.loading", "Deleting connection..."));
    try {
      await deleteProfileMutation.mutateAsync(id);
      showSuccess(t("app.connections.delete.success", "Connection deleted successfully"));
      navigate({ to: "/" });
    } catch (error: any) {
      setError(t("app.connections.delete.error", "Failed to delete connection"), error.message || String(error));
    }
  };

  const handleTest = async (conn: connection.Connection, password: string, tunnelPassword: string) => {
    setLoading(t("app.connections.connecting", "Establishing Connection..."));
    try {
      await TestConnection(conn, password, tunnelPassword);
      showSuccess(t("app.connections.test.success", "Connection successful!"));
    } catch (err: any) {
      setError(t("app.connections.test.error", "Connection failed"), err.message || String(err));
    }
  };

  if (!initialData) return <div className={styles.loading}>{t("app.loading")}</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.iconBtn} onClick={() => navigate({ to: "/" })}>
          <ArrowLeft size={18} />
        </button>
        <div style={{ flex: 1 }}>
          <h1 className={styles.title}>{t("app.connections.edit.title", "Edit Connection")}</h1>
        </div>
        <button className={`${styles.iconBtn} ${styles.dangerBtn}`} onClick={() => setShowDeleteConfirm(true)}>
          <Trash2 size={18} />
        </button>
      </div>
      <div className={styles.content}>
        <ConnectionForm
          initialData={initialData}
          onSubmit={handleSubmit}
          onTest={handleTest}
          isSubmitting={isSubmitting}
        />
      </div>

      {showDeleteConfirm && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3 className={styles.modalTitle}>{t("app.connections.delete.title", "Delete Connection")}</h3>
            <p className={styles.modalText}>{t("app.connections.delete.confirm", "Are you sure you want to delete this connection? This action cannot be undone.")}</p>
            <div className={styles.modalActions}>
              <button className={styles.btnCancel} onClick={() => setShowDeleteConfirm(false)}>
                {t("app.common.cancel", "Cancel")}
              </button>
              <button className={styles.btnDelete} onClick={handleDelete}>
                {t("app.common.delete", "Delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}