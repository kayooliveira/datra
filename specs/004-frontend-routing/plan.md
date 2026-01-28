# Implementation Plan: Frontend Routing

**Branch**: `004-frontend-routing` | **Date**: 2026-01-28 | **Spec**: [specs/004-frontend-routing/spec.md](../spec.md)
**Input**: Feature specification from `specs/004-frontend-routing/spec.md`

## Summary

Implement a client-side routing system using **TanStack Router** to manage application screens and layouts. This choice leverages the project's TypeScript foundation to provide full type safety for navigation and state management.

## Technical Context

**Language/Version**: React 18.2.0 (Frontend), Go 1.23 (Backend), TypeScript
**Primary Dependencies**: `@tanstack/react-router`, `lucide-react`
**Storage**: N/A (Frontend state only)
**Testing**: N/A (Frontend unit tests not yet set up, manual verification required)
**Target Platform**: Wails Desktop Application (uses `file://` protocol, requires Hash Routing)
**Project Type**: Desktop App (React Frontend + Go Backend)
**Performance Goals**: Navigation < 200ms, minimal bundle size increase.
**Constraints**: Must work with Wails asset serving (Hash Routing required).
**Scale/Scope**: Small initial scope (2 screens), but foundation for complex IDE-like app.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] IDE UX: Routing enables URL-based state (search params) which is crucial for shareable/restorable IDE contexts.
- [x] Security: No new security surface area (client-side only).
- [x] Performance: Client-side routing is instant; avoiding full reloads.
- [x] Productivity: Standardizes navigation, making it easier for devs to add screens.
- [x] Architecture: React owns navigation state; Go remains stateless regarding UI views.

## Project Structure

### Documentation (this feature)

```text
specs/004-frontend-routing/
├── plan.md              # This file
├── research.md          # Router comparison and decision
├── data-model.md        # Route tree definition
├── quickstart.md        # Guide: "How to add a new screen"
└── tasks.md             # Implementation tasks
```

### Source Code

```text
frontend/
├── src/
│   ├── routes/          # [NEW] Route definitions and layouts
│   │   ├── _layout.tsx  # Main layout (Sidebar/Header)
│   │   ├── index.tsx    # Home/Connections screen
│   │   └── settings.tsx # Settings screen
│   ├── App.jsx          # Modified to use RouterProvider
│   └── main.jsx         # Entry point
```

**Structure Decision**: Adopting a `src/routes` directory pattern (common in TanStack Router and modern RRD) to keep routing logic organized.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| New Dependency | Routing is essential for multi-view apps | Conditional rendering (current state) is unmaintainable at scale |