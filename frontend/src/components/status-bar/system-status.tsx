import { useState } from "react";
import { useNotificationStore } from "../../stores/notificationStore";
import { Loader2, CheckCircle2, XCircle, AlertCircle, X, Terminal } from "lucide-react";
import styles from "./system-status.module.css";
import { useTranslation } from "react-i18next";

export function SystemStatus() {
  const { status, message, details } = useNotificationStore();
  const [showErrorModal, setShowErrorModal] = useState(false);
  const { t } = useTranslation();

  const handleOpenError = () => {
    if (status === 'error' && details) {
      setShowErrorModal(true);
    }
  };

  if (status === 'idle') return null;

  return (
    <>
      <div 
        className={`${styles.container} ${styles[status]} ${details ? styles.clickable : ''}`}
        onClick={handleOpenError}
        title={details ? t("app.status.click_for_details") : message}
      >
        {status === 'loading' && <Loader2 size={12} className="animate-spin" />}
        {status === 'success' && <CheckCircle2 size={12} />}
        {status === 'error' && <AlertCircle size={12} />}
        <span className={styles.message}>{message}</span>
      </div>

      {showErrorModal && details && (
        <div className={styles.modalOverlay} onClick={() => setShowErrorModal(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                <AlertCircle size={16} className="text-red-500" />
                {t("app.common.error")}
              </h3>
              <button className={styles.closeBtn} onClick={() => setShowErrorModal(false)}>
                <X size={16} />
              </button>
            </div>
            <div className={styles.modalBody}>
                <div className={styles.errorMessage}>{message}</div>
                <div className={styles.errorDetails}>
                    <div className={styles.terminalHeader}>
                        <Terminal size={12} /> 
                        <span>Stack Trace / Details</span>
                    </div>
                    <pre>{details}</pre>
                </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.primaryBtn} onClick={() => setShowErrorModal(false)}>
                {t("app.common.close")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
