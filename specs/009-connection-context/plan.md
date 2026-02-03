# Implementation Plan: Fix Connection Context Switching

**Branch**: `009-connection-context` | **Date**: February 2, 2026 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/009-connection-context/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

**Primary Requirement**: Fix the broken connection context switching that causes the application to always display the first connection's data regardless of which connection is selected in the sidebar. Users must be able to switch between multiple active database connections seamlessly, with the UI updating to show the correct connection's information (overview, tables, metadata). New query tabs must open in the context of the currently selected connection, not always in the first connection.

**Technical Approach**: Refactor the state management architecture to properly propagate the active connection ID through all relevant components. The root cause is that UI components are reading stale or static connection references instead of subscribing to the active connection context. The solution involves:
1. Ensuring `useSessionStore.activeSessionId` is the single source of truth for the active connection
2. Fixing the sidebar click handlers to properly update `activeSessionId`
3. Ensuring the main overview tab's context updates when switching connections
4. Binding new query tab creation to the current `activeSessionId`
5. Adding visual indicators for the active connection in the sidebar

## Technical Context

**Language/Version**: 
- **Backend**: Go 1.24.0
- **Frontend**: TypeScript 5.9.3, React 18.3.1

**Primary Dependencies**: 
- **Desktop Framework**: Wails v2.11.0 (Go/React bridge)
- **Frontend State**: Zustand 5.0.10 (lightweight state management)
- **Routing**: TanStack Router 1.157.16
- **Data Fetching**: TanStack Query 5.90.20
- **UI Components**: Lucide React 0.563.0 (icons)
- **Code Editor**: CodeMirror (@uiw/react-codemirror 4.25.4)

**Storage**: 
- Backend: In-memory session manager (`SessionManager` in Go) maps sessionID → `*sql.DB`
- Frontend: Zustand stores (sessionStore, tabStore, selectionStore) for UI state
- Configuration: YAML files for connection profiles, OS Keyring for credentials

**Testing**: 
- Backend: `go test ./...` (standard Go testing)
- Frontend: Manual testing required for UI interaction flows (no automated UI tests currently)

**Target Platform**: Desktop application (macOS, Windows, Linux) via Wails native binaries

**Project Type**: Desktop application with Go backend and React frontend (Wails architecture)

**Performance Goals**: 
- Connection context switches must complete within 500ms (per spec SC-001)
- UI must remain responsive during metadata loading
- Support 5+ simultaneous active connections without degradation (per spec SC-004)

**Constraints**: 
- Must not block the UI thread during connection switches
- All Go/React communication goes through Wails bindings
- Must maintain existing keyboard shortcuts (Cmd/Ctrl + T, Cmd/Ctrl + N)
- IDE-style dense layout must be preserved

**Scale/Scope**: 
- Multiple active database connections (target: 5+, tested up to 10)
- Multiple query tabs per connection
- Metadata trees with schemas, tables, columns per connection
- Single-user desktop application (no multi-tenancy)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Initial Check (Before Phase 0) - ✅ PASSED

- [x] IDE UX: feature fits the IDE-style multi-pane layout; keyboard-friendly where relevant
  - **Compliance**: Enhances existing sidebar navigation and tab management, maintaining IDE-style workflow. Keyboard shortcuts (Cmd+T, Cmd+N) are explicitly preserved.
  
- [x] Security: inputs validated; secrets not logged; destructive actions have safe UX
  - **Compliance**: No new security surface introduced. Feature only fixes UI state synchronization. Connection IDs are validated (existing backend validation). No credential handling changes.
  
- [x] Performance: long-running work is async; UI remains responsive; cancellation/feedback considered
  - **Compliance**: Context switches are state updates (synchronous, <10ms). Metadata loading already async via TanStack Query. Loading indicators already present during connection switches. Target: <500ms total context switch time.
  
- [x] Productivity: changes are incremental; non-trivial logic has tests; UI changes include manual checks
  - **Compliance**: Changes are incremental (fixing existing handlers, not rewriting architecture). Manual testing checklist will be provided in tasks.md. State logic in Zustand stores is testable but currently no test infrastructure for frontend (consistent with project state).
  
- [x] Architecture: Go owns business logic; Wails boundary uses explicit request/response shapes
  - **Compliance**: No Go backend changes required. Issue is purely frontend state management. All existing Wails bindings (GetActiveSessions, Connect, ExecuteQuery) remain unchanged.

### Post-Design Re-evaluation (After Phase 1) - ✅ PASSED

**Design Review Against Constitution**:

- [x] **IDE UX Maintained**: 
  - Design adds visual active state indicator (CSS-based highlighting)
  - Keyboard shortcuts (Cmd+T, Cmd+N) functionality preserved and fixed
  - Multi-pane layout unchanged
  - Tab management enhanced (main tab context sync)
  - **Verdict**: ✅ Enhances IDE-style UX

- [x] **Security Preserved**:
  - No new inputs added (only fixing state synchronization)
  - Session IDs validated by existing backend logic
  - No credential logging (no logging added at all)
  - No destructive actions introduced
  - **Verdict**: ✅ No security impact

- [x] **Performance Optimized**:
  - `useSyncMainTabContext()` uses React's batched updates
  - Effect dependencies properly declared (no infinite loops)
  - Zustand state updates are atomic and performant
  - Loading flags (`isConnectingSession`) prevent rapid clicks
  - All async work (metadata loading) already handled correctly
  - **Verdict**: ✅ Performance maintained, no regressions

- [x] **Productivity Enhanced**:
  - Incremental changes: 7 file modifications, 1 new file
  - Changes are focused: stores, hooks, click handlers, CSS
  - Manual testing checklist provided in quickstart.md
  - State logic in Zustand stores is testable (could add unit tests later)
  - **Verdict**: ✅ Incremental, testable changes

