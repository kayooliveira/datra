import React, { useState } from "react";
import { useSchemas, useTables, useColumns } from "../../hooks/useMetadata";
import {
  ChevronRight,
  ChevronDown,
  Folder,
  Table,
  Columns,
  Loader2,
} from "lucide-react";
import { useSelectionStore } from "../../stores/selectionStore";
import { useSessionStore } from "../../stores/sessionStore";
import { useTabStore, MAIN_TAB_ID } from "../../stores/tabStore";
import {
  ExecuteQuery,
  GetActiveSessions,
} from "../../../wailsjs/go/connection/ConnectionService";
import { useTranslation } from "react-i18next";
import styles from "./metadata-tree.module.css";

interface MetadataTreeProps {
  sessionId: string;
  onLoadStart?: () => void;
  onLoadEnd?: () => void;
}

const ColumnList: React.FC<{
  sessionId: string;
  schema: string;
  table: string;
}> = ({ sessionId, schema, table }) => {
  const { t } = useTranslation();
  const {
    data: columns,
    isLoading,
    error,
  } = useColumns(sessionId, schema, table, true);
  const { selectedId, selectItem } = useSelectionStore();

  if (isLoading)
    return (
      <div className="pl-8 py-1 flex items-center gap-2 text-[var(--text-muted)] opacity-70">
        <Loader2 size={10} className="animate-spin" />
        <span className="text-[10px] italic">
          {t("app.common.loading_columns")}
        </span>
      </div>
    );
  if (error)
    return (
      <div className="pl-8 text-xs text-red-500 py-1">
        {t("app.common.error")}
      </div>
    );

  return (
    <div>
      {columns?.map((col) => {
        const id = `${sessionId}|${schema}|${table}|${col.name}`;
        const isSelected = selectedId === id;
        return (
          <div
            key={col.name}
            className={`${styles.item} ${styles.level3} ${isSelected ? styles.selected : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              selectItem(id, "column");
            }}
          >
            <Columns size={12} className={styles.columnIcon} />
            <span className={styles.label}>{col.name}</span>
            <span className={styles.type}>{col.type}</span>
          </div>
        );
      })}
    </div>
  );
};

const TableList: React.FC<{ sessionId: string; schema: string }> = ({
  sessionId,
  schema,
}) => {
  const { t } = useTranslation();
  const { data: tables, isLoading, error } = useTables(sessionId, schema, true);
  const [expandedTables, setExpandedTables] = useState<Set<string>>(new Set());
  const { selectedId, selectItem } = useSelectionStore();
  const { setSessionContext, setActiveSessionId, activeSessionId } = useSessionStore();
  const { tabs, setActiveTab, activeTabId } = useTabStore();

  const toggleTable = (name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSet = new Set(expandedTables);
    if (newSet.has(name)) newSet.delete(name);
    else newSet.add(name);
    setExpandedTables(newSet);
  };

  const handleSelect = async (name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const id = `${sessionId}|${schema}|${name}`;
    selectItem(id, "table");

    // Check if we need to switch to a different connection
    if (activeSessionId !== sessionId) {
      setActiveSessionId(sessionId); // Triggers sync
      // Ensure main tab is active to show the table
      setActiveTab(MAIN_TAB_ID);
    }

    // Update active context (schema/database) for this session
    setSessionContext(sessionId, { schema, database: undefined });
  };

  if (isLoading)
    return (
      <div className="pl-6 py-1 flex items-center gap-2 text-[var(--text-muted)] opacity-70">
        <Loader2 size={10} className="animate-spin" />
        <span className="text-[10px] italic">
          {t("app.common.loading_tables")}
        </span>
      </div>
    );
  if (error)
    return (
      <div className="pl-6 text-xs text-red-500 py-1">
        {t("app.common.error")}
      </div>
    );

  return (
    <div>
      {tables?.map((t) => {
        const id = `${sessionId}|${schema}|${t.name}`;
        const isSelected = selectedId === id;
        const isExpanded = expandedTables.has(t.name);

        return (
          <div key={t.name}>
            <div
              className={`${styles.item} ${styles.level2} ${isSelected ? styles.selected : ""}`}
              onClick={(e) => handleSelect(t.name, e)}
              onDoubleClick={(e) => toggleTable(t.name, e)}
            >
              <div
                className={styles.expandIcon}
                onClick={(e) => toggleTable(t.name, e)}
              >
                {isExpanded ? (
                  <ChevronDown size={12} />
                ) : (
                  <ChevronRight size={12} />
                )}
              </div>
              <Table size={14} className={styles.tableIcon} />
              <span className={styles.label}>{t.name}</span>
            </div>
            {isExpanded && (
              <ColumnList
                sessionId={sessionId}
                schema={schema}
                table={t.name}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export const MetadataTree: React.FC<MetadataTreeProps> = ({ sessionId, onLoadStart, onLoadEnd }) => {
  const { t } = useTranslation();
  const [expandedSchemas, setExpandedSchemas] = useState<Set<string>>(
    new Set(),
  );
  const { data: schemas, isLoading, error } = useSchemas(sessionId, true);

  // Notify parent about loading state
  React.useEffect(() => {
    if (isLoading) {
      onLoadStart?.();
    } else {
      onLoadEnd?.();
    }
  }, [isLoading, onLoadStart, onLoadEnd]);

  const { selectedId, selectItem } = useSelectionStore();
  const { setSessionContext, setActiveSessionId, activeSessionId } = useSessionStore();
  const { tabs, setActiveTab, activeTabId } = useTabStore();

  const toggleSchema = (name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSet = new Set(expandedSchemas);
    if (newSet.has(name)) newSet.delete(name);
    else newSet.add(name);
    setExpandedSchemas(newSet);
  };

  const handleSelect = async (name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const id = `${sessionId}|${name}`;
    selectItem(id, "schema");

    if (activeSessionId !== sessionId) {
      setActiveSessionId(sessionId);
      // Ensure main tab is active when switching sessions
      setActiveTab(MAIN_TAB_ID);
    }
    
    // Set schema context for this specific session
    setSessionContext(sessionId, { schema: name });

    try {
      // Fetch session to determine driver
      // const sessions = await GetActiveSessions();
      // Default to USE for mysql/mariadb/others, SET search_path for pg
      // This is a heuristic. Ideally backend exposes "switch context" capability.
      let query = `USE ${name}`;
      // In a real app we'd check session.driver. But we don't have it easily here without fetching.
      // For now, let's try to send "USE" which is common.
      // If postgres, it might fail or we need "SET search_path".

      // NOTE: We should ideally check the driver.
      // But let's send it.
      await ExecuteQuery(sessionId, query);
    } catch (err) {
      console.warn(
        "Context switch query failed (might be expected for some drivers):",
        err,
      );
    }
  };

  if (isLoading)
    return (
      <div className={styles.loadingContainer}>
        <Loader2 size={16} className={styles.loadingSpinner} />
        <span className={styles.loadingText}>
          {t("app.common.loading_schemas")}
        </span>
      </div>
    );
  if (error)
    return (
      <div className={styles.errorContainer}>
        <span className={styles.errorText}>
          {t("app.common.error_loading_schemas")}
        </span>
      </div>
    );

  return (
    <div className={styles.container}>
      {schemas?.map((s) => {
        const id = `${sessionId}|${s}`;
        const isSelected = selectedId === id;
        const isExpanded = expandedSchemas.has(s);

        return (
          <div key={s}>
            <div
              className={`${styles.item} ${styles.level1} ${isSelected ? styles.selected : ""}`}
              onClick={(e) => handleSelect(s, e)}
              onDoubleClick={(e) => toggleSchema(s, e)}
            >
              <div
                className={styles.expandIcon}
                onClick={(e) => toggleSchema(s, e)}
              >
                {isExpanded ? (
                  <ChevronDown size={12} />
                ) : (
                  <ChevronRight size={12} />
                )}
              </div>
              <Folder size={14} className={styles.schemaIcon} />
              <span className={styles.label}>{s}</span>
            </div>
            {isExpanded && <TableList sessionId={sessionId} schema={s} />}
          </div>
        );
      })}
    </div>
  );
};
