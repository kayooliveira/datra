import React from 'react';
import { TabResult, useTabStore } from '../../stores/tabStore';
import { ResultGrid } from './ResultGrid';
import styles from './result-tabs.module.css';

interface ResultTabsProps {
    tabId: string;
    results: TabResult[];
    activeResultId?: string;
    onSelectResult: (id: string) => void;
}

export const ResultTabs: React.FC<ResultTabsProps> = ({ tabId, results, activeResultId, onSelectResult }) => {
    const setResultSelection = useTabStore(state => state.setResultSelection);
    // If no active result string, default to first
    const activeResult = results.find(r => r.id === activeResultId) || results[0];

    if (!activeResult) return null;

    const handleSelectionChange = (updaterOrValue: any) => {
        const oldSelection = activeResult.selection || {};
        const newSelection = typeof updaterOrValue === 'function' 
            ? updaterOrValue(oldSelection) 
            : updaterOrValue;
        setResultSelection(tabId, activeResult.id, newSelection);
    };
    
    const selectionCount = Object.keys(activeResult.selection || {}).length;

    return (
        <div className={styles.container}>
            {results.length > 1 && (
                <div className={styles.tabsHeader}>
                    {results.map((result, index) => (
                        <div 
                            key={result.id}
                            className={`${styles.tab} ${result.id === activeResult.id ? styles.active : ''}`}
                            onClick={() => onSelectResult(result.id)}
                        >
                            Result {index + 1}
                            {result.data.error && <span className={styles.errorBadge}>!</span>}
                        </div>
                    ))}
                </div>
            )}
            
            <div className={styles.content}>
                <div className={styles.actionsHeader}>
                    {/* Placeholder Actions - "header bem pequeno" */}
                    <button className={styles.actionBtn} title="Export">Export</button>
                    <button 
                        className={styles.actionBtn} 
                        disabled={selectionCount === 0}
                        title="Delete Selected Rows"
                    >
                        Delete {selectionCount > 0 ? `(${selectionCount})` : ''}
                    </button>
                    <span className={styles.metaInfo}>
                        {activeResult.data.rows?.length || 0} rows 
                        • {activeResult.data.time_ms}ms
                    </span>
                </div>
                
                <div className={styles.gridContainer}>
                    {activeResult.data.error ? (
                        <div className={styles.errorResult}>{activeResult.data.error}</div>
                    ) : (
                        <ResultGrid 
                            result={activeResult.data} 
                            selectedRows={activeResult.selection || {}}
                            onRowSelectionChange={handleSelectionChange}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};
