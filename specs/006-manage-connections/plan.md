# Implementation Plan: Connection Management

**Branch**: `006-manage-connections` | **Date**: 2026-01-28 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement a full CRUD (Create, Read, Update, Delete) management system for database connections. This includes a persistent storage mechanism in Go (using OS-native secure storage for secrets), a responsive React UI with a sidebar list and a main management dashboard, and support for keyboard shortcuts and internationalization. The technical approach involves using Wails bindings for Go-logic execution and a cross-platform keyring library for secure credential storage.

## Technical Context

**Language/Version**: Go 1.23, React 18.2.0, TypeScript 5.x
**Primary Dependencies**: Wails v2.11.0, `lucide-react`, `@tanstack/react-router`, `gopkg.in/yaml.v3`, `zalando/go-keyring` (Proposed for secure storage)
**Storage**: `~/.datra/connections.yaml` for metadata, OS Keychain/Credential Manager for passwords.
**Testing**: `go test ./...` for backend, Vitest for frontend.
**Target Platform**: Windows, macOS, Linux (Native binaries via Wails).
**Project Type**: Wails App (Go backend + React frontend).
**Performance Goals**: UI remains fluid; "Test Connection" and "Save" operations must not block the main thread.
**Constraints**: No plain-text password storage; SSL/TLS support required; SSH Tunneling support required.
**Scale/Scope**: Manage N connections; handle complex forms with validation and advanced settings.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] IDE UX: sidebar list and main page table/form follow IDE patterns.
- [x] Security: **CRITICAL**: Password storage will use OS secure storage (Keychain/etc).
- [x] Performance: Async connection testing and saving.
- [x] Productivity: Incremental PRs; unit tests for connection logic.
- [x] Architecture: Connection logic lives in Go; React handles the forms and list rendering.

## Project Structure

### Source Code (repository root)

```text
/
├── app.go               # Wails app lifecycle and connection methods
├── i18n.go              # Backend translations (if needed)
├── internal/
│   ├── connection/      # Go domain logic for connections
│   │   ├── model.go     # Connection entity
│   │   ├── service.go   # CRUD logic
│   │   └── storage.go   # YAML + Keyring integration
│   └── ssh/             # SSH Tunneling logic
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── connections/ # Connection forms and lists
│   │   ├── routes/
│   │   │   ├── index.tsx    # Connection list dashboard
│   │   │   └── connections/
│   │   │       ├── $id.tsx  # Edit connection
│   │   │       └── new.tsx  # Create connection
│   │   └── translations/    # i18n JSON files
```

**Structure Decision**: Standard Wails structure with a new `internal/connection` package for Go logic and a `connections` feature folder in React.


## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
