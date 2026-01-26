<!--
Sync Impact Report
- Version change: unversioned template → 1.0.0
- Modified principles: N/A (template placeholders replaced)
- Added sections: Core Principles (filled), Architecture & Tech Stack, Development Workflow, Governance (filled)
- Removed sections: None
- Templates requiring updates:
	- ✅ .specify/templates/plan-template.md
	- ✅ .specify/templates/tasks-template.md
	- ⚠️ .specify/templates/commands/*.md (directory not present in this repo)
- Deferred items:
	- TODO(RATIFICATION_DATE): Original constitution ratification date unknown
-->

# Datra Constitution

## Core Principles

### I. IDE-Style UX (Database Manager)
Datra is a desktop database manager. The UI MUST follow an IDE-style layout inspired by tools like
DBeaver and HeidiSQL: resizable panes, a left-side navigation tree, a primary editor/worksheet area,
and a bottom results/logs area.

User workflows MUST be discoverable, keyboard-friendly, and consistent (tabs, context menus,
shortcuts, and view switching behave predictably).

Rationale: A database manager succeeds on workflow efficiency and familiar interaction patterns.

### II. Security First
All inputs (UI fields, imported files, DB responses, connection strings) MUST be treated as
untrusted. Secrets MUST NOT be logged. Credentials MUST be stored using OS-appropriate secure
storage when added (Keychain/Credential Manager/etc.), or not stored at all.

Any feature that executes SQL MUST make execution intent explicit (e.g., separate “Run” vs “Save”,
clear connection context, and confirmation for destructive operations when reasonable).

Rationale: Database tools handle sensitive data and high-impact operations.

### III. Performance & Responsiveness
The app MUST remain responsive during long operations (connection, schema loading, query
execution). Heavy work MUST run off the UI thread, with cancellation where feasible and progressive
feedback (loading state, progress, or partial results).

Rationale: Perceived performance is a core part of the UX for an IDE-style tool.

### IV. Developer Productivity & Maintainability
Prefer clear, incremental changes that keep the app buildable at all times. Non-trivial logic MUST
be testable and covered by tests (at least unit tests for Go domain logic). UI-heavy work MUST
include a manual verification checklist.

New dependencies MUST be justified and kept minimal.

Rationale: Fast iteration and reliability require disciplined engineering practices.

### V. Clear Go/React Boundaries
Business logic and system integration MUST live in Go. React is responsible for presentation and
UI state. All cross-boundary calls MUST go through Wails bindings with explicit input/output shapes.

Rationale: Prevents duplicated logic and keeps the architecture understandable.

## Architecture & Tech Stack

- App type: Desktop database manager
- Backend: Go (module: `datra`, currently Go 1.23)
- Desktop framework: Wails v2
- Frontend: React + Vite under `frontend/`
- UX layout expectation: IDE-style multi-pane workspace with tabs and resizable splits

Constraints:
- Avoid blocking the UI thread.
- Data crossing Go/React boundary MUST be validated and schema/versioned when persisted.
- Logging MUST be structured and MUST redact secrets.

## Development Workflow

- PRs MUST include a short description, manual verification steps, and security/performance impact.
- Go changes MUST run `go test ./...` locally or in CI.
- Frontend changes MUST run the configured lint/build/test commands when present.
- If a PR violates a principle, it MUST include an explicit exception rationale and mitigation.

## Governance
<!-- Example: Constitution supersedes all other practices; Amendments require documentation, approval, migration plan -->

This constitution supersedes local conventions and ad-hoc practices.

Amendments:
- Any change MUST be proposed in a PR.
- The PR MUST explain motivation, expected impact, and any migration needed.
- Versioning policy is Semantic Versioning:
	- MAJOR: backward-incompatible governance changes or principle removals/redefinitions
	- MINOR: new principle/section or materially expanded guidance
	- PATCH: clarifications, typo fixes, non-semantic refinements

Compliance review:
- Reviewers MUST check PRs for constitution compliance.

**Version**: 1.0.0 | **Ratified**: TODO(RATIFICATION_DATE): Original adoption date unknown | **Last Amended**: 2026-01-26
