# Research: Fix Connection Context Switching

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)  
**Date**: February 2, 2026  
**Status**: Complete

## Research Overview

This document consolidates the research findings for fixing the connection context switching bug in Datra. The investigation focused on understanding the root cause of why clicking different connections in the sidebar always displays the first connection's data, and identifying the best patterns for fixing this issue in the React + Zustand + Wails architecture.

---

## 1. Root Cause Analysis

### Decision: Identified State Synchronization Bug

**What was investigated**:
- Examined the current state management architecture using Zustand stores
- Traced the data flow from sidebar clicks to UI updates
- Analyzed how `activeSessionId` is being set and consumed across components

**Root Cause Identified**:

The bug occurs because of **stale closure captures and inconsistent state reads** across multiple components:

1. **ConnectionItem click handler** (`connection-item.tsx:153-177`):
   - When clicking a connection, `onSelect(connection.id)` is called
   - This triggers `handleSelectConnection` in `sidebar.tsx` or `index.tsx`
   - The handler calls `Connect(id)` and `setActiveSessionId(sessionId)`
   - **✅ This part works correctly**

2. **Main Tab Context is Static** (`tabStore.ts:60-75`):
   - The main tab is initialized once with `initializeMainTab(connectionId, ...)`
   - The tab's `context.connectionId` field is set at creation time
   - **❌ Problem**: When switching connections, the main tab's context is NOT updated
   - The overview/main view reads from `tabs.find(t => t.id === MAIN_TAB_ID).context.connectionId`
   - This always returns the **first connection's ID** that was used to initialize the tab

3. **Query Tab Creation** (`SqlEditor.tsx` + `tabStore.ts:77-97`):
   - New query tabs are created with `addTab(connectionId, ...)`
   - The `connectionId` parameter comes from the active tab's context
   - **❌ Problem**: If the active tab is the main tab with stale context, new queries get the wrong connection
   - The code reads `activeTab?.context?.connectionId` which may be stale

4. **Metadata Tree Table Clicks** (`MetadataTree.tsx:94-130`):
   - Table selection has logic to switch sessions if needed
   - **❌ Problem**: It switches tabs but doesn't update `activeSessionId` consistently
   - The logic tries to find a matching tab instead of treating `activeSessionId` as the single source of truth

**Rationale**:
- The Zustand store `activeSessionId` is being updated correctly
- However, components are reading from derived state (`tab.context.connectionId`) which becomes stale
- The architecture has **two competing sources of truth**: `activeSessionId` (dynamic) vs `tab.context.connectionId` (static)

**Alternatives Considered**:
- ❌ **Backend fix**: Considered if sessions weren't being tracked correctly in Go, but `SessionManager` is working fine
- ❌ **Full rewrite**: Considered redesigning the entire state architecture, but this is overkill for a synchronization bug
- ✅ **Synchronize state reads**: Make `activeSessionId` the single source of truth and update tab contexts when switching

---

## 2. React + Zustand State Management Best Practices

### Decision: Use Single Source of Truth Pattern with Derived State

**What was investigated**:
- Zustand documentation for state management patterns
- React best practices for avoiding stale closures
- How to properly synchronize multiple state slices

**Best Practice Identified**:

**Single Source of Truth (SSOT)**:
```typescript
// ❌ WRONG: Multiple sources of truth
const activeSessionId = useSessionStore(state => state.activeSessionId);
const activeTab = useTabStore(state => state.tabs.find(t => t.id === state.activeTabId));
const connectionId = activeTab?.context?.connectionId; // May be stale!

// ✅ CORRECT: Single source of truth
const activeSessionId = useSessionStore(state => state.activeSessionId);
// Use activeSessionId directly, or derive state that updates when it changes
```

**Tab Context as Derived State**:
Instead of storing `connectionId` in each tab and hoping it stays in sync, we should either:
1. Store only the `activeSessionId` in a single place and tabs reference it
2. Add a `syncMainTabContext(connectionId)` action that updates the main tab when switching
3. Have tabs read from `activeSessionId` for their connection context

**Rationale**:
- Zustand is excellent for managing global state, but requires discipline to avoid duplication
- React's closure-based hooks can capture stale values if state is duplicated
- The fix should minimize state duplication and ensure all components read from the same source

