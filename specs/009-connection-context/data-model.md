# Data Model: Fix Connection Context Switching

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md) | **Research**: [research.md](./research.md)  
**Date**: February 2, 2026

## Overview

This document defines the data structures and state management entities required to fix the connection context switching bug. The fix is **entirely frontend-focused** with no backend changes required. The key insight from research is that we need to establish `activeSessionId` as the single source of truth and synchronize all derived state (tab contexts, UI indicators) from it.

---

## State Management Entities (Zustand Stores)

### 1. Session Store (Existing - Enhanced)

**File**: `frontend/src/stores/sessionStore.ts`

The session store manages the global active connection context. This is the **single source of truth** for which database connection is currently active.

```typescript
interface SessionState {
  // --- Existing fields (no changes) ---
  activeSessionId: string | null;           // PRIMARY SOURCE OF TRUTH
  setActiveSessionId: (id: string | null) => void;
  
  isCreatingConnection: boolean;
  setIsCreatingConnection: (isCreating: boolean) => void;
  
  isConnectingSession: boolean;
  setIsConnectingSession: (isConnecting: boolean) => void;
  
  activeContext: {
    database?: string;
    schema?: string;
  } | null;
  setActiveContext: (context: { database?: string; schema?: string } | null) => void;
  
  // --- No new fields needed ---
  // The existing structure is sufficient
}
```

