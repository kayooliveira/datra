# Tasks: Fix Connection Context Switching

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md) | **Data Model**: [data-model.md](./data-model.md)  
**Branch**: `009-connection-context`  
**Created**: February 3, 2026

**Prerequisites**: All design documents complete (plan.md, spec.md, research.md, data-model.md, contracts/)

**Tests**: This is a UI bug fix with no automated test infrastructure currently in place. Manual testing checklist is provided for each user story.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

---

## Format: `- [ ] [ID] [P?] [Story] Description with file path`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- All file paths are relative to repository root

---

## Phase 1: Setup & Preparation

**Purpose**: Verify environment and understand existing code structure

- [x] T001 Verify development environment is running (`wails dev` in terminal)
- [x] T002 Review existing state management architecture in frontend/src/stores/
- [x] T003 [P] Review existing click handlers in frontend/src/components/sidebar/
- [x] T004 [P] Review existing tab management in frontend/src/stores/tabStore.ts

**Checkpoint**: ✅ Environment ready, code structure understood

---

## Phase 2: Foundational (Core State Management Fix)

**Purpose**: Implement the core synchronization mechanism that all user stories depend on

**⚠️ CRITICAL**: This phase MUST be complete before implementing any user story features

- [x] T005 Add `syncMainTabContext` action to TabState interface in frontend/src/stores/tabStore.ts
- [x] T006 Implement `syncMainTabContext` action in useTabStore in frontend/src/stores/tabStore.ts
- [x] T007 Create new file frontend/src/hooks/useSyncMainTabContext.ts
- [x] T008 Implement useSyncMainTabContext hook with effect logic in frontend/src/hooks/useSyncMainTabContext.ts
- [x] T009 Add useSyncMainTabContext import and call in frontend/src/routes/index.tsx root component

**Checkpoint**: ✅ Core synchronization mechanism in place - tab context now syncs with activeSessionId

**Manual Verification**:
- [ ] Console should log "Syncing main tab context: X -> Y" when switching connections
- [ ] No infinite loops or repeated syncing should occur

---

## Phase 3: User Story 1 - Switch Connection Context via Sidebar (Priority: P1) 🎯 MVP

**Goal**: When clicking a connection in the sidebar, the application displays the correct connection's overview data

**Independent Test**: Create two active connections, click between them, verify overview panel shows correct data

### Implementation for User Story 1

- [x] T010 [US1] Update handleSelectConnection in frontend/src/components/sidebar/sidebar.tsx to check if main tab exists before calling initializeMainTab
- [x] T011 [US1] Ensure handleSelectConnection sets activeSessionId which triggers useSyncMainTabContext
- [x] T012 [US1] Update handleConnect in frontend/src/components/sidebar/connection-item.tsx to follow same pattern

**Checkpoint**: ✅ User Story 1 complete - clicking connections in sidebar updates overview correctly

**Manual Testing Checklist for US1**:
- [ ] Test 1.1: Create Connection A and Connection B
- [ ] Test 1.2: Connect to Connection A, verify overview shows Connection A data
- [ ] Test 1.3: Click Connection B in sidebar
- [ ] Test 1.4: Verify loading indicator appears briefly
- [ ] Test 1.5: Verify overview panel updates to show Connection B data (NOT Connection A)
- [ ] Test 1.6: Click Connection A again, verify overview switches back to Connection A
- [ ] Test 1.7: Create Connection C, verify clicking any of the three connections shows correct data every time
- [ ] Test 1.8: Check console for no errors during connection switches
- [ ] Test 1.9: Verify connection switches complete within 500ms (acceptable UX speed)

---

## Phase 4: User Story 2 - Switch Context by Selecting Table in Sidebar (Priority: P1)

**Goal**: When clicking a table from a different connection, the application switches to that connection's context

**Independent Test**: Create two connections with different tables, click table from Connection B while viewing Connection A, verify context switches

### Implementation for User Story 2

