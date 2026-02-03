# Frontend State Management Contracts

**Feature**: Fix Connection Context Switching  
**Date**: February 2, 2026

This document defines the contracts (interfaces and actions) for the Zustand state stores that will be modified or created to fix the connection context switching bug.

---

## SessionStore Contract

**File**: `frontend/src/stores/sessionStore.ts`

### State Shape

```typescript
interface SessionState {
  // Active connection context (SINGLE SOURCE OF TRUTH)
  activeSessionId: string | null;
  
  // Connection establishment flags
  isCreatingConnection: boolean;
  isConnectingSession: boolean;
  
  // Schema/database context within the active connection
  activeContext: {
    database?: string;
    schema?: string;
  } | null;
  
  // Actions
  setActiveSessionId: (id: string | null) => void;
  setIsCreatingConnection: (isCreating: boolean) => void;
  setIsConnectingSession: (isConnecting: boolean) => void;
  setActiveContext: (context: { database?: string; schema?: string } | null) => void;
}
```

### Action Contracts

#### `setActiveSessionId(id: string | null): void`

**Purpose**: Update the active database session (primary source of truth)

**Parameters**:
- `id`: Session ID from backend's `Connect()` method, or `null` to clear

**Behavior**:
- Sets `activeSessionId` to the provided value
- Triggers re-renders in all components subscribing to `activeSessionId`
- Should trigger tab context synchronization via `useSyncMainTabContext()` effect

**Preconditions**:
- If `id` is not `null`, it should correspond to an active backend session
- If setting to `null`, caller should also clear tabs via `tabStore.clearTabs()`

**Postconditions**:
- `activeSessionId` is updated
- All dependent UI components re-render with new context
- Main tab context will be synced by the effect hook

**Example Usage**:
```typescript
const { setActiveSessionId } = useSessionStore();
const sessionId = await Connect(profileId);
setActiveSessionId(sessionId);
```

---

#### `setActiveContext(context: { database?: string; schema?: string } | null): void`

**Purpose**: Update the active schema/database within the current connection

**Parameters**:
- `context`: Object with optional `database` and `schema` fields, or `null` to clear

**Behavior**:
- Sets `activeContext` to the provided value
- Used to track which schema/database is selected in the metadata tree
- Displayed in the status bar and query context

**Preconditions**:
- Should only be called when there's an active session (`activeSessionId` is not `null`)

**Postconditions**:
- `activeContext` is updated
- Status bar and query context UI reflect the new context

**Example Usage**:
```typescript
const { setActiveContext } = useSessionStore();
// User clicks on schema "public"
setActiveContext({ schema: 'public' });
```

---

## TabStore Contract

**File**: `frontend/src/stores/tabStore.ts`

### State Shape

```typescript
export type TabType = 'main' | 'query';
export const MAIN_TAB_ID = '__main__';

export interface QueryTab {
  id: string;
  type: TabType;
  title: string;
  content: string;
  context: {
    connectionId: string;
    database?: string;
    schema?: string;
  };
  connectionName?: string;
  profileId?: string;
  results?: TabResult[];
  activeResultId?: string;
  isExecuting: boolean;
  error?: string;
  limit: number;
}

interface TabState {
  tabs: QueryTab[];
  activeTabId: string | null;
  
  // Existing actions (no changes to signatures)
  initializeMainTab: (connectionId: string, connectionName?: string, profileId?: string) => void;
  addTab: (connectionId: string, connectionName?: string, profileId?: string) => void;
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  updateTab: (id: string, updates: Partial<QueryTab>) => void;
  // ... other existing actions
  
  // NEW ACTION
  syncMainTabContext: (connectionId: string, connectionName?: string, profileId?: string) => void;
}
```

### New Action Contract

#### `syncMainTabContext(connectionId: string, connectionName?: string, profileId?: string): void`

**Purpose**: Update the main tab's connection context when the active connection changes

**Parameters**:
- `connectionId` (required): The new session ID to bind the main tab to
- `connectionName` (optional): Display name of the connection
- `profileId` (optional): Connection profile ID for lookup

**Behavior**:
- Finds the main tab (ID === `MAIN_TAB_ID`)
- Updates its `context.connectionId`, `connectionName`, and `profileId`
- Does NOT change other tabs (query tabs remain bound to their original connections)
- If main tab doesn't exist, does nothing (should never happen in normal flow)

**Preconditions**:
- Main tab must exist in the tabs array
- `connectionId` should be a valid active session ID

