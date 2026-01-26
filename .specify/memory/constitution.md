<!--
Sync Impact Report:
- Version change: [New] -> 1.0.0
- List of modified principles:
  - Security First (New)
  - High Performance (New)
  - Developer Productivity (New)
  - IDE-Style UX (New)
- Added sections: Technology Standards, Development Workflow
- Removed sections: None
- Templates requiring updates: 
  - .specify/templates/plan-template.md (✅ Checked - Generic)
  - .specify/templates/spec-template.md (✅ Checked - Generic)
  - .specify/templates/tasks-template.md (✅ Checked - Generic)
-->

# Datra Constitution

## Core Principles

### I. Security First
Security is paramount. Database credentials, connection strings, and sensitive user data MUST be handled with strict security measures. No plain-text storage of secrets is permitted. Secure communication channels (SSH, SSL/TLS) are MANDATORY for all remote connections to ensure data integrity and confidentiality.

### II. High Performance
The application MUST remain responsive under load. Large datasets (millions of rows) MUST NOT freeze the UI. Memory management in both Wails (Go) and React (JS) MUST be optimized to prevent leaks and excessive consumption. Operations exceeding 100ms SHOULD provide visual feedback; blocking operations MUST run asynchronously to maintain a fluid user experience.

### III. Developer Productivity
The tool is built for developers; therefore, it MUST enhance developer workflows. Features like SQL auto-complete, quick navigation, and snippet management are priorities. The internal codebase MUST also prioritize maintainability and developer experience (DX) through clear documentation, consistent coding standards, and automated testing.

### IV. IDE-Style UX
The user interface MUST follow an IDE-style layout inspired by DBeaver and HeidiSQL. This includes a dense information density, multi-tab support, and pane-based navigation. Whitespace SHOULD be minimized in favor of functional data display to maximize the utility of the screen real estate for database tasks.

## Technology Standards

The project relies on a specific stack to ensure cross-platform compatibility and performance:
- **Backend**: Go (using the Wails framework) for robust system interactions and performance-critical logic.
- **Frontend**: React for a dynamic and responsive user interface.
- **Styling**: Consistent with IDE aesthetics (dense, functional, dark/light mode support).
- **Packaging**: Native binaries for Windows, macOS, and Linux are the required output formats.

## Development Workflow

To ensure quality and stability:
- **Code Review**: All changes MUST pass peer review before merging.
- **Testing**: Unit tests for the Go backend are MANDATORY. Component tests for the React frontend are HIGHLY RECOMMENDED.
- **CI/CD**: Automated builds and tests MUST pass before any merge to the main branch.
- **Branching**: Follow standard Git feature branching workflows.
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

This Constitution supersedes all other project documentation in case of conflict.
- **Amendments**: Changes to this document require a Pull Request with an explicit "Constitution Update" label and team consensus.
- **Compliance**: All new features MUST be checked against these principles during the Planning phase.
- **Versioning**: The Constitution follows Semantic Versioning (Major.Minor.Patch).

**Version**: 1.0.0 | **Ratified**: 2026-01-27 | **Last Amended**: 2026-01-27
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
