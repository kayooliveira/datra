# Quickstart: i18n and Settings Page

## Implementation Steps

1. **Backend**:
   - Update `app.go` to include `GetSettings` and `SaveSettings`.
   - Update `main.go` to define the native menu.
   - Map "Settings" menu item to `EventsEmit(ctx, "open-settings")`.

2. **Frontend**:
   - Create `src/contexts/SettingsContext.jsx` to manage i18n and theme state.
   - Use `data-theme` attribute on `body` for CSS theme switching.
   - Listen for `open-settings` event to navigate to `/settings`.

## Verification

1. **Native Menu**: Click "Settings" in the OS menu bar. Does it open the page?
2. **i18n**: Change language to "Português". Do all labels update instantly?
3. **Theme**: Toggle "Dark" mode. Does the background change without refresh?
4. **Persistence**: Change settings, restart app. Are they preserved?
