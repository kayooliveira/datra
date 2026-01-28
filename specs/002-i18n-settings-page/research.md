# Research: i18n and Settings Page

**Feature**: i18n and Settings Page
**Status**: Complete

## 1. Native Menu Integration (Wails)

**Decision**: Use Wails `Menu` API in `main.go` and `runtime.MenuSetApplicationMenu` if dynamic updates are needed, or simply define it in `options.App`.
**Rationale**: 
- Wails provides native OS menu bar support.
- We can map menu items to Go functions that emit events to the frontend (e.g., `EventsEmit(ctx, "open-settings")`).

## 2. i18n Strategy (React)

**Decision**: Use a lightweight custom Context-based i18n provider for English and Portuguese.
**Rationale**: 
- With only 2 languages, a full library like `react-i18next` might be overkill.
- A custom provider allows for absolute control over performance and re-renders.
- We can load translations as simple JSON objects.

## 3. Theme Switching (CSS Variables)

**Decision**: Use CSS variables on the `:root` or a `[data-theme]` attribute on the `body`.
**Rationale**: 
- CSS variables allow instant theme switching without re-rendering components.
- Avoids layout shifts.
- Easy to manage in a desktop app.

## 4. Persistence

**Decision**: Use `~/.datra/settings.yaml`.
**Rationale**: 
- Consistent with `connections.yaml` from Feature 001.
- Easy for users to inspect.
- Go handles YAML easily with `gopkg.in/yaml.v3`.

## 5. Performance (Desktop App)

**Decision**: 
- Use `React.memo` for static UI parts.
- Ensure the settings state doesn't trigger global re-renders for every single keypress (though settings are usually low-frequency).
- Backend should load settings once and provide them via Wails binding.
