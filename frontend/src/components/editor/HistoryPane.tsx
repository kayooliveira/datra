import React from 'react';
import { useHistoryStore } from '../../stores/historyStore';
import { format } from 'date-fns';
import { CheckCircle, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTabStore } from '../../stores/tabStore';
import styles from './history-pane.module.css';

interface HistoryPaneProps {
    sessionId: string;
}

export const HistoryPane: React.FC<HistoryPaneProps> = ({ sessionId }) => {
    const { t } = useTranslation();
    const { getHistory } = useHistoryStore();
    const history = getHistory(sessionId);
    const { setTabContent, activeTabId } = useTabStore();

    const loadQuery = (query: string) => {
        if (activeTabId) {
            setTabContent(activeTabId, query);
        }
    };

    if (history.length === 0) {
        return (
            <div className={styles.container}>
                <div className={styles.empty}>
                    {t("app.history.empty", "No query history for this session.")}
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th className={styles.th} style={{ width: 40 }}>{t("app.history.status", "St")}</th>
                            <th className={styles.th} style={{ width: 80 }}>{t("app.history.time", "Time")}</th>
                            <th className={styles.th} style={{ width: 80 }}>{t("app.history.duration", "Dur")}</th>
                            <th className={styles.th}>{t("app.history.query", "Query")}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {history.map((entry) => (
                            <tr 
                                key={entry.id} 
                                className={styles.tr}
                                onClick={() => loadQuery(entry.query)}
                                title={t("app.history.click_to_load", "Click to load query")}
                            >
                                <td className={styles.td}>
                                    <div className={styles.status}>
                                        {entry.status === 'success' ? (
                                            <CheckCircle size={14} className={styles.success} />
                                        ) : (
                                            <XCircle size={14} className={styles.error} />
                                        )}
                                    </div>
                                </td>
                                <td className={`${styles.td} ${styles.timestamp}`}>
                                    {format(entry.timestamp, 'HH:mm:ss')}
                                </td>
                                <td className={`${styles.td} ${styles.duration}`}>
                                    {entry.duration}ms
                                </td>
                                <td className={`${styles.td} ${styles.queryText}`}>
                                    {entry.query}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
