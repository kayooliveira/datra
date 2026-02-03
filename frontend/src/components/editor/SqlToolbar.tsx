import React from 'react';
import { Play, Download, Eraser, Square } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import styles from './sql-toolbar.module.css';
import { LimitSelector } from './LimitSelector';

interface SqlToolbarProps {
  onRun: () => void;
  onStop: () => void;
  isExecuting: boolean;
  isDisabled?: boolean;
  limit: number;
  onLimitChange: (limit: number) => void;
  hasResults: boolean;
  onClear: () => void;
  schema?: string;
}

export const SqlToolbar: React.FC<SqlToolbarProps> = ({ 
  onRun, 
  onStop,
  isExecuting, 
  isDisabled,
  limit, 
  onLimitChange,
  hasResults,
  onClear,
  schema
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

        <button 
          onClick={onStop}
          disabled={!isExecuting}
          className={styles.stopBtn}
          title={t("app.editor.stop_query", "Stop Execution")}
        >
          <Square size={14} fill="currentColor" /> 
          {t("app.editor.stop", "Stop")}
        </button>
        
        <div style={{ width: 1, height: 16, background: 'var(--border-subtle)', margin: '0 4px' }} />
        
        <button 
          className={styles.iconButton}
          onClick={onClear}
          title={t("app.editor.clear", "Clear Query")}
        >
          <Eraser size={16} />
        </button>

        {schema && (
          <>
            <div style={{ width: 1, height: 16, background: 'var(--border-subtle)', margin: '0 4px' }} />
            <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, paddingLeft: 4 }}>
              <span style={{ opacity: 0.7 }}>Schema:</span>
              <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>{schema}</span>
            </div>
          </>
        )}
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