**Postconditions**:
- Main tab's `context.connectionId` matches `connectionId`
- Main tab's `connectionName` and `profileId` are updated
- Other tabs are unchanged

**Example Usage**:
```typescript
const { syncMainTabContext } = useTabStore();
// When active session changes
syncMainTabContext('session-123', 'Production DB', 'profile-456');
```

**Implementation**:
```typescript
syncMainTabContext: (connectionId, connectionName, profileId) => {
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

---

### Modified Action Behavior

#### `addTab(connectionId: string, connectionName?: string, profileId?: string): void`

**Current Behavior**: Creates a new query tab bound to a connection

**Required Change**: Must read `connectionId` from `sessionStore.activeSessionId` instead of from the active tab's context

**Updated Implementation Pattern**:
```typescript
// ❌ OLD (broken): Read from active tab's context
const activeTab = tabs.find(t => t.id === activeTabId);
const connectionId = activeTab?.context?.connectionId; // May be stale!

// ✅ NEW (fixed): Read from sessionStore
const activeSessionId = useSessionStore.getState().activeSessionId;
if (!activeSessionId) return; // No active session
addTab(activeSessionId, connectionName, profileId);
```

---

## Custom Hook Contract

### useSyncMainTabContext Hook

**File**: `frontend/src/hooks/useSyncMainTabContext.ts` (new file)

#### Function Signature

```typescript
export function useSyncMainTabContext(): void
```

**Purpose**: Synchronize the main tab's connection context with the active session ID

**Parameters**: None (hook reads from stores directly)

**Returns**: `void` (side effects only)

**Behavior**:
- Subscribes to `sessionStore.activeSessionId`, `tabStore.tabs`, and `useActiveSessions()` data
- When `activeSessionId` changes and main tab exists:
  - Checks if main tab's `context.connectionId` matches `activeSessionId`
  - If not, calls `tabStore.syncMainTabContext()` to update it
  - Sets the main tab as active via `setActiveTab(MAIN_TAB_ID)`
- If `activeSessionId` is `null`, does nothing (no active session)

**Dependencies**:
- `sessionStore.activeSessionId`
- `tabStore.tabs`, `tabStore.syncMainTabContext`, `tabStore.setActiveTab`
- `useActiveSessions()` hook for session metadata

**Usage Pattern**:
```typescript
// In the root layout component (__root.tsx or index.tsx)
import { useSyncMainTabContext } from '../hooks/useSyncMainTabContext';