**Alternatives Considered**:
- **Redux-style actions**: Too heavyweight for this simple synchronization issue
- **Context API**: Zustand is already in use and working well
- **Component-local state**: Doesn't solve the cross-component synchronization problem

**Implementation Strategy**:
1. Keep `activeSessionId` in `sessionStore` as the SSOT
2. Update `tabStore` to have a `updateMainTabContext(connectionId)` action
3. Call `updateMainTabContext` whenever `activeSessionId` changes
4. Ensure all "create new tab" logic reads from `activeSessionId`, not derived tab context

---

## 3. Sidebar Click Handler Patterns

### Decision: Use Effect Hook to Sync Tab Context with Active Session

**What was investigated**:
- How sidebar click handlers currently update state
- React patterns for responding to state changes
- How to ensure tab context stays synchronized with activeSessionId

**Pattern to Implement**:

```typescript
// In a component or custom hook that watches activeSessionId
useEffect(() => {
  if (activeSessionId) {
    // Find the main tab
    const mainTab = tabs.find(t => t.id === MAIN_TAB_ID);
    
    // If main tab exists and its context is outdated, update it
    if (mainTab && mainTab.context.connectionId !== activeSessionId) {
      updateTab(MAIN_TAB_ID, {
        context: { connectionId: activeSessionId }
      });
    }
    
    // If main tab is active, ensure it stays active (or switch to it)
    if (activeTabId !== MAIN_TAB_ID) {
      setActiveTab(MAIN_TAB_ID);
    }
  }
}, [activeSessionId, tabs, activeTabId]);
```

**Click Handler Pattern**:
```typescript
const handleSelectConnection = async (id: string) => {
  setIsConnectingSession(true);
  try {
    const sessionId = await Connect(id); // Get session ID from backend
    setActiveSessionId(sessionId);       // Update SSOT
    // The useEffect above will sync the main tab context
    navigate({ to: "/" });               // Navigate to home/overview
  } catch (err) {
    console.error("Failed to connect:", err);
  } finally {
    setIsConnectingSession(false);
  }
};
```

**Rationale**:
- Separates concerns: click handler updates the source of truth, effect syncs derived state
- Prevents race conditions and duplicate logic across multiple components
- Makes the synchronization logic explicit and testable

**Alternatives Considered**:
- **Inline sync in click handler**: Would need to be duplicated in every handler (sidebar, table clicks, etc.)
- **Selector-based derivation**: Would require refactoring all consumers to use selectors
- **Event emitter**: Too complex for a simple state synchronization need

---

## 4. Visual Active Connection Indicators

### Decision: Add CSS-based Active State to Sidebar Connection Items

**What was investigated**:
- Current styling in `connection-item.module.css`
- How other IDE tools (VS Code, DBeaver) show active items
- Accessibility requirements for visual indicators

**Implementation Pattern**:

```css
/* connection-item.module.css */
.container.active {
  background-color: var(--primary);
  border-left: 3px solid var(--primary-bright);
}

.container.active .name {
  color: var(--primary-fg);
  font-weight: 600;
}

.container.active .statusDot {
  border-color: var(--primary-bright);
}
```

```tsx
// connection-item.tsx
const isActive = session?.id === activeSessionId;

<div className={`${styles.container} ${isConnected ? styles.connected : ""} ${isActive ? styles.active : ""}`}>
  {/* ... */}
</div>
```

**Rationale**:
- Visual feedback is critical for IDE-style applications (Constitution Principle IV)
- Users need immediate visual confirmation of which connection is active
- CSS-based solution is performant and doesn't require JavaScript state

**Alternatives Considered**:
- **Icon-based indicator**: Considered using a checkmark icon, but this adds visual clutter
- **Color change only**: Not sufficient for accessibility (needs multiple visual cues)
- **Tooltip only**: Not sufficient, users need at-a-glance awareness

---

## 5. Query Tab Binding to Connection Context

### Decision: Read activeSessionId When Creating New Tabs

**What was investigated**:
- Current new tab creation logic in `SqlEditor.tsx` and `SqlEditorTabs.tsx`
- Keyboard shortcut handlers for Cmd+T and Cmd+N
- How query results are associated with connections

**Implementation Pattern**:

