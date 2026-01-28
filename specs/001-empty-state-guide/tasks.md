---
description: "Task list for Empty State Guide implementation"
---

# Tasks: Empty State Guide

**Input**: Design documents from `/specs/001-empty-state-guide/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api.md

**Organization**: Tasks are grouped by user story to enable independent implementation.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create feature documentation structure in specs/001-empty-state-guide/
- [x] T002 Verify Wails project dependencies in go.mod and frontend/package.json
- [x] T003 [P] Configure basic linting rules if not already present

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure for data and backend logic

- [x] T004 Define ConnectionProfile struct in app.go
- [x] T005 Implement storage path logic (GetStoragePath) in app.go
- [x] T006 Implement YAML reading logic (GetConnections) in app.go
- [x] T007 Expose GetConnections method to Wails runtime in app.go
- [x] T008 [P] Install yaml package in go.mod

**Checkpoint**: Backend is ready to serve connection data.

---

## Phase 3: User Story 1 - Initial Welcome (Priority: P1) 🎯 MVP

**Goal**: Display a clear welcome screen when no connections exist.

**Independent Test**: Launch app with no `connections.yaml`; verify Empty State view appears.

### Implementation for User Story 1

- [x] T009 [P] [US1] Create EmptyState component in frontend/src/components/EmptyState.jsx
- [x] T010 [P] [US1] Add "New Connection" button and welcome text to EmptyState.jsx
- [x] T011 [US1] Update App.jsx to fetch connections via Wails GetConnections on mount
- [x] T012 [US1] Implement conditional rendering in App.jsx (EmptyState vs Placeholder) based on count
- [x] T013 [US1] Add basic CSS for centering and layout in frontend/src/style.css (or component specific)

**Checkpoint**: App shows empty state correctly on launch.

---

## Phase 4: User Story 3 - Create Connection Action (Priority: P1)

**Goal**: "New Connection" button triggers an action.

**Independent Test**: Click button, verify log/console output.

### Implementation for User Story 3

- [x] T014 [US3] Add onClick handler to button in frontend/src/components/EmptyState.jsx
- [x] T015 [US3] Implement CreateConnection placeholder method in App.jsx or Wails (as needed by future specs)
- [x] T016 [US3] Log "Create Connection Clicked" to console in handler (temporary verification)

**Checkpoint**: Button is interactive.

---

## Phase 5: User Story 2 - Return to Empty State (Priority: P2)

**Goal**: App returns to empty state if the last connection is removed.

**Independent Test**: Manually delete/rename `connections.yaml` while app is running and trigger a refresh (or mock the state change).

### Implementation for User Story 2

- [x] T017 [US2] Add manual "Refresh" button or poll mechanism in App.jsx (for testing state transition without full delete feature)
- [x] T018 [US2] Verify state transition from "List" to "Empty" by mocking `setConnections([])` in React DevTools

**Checkpoint**: State transitions work dynamically.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: UI Refinements and cleanup.

- [x] T019 [P] Polish CSS for EmptyState to match "IDE-style" (dense, functional)
- [x] T020 [P] Ensure Light/Dark mode compatibility for EmptyState icons/text
- [x] T021 Run verification steps from specs/001-empty-state-guide/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Start immediately.
- **Foundational (Phase 2)**: Blocks US1, US2, US3.
- **User Stories (Phase 3+)**: US1 is MVP. US3 depends on US1 component. US2 is state logic refinement.

### User Story Dependencies

- **US1 (Welcome)**: Depends on Backend (Phase 2).
- **US3 (Action)**: Depends on US1 (Button existence).
- **US2 (Return)**: Depends on US1 (View existence).

### Parallel Opportunities

- T009 (Component UI) can run parallel with T004-T007 (Backend).
- T019/T020 (Styling) can be done anytime after T009.

---

## Implementation Strategy

1. **Foundational**: Get the backend reading the file.
2. **MVP (US1)**: Get the frontend displaying the empty state.
3. **Interactive (US3)**: Make the button click work.
4. **Refine (US2/Polish)**: Handle updates and styling.