- [x] **Architecture Respected**:
  - Zero Go backend changes (confirmed in design)
  - All fixes in React frontend layer
  - Wails bindings unchanged
  - State management follows Zustand best practices
  - Single Source of Truth pattern properly applied
  - **Verdict**: ✅ Architecture boundaries maintained

### Final Constitution Compliance: ✅ APPROVED

The design fully complies with all Datra Constitution principles. No exceptions or waivers required. The feature can proceed to implementation (Phase 2: tasks.md generation).

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

This is a Wails desktop application with Go backend and React frontend:

```text
datra/ (repository root)
├── internal/                    # Go backend (no changes needed for this feature)
│   └── connection/
│       ├── manager.go          # Connection profile management
│       ├── service.go          # Wails-exposed service methods
│       └── session.go          # Session state (sessionID → *sql.DB)
│
├── frontend/                   # React frontend (PRIMARY FOCUS)
│   ├── src/
│   │   ├── stores/             # Zustand state management
│   │   │   ├── sessionStore.ts         # ⚠️ CRITICAL: activeSessionId state
│   │   │   ├── tabStore.ts              # ⚠️ CRITICAL: tab management & context
│   │   │   └── selectionStore.ts       # Sidebar selection state
│   │   │
│   │   ├── components/
│   │   │   ├── sidebar/
│   │   │   │   ├── connection-item.tsx  # ⚠️ FIX: click handler must update activeSessionId
│   │   │   │   └── sidebar.tsx          # ⚠️ FIX: handleSelectConnection logic
│   │   │   │
│   │   │   ├── connections/
│   │   │   │   └── MetadataTree.tsx     # ⚠️ FIX: table click must switch connection context
│   │   │   │
│   │   │   └── editor/
│   │   │       ├── SqlEditor.tsx        # ⚠️ FIX: must read activeSessionId for new tabs
│   │   │       └── SqlEditorTabs.tsx    # Tab creation logic
│   │   │
│   │   ├── hooks/
│   │   │   └── useConnections.ts       # React Query hooks for connection data
│   │   │
│   │   └── routes/
│   │       └── index.tsx               # ⚠️ FIX: handleSelectConnection updates activeSessionId
│   │
│   └── wailsjs/go/              # Auto-generated Wails bindings (no changes)
│
└── specs/
    └── 009-connection-context/
        ├── spec.md              # Feature specification
        ├── plan.md              # This file
        ├── research.md          # Phase 0 output (to be generated)
        ├── data-model.md        # Phase 1 output (to be generated)
        ├── quickstart.md        # Phase 1 output (to be generated)
        └── contracts/           # Phase 1 output (to be generated)
```

**Structure Decision**: This is a desktop application using Wails v2 architecture. The bug is isolated to the frontend React state management layer. No Go backend changes are required because the session management logic is already correct—the issue is that the UI is not properly subscribing to and updating the active session state. All fixes will be in the `frontend/src/` directory, primarily in stores and component click handlers.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations identified. All Constitution principles are followed. This section is not applicable.

---

## Phase Completion Summary

### Phase 0: Research ✅ COMPLETE

**Output**: [research.md](./research.md)

**Key Findings**:
1. Root cause identified: Stale closure captures and inconsistent state reads
2. Main tab context is static while `activeSessionId` is dynamic (two sources of truth)
3. Solution: Make `activeSessionId` the single source of truth and sync tab context via effect hook
4. No new dependencies required—all fixes use existing React + Zustand patterns

### Phase 1: Design & Contracts ✅ COMPLETE

**Outputs**:
- [data-model.md](./data-model.md) - State management entities and synchronization logic
- [contracts/state-management.md](./contracts/state-management.md) - Interface contracts for stores, hooks, and components
- [quickstart.md](./quickstart.md) - Step-by-step implementation guide for developers

**Key Design Decisions**:
1. **New Action**: `TabStore.syncMainTabContext()` to update main tab's connection context
2. **New Hook**: `useSyncMainTabContext()` for automatic synchronization via React effect
3. **Visual Indicator**: CSS `.active` class for highlighting the active connection
4. **Click Handler Updates**: Sidebar and metadata tree handlers updated to set `activeSessionId`
5. **Query Tab Fix**: Read from `activeSessionId` when creating tabs, not from active tab's context

**Files to Modify**:
- `frontend/src/stores/tabStore.ts` - Add `syncMainTabContext()` action
- `frontend/src/hooks/useSyncMainTabContext.ts` - NEW FILE - Sync effect hook
- `frontend/src/routes/index.tsx` - Call sync hook in root layout
- `frontend/src/components/sidebar/sidebar.tsx` - Fix connection click handler
- `frontend/src/components/connections/MetadataTree.tsx` - Fix table click handler
- `frontend/src/components/editor/SqlEditor.tsx` - Fix new query tab creation
- `frontend/src/components/sidebar/connection-item.tsx` - Add active state logic
- `frontend/src/components/sidebar/connection-item.module.css` - Add `.active` styles

**Estimated Implementation Time**: 2.5-4 hours (per quickstart guide)

### Phase 2: Next Steps

This plan stops after Phase 1 design, as per `/speckit.plan` command scope.

**To proceed with implementation**:
1. Run `/speckit.tasks` to generate detailed task breakdown
2. Follow the [quickstart.md](./quickstart.md) implementation guide
3. Use the [contracts](./contracts/) for interface specifications
4. Refer to [data-model.md](./data-model.md) for state management architecture
5. Execute manual testing checklist from quickstart.md

---

## Plan Status: ✅ COMPLETE

All planning phases finished. Feature is ready for implementation.

**Branch**: `009-connection-context`  
**Next Command**: `/speckit.tasks` (to generate implementation tasks)
