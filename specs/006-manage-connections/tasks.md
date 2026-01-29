# Tasks: Connection Management

**Input**: Design documents from `/specs/006-manage-connections/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Include unit tests for Go connection logic and keyring integration. UI verification via manual checks in quickstart.md.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create `internal/connection/` and `internal/ssh/` directory structure
- [x] T002 Add `github.com/zalando/go-keyring` and `golang.org/x/crypto/ssh` to `go.mod`
- [x] T003 [P] Add `react-hotkeys-hook` to `frontend/package.json`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Define Connection and Tunnel structs in `internal/connection/model.go`
- [x] T005 Implement YAML storage logic for connection metadata in `internal/connection/storage.go`
- [x] T006 Implement Keyring integration for secure password storage in `internal/connection/storage.go`
- [x] T007 Implement SSH Tunneling logic in `internal/ssh/tunnel.go`
- [x] T008 [P] Setup TypeScript interfaces for Connection in `frontend/src/wailsjs/go/models.ts` (via `wails generate`)

**Checkpoint**: Foundation ready - connection logic and secure storage are available for the backend.

---

## Phase 3: User Story 1 - List and Navigate Connections (Priority: P1) 🎯 MVP

**Goal**: Show saved connections in sidebar and main dashboard.

**Independent Test**: Verify that connections saved in `connections.yaml` appear in both sidebar and dashboard lists.

### Implementation for User Story 1

- [x] T009 [US1] Implement `GetConnections` in `internal/connection/service.go`
- [x] T010 [US1] Expose `GetConnections` via `App.GetConnections` in `app.go`
- [x] T011 [P] [US1] Create connection sidebar item component in `frontend/src/components/sidebar/connection-item.tsx`
- [x] T012 [US1] Update `frontend/src/components/sidebar/sidebar.tsx` to fetch and display connections
- [x] T013 [P] [US1] Create connection card component for dashboard in `frontend/src/components/connections/connection-card.tsx`
- [x] T014 [US1] Update `frontend/src/routes/index.tsx` to show connection grid/list

**Checkpoint**: User Story 1 functional - users can see their existing connections.

---

## Phase 4: User Story 2 - Create New Connection (Priority: P1)

**Goal**: Create a new connection with advanced options.

**Independent Test**: Successfully create a connection with name, host, and password, and see it persist after app restart.

### Implementation for User Story 2

- [x] T015 [US2] Implement `CreateConnection` and `TestConnection` in `internal/connection/service.go`
- [x] T016 [US2] Expose `CreateConnection` and `TestConnection` in `app.go`
- [x] T017 [P] [US2] Create connection form component in `frontend/src/components/connections/connection-form.tsx`
- [x] T018 [US2] Implement "New Connection" route in `frontend/src/routes/connections/new.tsx`
- [x] T019 [US2] Add form validation for required fields in the UI
- [x] T020 [US2] Integrate "Test Connection" button with backend `TestConnection` method

**Checkpoint**: User Story 2 functional - users can now add new data sources.

---

## Phase 5: User Story 3 - Edit and Delete Connections (Priority: P2)

**Goal**: Modify or remove existing connections.

**Independent Test**: Edit a connection name and see it update; delete a connection and confirm it disappears from YAML and Keyring.

### Implementation for User Story 3

- [x] T021 [US3] Implement `UpdateConnection` and `DeleteConnection` in `internal/connection/service.go`
- [x] T022 [US3] Expose `UpdateConnection` and `DeleteConnection` in `app.go`
- [x] T023 [US3] Implement "Edit Connection" route in `frontend/src/routes/connections/$id.tsx` reusing `ConnectionForm`
- [x] T024 [US3] Add deletion confirmation dialog in `frontend/src/components/connections/delete-dialog.tsx`

**Checkpoint**: User Story 3 functional - full CRUD lifecycle is complete.

---

## Phase 6: User Story 4 - Keyboard Shortcuts and i18n (Priority: P3)

**Goal**: Add shortcuts and local language support.

**Independent Test**: Press `Cmd+N` to open the new connection form; switch language and see form labels translate.

### Implementation for User Story 4

- [x] T025 [P] [US4] Add Portuguese translations for all connection fields in `frontend/src/translations/pt.json`
- [x] T026 [P] [US4] Add English translations for all connection fields in `frontend/src/translations/en.json`
- [x] T027 [US4] Implement global keyboard shortcuts (Cmd+N, Cmd+S, Cmd+Backspace) in `frontend/src/routes/__root.tsx` using `react-hotkeys-hook`

**Checkpoint**: User Story 4 functional - power user features and localization active.

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Final touches and verification

- [x] T028 Add unit tests for `internal/connection/storage.go` covering YAML and Keyring edge cases
- [x] T029 [P] Update `README.md` with new keyboard shortcuts
- [x] T030 Run full validation of `specs/006-manage-connections/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Must finish T001-T003 first.
- **Foundational (Phase 2)**: T004-T008 are blocking for all US phases.
- **User Stories (Phase 3-6)**: Should be implemented in priority order (US1 & US2 first).

### User Story Dependencies

- **US1**: Needs Foundational.
- **US2**: Needs Foundational.
- **US3**: Needs US2 (reuses form).
- **US4**: Can be added last.

### Parallel Opportunities

- T011, T013 can be done in parallel (UI components).
- T025, T026 translations can be done in parallel.
- Frontend routes (T018, T023) can be developed once the base `ConnectionForm` (T017) is ready.

---

## Implementation Strategy

### MVP First (User Story 1 & 2)

Focus on listing existing connections and creating new ones. This provides the most immediate value.

### Incremental Delivery

1. Setup & Foundation (Backend logic & storage)
2. US1 (Sidebar & Dashboard listing)
3. US2 (Creation form & Test connection)
4. US3 (Editing & Deletion)
5. US4 (Shortcuts & i18n)

---

## Notes

- Verify that `zalando/go-keyring` works on the current development OS during T006.
- Ensure `TestConnection` is non-blocking (Wails calls are async by default from frontend, but ensure Go logic doesn't hang the event loop).
- Confirmation dialogs for deletion are mandatory for safety.
