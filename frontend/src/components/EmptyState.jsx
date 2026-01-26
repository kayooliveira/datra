import { DatabaseIcon, PlusIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

function EmptyState({ onCreateConnection }) {
  const { t } = useTranslation();

  return (
    <div className="empty-state">
      <div className="empty-state-content">
        <DatabaseIcon size={120} strokeWidth={1} className="empty-state-icon" />
        <h1>{t('empty_state.title')}</h1>
        <p>
          {t('empty_state.description')}
        </p>
        <button className="primary-button" onClick={onCreateConnection}>
          {t('empty_state.button')} <PlusIcon size={16} />
        </button>
      </div>
    </div>
  );
}

export default EmptyState;
