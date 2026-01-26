# Research: Connection Empty State

**Feature**: `001-connection-empty-state`  
**Date**: 2026-01-26

## Decisions

### 1) Persist connection metadata as a local JSON file

**Decision**: Store non-secret connection metadata in a JSON file under the OS user config directory
(e.g., `${UserConfigDir}/datra/connections.json`).

**Rationale**:
- Simple, transparent, and easy to migrate as the schema evolves.
- Works offline and avoids introducing a database dependency for metadata.
- Enables deterministic “zero connections” detection on startup.

**Alternatives considered**:
- SQLite metadata DB: stronger querying/migrations, but heavier for initial iteration.
- Browser-style localStorage: tied to UI, weak for cross-layer source-of-truth.
- Wails-specific storage plugin: adds coupling/unknowns vs straightforward Go file IO.

### 2) Do not store credentials in this feature

**Decision**: Treat credentials as out-of-scope for this feature; persist only non-secret fields.

**Rationale**:
- Avoids insecure storage and accidental logging.
- Leaves room for proper OS-keychain integration later.

**Alternatives considered**:
- Storing passwords in the JSON file (rejected: insecure).
- Homegrown encryption (rejected: still risky; key management hard).

### 3) Implement IDE-style empty state using minimal custom UI

**Decision**: Build the first-run empty state using simple layout primitives (CSS grid/flex) and
minimal custom components rather than introducing a UI component library.

**Rationale**:
- Keeps the dependency surface small.
- Ensures the UI can evolve toward a DBeaver/HeidiSQL-inspired layout without being constrained by
  library assumptions.

**Alternatives considered**:
- Introducing a component library (rejected for now: adds dependency and styling constraints).

### 4) Keyboard-first onboarding

**Decision**: Ensure the primary CTA is focusable and reachable via keyboard-only navigation; make
secondary entry points discoverable (menu/shortcut hint).

**Rationale**:
- Matches IDE-style tooling expectations.
- Improves accessibility and productivity.

**Alternatives considered**:
- Mouse-only onboarding (rejected).

## Resolved Clarifications

- Storage approach: local JSON file in OS config dir.
- Connection creation flow: will be implemented minimally in this feature as a modal/screen sufficient
  to create a connection entry (not actual DB connectivity).
- “IDE-style layout” definition: left navigation tree area, main editor/workspace area, bottom results/logs area; resizable panes as a near-term goal (initial layout can be non-resizable but must be structured to support it).
