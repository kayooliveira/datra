import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ConnectionForm } from "../../components/connections/connection-form";
import { CreateConnection, TestConnection } from "../../../wailsjs/go/main/App";
import { connection } from "../../../wailsjs/go/models";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import styles from "./connection-page.module.css";

export const Route = createFileRoute("/connections/new")({
  component: NewConnectionComponent,
});

function NewConnectionComponent() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testError, setTestError] = useState<string | null>(null);
  const [testSuccess, setTestSuccess] = useState(false);

  const handleSubmit = async (conn: connection.Connection, password: string, tunnelPassword: string) => {
    setIsSubmitting(true);
    setTestError(null);
    setTestSuccess(false);
    try {
      await CreateConnection(conn, password, tunnelPassword);
      navigate({ to: "/" });
    } catch (error: any) {
      setTestError(error.message || String(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTest = async (conn: connection.Connection, password: string, tunnelPassword: string) => {
    setTestError(null);
    setTestSuccess(false);
    try {
      await TestConnection(conn, password, tunnelPassword);
      setTestSuccess(true);
    } catch (error: any) {
      setTestError(error.message || String(error));
    }
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
          testError={testError}
          testSuccess={testSuccess}
        />
      </div>
    </div>
  );
}