**Key Properties**:
- `activeSessionId`: The ID of the currently active database session (returned from Go backend's `Connect()` method)
- `activeContext`: Additional context like active schema/database within the connection
- `isConnectingSession`: Loading flag to disable UI during connection establishment

**Relationships**:
- `activeSessionId` is the foreign key linking to backend session data
- `activeContext` is derived from user interactions (schema/table selection)
- All components should read from `activeSessionId`, not from derived sources

**Validation Rules**:
- `activeSessionId` must be `null` OR a valid session ID from `GetActiveSessions()`
- When `activeSessionId` is set, it must correspond to an active backend session
- When `activeSessionId` is `null`, no connection is active (show empty state)

---

### 2. Tab Store (Existing - Enhanced)

**File**: `frontend/src/stores/tabStore.ts`

The tab store manages query editor tabs. Each tab has a `context.connectionId` that links it to a specific database connection. The main tab's context must stay synchronized with `activeSessionId`.

```typescript
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
  id: string;               // UUID or '__main__' for the main tab
  type: TabType;            // 'main' for overview, 'query' for SQL query
  title: string;            // e.g., "Overview", "Query 1", "users.sql"
  content: string;          // SQL text (empty for main tab)
  
  // ⚠️ CRITICAL: This context must stay in sync with activeSessionId
  context: {
    connectionId: string;   // MUST match activeSessionId for main tab
    database?: string;
    schema?: string;
  };
  
  connectionName?: string;  // Display name of the connection
  profileId?: string;       // Profile ID for connection lookup
  results?: TabResult[];    // Execution results
  activeResultId?: string;
  isExecuting: boolean;
  error?: string;
  limit: number;            // Default 50
}

interface TabState {
  tabs: QueryTab[];
  activeTabId: string | null;
  
  // --- Existing actions (no signature changes) ---
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
  
  // --- NEW ACTIONS NEEDED ---
  syncMainTabContext: (connectionId: string, connectionName?: string, profileId?: string) => void;
}
```

**New Action: `syncMainTabContext`**

This action updates the main tab's context when the active connection changes:

```typescript
syncMainTabContext: (connectionId: string, connectionName?: string, profileId?: string) => {
  set((state) => ({
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
  }));
}
```

**Key Properties**:
- `context.connectionId`: Links the tab to a specific database session
- For the main tab (Overview), this MUST match `activeSessionId`
- For query tabs, this is set at creation time and remains static (each query tab is bound to one connection)

**Relationships**:
- `tabs[].context.connectionId` → References `sessionState.activeSessionId` (for main tab)
- `tabs[].context.connectionId` → References backend session IDs (for query tabs)

**Validation Rules**:
- Main tab (`MAIN_TAB_ID`) must always exist when there's an active session
- Main tab's `context.connectionId` must always match `activeSessionId`
- Query tabs' `context.connectionId` is immutable after creation
- Cannot close the main tab

---

### 3. Selection Store (Existing - No Changes)

**File**: `frontend/src/stores/selectionStore.ts`

The selection store manages sidebar item selection state (which connection, schema, table, or column is visually selected).

```typescript
interface SelectionState {
  selectedId: string | null;           // e.g., "sessionId|schema|table"
  selectedType: 'connection' | 'database' | 'schema' | 'table' | 'column' | null;
  
  // Actions
  selectItem: (id: string, type: SelectionState['selectedType']) => void;
  clearSelection: () => void;
}
```

**Key Properties**:
- `selectedId`: Composite ID representing the selected sidebar item
- `selectedType`: The type of item selected

**Relationships**:
- `selectedId` is separate from `activeSessionId` (visual selection vs active connection)
- Selecting a table from Connection B should update `activeSessionId` to Connection B's session ID
- Visual selection drives context switches

**No Changes Required**: This store is already working correctly. The bug is in how components respond to selection changes, not in the selection state itself.

---

## Component State Synchronization

### Synchronization Logic (New)

A new custom hook or effect will ensure the main tab stays in sync with `activeSessionId`:

**File**: `frontend/src/hooks/useSyncMainTabContext.ts` (new file)

```typescript
import { useEffect } from 'react';
import { useSessionStore } from '../stores/sessionStore';
import { useTabStore, MAIN_TAB_ID } from '../stores/tabStore';
import { useActiveSessions } from './useConnections';

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
```

**Usage**: This hook should be called in the root layout component (`__root.tsx` or `index.tsx`) to ensure it runs for the entire application lifecycle.

---

## UI Component Data Flow

### Connection Selection Flow

```
User clicks Connection B in sidebar
  ↓
ConnectionItem.onSelect(connectionId) called
  ↓
Sidebar.handleSelectConnection(connectionId)
  ↓
Connect(connectionId) → returns sessionId
  ↓
sessionStore.setActiveSessionId(sessionId)
  ↓
useSyncMainTabContext() effect triggers
  ↓
tabStore.syncMainTabContext(sessionId, name, profileId)
  ↓
Main tab context updated
  ↓
UI re-renders showing Connection B's data
```

### Table Selection Flow

```
User clicks Table X from Connection B
  ↓
MetadataTree.handleSelect(tableName)
  ↓
selectionStore.selectItem(id, 'table')
  ↓
Extract sessionId from selection ID
  ↓
if (currentActiveSessionId !== sessionId)
  sessionStore.setActiveSessionId(sessionId)
  ↓
  useSyncMainTabContext() syncs main tab
  ↓
sessionStore.setActiveContext({ schema, database })
  ↓
UI updates to show Connection B + Table X
```

### New Query Tab Flow

```
User presses Cmd+T
  ↓
handleNewQueryTab() in SqlEditor
  ↓
Read sessionStore.activeSessionId
  ↓
Fetch connection info (name, profileId)
  ↓
tabStore.addTab(activeSessionId, name, profileId)
  ↓
New query tab created with correct connectionId
  ↓
Tab is set as active
  ↓
User can execute queries against Connection B
```

---

## Visual State (CSS)

### Active Connection Indicator

The sidebar connection item needs visual feedback to show which connection is active:

**State Determination**:
```typescript
// In connection-item.tsx
const { data: sessions } = useActiveSessions();
const { activeSessionId } = useSessionStore();

const session = sessions?.find(s => s.profile_id === connection.id);
const isConnected = !!session;
const isActive = session?.id === activeSessionId;
```

**CSS Classes**:
```css
/* connection-item.module.css */

/* Default state - not connected */
.container {
  /* existing styles */
}

/* Connected state - has an active session */
.container.connected {
  /* existing styles */
}

/* Active state - currently selected connection */
.container.active {
  background-color: var(--primary-dim);    /* Subtle background highlight */
  border-left: 3px solid var(--primary);   /* Left accent bar */
}

.container.active .name {
  color: var(--primary-fg);
  font-weight: 600;
}

.container.active .statusDot {
  box-shadow: 0 0 8px var(--primary);      /* Glow effect */
}
```

**Applied Classes**:
```tsx
<div className={`
  ${styles.container}
  ${isConnected ? styles.connected : ''}
  ${isActive ? styles.active : ''}
`}>
```

---

## Data Validation & Invariants

### Invariants to Maintain

1. **Single Source of Truth**:
   - `sessionStore.activeSessionId` is the ONLY authoritative source for the active connection
   - All UI components MUST read from `activeSessionId`, not from derived state

2. **Main Tab Context Sync**:
   - When `activeSessionId` changes, main tab's `context.connectionId` MUST update
   - This happens automatically via `useSyncMainTabContext()` effect

3. **Tab-Session Binding**:
   - Query tabs are created with a specific `context.connectionId`
   - This binding is immutable for the tab's lifetime
   - Main tab's binding is mutable and tracks `activeSessionId`

4. **Session Validation**:
   - `activeSessionId` must be `null` OR exist in `GetActiveSessions()` results
   - If session is disconnected/deleted, `activeSessionId` must be cleared

5. **Visual Consistency**:
   - Only ONE connection in the sidebar can have the `active` class at a time
   - The connection with `session.id === activeSessionId` gets the `active` class

### Error States

| Error Condition | Handling Strategy |
|-----------------|-------------------|
| `activeSessionId` set but session doesn't exist | Clear `activeSessionId`, show empty state |
| Main tab deleted | Recreate main tab with current `activeSessionId` |
| Connection disconnected while active | Clear `activeSessionId`, clear tabs, show empty state |
| Rapid connection switching | Use `isConnectingSession` flag to disable UI during switch |

---

## Backend Entities (No Changes)

The backend Go code requires **no modifications**. The existing structures are sufficient:

### Session (Go - Read Only)

```go
// internal/connection/models.go
type Session struct {
    ID          string    `json:"id"`           // UUID
    ProfileID   string    `json:"profile_id"`   // Reference to connection profile
    ProfileName string    `json:"profile_name"` // Display name
    Driver      string    `json:"driver"`       // mysql, postgres, sqlite
    ConnectedAt time.Time `json:"connected_at"`
}
```

### Connection Service Methods (Go - No Changes)

```go
// internal/connection/service.go
func (s *ConnectionService) Connect(profileID string) (string, error)
func (s *ConnectionService) Disconnect(sessionID string) error
func (s *ConnectionService) GetActiveSessions() ([]*Session, error)
func (s *ConnectionService) ExecuteQuery(sessionID, query string, limit int) (*QueryResult, error)
```

These methods are already correct and working. The bug is purely in the React frontend state management.

---

## Summary

### Entities Modified

1. **SessionStore**: No schema changes, but usage patterns change (becomes SSOT)
2. **TabStore**: Add `syncMainTabContext()` action to update main tab's context
3. **SelectionStore**: No changes required

### New Entities

1. **useSyncMainTabContext()**: New custom hook to synchronize main tab with activeSessionId
2. **CSS Active State**: New `.active` class for visual feedback

### No Backend Changes

All fixes are contained to the frontend React layer. Backend session management is working correctly.

### Key Relationships

```
sessionStore.activeSessionId (SSOT)
  ↓ sync via useSyncMainTabContext()
tabStore.tabs[MAIN_TAB].context.connectionId
  ↓ used by
UI components (overview, metadata tree, query editor)
```

This architecture ensures that changing `activeSessionId` automatically propagates to all dependent state and UI components.
