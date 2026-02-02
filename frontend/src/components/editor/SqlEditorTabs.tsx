import React, { useEffect } from "react";
import { useTabStore, MAIN_TAB_ID } from "../../stores/tabStore";
import { Tab } from "./Tab";
import { Plus } from "lucide-react";
import styles from "./sql-editor-tabs.module.css";
import { useSessionStore } from "../../stores/sessionStore";
import { useProfiles } from "../../hooks/useConnections";
import { GetActiveSessions } from "../../../wailsjs/go/connection/ConnectionService";

export const SqlEditorTabs: React.FC = () => {
  const {
    tabs,
    activeTabId,
    addTab,
    closeTab,
    setActiveTab,
    initializeMainTab,
  } = useTabStore();
  const { activeSessionId } = useSessionStore();
  const { data: profiles } = useProfiles();

  useEffect(() => {
    // Initialize main tab when session becomes active
    if (activeSessionId && tabs.length === 0) {
      initializeMainTab(activeSessionId);
    }
  }, [activeSessionId, tabs.length, initializeMainTab]);

  const handleAddTab = async () => {
    if (activeSessionId) {
      try {
        const sessions = await GetActiveSessions();
        const session = sessions.find((s) => s.id === activeSessionId);
        if (session && profiles) {
          const profile = profiles.find((p) => p.id === session.profile_id);
          addTab(activeSessionId, profile?.name, session.profile_id);
        } else {
          addTab(activeSessionId);
        }
      } catch (err) {
        console.error("Failed to fetch session info:", err);
        addTab(activeSessionId);
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.tabBar}>
        <div className={styles.tabsScroll}>
          {tabs.map((tab) => (
            <Tab
              key={tab.id}
              tab={tab}
              isActive={tab.id === activeTabId}
              onSelect={() => setActiveTab(tab.id)}
              onClose={(e) => {
                e.stopPropagation();
                closeTab(tab.id);
              }}
              isMainTab={tab.id === MAIN_TAB_ID}
            />
          ))}
        </div>
        <button
          className={styles.addBtn}
          onClick={handleAddTab}
          title="New Query Tab"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
};