```typescript
// SqlEditor.tsx or where keyboard shortcuts are handled
const { activeSessionId } = useSessionStore();
const { data: profiles } = useProfiles();
const { addTab } = useTabStore();

const handleNewQueryTab = useCallback(() => {
  if (!activeSessionId) {
    console.warn("No active session to create query tab");
    return;
  }
  
  // Find the connection/profile name for display
  const sessions = await GetActiveSessions();
  const session = sessions.find(s => s.id === activeSessionId);
  const profile = profiles?.find(p => p.id === session?.profile_id);
  
  // Create tab bound to the active session
  addTab(activeSessionId, profile?.name, session?.profile_id);
}, [activeSessionId, profiles, addTab]);

// Register keyboard shortcuts
useHotkeys('mod+t', handleNewQueryTab, [handleNewQueryTab]);
useHotkeys('mod+n', handleNewQueryTab, [handleNewQueryTab]);
```

**Rationale**:
- Query tabs must be bound to the connection that was active when created
- Reading from `activeSessionId` ensures we always get the current context
- This fixes the bug where new tabs always open in the first connection

**Alternatives Considered**:
- **Read from active tab's context**: This is the current broken approach
- **Prompt user for connection**: Bad UX, users expect tabs to open in current context
- **Global default connection**: Doesn't support multi-connection workflows

---

## 6. Handling Edge Cases

### Decision: Implement Graceful Degradation for Edge Cases

**Edge Case Research**:

1. **Connection disconnected while viewing**:
   - **Current behavior**: Connection remains in sidebar until explicitly disconnected
   - **Fix needed**: When `activeSessionId` becomes invalid, switch to another active session or show empty state
   - **Implementation**: Add validation in the sync effect to check if `activeSessionId` exists in active sessions

2. **Active connection deleted**:
   - **Current behavior**: Tab store has `clearTabs()` that runs on disconnect
   - **Fix needed**: Ensure `activeSessionId` is also cleared when a connection is deleted
   - **Implementation**: Add `setActiveSessionId(null)` to disconnect/delete handlers

3. **Rapid connection switching**:
   - **Current behavior**: No debouncing, may cause rapid re-renders
   - **Fix needed**: Zustand state updates are atomic, but UI should show loading state
   - **Implementation**: Keep `isConnectingSession` flag in sessionStore, disable clicks while connecting

4. **Multiple browser tabs** (doesn't apply to Wails desktop app):
   - **Not applicable**: Wails runs as a single-instance desktop application

5. **Table deleted while viewing**:
   - **Current behavior**: Metadata tree will show error on next refresh
   - **Fix needed**: None required for this feature (handled by existing error boundaries)

**Implementation Strategy**:
```typescript
// In the sync effect
useEffect(() => {
  if (activeSessionId) {
    // Validate that the session still exists
    const session = sessions?.find(s => s.id === activeSessionId);
    if (!session) {
      // Session no longer exists, clear it
      setActiveSessionId(null);
      clearTabs();
      return;
    }
    
    // ... rest of sync logic
  }
}, [activeSessionId, sessions]);
```

---

## Summary of Research Findings

### Key Decisions Made

1. **Root Cause**: State synchronization bug caused by reading from stale tab context instead of `activeSessionId`
2. **Architecture Pattern**: Use `activeSessionId` as single source of truth, sync tab context via effect hook
3. **Click Handler Pattern**: Update `activeSessionId` in handlers, let effects propagate changes
4. **Visual Indicator**: CSS-based active state styling for sidebar connections
5. **Query Tab Binding**: Read `activeSessionId` when creating new tabs, not from active tab's context
6. **Edge Case Handling**: Validate session existence, graceful degradation on errors

### Technologies & Patterns Confirmed

- **State Management**: Zustand (already in use, working well)
- **Data Fetching**: TanStack Query (already handling async metadata loading)
- **Synchronization Pattern**: React `useEffect` for derived state sync
- **Visual Feedback**: CSS classes + Zustand state for active indicators

### No New Dependencies Required

All fixes can be implemented with existing dependencies. No new libraries needed.

### Ready for Phase 1

All "NEEDS CLARIFICATION" items from Technical Context have been resolved. The feature is ready for data model design and contract generation.
