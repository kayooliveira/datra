import React, { useEffect, useState, useMemo } from "react";
import {
  ExecuteQuery,
  GetActiveSessions,
  CancelQuery,
} from "../../../wailsjs/go/connection/ConnectionService";
import { connection } from "../../../wailsjs/go/models";
import { useTranslation } from "react-i18next";
import { useTabStore, MAIN_TAB_ID, TabResult } from "../../stores/tabStore";
import { SqlEditorTabs } from "./SqlEditorTabs";
import { useSessionStore } from "../../stores/sessionStore";
import { useQueryExecutor } from "../../hooks/useQueryExecutor";
import { useHotkeys } from "react-hotkeys-hook";
import { useSettings } from "../../contexts/settings-context";
import CodeMirror from "@uiw/react-codemirror";
import {
  sql,
  MySQL,
  PostgreSQL,
  SQLite,
  StandardSQL,
} from "@codemirror/lang-sql";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import { useProfiles } from "../../hooks/useConnections";
import { EditorStatusBar } from "../status-bar/EditorStatusBar";
import { Panel, Group, Separator } from "react-resizable-panels";
import { SqlToolbar } from "./SqlToolbar";
import styles from "./sql-editor.module.css";
import { useHistoryStore } from "../../stores/historyStore";
import { HistoryPane } from "./HistoryPane";
import { useSchemaAutocompletion } from "../../hooks/useSchemaAutocompletion";
import { ConnectionOverview } from "./ConnectionOverview";
import { ResultTabs } from "../results/ResultTabs";

interface SqlEditorProps {
  sessionId: string | null;
}

const getDialect = (driverType: string | undefined) => {
  switch (driverType?.toLowerCase()) {
    case "mysql":
    case "mariadb":
      return MySQL;
    case "postgres":
    case "postgresql":
      return PostgreSQL;
    case "sqlite":
    case "sqlite3":
      return SQLite;
    default:
      return StandardSQL;
  }
};

