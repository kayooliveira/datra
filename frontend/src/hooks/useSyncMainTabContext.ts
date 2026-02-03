import { useEffect } from 'react';
import { useSessionStore } from '../stores/sessionStore';
import { useTabStore, MAIN_TAB_ID } from '../stores/tabStore';
import { useActiveSessions } from './useConnections';

/**
 * Hook to synchronize the main tab's connection context with the global active session ID.
 * 
 * This ensures that when the user switches connections (via sidebar or other means),
 * the Main Tab (Overview) updates to reflect the currently active connection.
 * 
 * It watches `activeSessionId` from sessionStore and updates the main tab's context
 * if it differs.
 */
export function useSyncMainTabContext() {
  const { activeSessionId } = useSessionStore();
  const { tabs, syncMainTabContext, setActiveTab } = useTabStore();
  const { data: sessions } = useActiveSessions();

  useEffect(() => {
    if (!activeSessionId) {
      // No active session, nothing to sync
      return;
    }

    // Find the main tab
    const mainTab = tabs.find((t) => t.id === MAIN_TAB_ID);
    
    if (!mainTab) {
      // Main tab doesn't exist yet, skip sync
      // (It will be initialized when connection is established)
      return;
    }

    // Check if main tab's context is out of sync
    if (mainTab.context.connectionId !== activeSessionId) {
      // Find session info for display name
      const session = sessions?.find((s) => s.id === activeSessionId);
      
      // Sync the main tab context
      syncMainTabContext(activeSessionId, session?.profile_name, session?.profile_id);
      
      // Ensure main tab is active when switching connections
      setActiveTab(MAIN_TAB_ID);
    }
  }, [activeSessionId, tabs, sessions, syncMainTabContext, setActiveTab]);
}
