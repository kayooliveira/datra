# Implementation Plan: Connection Empty State

**Branch**: `001-connection-empty-state` | **Date**: 2026-01-26 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `specs/001-connection-empty-state/spec.md`

## Summary

Implement Datra’s first-run experience when there are no saved database connections: an IDE-style
empty workspace that guides the user to create a new connection via a prominent primary action and
clear, minimal onboarding copy.

## Technical Context

**Language/Version**: Go 1.23 (backend) + Node/React (frontend)  
**Primary Dependencies**: Wails v2 (Go), React 18, Vite 3  
**Storage**: Local files (JSON) under user config directory for non-secret connection metadata  
**Testing**: `go test ./...` for backend/domain logic; manual UI verification checklist for frontend  
**Target Platform**: Desktop (macOS, Windows, Linux)  
**Project Type**: Wails desktop app (Go backend at repo root + `frontend/` UI)  
**Performance Goals**: Empty state interactive < 1s; navigation/UI updates feel instantaneous (< 100ms)  
**Constraints**: Keyboard-only usable; small-window usable; no secrets in logs; do not block UI thread  
**Scale/Scope**: Single-user desktop app; dozens of saved connections expected

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] IDE UX: fits IDE-style multi-pane workspace; keyboard-friendly interactions included
- [x] Security: treats inputs as untrusted; avoids logging secrets; safe UX for future destructive actions
- [x] Performance: no UI blocking; async loading; responsive UX for first-run
- [x] Productivity: incremental change; backend logic testable; manual verification checklist included
- [x] Architecture: Go owns data/business logic; Wails boundary uses explicit request/response shapes

## Project Structure

### Documentation (this feature)

```text
specs/001-connection-empty-state/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── openapi.yaml
└── tasks.md            # Produced by /speckit.tasks
```

### Source Code (repository root)

```text
# Go (Wails backend)
app.go
main.go
internal/
  connections/
    model.go
    store.go
    store_file.go
    service.go
    service_test.go

# React frontend
frontend/
  src/
    layout/
      WorkspaceLayout.jsx
      WorkspaceLayout.css
    features/
      connections/
        ConnectionEmptyState.jsx
        ConnectionEmptyState.css
        CreateConnectionModal.jsx
        connections.types.js
    main.jsx
    App.jsx
```

**Structure Decision**: Use the existing Wails layout (Go at repo root, React in `frontend/`). Add
Go domain code under `internal/` and add UI feature modules under `frontend/src/features/`.

## Phase 0: Research (complete)

See [research.md](research.md) for decisions on:
- Persisting non-secret connection metadata as JSON in the user config directory
- Keeping credential storage out-of-scope for this feature (future Keychain/Credential Manager)
- Implementing the IDE-style empty state with minimal custom UI (no new component library)

## Phase 1: Design (complete)

See:
- [data-model.md](data-model.md) for connection entity design
- [contracts/openapi.yaml](contracts/openapi.yaml) for connection CRUD contract (conceptual)
- [quickstart.md](quickstart.md) for manual verification steps

High-level design:
- Backend exposes a minimal “connections service” through Wails bindings:
  - list existing connections
  - create a new connection
- Frontend renders an IDE-style workspace shell. When there are zero connections, it shows a guided
  empty state with a single primary CTA and a secondary “menu/shortcut hint”.

Security boundary:
- The initial implementation persists non-secret metadata only (name/type/host/etc.). Credentials
  are not stored yet; this prevents accidental insecure storage until OS-keychain integration exists.

## Phase 2: Implementation Plan (tasks planning)

1. Backend: add connection model + file-backed store under `internal/connections/`
2. Backend: expose `ListConnections` and `CreateConnection` methods on the Wails-bound App
3. Frontend: implement IDE-style workspace layout shell (panes + tabs placeholders)
4. Frontend: implement “no connections” empty state with keyboard-first focus behavior
5. Frontend: implement minimal “Create Connection” modal to create a connection entry
6. Testing: add Go unit tests for store/service behavior; add manual UI checklist in quickstart

Scope guardrails:
- No real database connectivity in this feature
- No credential storage in this feature
- No full schema browsing in this feature