export function RootLayout() {
  // This runs for the entire application lifecycle
  useSyncMainTabContext();
  
  return (
    <div>
      <Sidebar />
      <MainContent />
    </div>
  );
}
```

**Effect Dependencies**:
```typescript
useEffect(() => {
  // Sync logic
}, [activeSessionId, tabs, sessions, syncMainTabContext, setActiveTab]);
```

---

## Component Click Handler Contracts

### Sidebar Connection Click Handler

**File**: `frontend/src/components/sidebar/sidebar.tsx`

#### `handleSelectConnection(id: string): Promise<void>`

**Purpose**: Handle user clicking a connection in the sidebar to switch to it

**Parameters**:
- `id`: Connection profile ID (NOT session ID)

**Behavior**:
1. Set `isConnectingSession` flag to `true` (disables UI)
2. Call backend `Connect(id)` to get or create a session
3. Update `sessionStore.setActiveSessionId(sessionId)`
4. Initialize main tab if it doesn't exist
5. Navigate to home route (`"/"`)
6. Set `isConnectingSession` to `false`

**Contract**:
```typescript
const handleSelectConnection = async (id: string): Promise<void> => {
  setIsConnectingSession(true);
  try {
    const sessionId = await Connect(id);
    setActiveSessionId(sessionId); // Triggers useSyncMainTabContext()
    
    const connection = connections.find(c => c.id === id);
    
    // Initialize main tab if it doesn't exist
    const mainTab = tabs.find(t => t.id === MAIN_TAB_ID);
    if (!mainTab) {
      initializeMainTab(sessionId, connection?.name, id);
    }
    // Otherwise, useSyncMainTabContext() will sync it
    
    navigate({ to: "/" });
  } catch (err) {
    console.error("Failed to connect:", err);
    // Show error notification
  } finally {
    setIsConnectingSession(false);
  }
};
```

---

### Metadata Tree Table Click Handler

**File**: `frontend/src/components/connections/MetadataTree.tsx`

#### `handleSelect(tableName: string, e: React.MouseEvent): Promise<void>`

**Purpose**: Handle user clicking a table in the metadata tree

**Parameters**:
- `tableName`: Name of the table clicked
- `e`: Mouse event (for `stopPropagation`)

**Behavior**:
1. Update selection store with table ID
2. Check if table belongs to a different connection than currently active
3. If different, switch `activeSessionId` to the table's session
4. Update `activeContext` with schema/database
5. Ensure main tab is displayed

**Contract**:
```typescript
const handleSelect = async (name: string, e: React.MouseEvent): Promise<void> => {
  e.stopPropagation();
  
  const id = `${sessionId}|${schema}|${name}`;
  selectItem(id, "table");
  
  // Check if we need to switch connections
  if (activeSessionId !== sessionId) {
    setActiveSessionId(sessionId); // Triggers context sync
  }
  
  // Update active context (schema/database within connection)
  setActiveContext({ schema, database: undefined });
  
  // Ensure main tab is active
  setActiveTab(MAIN_TAB_ID);
};
```

---

### New Query Tab Keyboard Shortcut Handler

**File**: `frontend/src/components/editor/SqlEditor.tsx`

#### `handleNewQueryTab(): void`

**Purpose**: Handle keyboard shortcuts (Cmd+T, Cmd+N) to create a new query tab

**Parameters**: None

**Behavior**:
1. Read `activeSessionId` from session store
2. If no active session, do nothing (or show notification)
3. Fetch session info to get connection name
4. Call `addTab(activeSessionId, connectionName, profileId)`

**Contract**:
```typescript
const handleNewQueryTab = useCallback(async () => {
  const { activeSessionId } = useSessionStore.getState();
  
  if (!activeSessionId) {
    console.warn("No active session to create query tab");
    return;
  }
  
  try {
    const sessions = await GetActiveSessions();
    const session = sessions.find(s => s.id === activeSessionId);
    const profile = profiles?.find(p => p.id === session?.profile_id);
    
    addTab(activeSessionId, profile?.name, session?.profile_id);
  } catch (err) {
    console.error("Failed to create query tab:", err);
  }
}, [addTab, profiles]);

// Register shortcuts
useHotkeys('mod+t', handleNewQueryTab, [handleNewQueryTab]);
useHotkeys('mod+n', handleNewQueryTab, [handleNewQueryTab]);
```

---

## CSS Contract

### Active Connection Indicator Styles

**File**: `frontend/src/components/sidebar/connection-item.module.css`

#### `.active` Class

**Purpose**: Visually indicate which connection is currently active

**Applied When**: `session?.id === activeSessionId`

**Style Rules**:
```css
.container.active {
  background-color: var(--primary-dim);
  border-left: 3px solid var(--primary);
}

.container.active .name {
  color: var(--primary-fg);
  font-weight: 600;
}

.container.active .statusDot {
  box-shadow: 0 0 8px var(--primary);
}
```

**Application in Component**:
```tsx
const isActive = session?.id === activeSessionId;

<div className={`
  ${styles.container}
  ${isConnected ? styles.connected : ''}
  ${isActive ? styles.active : ''}
`}>
```

---

## Backend Contracts (No Changes Required)

The backend Go API contracts remain unchanged. All existing methods work correctly:

- `Connect(profileID string) (string, error)`: Returns session ID
- `Disconnect(sessionID string) error`: Disconnects session
- `GetActiveSessions() ([]*Session, error)`: Lists active sessions
- `ExecuteQuery(sessionID, query string, limit int) (*QueryResult, error)`: Executes query

No new backend endpoints or changes to existing ones are needed.

---

## Contract Summary

### New Contracts
1. `TabStore.syncMainTabContext()` - Sync main tab context
2. `useSyncMainTabContext()` - Effect hook for automatic sync
3. CSS `.active` class - Visual active state

### Modified Contracts
1. `Sidebar.handleSelectConnection()` - Must update activeSessionId
2. `MetadataTree.handleSelect()` - Must switch activeSessionId if needed
3. `SqlEditor.handleNewQueryTab()` - Must read activeSessionId, not tab context

### Unchanged Contracts
1. All backend Go methods (no changes)
2. `SessionStore` state shape (existing fields sufficient)
3. `SelectionStore` (no changes)

This contract specification ensures all components correctly implement the state synchronization pattern to fix the connection context switching bug.
