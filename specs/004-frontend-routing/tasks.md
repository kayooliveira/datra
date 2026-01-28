# Tasks: Frontend Routing

**Branch**: `004-frontend-routing` | **Spec**: [specs/004-frontend-routing/spec.md](../spec.md)
**Status**: Completed

<!--
  Status Flow: Pending -> In Progress -> Completed
  Update this file as you complete tasks.
-->

## Phase 1: Setup & Infrastructure
**Goal**: Initialize the project with TanStack Router and prepare the codebase for type-safe routing.

- [x] T001 Install `@tanstack/react-router` and `@tanstack/router-devtools` dependencies in `frontend/package.json`
- [x] T002 Rename `frontend/src/main.jsx` to `frontend/src/main.tsx` to support TypeScript router configuration
- [x] T003 Rename `frontend/src/App.jsx` to `frontend/src/App.tsx` to support TypeScript router configuration
- [x] T004 Create `frontend/src/routes` directory structure for route definitions

## Phase 2: Foundational Routing
**Goal**: Establish the core router instance with Hash history (required for Wails) and the root layout.

- [x] T005 Create `frontend/src/routes/__root.tsx` to define the Root Route and main Layout (shell) with an `Outlet`
- [x] T006 Implement `createHashHistory` instance in a new file `frontend/src/router.tsx` (or within `main.tsx`) to ensure Wails compatibility
- [x] T007 Initialize the `router` instance in `frontend/src/main.tsx` passing the route tree and history

## Phase 3: User Story 1 - Navigate between main application screens (P1)
**Goal**: Migrate existing Home and Settings views to independent routes and enable navigation.
**Independent Test**: User can navigate from Home to Settings and back using the URL hash or links, without manual state toggles.

- [x] T008 [US1] Create `frontend/src/routes/index.tsx` and migrate the "Home/Connections" view logic from `App.tsx`
- [x] T009 [US1] Create `frontend/src/routes/settings.tsx` and migrate the "Settings" view logic from `App.tsx`
- [x] T010 [US1] Create the route tree configuration in `frontend/src/routeTree.gen.ts` (or manual configuration file if not using auto-generation) linking root, index, and settings
- [x] T011 [US1] Replace the conditional rendering logic in `frontend/src/App.tsx` (or `main.tsx`) with the `RouterProvider` component
- [x] T012 [US1] Update `frontend/src/components/SettingsPage.tsx` to use `Link` or `useNavigate` for the "Close" action instead of a callback prop

## Phase 4: User Story 2 - Consistent Application Layouts (P2)
**Goal**: Consolidate shared UI elements (Header/Footer/Sidebar) into the Root layout.
**Independent Test**: The Footer/Navigation bar remains persistent and doesn't flicker when switching between Home and Settings.

- [x] T013 [US2] Migrate the shared Footer/Navigation from `App.tsx` to the `frontend/src/routes/__root.tsx` layout component
- [x] T014 [US2] Update navigation buttons in the Footer to use TanStack Router `Link` components with `activeProps` for styling
- [x] T015 [US2] Verify and adjust CSS in `frontend/src/style.css` to ensure the new Layout structure (Root + Outlet) renders correctly (full height, scrollable areas)

## Phase 5: Polish & Cleanup
**Goal**: Remove legacy state management and ensure the codebase is clean.

- [x] T016 Remove unused `useState` (e.g., `showSettings`) and legacy navigation handlers from `frontend/src/App.tsx` (if any remain)
- [x] T017 Verify full type safety of routes by attempting to link to a non-existent route (should cause TS error)
- [x] T018 Verify that reloading the app on a specific screen (e.g., `/#/settings`) restores the correct view

## Implementation Strategy
- **MVP**: Complete Phase 1, 2, and 3 to have functional navigation.
- **Full Feature**: Complete Phase 4 to ensure consistent layout and code reuse.
- **Parallelism**: T008 and T009 can be done in parallel after Phase 2 is complete.

## Dependencies
- Phase 3 requires Phase 2 (Router instance).
- Phase 4 requires Phase 3 (Routes exist to be laid out).
