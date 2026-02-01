import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ConnectionForm } from "../../components/connections/connection-form";
import { TestConnection } from "../../../wailsjs/go/main/App";
import { connection } from "../../../wailsjs/go/models";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import styles from "./connection-page.module.css";
import { useSaveProfile } from "../../hooks/useConnections";
import { useNotificationStore } from "../../stores/notificationStore";

export const Route = createFileRoute("/connections/new")({
  component: NewConnectionComponent,
});

function NewConnectionComponent() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const saveProfileMutation = useSaveProfile();
  const { setLoading, showSuccess, setError, setIdle } = useNotificationStore();

  const handleSubmit = async (conn: connection.Connection, password: string, tunnelPassword: string) => {
    setIsSubmitting(true);
    setLoading(t("app.connections.save.loading", "Saving connection..."));
    try {
      await saveProfileMutation.mutateAsync({ profile: conn, password });
      showSuccess(t("app.connections.save.success", "Connection saved successfully"));
      navigate({ to: "/" });
    } catch (error: any) {
      setError(t("app.connections.save.error", "Failed to save connection"), error.message || String(error));
    } finally {
      setIsSubmitting(false);
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

  // Clear status when component unmounts
  // useEffect(() => () => setIdle(), []); // Optional: depends if we want to keep status visible

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.iconBtn} onClick={() => navigate({ to: "/" })}>
          <ArrowLeft size={18} />
        </button>
        <h1 className={styles.title}>{t("app.connections.new.title", "New Connection")}</h1>
      </div>
      <div className={styles.content}>
        <ConnectionForm
          onSubmit={handleSubmit}
          onTest={handleTest}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}