# Quickstart Guide: Fix Connection Context Switching

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)  
**For**: Developers implementing the connection context switching fix  
**Est. Time**: 2-4 hours

## Overview

This quickstart walks you through fixing the connection context switching bug in Datra. The bug causes the application to always show the first connection's data regardless of which connection is selected in the sidebar. The fix involves synchronizing the main tab's context with the active session ID.

**What You'll Build**:
1. A new `syncMainTabContext()` action in the tab store
2. A custom hook `useSyncMainTabContext()` to automatically sync the main tab
3. Updated click handlers to properly set the active session ID
4. Visual indicators showing which connection is active
5. Fixed new query tab creation to use the correct connection

---

## Prerequisites

- Datra repository cloned and set up
- Development environment running (`wails dev`)
- Basic understanding of:
  - React hooks (`useEffect`, `useCallback`)
  - Zustand state management
  - TypeScript interfaces

---

## Step 1: Add `syncMainTabContext` to TabStore

**File**: `frontend/src/stores/tabStore.ts`

**What**: Add a new action to update the main tab's connection context

**Why**: The main tab's `context.connectionId` needs to stay in sync with `activeSessionId`

### Implementation

1. Open `frontend/src/stores/tabStore.ts`

2. Add the new action to the `TabState` interface:

```typescript
interface TabState {
  // ... existing fields ...
  
  // NEW ACTION
  syncMainTabContext: (connectionId: string, connectionName?: string, profileId?: string) => void;
}
```

3. Implement the action in the Zustand store:

```typescript
export const useTabStore = create<TabState>((set, get) => ({
  // ... existing state and actions ...
  
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
  },
}));
```

**Expected Result**: The tab store now has a method to update the main tab's context.

---

## Step 2: Create the Sync Hook

**File**: `frontend/src/hooks/useSyncMainTabContext.ts` (new file)

**What**: Create a custom hook that automatically syncs the main tab when `activeSessionId` changes

**Why**: This ensures the main tab always reflects the currently active connection

### Implementation

1. Create a new file `frontend/src/hooks/useSyncMainTabContext.ts`

2. Add the following code:

