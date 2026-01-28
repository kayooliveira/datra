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
- Follow-up TODOs: None
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

## Governance

This Constitution supersedes all other project documentation in case of conflict.
- **Amendments**: Changes to this document require a Pull Request with an explicit "Constitution Update" label and team consensus.
- **Compliance**: All new features MUST be checked against these principles during the Planning phase.
- **Versioning**: The Constitution follows Semantic Versioning (Major.Minor.Patch).

**Version**: 1.0.0 | **Ratified**: 2026-01-27 | **Last Amended**: 2026-01-27