# Implementation Plan: Connection Profiles & Sessions

**Branch**: `007-connection-manager` | **Date**: 2026-01-29 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/007-connection-manager/spec.md`

## Summary

The **Connection Manager** enables users to creating, saving, and managing database connection profiles (MySQL, PostgreSQL, SQLite) with secure password storage via OS Keyring. It introduces the concept of **Sessions** (active connection pools) and **Metadata** (schema/table exploration). The backend (Go) manages security and connection pooling, while the frontend (React) provides an IDE-like interface for managing these resources.

**Key Technical Decisions**:
- **Security**: `zalando/go-keyring` for password storage.
- **Pooling**: `database/sql` standard library.
- **API**: Wails-bound Go methods (`GetProfiles`, `Connect`, `ExecuteQuery`).
- **State**: Backend holds connection pools; Frontend holds UI state and metadata cache (TanStack Query).

## Technical Context

**Language/Version**: Go 1.23 (Backend), TypeScript 5.x / React 18.2.0 (Frontend)
**Primary Dependencies**: 
- Backend: `wails/v2`, `zalando/go-keyring`, `go-sql-driver/mysql`, `jackc/pgx/v5`, `mattn/go-sqlite3` (or `modernc`).
- Frontend: `@tanstack/react-query`, `lucide-react`, `zustand` (optional, or React Context).
**Storage**: `~/.datra/connections.yaml` (Profiles metadata), OS Keyring (Passwords).
**Testing**: `go test ./...` (Backend unit), `vitest` (Frontend components).
**Target Platform**: Desktop (macOS, Windows, Linux).
**Performance Goals**: Connection switch < 200ms, UI non-blocking during metadata fetch.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] IDE UX: Supports sidebar navigation for connections and tabbed SQL editors.
- [x] Security: Credentials stored in OS Keyring; no raw passwords sent to Frontend.
- [x] Performance: Metadata loading is lazy/async; connection pools reused.
- [x] Productivity: Wails bindings provide strict types; Go unit tests for connection logic.
- [x] Architecture: Go manages `*sql.DB` pools; React handles display logic only.

## Project Structure

### Documentation (this feature)

```text
specs/007-connection-manager/
├── plan.md              # This file
├── research.md          # Technical decisions
├── data-model.md        # Entity definitions
├── quickstart.md        # Usage guide
├── contracts/           # API definitions
│   └── api.md
└── tasks.md             # To be created
```

### Source Code

```text
# Backend (Go)
/
├── internal/
│   ├── connection/      # connection-manager package
│   │   ├── manager.go   # Profile CRUD & Keyring integration
│   │   ├── session.go   # Active session pool management
│   │   ├── metadata.go  # Schema/Table fetching logic
│   │   └── models.go    # Struct definitions
│   └── database/        # (Existing or new common DB utilities)

# Frontend (React)
frontend/src/
├── components/
│   ├── connections/     # Connection-related components
│   │   ├── ConnectionList.tsx
│   │   ├── ConnectionForm.tsx
│   │   └── MetadataTree.tsx
├── hooks/
│   └── useConnections.ts # React Query hooks
└── wailsjs/go/          # Generated bindings
```

**Structure Decision**: A new `internal/connection` package will encapsulate all logic for profiles and sessions to keep the root `app.go` clean.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| (None)    |            |                                     |