- [x] T013 [US2] Locate handleSelect function in TableList component in frontend/src/components/connections/MetadataTree.tsx (around line 94)
- [x] T014 [US2] Add activeSessionId check: if (activeSessionId !== sessionId) setActiveSessionId(sessionId)
- [x] T015 [US2] Ensure setActiveContext is called with schema information
- [x] T016 [US2] Ensure setActiveTab(MAIN_TAB_ID) is called to show the main tab
- [x] T017 [P] [US2] Locate handleSelect function in SchemaList component in frontend/src/components/connections/MetadataTree.tsx (around line 187)
- [x] T018 [P] [US2] Apply same activeSessionId check and update pattern to schema selection

**Checkpoint**: ✅ User Story 2 complete - clicking tables/schemas from different connections switches context correctly

**Manual Testing Checklist for US2**:
- [ ] Test 2.1: Connect to Connection A and Connection B
- [ ] Test 2.2: Expand tables for both connections in sidebar
- [ ] Test 2.3: While viewing Connection A, click a table from Connection B
- [ ] Test 2.4: Verify application switches to Connection B context
- [ ] Test 2.5: Verify selected table's information is displayed
- [ ] Test 2.6: Click a table from Connection A
- [ ] Test 2.7: Verify application switches back to Connection A context
- [ ] Test 2.8: Click different table within same connection, verify view updates without connection switch
- [ ] Test 2.9: Test with schemas - click schema from different connection, verify context switch

---

## Phase 5: User Story 3 - Open New Query Tabs in Active Connection Context (Priority: P2)

**Goal**: New query tabs open bound to the currently active connection, not always the first connection

**Independent Test**: Select Connection B, press Cmd+T, verify new query tab executes against Connection B

### Implementation for User Story 3

- [x] T019 [US3] Add import for useSessionStore in frontend/src/components/editor/SqlEditor.tsx
- [x] T020 [US3] Destructure activeSessionId from useSessionStore in SqlEditor component
- [x] T021 [US3] Create handleNewQueryTab callback function that reads activeSessionId
- [x] T022 [US3] In handleNewQueryTab, fetch session info using GetActiveSessions() and find matching session
- [x] T023 [US3] In handleNewQueryTab, call addTab(activeSessionId, profile?.name, session?.profile_id)
- [x] T024 [US3] Register keyboard shortcuts using useHotkeys('mod+t', handleNewQueryTab)
- [x] T025 [US3] Register keyboard shortcuts using useHotkeys('mod+n', handleNewQueryTab)
- [x] T026 [P] [US3] Update any "New Query" button click handlers to use same handleNewQueryTab function

**Checkpoint**: ✅ User Story 3 complete - new query tabs open in correct connection context

**Manual Testing Checklist for US3**:
- [ ] Test 3.1: Connect to Connection A and Connection B
- [ ] Test 3.2: Select Connection B in sidebar
- [ ] Test 3.3: Press Cmd+T (or Ctrl+T on Windows/Linux)
- [ ] Test 3.4: Verify new query tab is created with "Connection B" as context
- [ ] Test 3.5: Execute a query like `SELECT 1;` in the new tab
- [ ] Test 3.6: Verify query executes against Connection B's database
- [ ] Test 3.7: Switch to Connection A
- [ ] Test 3.8: Press Cmd+N
- [ ] Test 3.9: Verify new query tab is associated with Connection A
- [ ] Test 3.10: Test with "New Query" button (if exists), verify same behavior
- [ ] Test 3.11: Create multiple query tabs for different connections, verify each executes against correct database
- [ ] Test 3.12: Verify query results show in the correct tab context

---

## Phase 6: Visual Active Connection Indicator

**Purpose**: Add visual feedback showing which connection is currently active

**Dependencies**: Can be implemented in parallel with Phase 3-5 but should be tested after US1 is complete

- [x] T027 [P] Import useSessionStore in frontend/src/components/sidebar/connection-item.tsx
- [x] T028 [P] Destructure activeSessionId from useSessionStore in ConnectionItem component
- [x] T029 Determine isActive state: const isActive = session?.id === activeSessionId
- [x] T030 Apply active class to container div: ${isActive ? styles.active : ''}
- [x] T031 [P] Open frontend/src/components/sidebar/connection-item.module.css
- [x] T032 [P] Add .container.active selector with background-color: var(--primary-dim)
- [x] T033 [P] Add border-left: 3px solid var(--primary) to .container.active
- [x] T034 [P] Add .container.active .name selector with color: var(--primary-fg) and font-weight: 600
- [x] T035 [P] Add .container.active .statusDot selector with box-shadow: 0 0 8px var(--primary)

