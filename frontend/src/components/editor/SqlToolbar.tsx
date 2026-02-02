import React from 'react';
import { Play, Download, Eraser } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import styles from './sql-toolbar.module.css';
import { LimitSelector } from './LimitSelector';

interface SqlToolbarProps {
  onRun: () => void;
  isExecuting: boolean;
  isDisabled?: boolean;
  limit: number;
  onLimitChange: (limit: number) => void;
  hasResults: boolean;
  onClear: () => void;
}

export const SqlToolbar: React.FC<SqlToolbarProps> = ({ 
  onRun, 
  isExecuting, 
  isDisabled,
  limit, 
  onLimitChange,
  hasResults,
  onClear
}) => {
  const { t } = useTranslation();

  return (
    <div className={styles.toolbar}>
      <div className={styles.leftGroup}>
        <button 
          onClick={onRun}
          disabled={isExecuting || isDisabled}
          className={styles.runBtn}
          title={`${t("app.editor.run_query")} (Shift + Enter)`}
        >
          <Play size={14} fill="currentColor" /> 
          {t("app.editor.run", "Run")}
        </button>
        
        <div style={{ width: 1, height: 16, background: 'var(--border-subtle)', margin: '0 4px' }} />
        
        <button 
          className={styles.iconButton}
          onClick={onClear}
          title={t("app.editor.clear", "Clear Query")}
        >
          <Eraser size={16} />
        </button>

        {/* Placeholder for future buttons */}
        {/* <button className={styles.iconButton}>
            <Settings2 size={16} />
        </button> */}
      </div>

      <div className={styles.rightGroup}>
        <LimitSelector value={limit} onChange={onLimitChange} />
        
        {hasResults && (
           <button className={styles.iconButton} title={t("app.editor.export", "Export Results")}>
             <Download size={16} />
           </button>
        )}
      </div>
    </div>
  );
};
