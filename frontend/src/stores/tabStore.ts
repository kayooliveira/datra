import { create } from 'zustand';
import { connection } from '../../wailsjs/go/models';

export type TabType = 'main' | 'query';

export const MAIN_TAB_ID = '__main__';

export interface TabResult {
  id: string;
  query: string;
  timestamp: number;
  data: connection.QueryResult;
  selection?: Record<string, boolean>;
}

export interface QueryTab {
  id: string;             // UUID or '__main__' for the main tab
  type: TabType;          // 'main' for overview, 'query' for SQL query
  title: string;          // e.g., "Overview", "Query 1", "users.sql"
  content: string;        // SQL text (empty for main tab)
  context: {
    connectionId: string;
    database?: string;
    schema?: string;
  };
  connectionName?: string; // Display name of the connection
  profileId?: string;      // Profile ID for connection lookup
  results?: TabResult[];  // Execution results
  activeResultId?: string;
  isExecuting: boolean;
  error?: string;
  limit: number;          // Default 50
}

interface TabState {
  tabs: QueryTab[];
  activeTabId: string | null;
  
  // Actions
  initializeMainTab: (connectionId: string, connectionName?: string, profileId?: string) => void;
  addTab: (connectionId: string, connectionName?: string, profileId?: string) => void;
  closeTab: (id: string) => void;
  renameTab: (id: string, newTitle: string) => void;
  setActiveTab: (id: string) => void;
  updateTab: (id: string, updates: Partial<QueryTab>) => void;
  setTabContent: (id: string, content: string) => void;
  setTabResults: (id: string, results: TabResult[]) => void;
  setActiveResultTab: (tabId: string, resultId: string) => void;
  setResultSelection: (tabId: string, resultId: string, selection: Record<string, boolean>) => void;
  clearTabs: () => void;
  syncMainTabContext: (connectionId: string, connectionName?: string, profileId?: string) => void;
  closeTabsByProfile: (profileId: string) => void;
}

export const useTabStore = create<TabState>((set, get) => ({
  tabs: [],
  activeTabId: null,

  closeTabsByProfile: (profileId: string) => set((state) => {
    // Keep main tab (even if bound to this profile, it will be updated or cleared separately)
    // and tabs NOT belonging to this profile
    const newTabs = state.tabs.filter((t) => 
      t.id === MAIN_TAB_ID || t.profileId !== profileId
    );
    
    // If active tab was removed, switch to main tab
    let newActiveId = state.activeTabId;
    if (state.activeTabId && !newTabs.find(t => t.id === state.activeTabId)) {
      newActiveId = MAIN_TAB_ID;
    }

    return {
      tabs: newTabs,
      activeTabId: newActiveId,
    };
  }),

  syncMainTabContext: (connectionId, connectionName, profileId) => set((state) => ({
    tabs: state.tabs.map((tab) =>
      tab.id === MAIN_TAB_ID
        ? {
            ...tab,
            context: { connectionId },
            connectionName,
            profileId,
          }
        : tab
    ),
  })),

  initializeMainTab: (connectionId: string, connectionName?: string, profileId?: string) => {
    const state = get();
    // Only initialize if main tab doesn't exist
    if (!state.tabs.find((t) => t.id === MAIN_TAB_ID)) {
      const mainTab: QueryTab = {
        id: MAIN_TAB_ID,
        type: 'main',
        title: 'Overview',
        content: '',
        context: { connectionId },
        connectionName,
        profileId,
        isExecuting: false,
        limit: 50,
      };
      set({
        tabs: [mainTab],
        activeTabId: MAIN_TAB_ID,
      });
    }
  },

  addTab: (connectionId: string, connectionName?: string, profileId?: string) => set((state) => {
    // Count only query tabs for naming
    const queryTabsCount = state.tabs.filter((t) => t.type === 'query').length;
    const newTab: QueryTab = {
      id: crypto.randomUUID(),
      type: 'query',
      title: `Query ${queryTabsCount + 1}`,
      content: '',
      context: { connectionId },
      connectionName,
      profileId,
      isExecuting: false,
      limit: 50,
    };
    return {
      tabs: [...state.tabs, newTab],
      activeTabId: newTab.id,
    };
  }),

  closeTab: (id: string) => set((state) => {
    // Cannot close main tab
    if (id === MAIN_TAB_ID) {
      return state;
    }

    const newTabs = state.tabs.filter((t) => t.id !== id);
    let newActiveId = state.activeTabId;
    
    if (state.activeTabId === id) {
      // Find the next tab to activate (prefer previous tab, then main)
      const closedIndex = state.tabs.findIndex((t) => t.id === id);
      if (closedIndex > 0) {
        newActiveId = state.tabs[closedIndex - 1].id;
      } else {
        newActiveId = MAIN_TAB_ID;
      }
    }

    return {
      tabs: newTabs,
      activeTabId: newActiveId,
    };
  }),

  renameTab: (id: string, newTitle: string) => set((state) => ({
    tabs: state.tabs.map((t) => (t.id === id ? { ...t, title: newTitle } : t)),
  })),

  setActiveTab: (id: string) => set({ activeTabId: id }),

  updateTab: (id: string, updates: Partial<QueryTab>) => set((state) => ({
    tabs: state.tabs.map((t) => (t.id === id ? { ...t, ...updates } : t)),
  })),

  setTabContent: (id: string, content: string) => set((state) => ({
    tabs: state.tabs.map((t) => (t.id === id ? { ...t, content } : t)),
  })),

  setTabResults: (id: string, results: TabResult[]) => set((state) => ({
    tabs: state.tabs.map((t) => 
      t.id === id 
        ? { 
            ...t, 
            results,
            activeResultId: results.length > 0 ? results[0].id : undefined
          } 
        : t
    ),
  })),

  setActiveResultTab: (tabId: string, resultId: string) => set((state) => ({
    tabs: state.tabs.map((t) =>
      t.id === tabId ? { ...t, activeResultId: resultId } : t
    ),
  })),

  setResultSelection: (tabId: string, resultId: string, selection: Record<string, boolean>) => set((state) => ({
    tabs: state.tabs.map((t) => {
      if (t.id !== tabId || !t.results) return t;
      return {
        ...t,
        results: t.results.map((r) =>
          r.id === resultId ? { ...r, selection } : r
        ),
      };
    }),
  })),

  clearTabs: () => set({ tabs: [], activeTabId: null }),
}));