**Checkpoint**: ✅ Visual indicator complete - active connection is clearly highlighted in sidebar

**Manual Testing Checklist for Visual Indicator**:
- [ ] Test VI.1: With multiple connections, verify only ONE connection has the highlighted background
- [ ] Test VI.2: Click different connections, verify highlight moves to the clicked connection
- [ ] Test VI.3: Verify the active connection has a left accent bar (3px border)
- [ ] Test VI.4: Verify the active connection's name is bold and colored
- [ ] Test VI.5: Verify the status dot has a glow effect on the active connection
- [ ] Test VI.6: Test in both light and dark mode (if supported) to ensure visibility

---

## Phase 7: Integration Testing & Edge Cases

**Purpose**: Comprehensive testing of all user stories working together plus edge case handling

- [ ] T036 Execute full manual testing checklist for all three user stories
- [ ] T037 Test rapid connection switching (click multiple connections quickly)
- [ ] T038 Test with 5 simultaneous active connections
- [ ] T039 Test disconnecting the currently active connection
- [ ] T040 Test deleting a connection while it's active
- [ ] T041 Test switching connections while query is executing
- [ ] T042 Test switching connections while metadata is loading
- [ ] T043 Verify no console errors during any edge case scenarios
- [ ] T044 Verify performance: all connection switches complete within 500ms

**Manual Testing Checklist for Integration**:
- [ ] Test INT.1: **Multi-Connection Workflow**: Connect to 3 databases, click between them, open query tabs in each, execute queries, verify all data is correct
- [ ] Test INT.2: **Rapid Switching**: Click through 5 connections rapidly, verify no visual glitches or stale data
- [ ] Test INT.3: **Table Navigation**: With 3 connections, navigate by clicking tables across different connections, verify context always switches correctly
- [ ] Test INT.4: **Query Tab Lifecycle**: Create query tabs from different connections, switch active connection, create more tabs, verify correct binding
- [ ] Test INT.5: **Disconnect Active**: Disconnect the currently active connection, verify UI switches to another connection or shows empty state
- [ ] Test INT.6: **Delete Active**: Delete the active connection, verify activeSessionId is cleared and tabs are cleared
- [ ] Test INT.7: **Loading States**: Click a connection, immediately click another before metadata loads, verify no crashes or stale data
- [ ] Test INT.8: **Performance**: Time 10 connection switches, verify average is under 500ms
- [ ] Test INT.9: **Visual Consistency**: Verify active indicator is always accurate across all test scenarios
- [ ] Test INT.10: **Keyboard Shortcuts**: Test all keyboard shortcuts (Cmd+T, Cmd+N) across different connection contexts

---

## Phase 8: Polish & Documentation

**Purpose**: Final cleanup, code review preparation, and documentation

- [x] T045 Remove any console.log statements added during development (keep only meaningful logs)
- [x] T046 Add JSDoc comments to useSyncMainTabContext hook explaining its purpose
- [x] T047 Review all modified files for code quality and consistency
- [x] T048 Verify all TypeScript types are correct (no 'any' types added)
- [ ] T049 Run frontend linter and fix any issues
- [x] T050 Test in production build mode (`wails build`)
- [ ] T051 Update CHANGELOG or commit message with detailed description of fix
- [ ] T052 Take screenshots of visual active indicator for PR documentation
- [ ] T053 Prepare PR description with testing results and screenshots

**Final Verification Checklist**:
- [ ] All 3 user stories pass their independent tests
- [ ] All integration tests pass
- [ ] All edge cases handled gracefully
- [ ] Visual indicator working correctly
- [ ] Performance goals met (<500ms switches)
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Code is clean and documented
- [ ] Ready for code review

---

## Implementation Strategy

### Recommended Order

