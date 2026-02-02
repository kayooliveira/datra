# Tasks: Enhance Database UI/UX

**Feature Branch**: `008-enhance-db-ui`
**Spec**: [specs/008-enhance-db-ui/spec.md](specs/008-enhance-db-ui/spec.md)

## Phase 1: Setup

*Goal: Initialize environment and install dependencies.*

- [x] T001 Install UI dependencies (@tanstack/react-table, @tanstack/react-virtual) in `frontend/`

## Phase 2: Foundational

*Goal: Establish state management stores required for the new UI.*

- [x] T002 [P] Create `useTabStore` in `frontend/src/stores/tabStore.ts` to manage tab state (add, close, switch, content)
- [x] T003 [P] Create `useSelectionStore` in `frontend/src/stores/selectionStore.ts` for sidebar highlighting state
- [x] T004 [P] Update `useSessionStore` in `frontend/src/stores/sessionStore.ts` to include `activeContext` (schema/database)

## Phase 3: Smart Sidebar Navigation & Context (Priority: P1)

*Goal: Sidebar selection highlights instantly and updates query context.*
*Independent Test: Click a table -> Item highlights -> Editor context updates.*

- [x] T005 [US1] Refactor `MetadataTree` in `frontend/src/components/connections/MetadataTree.tsx` to use `useSelectionStore` for optimized highlighting
- [x] T006 [US1] Update `MetadataTree` to dispatch `activeContext` updates to `useSessionStore` on item click
- [x] T007 [US1] Style sidebar dropdowns and lists in `frontend/src/components/connections/connection-card.module.css` (or relevant CSS) for consistent spacing and hierarchy

## Phase 4: Modern Query Editor with Tabs (Priority: P1)

*Goal: Multi-tab support with professional styling.*
*Independent Test: Open multiple tabs -> Switch between them -> Content persists.*

- [x] T008 [US2] Create `Tab` component in `frontend/src/components/editor/Tab.tsx` (visual tab with close button)
- [x] T009 [US2] Create `SqlEditorTabs` container in `frontend/src/components/editor/SqlEditorTabs.tsx` to manage tab layout
- [x] T010 [US2] Refactor `SqlEditor.tsx` to accept controlled state (query/results) from `useTabStore` instead of local state
- [x] T011 [US2] Integrate `SqlEditorTabs` into `frontend/src/routes/index.tsx` replacing the standalone editor
- [x] T012 [US2] Style the "Run Query" button and Input area in `frontend/src/components/editor/editor.module.css` to match professional IDE standards

## Phase 5: Advanced Results Table (Priority: P1)

*Goal: Resizeable columns, virtual scrolling, and dense data display.*
*Independent Test: Drag column header -> Resizes. Scroll 10k rows -> Smooth.*

- [x] T013 [P] [US3] Create `ResultGrid` component in `frontend/src/components/results/ResultGrid.tsx` using TanStack Table
- [x] T014 [US3] Implement column resizing logic in `ResultGrid.tsx`
- [x] T015 [US3] Implement virtual scrolling with `@tanstack/react-virtual` in `ResultGrid.tsx`
- [x] T016 [US3] Replace old `ResultTable` usage in `SqlEditor.tsx` with `ResultGrid`

## Phase 6: Intelligent Query Constraints (Priority: P2)

*Goal: Default 50 row limit with user override and performance warnings.*
*Independent Test: Run query -> Limit 50 applied. Change to Unlimited -> Warning shown.*

- [x] T017 [US4] Create `LimitSelector` component in `frontend/src/components/editor/LimitSelector.tsx` (50, 100, 500, Unlimited)
- [x] T018 [US4] Implement safe limit injection logic in `frontend/src/hooks/useQueryExecutor.ts` (or relevant hook) - append LIMIT if missing, do NOT use regex replacement
- [x] T019 [US4] Add "Unlimited" warning toast/modal in `LimitSelector` interaction

## Phase 7: Polish & Cross-Cutting

*Goal: Final UI consistency and cleanup.*

- [x] T020 Review and unify colors/spacing across Sidebar, Editor, and Results for "IDE Theme" consistency
- [x] T021 Verify dark/light mode rendering for new TanStack table components

## Dependencies

- Phase 3 (Sidebar) depends on Phase 2 (Stores)
- Phase 4 (Tabs) depends on Phase 2 (Stores)
- Phase 5 (Results) depends on Phase 1 (Dependencies)
- Phase 6 (Constraints) depends on Phase 4 (Editor)

## Implementation Strategy

1. **MVP**: Complete Phases 1-4. This gives the core "IDE" feel with Tabs and Sidebar.
2. **Data**: Complete Phase 5 to fix the "rotten" table.
3. **Safety**: Complete Phase 6 to protect performance.
