# Tasks: Global Sidebar

**Branch**: `005-global-sidebar` | **Spec**: [specs/005-global-sidebar/spec.md](../spec.md)
**Status**: Completed

<!--
  Status Flow: Pending -> In Progress -> Completed
  Update this file as you complete tasks.
-->

## Phase 1: Setup & Infrastructure
**Goal**: Initialize dependencies and directory structure for the sidebar components.

- [x] T001 Install `react-resizable-panels` dependency in `frontend/package.json`
- [x] T002 Create `frontend/src/components/sidebar` directory structure for sidebar components

## Phase 2: Foundational Layout (Sidebar Shell)
**Goal**: Implement the resizable panel layout in the application root, replacing the simple container.

- [x] T003 Create `frontend/src/components/sidebar/resizable-handle.tsx` with a styled resize handle component
- [x] T004 Create `frontend/src/components/sidebar/sidebar.tsx` as the main sidebar container component
- [x] T005 Update `frontend/src/routes/__root.tsx` to wrap the existing `<Outlet />` and footer in a `react-resizable-panels` `PanelGroup`
- [x] T006 Implement `localStorage` persistence logic for the sidebar layout in `frontend/src/routes/__root.tsx` (using `onLayout` callback)

## Phase 3: User Story 1 - Access Connections from Any Screen (P1)
**Goal**: Display the list of available connections in the sidebar and enable navigation.
**Independent Test**: User sees their connections listed on the left and can click one to navigate/select it.

- [x] T007 [US1] Create `frontend/src/components/sidebar/connection-list.tsx` to display a list of connection items
- [x] T008 [US1] Implement data fetching in `frontend/src/components/sidebar/sidebar.tsx` using `GetConnections` from Wails
- [x] T009 [US1] Pass fetched connections to `ConnectionList` and render them using `lucide-react` icons
- [x] T010 [US1] Implement navigation logic in `ConnectionList` items (e.g., navigate to `/connection/$id` or log selection)
- [x] T011 [US1] Ensure the connection list area is scrollable (`overflow-y-auto`) independent of the main panel

## Phase 4: User Story 2 - Manage Connections from Sidebar (P2)
**Goal**: Handle the "No Connections" state and provide actions to create new ones.
**Independent Test**: Empty state appears when no connections exist; "New Connection" button triggers action.

- [x] T012 [US2] Create `frontend/src/components/sidebar/empty-state-sidebar.tsx` with a "Create Connection" call-to-action
- [x] T013 [US2] Update `frontend/src/components/sidebar/sidebar.tsx` to conditionally render `EmptyStateSidebar` when the connection list is empty
- [x] T014 [US2] Add a persistent "New Connection" button to the `Sidebar` component (header or footer area)
- [x] T015 [US2] Wire up the "New Connection" button to trigger the same action as the Empty State button (e.g., console log or dialog open stub)

## Phase 5: Polish & Edge Cases
**Goal**: Refine the UI for an IDE-like experience and handle edge cases.

- [x] T016 Verify and fix styling for long connection names (implement truncation with `text-overflow: ellipsis`)
- [x] T017 Apply IDE-style styling (colors, borders) to the `PanelResizeHandle` to make it visible but subtle
- [x] T018 Verify that the sidebar collapses correctly (if implementing collapsible features via `react-resizable-panels` API)
- [x] T019 Clean up any temporary inline styles and move them to `frontend/src/style.css` or component-specific classes

## Implementation Strategy
- **MVP**: Complete Phases 1-3 to get the sidebar visible and populated.
- **Full Feature**: Complete Phase 4 to handle the lifecycle (empty -> populated).
- **Parallelism**: T007 and T012 can be built in parallel as they are independent UI components.

## Dependencies
- Phase 3 requires `GetConnections` (backend) which exists.
- Phase 2 modifies the global root layout, so it should be done carefully to avoid breaking the app.