```typescript
import { useEffect } from 'react';
import { useSessionStore } from '../stores/sessionStore';
import { useTabStore, MAIN_TAB_ID } from '../stores/tabStore';
import { useActiveSessions } from './useConnections';

/**
 * Synchronizes the main tab's connection context with the active session ID.
 * This hook should be called once in the root layout component.
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
      // It will be initialized when the connection is established
      return;
    }

    // Check if main tab's context is out of sync
    if (mainTab.context.connectionId !== activeSessionId) {
      console.log(`Syncing main tab context: ${mainTab.context.connectionId} -> ${activeSessionId}`);
      
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

**Expected Result**: A reusable hook that watches for `activeSessionId` changes and syncs the main tab.

---

## Step 3: Use the Sync Hook in Root Layout

**File**: `frontend/src/routes/__root.tsx` OR `frontend/src/routes/index.tsx`

**What**: Call `useSyncMainTabContext()` in the root layout component

**Why**: The hook needs to run for the entire application lifecycle

### Implementation

1. Open `frontend/src/routes/index.tsx` (or wherever your root layout is)

2. Import the hook:

```typescript
import { useSyncMainTabContext } from '../hooks/useSyncMainTabContext';
```

3. Call it at the top of your component:

```typescript
function HomeComponent() {
  // ADD THIS LINE
  useSyncMainTabContext();
  
  // ... rest of component code ...
}
```

**Expected Result**: The sync hook now runs automatically whenever the component renders.

---

## Step 4: Fix Sidebar Connection Click Handler

**File**: `frontend/src/components/sidebar/sidebar.tsx`

**What**: Ensure clicking a connection properly updates `activeSessionId`

**Why**: The sidebar handler must trigger the sync by updating the source of truth

### Implementation

1. Open `frontend/src/components/sidebar/sidebar.tsx`

2. Locate the `handleSelectConnection` function (around line 28)

3. Ensure it follows this pattern:

```typescript
const handleSelectConnection = async (id: string) => {
  setIsConnectingSession(true);
  try {
    const sessionId = await Connect(id);
    setActiveSessionId(sessionId); // This triggers useSyncMainTabContext()
    
    const connection = connections.find((c) => c.id === id);
    
    // Initialize main tab if it doesn't exist
    const mainTab = tabs.find(t => t.id === MAIN_TAB_ID);
    if (!mainTab) {
      initializeMainTab(sessionId, connection?.name, id);
    }
    // Otherwise, useSyncMainTabContext() will sync it automatically
    
    navigate({ to: "/" });
  } catch (err) {
    console.error("Failed to connect from sidebar:", err);
  } finally {
    setIsConnectingSession(false);
  }
};
```

**Expected Result**: Clicking a connection in the sidebar now triggers the sync effect.

---

## Step 5: Fix Table Click in Metadata Tree

**File**: `frontend/src/components/connections/MetadataTree.tsx`

**What**: Update table click handler to switch `activeSessionId` when clicking tables from different connections

**Why**: Clicking a table should switch to that table's connection if it's not already active

### Implementation

1. Open `frontend/src/components/connections/MetadataTree.tsx`

2. Locate the `handleSelect` function in the `TableList` component (around line 94)

3. Update it to check and update `activeSessionId`:

```typescript
const handleSelect = async (name: string, e: React.MouseEvent) => {
  e.stopPropagation();
  const id = `${sessionId}|${schema}|${name}`;
  selectItem(id, "table");

  // Check if we need to switch to a different connection
  if (activeSessionId !== sessionId) {
    console.log(`Switching active session: ${activeSessionId} -> ${sessionId}`);
    setActiveSessionId(sessionId); // Triggers sync
  }

  // Update active context (schema/database)
  setActiveContext({ schema, database: undefined });
  
  // Ensure main tab is active to show the table
  setActiveTab(MAIN_TAB_ID);
};
```

**Expected Result**: Clicking a table from a different connection switches the active connection.

---

## Step 6: Fix New Query Tab Creation

**File**: `frontend/src/components/editor/SqlEditor.tsx` OR `frontend/src/components/editor/SqlEditorTabs.tsx`

**What**: Ensure new query tabs read from `activeSessionId` instead of active tab's context

**Why**: The bug was caused by reading from stale tab context

### Implementation

1. Open `frontend/src/components/editor/SqlEditor.tsx`

2. Locate where new tabs are created (keyboard shortcuts or button clicks)

3. Update to read from `activeSessionId`:

```typescript
const { activeSessionId } = useSessionStore(); // Add this
const { data: profiles } = useProfiles();
const { addTab } = useTabStore();

const handleNewQueryTab = useCallback(async () => {
  if (!activeSessionId) {
    console.warn("No active session to create query tab");
    return;
  }
  
  try {
    const sessions = await GetActiveSessions();
    const session = sessions.find(s => s.id === activeSessionId);
    const profile = profiles?.find(p => p.id === session?.profile_id);
    
    // Use activeSessionId, not tab context
    addTab(activeSessionId, profile?.name, session?.profile_id);
  } catch (err) {
    console.error("Failed to create query tab:", err);
  }
}, [activeSessionId, addTab, profiles]);

