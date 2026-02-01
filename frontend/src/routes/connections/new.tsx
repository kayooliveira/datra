import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ConnectionForm } from "../../components/connections/connection-form";
import { CreateConnection, TestConnection } from "../../../wailsjs/go/main/App";
import { connection } from "../../../wailsjs/go/models";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import styles from "./connection-page.module.css";

export const Route = createFileRoute("/connections/new")({
  component: NewConnectionComponent,
});

function NewConnectionComponent() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (conn: connection.Connection, password: string, tunnelPassword: string) => {
    setIsSubmitting(true);
    try {
      await CreateConnection(conn, password, tunnelPassword);
      toast.success(t("app.connections.save.success", "Connection saved successfully"));
      navigate({ to: "/" });
    } catch (error: any) {
      toast.error(error.message || String(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTest = async (conn: connection.Connection, password: string, tunnelPassword: string) => {
    toast.promise(TestConnection(conn, password, tunnelPassword), {
      loading: t("app.connections.connecting", "Establishing Connection..."),
      success: t("app.connections.test.success", "Connection successful!"),
      error: (err) => t("app.connections.test.error", "Connection failed: ") + (err.message || String(err)),
    });
  };

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