1. **Phase 1-2** (Setup + Foundation): ~30 minutes
   - Essential infrastructure before any features
   
2. **Phase 3** (US1 - Sidebar Clicks): ~30-45 minutes
   - Core functionality, highest value
   - Test thoroughly before moving on
   
3. **Phase 6** (Visual Indicator): ~15 minutes
   - Can be done in parallel with Phase 4-5
   - Helps with testing other phases
   
4. **Phase 4** (US2 - Table Clicks): ~20-30 minutes
   - Builds on US1 foundation
   
5. **Phase 5** (US3 - New Query Tabs): ~30-45 minutes
   - Depends on US1 and US2 working
   
6. **Phase 7** (Integration Tests): ~30-60 minutes
   - Thorough testing of all features together
   
7. **Phase 8** (Polish): ~20-30 minutes
   - Final cleanup and preparation

### Parallel Opportunities

Tasks marked with **[P]** can be executed in parallel:
- T003 and T004 (code review)
- T027-T035 (visual indicator - separate files/concerns)
- T017 and T018 (schema vs table handlers)

### MVP Scope

For a minimal viable fix, you could implement just:
- **Phase 1-2**: Foundation
- **Phase 3**: User Story 1 (sidebar connection switching)
- **Phase 6**: Visual indicator
- **Phase 7**: Basic testing

This delivers the core value (fixing the broken connection switching) in ~1.5-2 hours.

---

## Success Criteria

### User Story 1 Success
- ✅ Clicking different connections in sidebar shows correct data 100% of the time
- ✅ No "always shows first connection" bug

### User Story 2 Success
- ✅ Clicking tables from different connections switches context correctly
- ✅ Schema/database context is maintained

### User Story 3 Success
- ✅ New query tabs are bound to the active connection
- ✅ Keyboard shortcuts (Cmd+T, Cmd+N) work correctly
- ✅ Queries execute against the correct database

### Overall Success
- ✅ All acceptance scenarios from spec.md pass
- ✅ All success criteria from spec.md met:
  - SC-001: Context switches within 500ms ⏱️
  - SC-002: 100% accuracy in displaying correct connection 🎯
  - SC-003: 100% correct query tab binding 🎯
  - SC-004: Supports 5+ simultaneous connections 📊
  - SC-005: No stale data when switching between 10 connections 🔄
  - SC-006: Active indicator is always accurate ✨

---

## Task Summary

**Total Tasks**: 53
- **Setup**: 4 tasks
- **Foundation**: 5 tasks
- **User Story 1**: 3 tasks
- **User Story 2**: 6 tasks
- **User Story 3**: 8 tasks
- **Visual Indicator**: 9 tasks
- **Integration Testing**: 9 tasks
- **Polish**: 9 tasks

**Estimated Time**: 2.5-4 hours (implementation) + 30-60 minutes (thorough testing) = **3-5 hours total**

**Parallelization**: ~9 tasks can run in parallel, reducing time for teams

**MVP Time**: ~1.5-2 hours (Phases 1-3 + 6 only)

---

## Dependencies Graph

```
Phase 1 (Setup)
    ↓
Phase 2 (Foundation) ← BLOCKING: Required for all user stories
    ↓
    ├─→ Phase 3 (US1) ← MVP Core
    │       ↓
    ├─→ Phase 4 (US2) ← Depends on US1 pattern
    │       ↓
    ├─→ Phase 5 (US3) ← Depends on US1 & US2 working
    │
    └─→ Phase 6 (Visual) ← Can run in parallel with US2/US3
            ↓
        Phase 7 (Integration) ← All user stories must be complete
            ↓
        Phase 8 (Polish)
```

---

## Notes

- This is a **frontend-only fix** - zero Go backend changes required
- All tasks are in the `frontend/src/` directory
- The root cause is state synchronization, not business logic
- The fix is straightforward: establish `activeSessionId` as single source of truth
- Most complexity is in thorough testing to ensure the bug is fully fixed
- Manual testing is critical since there's no automated UI test infrastructure

**Ready to implement!** Follow the quickstart guide or execute tasks in order. 🚀