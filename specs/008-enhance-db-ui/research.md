# Research & Decisions: Enhance Database UI/UX

**Feature**: Enhance Database UI/UX (008-enhance-db-ui)
**Date**: 2026-02-01

## 1. Tabbed Interface State Management

**Decision**: Custom **Zustand** store (`useTabStore`).
**Rationale**: 
- Lightweight and fits the existing architecture (already using Zustand for sessions).
- Needs to manage an array of tab objects `{ id, title, query, results, context }`.
- Allows tabs to persist state (query text, scroll position) when switching, which is critical for DX.
- Avoiding a heavy UI library for tabs allows for full styling control (VS Code style).

**Alternatives Considered**:
- *React Context*: Too much re-rendering for frequently changing query text in multiple tabs.
- *Radix UI Tabs*: Good for the UI component itself, but still needs external state management for the *data* of the tabs. We will likely use the *visual* primitives or build simple `<div>` based tabs, but the *logic* will be Zustand.

## 2. High-Performance Data Grid

**Decision**: **TanStack Table (v8)** + **@tanstack/react-virtual**.
**Rationale**:
- **Headless**: Gives full control over markup and styling (essential for "fixing the ugly table").
- **Performance**: Virtualization is mandatory for database results. `react-virtual` pairs perfectly with `react-table`.
- **Features**: Built-in column resizing, sorting, and flexible cell rendering.
- **Ecosystem**: Consistent with other TanStack libraries already in use.

**Alternatives Considered**:
- *React Data Grid*: Good performance, but opinionated styling and different API paradigm.
- *Ag-Grid*: Overkill (enterprise features not needed), large bundle size.

## 3. Sidebar Selection & Context

**Decision**: **Zustand** store (`useSelectionStore`) + Recursive Component Optimization.
**Rationale**:
- **Performance**: Prop-drilling selection state in a deep tree (MetadataTree) causes massive re-renders. A store allows individual tree nodes to subscribe to `state.selectedId === this.id`.
- **Context Switching**: When a node is selected, it updates `sessionStore.activeContext`. The Editor subscribes to this to inject `USE <schema>` (if supported) or highlight the current target.

## 4. Handling Large Result Sets

**Decision**: **Hard Limit (Default 100)** + **Virtualization**.
**Rationale**:
- **Performance**: Sending 100k rows over the Wails bridge (JSON serialization) freezes the app.
- **UX**: Users rarely read 100k rows. 
- **Mechanism**:
    - Default `LIMIT 100` appended to queries if no limit exists.
    - UI dropdown to select 100, 500, 1000, Unlimited.
    - "Unlimited" shows a warning toast/modal.
    - Virtualization ensures the DOM handles whatever we *do* fetch (up to ~10-50k safely). For massive exports, we should eventually stream to file (out of scope for this specific UI task, but good to keep in mind).

## 5. Styling Strategy

**Decision**: **Tailwind CSS** (Extension of existing system).
**Rationale**:
- consistent with current codebase.
- We need to define semantic colors for the "IDE look" (e.g., `bg-editor-bg`, `border-panel-border`) to ensure Dark Mode looks professional.