// Register keyboard shortcuts
useHotkeys('mod+t', handleNewQueryTab, [handleNewQueryTab]);
useHotkeys('mod+n', handleNewQueryTab, [handleNewQueryTab]);
```

**Expected Result**: New query tabs are created in the context of the currently active connection.

---

## Step 7: Add Visual Active State

**File**: `frontend/src/components/sidebar/connection-item.tsx`

**What**: Add visual indicator showing which connection is active

**Why**: Users need visual feedback to know which connection they're working with

### Implementation

1. Open `frontend/src/components/sidebar/connection-item.tsx`

2. Import `useSessionStore`:

```typescript
import { useSessionStore } from '../../stores/sessionStore';
```

3. In the component, determine if this connection is active:

```typescript
export function ConnectionItem({ connection, onSelect }: ConnectionItemProps) {
  // ... existing hooks ...
  const { activeSessionId } = useSessionStore(); // ADD THIS
  
  const session = sessions?.find((s) => s.profile_id === connection.id);
  const isConnected = !!session;
  const isActive = session?.id === activeSessionId; // ADD THIS
  
  // ... rest of component ...
}
```

4. Apply the active class to the container:

```typescript
<div className={`
  ${styles.container}
  ${isConnected ? styles.connected : ''}
  ${isActive ? styles.active : ''}
`}>
```

5. Open `frontend/src/components/sidebar/connection-item.module.css`

6. Add the `.active` class styles:

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

**Expected Result**: The active connection has a highlighted background and accent border.

---

## Step 8: Test the Fix

### Manual Testing Checklist

1. **Connection Switching**:
   - [ ] Connect to Connection A
   - [ ] Verify overview shows Connection A's data
   - [ ] Connect to Connection B
   - [ ] Click Connection B in sidebar
   - [ ] Verify overview updates to show Connection B's data
   - [ ] Click Connection A in sidebar
   - [ ] Verify overview switches back to Connection A

2. **Table Selection**:
   - [ ] Expand Connection A's tables
   - [ ] Expand Connection B's tables
   - [ ] Click a table from Connection B while viewing Connection A
   - [ ] Verify app switches to Connection B and shows the selected table

3. **Query Tab Creation**:
   - [ ] Select Connection A
   - [ ] Press Cmd+T (or Ctrl+T on Windows/Linux)
   - [ ] Verify new query tab is associated with Connection A
   - [ ] Switch to Connection B
   - [ ] Press Cmd+N
   - [ ] Verify new query tab is associated with Connection B
   - [ ] Execute queries in both tabs
   - [ ] Verify queries run against their respective connections

4. **Visual Indicators**:
   - [ ] With multiple connections, verify only one has the active highlight
   - [ ] Click different connections
   - [ ] Verify the active highlight moves to the clicked connection

5. **Edge Cases**:
   - [ ] Disconnect the active connection
   - [ ] Verify `activeSessionId` is cleared and UI shows empty state
   - [ ] Connect to 5 different connections
   - [ ] Switch rapidly between them
   - [ ] Verify no visual glitches or wrong data displays

---

## Troubleshooting

### Issue: Main tab not updating when switching connections

**Solution**: Ensure `useSyncMainTabContext()` is called in the root layout component, not inside a nested component that might unmount.

### Issue: New query tabs still opening in wrong connection

**Solution**: Verify you're reading from `useSessionStore().activeSessionId` and not from `activeTab?.context?.connectionId`.

### Issue: Active visual indicator not showing

**Solution**: Check that:
1. `isActive` is calculated correctly: `session?.id === activeSessionId`
2. The CSS `.active` class is defined in the stylesheet
3. The class is applied to the container: `${isActive ? styles.active : ''}`

### Issue: Console shows "Syncing main tab context" repeatedly

**Solution**: This is expected when switching connections. If it loops infinitely, check that `syncMainTabContext` doesn't trigger a state change that causes `activeSessionId` to update.

---

## Verification

After implementing all steps, your application should:

✅ Display the correct connection's data when switching connections in the sidebar  
✅ Switch connections when clicking tables from different connections  
✅ Create new query tabs in the context of the currently active connection  
✅ Show a visual indicator for which connection is active  
✅ Handle rapid connection switching without errors  
✅ Gracefully handle disconnections and deletions

---

## Next Steps

After completing this quickstart and verifying the fix works:

1. Run the full manual testing checklist
2. Test with real database connections (MySQL, PostgreSQL, SQLite)
3. Test with 5+ simultaneous connections
4. Submit a pull request with:
   - Description of the fix
   - Manual testing results
   - Screenshots showing the visual indicator

---

## Estimated Time

- Step 1: 10 minutes
- Step 2: 15 minutes
- Step 3: 5 minutes
- Step 4: 10 minutes
- Step 5: 10 minutes
- Step 6: 15 minutes
- Step 7: 15 minutes
- Step 8: 30-60 minutes (thorough testing)

**Total: 2-2.5 hours** (implementation) + **30-60 minutes** (testing) = **2.5-4 hours**

---

## Success Criteria

You've successfully fixed the bug when:

- ✅ SC-001: Connection switches complete within 500ms
- ✅ SC-002: 100% of switches display the correct connection's data
- ✅ SC-003: New query tabs always execute against the correct connection
- ✅ SC-004: Application supports 5+ simultaneous connections
- ✅ SC-005: No stale data or incorrect displays when switching between 10 connections
- ✅ SC-006: Active connection indicator is always accurate

Happy coding! 🚀
