# Tasks: Connection Profiles & Sessions

**Feature Branch**: `007-connection-manager`
**Spec**: [specs/007-connection-manager/spec.md](specs/007-connection-manager/spec.md)
**Status**: In Progress

## Dependencies

- **Phase 1 (Setup)**: Blocks everything.
- **Phase 2 (Foundational)**: Blocks all User Stories.
- **Phase 3 (US1)**: Blocks US2.
- **Phase 4 (US2)**: Blocks US3 and US4.
- **Phase 5 (US3)**: Independent of US4.
- **Phase 6 (US4)**: Depends on US2.

## Phase 1: Setup

**Goal**: Initialize project structure and dependencies.

- [ ] T001 Install Go dependencies (`zalando/go-keyring`, SQL drivers) in `go.mod`
- [ ] T002 [P] Install Frontend dependencies (`zustand`, `@tanstack/react-query`) in `frontend/package.json`
- [ ] T003 Create backend package directory `internal/connection/`
- [ ] T004 Create frontend component directories `frontend/src/components/connections/`

## Phase 2: Foundational

**Goal**: Establish core data models and service structures.

- [ ] T005 Define `ConnectionProfile` and `Session` structs in `internal/connection/models.go`
- [ ] T006 [P] Define TypeScript interfaces for Profile and Session in `frontend/src/types/connection.ts` (or `wailsjs` types)
- [ ] T007 Implement basic `ConnectionService` struct in `internal/connection/service.go`
- [ ] T008 Register `ConnectionService` in `main.go` (or `app.go`) for Wails binding

## Phase 3: User Story 1 - Manage Connection Profiles (P1)

**Goal**: Users can create, save, edit, and delete connection profiles with secure password storage.
**Independent Test**: Create a profile, restart app, verify profile exists and password is secure.

### Backend (Profile Management)
- [ ] T009 [US1] Implement `SaveProfile` with Keyring integration in `internal/connection/manager.go`
- [ ] T010 [US1] Implement `GetProfiles` (loading from yaml + masking secrets) in `internal/connection/manager.go`
- [ ] T011 [US1] Implement `DeleteProfile` (removing from yaml and Keyring) in `internal/connection/manager.go`
- [ ] T012 [US1] Implement `TestConnection` (transient check) in `internal/connection/manager.go`
- [ ] T013 [US1] Create unit tests for Profile CRUD and Keyring mocking in `internal/connection/manager_test.go`

### Frontend (Profile UI)
- [ ] T014 [US1] Generate Wails bindings (run `wails dev` or `wails generate`)
- [ ] T015 [US1] Implement `useProfiles` hook with React Query in `frontend/src/hooks/useConnections.ts`
- [ ] T016 [US1] Create `ConnectionForm` component with validation in `frontend/src/components/connections/ConnectionForm.tsx`
- [ ] T017 [US1] Create `ConnectionList` component to display saved profiles in `frontend/src/components/connections/ConnectionList.tsx`
- [ ] T018 [US1] Integrate `ConnectionList` into the Sidebar in `frontend/src/components/sidebar/Sidebar.tsx`

## Phase 4: User Story 2 - Connect and Manage Sessions (P1)

**Goal**: Users can establish active connections to databases and manage them.
**Independent Test**: Connect to two different profiles; verify both show "Connected" status.

### Backend (Session Management)
- [ ] T019 [US2] Define `SessionManager` struct to hold `*sql.DB` pools in `internal/connection/session.go`
- [ ] T020 [US2] Implement `Connect` method (driver initialization) in `internal/connection/session.go`
- [ ] T021 [US2] Implement `Disconnect` method (pool closing) in `internal/connection/session.go`
- [ ] T022 [US2] Implement `GetActiveSessions` method in `internal/connection/session.go`
- [ ] T023 [US2] Create unit tests for Session pool management in `internal/connection/session_test.go`

### Frontend (Session UI)
- [ ] T024 [US2] Implement `useSessions` hook (or extend `useConnections`) in `frontend/src/hooks/useConnections.ts`
- [ ] T025 [US2] Add visual connection status indicators (Green/Gray dots) to `ConnectionList.tsx`
- [ ] T026 [US2] Add context menu actions (Connect/Disconnect) to `ConnectionList.tsx`
- [ ] T027 [US2] Create global session state store (Zustand) in `frontend/src/stores/sessionStore.ts`

## Phase 5: User Story 3 - Explore Database Metadata (P2)

**Goal**: Users can explore schemas and tables for active sessions.
**Independent Test**: Expand a connected profile node to see schemas and tables.

### Backend (Metadata Providers)
- [ ] T028 [US3] Define `MetadataProvider` interface in `internal/connection/metadata.go`
- [ ] T029 [P] [US3] Implement MySQL metadata queries in `internal/connection/metadata_mysql.go`
- [ ] T030 [P] [US3] Implement PostgreSQL metadata queries in `internal/connection/metadata_pg.go`
- [ ] T031 [P] [US3] Implement SQLite metadata queries in `internal/connection/metadata_sqlite.go`
- [ ] T032 [US3] Expose `GetSchemas`, `GetTables`, `GetColumns` in `ConnectionService` (calling providers) in `internal/connection/metadata.go`

### Frontend (Metadata UI)
- [ ] T033 [US3] Implement `useMetadata` hook (lazy loading) in `frontend/src/hooks/useMetadata.ts`
- [ ] T034 [US3] Create `MetadataTree` component (handling expanded state) in `frontend/src/components/connections/MetadataTree.tsx`
- [ ] T035 [US3] Integrate `MetadataTree` as children of `ConnectionList` items

## Phase 6: User Story 4 - Execute Queries (P2)

**Goal**: Users can run SQL queries against specific sessions.
**Independent Test**: Run `SELECT 1` in a tab bound to an active session.

### Backend (Execution)
- [ ] T036 [US4] Implement `ExecuteQuery` with timeout/context in `internal/connection/session.go`
- [ ] T037 [US4] Implement result set formatting (JSON friendly) in `internal/connection/models.go`

### Frontend (Query UI)
- [ ] T038 [US4] Update SQL Editor to accept a `sessionID` prop in `frontend/src/components/editor/SqlEditor.tsx`
- [ ] T039 [US4] Add "Run" button wiring to `ExecuteQuery` Wails method in `frontend/src/components/editor/QueryToolbar.tsx`
- [ ] T040 [US4] Display results in a basic table in `frontend/src/components/results/ResultTable.tsx`
- [ ] T041 [US4] Ensure tab context switching updates the active session in `frontend/src/routes/dashboard.tsx`

## Phase 7: Polish & Cross-Cutting

**Goal**: Refine UX and error handling.

- [ ] T042 Handle connection errors gracefully with Toast notifications in `frontend/src/components/ui/Toaster.tsx`
- [ ] T043 Add loading states (spinners) for Connect/Disconnect actions
- [ ] T044 Verify secure password handling (logs/UI check)
- [ ] T045 Final integration test: Full flow from Create Profile -> Connect -> Query

## Implementation Strategy

- **MVP**: Complete Phase 1-4 (Manage Profiles & Sessions). This allows basic connectivity.
- **Increment 2**: Phase 5 (Metadata).
- **Increment 3**: Phase 6 (Query Execution).