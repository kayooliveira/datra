# Implementation Plan: Empty State Guide

**Branch**: `001-empty-state-guide` | **Date**: 2026-01-27 | **Spec**: [specs/001-empty-state-guide/spec.md](../spec.md)
**Input**: Feature specification from `specs/001-empty-state-guide/spec.md`

## Summary

Implement the initial "Empty State" view for the Datra desktop app. This involves creating a backend method to check for existing connection profiles (stored in `~/.datra/connections.yaml`) and a frontend React component that displays a welcome message and "Create Connection" button when the list is empty.

## Technical Context

**Language/Version**: Go 1.23 (Backend), React 18.2.0 (Frontend)
**Primary Dependencies**: Wails v2.11.0, Lucide React (Icons)
**Storage**: YAML file at `~/.datra/connections.yaml`
**Testing**: Go `testing` (Unit), Manual verification for UI
**Target Platform**: Desktop (Windows, macOS, Linux)
**Project Type**: Single Wails Project (Frontend + Backend)
**Performance Goals**: Render empty state < 100ms
**Constraints**: Must handle theme changes (dark/light), resize
**Scale/Scope**: Minimal data load (checking file existence/size)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Security First**: ✅ No secrets exposed. Future password storage will use secure methods (keychain/encryption), but checking for existence is safe.
- **High Performance**: ✅ Local file check is fast (<10ms). React render is instant.
- **Developer Productivity**: ✅ Config uses YAML for easy manual editing if needed.
- **IDE-Style UX**: ✅ Empty state provides clear "start here" guidance (Action-Oriented).

## Project Structure

### Documentation (this feature)

```text
specs/001-empty-state-guide/
├── plan.md              # This file
├── research.md          # Storage & UI strategy
├── data-model.md        # ConnectionProfile entity
├── quickstart.md        # How to verify
├── contracts/           # API definition
│   └── api.md           # GetConnections contract
└── tasks.md             # To be generated
```

### Source Code (repository root)

```text
# Single Wails Project
.
├── app.go                  # Backend logic (GetConnections)
├── main.go                 # Entry point
├── frontend/
│   ├── src/
│   │   ├── App.jsx         # Main layout / State logic
│   │   ├── components/
│   │   │   └── EmptyState.jsx # New component
│   │   └── wailsjs/        # Generated bindings
```

**Structure Decision**: Standard Wails layout. Refactoring `App.jsx` to use a dedicated `EmptyState` component for better maintainability.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |