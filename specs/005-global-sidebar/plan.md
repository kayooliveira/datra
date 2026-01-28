# Implementation Plan: Global Sidebar

**Branch**: `005-global-sidebar` | **Date**: 2026-01-28 | **Spec**: [specs/005-global-sidebar/spec.md](../spec.md)
**Input**: Feature specification from `specs/005-global-sidebar/spec.md`

## Summary

Implement a global, resizable sidebar component that persists across all application screens. It will display a list of database connections, provide an "Empty State" when no connections exist, and include a "New Connection" action. The implementation will leverage the existing TanStack Router layout.

## Technical Context

**Language/Version**: React 18.2.0 (Frontend), TypeScript (Frontend)
**Primary Dependencies**: `lucide-react` (Icons), `@tanstack/react-router` (Routing), `react-resizable-panels`
**Storage**: N/A (Consumes existing `GetConnections` API)
**Testing**: Manual verification (Component tests recommended but not mandatory per current workflow)
**Target Platform**: Wails Desktop Application
**Project Type**: Desktop App (React Frontend + Go Backend)
**Performance Goals**: Instant render, smooth scrolling for 50+ items.
**Constraints**: Must integrate with existing `__root.tsx` layout.
**Scale/Scope**: Single component, global usage.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] IDE UX: Sidebar is a core IDE pattern; resizable/collapsible nature aligns with principles.
- [x] Security: No new data handling; displays existing secure connection profiles.
- [x] Performance: Client-side rendering of lists; minimal overhead.
- [x] Productivity: Simplifies navigation for users; modular component for devs.
- [x] Architecture: Pure React presentation component; data via Wails bridge.

## Project Structure

### Documentation (this feature)

```text
specs/005-global-sidebar/
├── plan.md              # This file
├── research.md          # Library selection for resizable sidebar
├── data-model.md        # UI state model
├── quickstart.md        # N/A (UI Feature)
└── tasks.md             # Implementation tasks
```

### Source Code

```text
frontend/
├── src/
│   ├── components/
│   │   ├── sidebar/             # [NEW] Sidebar components
│   │   │   ├── sidebar.tsx      # Main container
│   │   │   ├── connection-list.tsx
│   │   │   ├── empty-state-sidebar.tsx
│   │   │   └── resizable-handle.tsx
│   │   └── ui/                  # [NEW] Shared UI atoms (if needed)
│   ├── routes/
│   │   └── __root.tsx           # [UPDATE] Integrate Sidebar here
```

**Structure Decision**: modular component structure in `src/components/sidebar` to keep sidebar logic encapsulated.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| New Dependency (Resizable) | IDE-like experience requires flexible layout | Fixed width is too rigid for variable connection names |