import { DatabaseIcon, PlusIcon } from "lucide-react";
import { useSettings } from "../contexts/SettingsContext";

function EmptyState({ onCreateConnection }) {
  const { t } = useSettings();

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
