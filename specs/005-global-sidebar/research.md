# Research: Resizable Sidebar Implementation

## Decision
**Selected Approach**: `react-resizable-panels`

## Rationale
To fulfill the "IDE-Style UX" principle requiring a resizable and collapsible sidebar, we evaluated implementing a custom solution versus using an established library. `react-resizable-panels` was selected because:

1.  **Robustness**: It handles complex edge cases (keyboard support, ARIA attributes, nested panels) out of the box.
2.  **Performance**: It uses efficient event listeners and avoids layout thrashing.
3.  **Popularity & Maintenance**: It is the underlying primitive for many modern UI libraries (like shadcn/ui).
4.  **Simplicity**: It provides a clean API (`PanelGroup`, `Panel`, `PanelResizeHandle`) that fits well with our React functional component structure.

## Alternatives Considered

### Custom Implementation (Mouse Events)
- **Pros**: Zero dependencies.
- **Cons**: High effort to get right (handling iframe overlays, text selection, minimum widths, keyboard accessibility). easy to introduce bugs.

### `re-resizable`
- **Pros**: Flexible, supports all directions.
- **Cons**: More generic component, less specialized for "panel layouts" typical in IDEs. Heavier API for this specific use case.

## Implementation Strategy
- Install `react-resizable-panels`.
- Wrap the main layout in `src/routes/__root.tsx` with a `PanelGroup`.
- Place the Sidebar in the left `Panel` and the `<Outlet />` in the right `Panel`.
- Use local storage (via the library's `onLayout` callback or a wrapper) to persist the sidebar width between sessions, enhancing the IDE experience.