export const SqlEditor: React.FC<SqlEditorProps> = ({ sessionId }) => {
  const { t } = useTranslation();
  const {
    tabs,
    activeTabId,
    updateTab,
    setTabContent,
    setTabResults,
    addTab,
    setActiveResultTab,
  } = useTabStore();
  const { sessionContexts } = useSessionStore();
  const { addEntry } = useHistoryStore();
  const { platformModifier } = useSettings();
  const [sessionInfo, setSessionInfo] =
    useState<connection.SessionSummary | null>(null);
  const { processQuery, splitQueries } = useQueryExecutor();
  const { data: profiles } = useProfiles();

  const activeTab = tabs.find((t) => t.id === activeTabId);
  const isMainTab = activeTabId === MAIN_TAB_ID;
  const modifier = platformModifier === "Ctrl" ? "ctrl" : "meta";
  const hasContent = !!activeTab?.content?.trim();

  // Use sessionId from active tab, not from prop
  const currentSessionId = activeTab?.context.connectionId || sessionId;
  
  // Get context for the specific session of this tab
  const activeContext = currentSessionId ? sessionContexts[currentSessionId] : null;

  const { data: schemaData } = useSchemaAutocompletion(
    currentSessionId,
    activeContext?.schema,
  );

  const connectionProfile =
    sessionInfo && profiles
      ? profiles.find((p) => p.id === sessionInfo.profile_id) || null
      : null;

  const sqlDialect = useMemo(() => {
    return getDialect(connectionProfile?.driver);
  }, [connectionProfile?.driver]);

  const sqlExtension = useMemo(() => {
    return sql({
      dialect: sqlDialect,
      schema: schemaData?.schema,
      tables: schemaData?.tables?.map((name) => ({
        label: name,
        type: "type",
        detail: "table",
      })),
      defaultSchema: schemaData?.defaultSchema,
    });
  }, [sqlDialect, schemaData]);

  useEffect(() => {
    if (currentSessionId) {
      setSessionInfo(null);
      fetchSessionInfo();
    }
  }, [currentSessionId]);

  const fetchSessionInfo = async () => {
    try {
      const sessions = await GetActiveSessions();
      const info = sessions.find((s) => s.id === currentSessionId);
      setSessionInfo(info || null);
    } catch (err) {
      console.error("Failed to fetch session info:", err);
      setSessionInfo(null);
    }
  };

  const getDriver = () => {
    if (!sessionInfo || !profiles) return undefined;
    const profile = profiles.find((p) => p.id === sessionInfo.profile_id);
    return profile?.driver;
  };

  const handleRun = async () => {
    if (
      !activeTabId ||
      !activeTab ||
      activeTab.isExecuting ||
      !hasContent ||
      isMainTab
    )
      return;

    // Use sessionId from the tab's context instead of the prop
    const tabSessionId = activeTab.context.connectionId;
    if (!tabSessionId) return;

    updateTab(activeTabId, {
      isExecuting: true,
      error: undefined,
      results: undefined,
    });

    const driver = getDriver();
    const queries = splitQueries(activeTab.content || "");
    const results: TabResult[] = [];

    for (const query of queries) {
      const startTime = Date.now();
      const finalQuery = processQuery(
        query,
        activeTab?.limit ?? 50,
        driver,
        activeContext || undefined,
      );

      try {
        const res = await ExecuteQuery(tabSessionId, finalQuery, activeTab?.limit ?? 50);
        const duration = Date.now() - startTime;

        results.push({
          id: crypto.randomUUID(),
          query: finalQuery,
          timestamp: startTime,
          data: res,
        });

        if (res.error) {
          updateTab(activeTabId, { error: res.error });
          addEntry(tabSessionId, {
            query: finalQuery,
            status: "error",
            duration,
          });
          break;
        } else {
          addEntry(tabSessionId, {
            query: finalQuery,
            status: "success",
            duration,
            rowsAffected: (res as any).rows_affected || 0,
          });
        }
      } catch (err: any) {
        const duration = Date.now() - startTime;
        updateTab(activeTabId, { error: err.toString() });
        addEntry(tabSessionId, {
          query: finalQuery,
          status: "error",
          duration,
        });
        break;
      }
    }

    setTabResults(activeTabId, results);
    updateTab(activeTabId, { isExecuting: false });
  };

  const handleLimitChange = (newLimit: number) => {
    if (activeTabId) {
      updateTab(activeTabId, { limit: newLimit });
    }
  };

  const handleClear = () => {
    if (activeTabId) {
      setTabContent(activeTabId, "");
    }
  };

  const handleStop = async () => {
    if (!activeTabId || !activeTab?.isExecuting) return;
    
    // Use sessionId from the tab's context
    const tabSessionId = activeTab.context.connectionId;
    if (!tabSessionId) return;

    try {
      await CancelQuery(tabSessionId);
      // We don't manually set isExecuting false here; 
      // ExecuteQuery will return with "Query canceled" error or similar,
      // and handleRun's try/catch/finally (or normal flow) will handle it.
      // But handleRun sets isExecuting false at the end.
    } catch (err) {
      console.error("Failed to cancel query:", err);
    }
  };

  useHotkeys(
    "shift+enter",
    (e) => {
      e.preventDefault();
      handleRun();
    },
    {
      enableOnFormTags: true,
      enabled: !!activeTabId && hasContent && !isMainTab,
    },
    [handleRun, activeTabId, hasContent, isMainTab],
  );

  useHotkeys(
    [`${modifier}+n`, `${modifier}+t`],
    async (e) => {
      e.preventDefault();
      // Need activeSessionId from store for global new tab shortcut
      const globalActiveSessionId = useSessionStore.getState().activeSessionId;
      
      if (globalActiveSessionId) {
        try {
          const sessions = await GetActiveSessions();
          const session = sessions.find((s) => s.id === globalActiveSessionId);
          if (session && profiles) {
            const profile = profiles.find((p) => p.id === session.profile_id);
            addTab(globalActiveSessionId, profile?.name, session.profile_id);
          } else {
            addTab(globalActiveSessionId);
          }
        } catch (err) {
          console.error("Failed to create new tab:", err);
          addTab(globalActiveSessionId);
        }
      }
    },
    { enableOnFormTags: true },
    [addTab, profiles],
  );

  if (!activeTab) return <SqlEditorTabs />;

  // Overview Tab (Main Tab)
  if (isMainTab) {
    return (
      <div className={styles.container}>
        <EditorStatusBar sessionInfo={sessionInfo} />
        <SqlEditorTabs />
        <Group orientation="vertical" className={styles.panelGroup}>
          <Panel id="overview" defaultSize="75%" minSize="40%">
            <div className={styles.panelContent}>
              <ConnectionOverview
                sessionInfo={sessionInfo}
                connectionProfile={connectionProfile}
              />
            </div>
          </Panel>
          <Separator className={styles.resizeHandle} />
          <Panel
            id="history"
            defaultSize="25%"
            minSize="10%"
            collapsible
            collapsedSize="0%"
          >
            <div className={styles.panelContent}>
              {currentSessionId && <HistoryPane sessionId={currentSessionId} />}
            </div>
          </Panel>
        </Group>
      </div>
    );
  }

  // Query Tab
  return (
    <div className={styles.container}>
      <EditorStatusBar sessionInfo={sessionInfo} />
      <SqlEditorTabs />
      <SqlToolbar
        onRun={handleRun}
        onStop={handleStop}
        isExecuting={!!activeTab?.isExecuting}
        isDisabled={!hasContent}
        limit={activeTab?.limit ?? 50}
        onLimitChange={handleLimitChange}
        hasResults={!!activeTab?.results}
        onClear={handleClear}
        schema={activeContext?.schema}
      />

      <Group orientation="vertical" className={styles.panelGroup}>
        <Panel id="sql-editor" defaultSize="35%" minSize="15%" maxSize="70%">
          <div className={styles.editorPane}>
            <CodeMirror
              value={activeTab?.content || ""}
              height="100%"
              theme={vscodeDark}
              extensions={[sqlExtension]}
              onChange={(val) => activeTabId && setTabContent(activeTabId, val)}
              basicSetup={{
                lineNumbers: true,
                highlightActiveLineGutter: true,
                highlightSpecialChars: true,
                history: true,
                drawSelection: true,
                dropCursor: true,
                allowMultipleSelections: true,
                indentOnInput: true,
                syntaxHighlighting: true,
                bracketMatching: true,
                closeBrackets: true,
                autocompletion: true,
                rectangularSelection: true,
                crosshairCursor: true,
                highlightActiveLine: true,
                highlightSelectionMatches: true,
                closeBracketsKeymap: true,
                defaultKeymap: true,
                searchKeymap: true,
                historyKeymap: true,
                foldKeymap: true,
                completionKeymap: true,
                lintKeymap: true,
              }}
              className={styles.codeMirror}
            />
          </div>
        </Panel>

        <Separator className={styles.resizeHandle} />

        <Panel id="results" defaultSize="45%" minSize="15%">
          <div className={styles.resultsPane}>
            {activeTab?.isExecuting && (
              <div className={styles.executingIndicator}>
                <div className={styles.executingDot} />
                {t("app.editor.executing")}...
              </div>
            )}

            <div className={styles.resultsContent}>
              {activeTab?.error &&
                (!activeTab.results || activeTab.results.length === 0) && (
                  <div className={styles.errorPane}>
                    <div className={styles.errorLabel}>
                      {t("app.editor.error")}:
                    </div>
                    {activeTab.error}
                  </div>
                )}

              {activeTab?.results &&
                activeTab.results.length > 0 &&
                activeTabId && (
                  <ResultTabs
                    tabId={activeTabId}
                    results={activeTab.results}
                    activeResultId={activeTab.activeResultId}
                    onSelectResult={(id) =>
                      activeTabId && setActiveResultTab(activeTabId, id)
                    }
                  />
                )}

              {(!activeTab?.results || activeTab.results.length === 0) &&
                !activeTab?.error &&
                !activeTab?.isExecuting && (
                  <div className={styles.emptyState}>
                    {t("app.editor.empty_results")}
                  </div>
                )}
            </div>
          </div>
        </Panel>

        <Separator className={styles.resizeHandle} />

        <Panel
          id="history"
          defaultSize="20%"
          minSize="10%"
          collapsible
          collapsedSize="0%"
        >
          <div className={styles.historyPane}>
            {currentSessionId && <HistoryPane sessionId={currentSessionId} />}
          </div>
        </Panel>
      </Group>
    </div>
  );
};
