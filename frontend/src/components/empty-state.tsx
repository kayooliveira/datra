import { DatabaseIcon, PlusIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import styles from "./empty-state.module.css";

interface EmptyStateProps {
  onCreateConnection: () => void;
}

function EmptyState({ onCreateConnection }: EmptyStateProps) {
  const { t } = useTranslation();

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <DatabaseIcon size={120} strokeWidth={1} className={styles.icon} />
        <h1 className={styles.title}>{t('empty_state.title')}</h1>
        <p className={styles.description}>
          {t('empty_state.description')}
        </p>
        <button className={styles.button} onClick={onCreateConnection}>
          {t('empty_state.button')} <PlusIcon size={16} />
        </button>
      </div>
    </div>
  );
}

export default EmptyState;
