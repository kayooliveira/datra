# Wails API Contract: Settings

## App Service

### GetSettings
Returns the current user settings.
- **Signature**: `GetSettings() UserPreferences`
- **Output**: `UserPreferences` object.

### SaveSettings
Persists updated settings.
- **Signature**: `SaveSettings(settings UserPreferences) error`
- **Input**: `UserPreferences` object.

## Events (Wails Runtime)

### open-settings
Emitted from the backend when "Settings" is clicked in the native menu.
- **Payload**: None
- **Frontend Action**: Show Settings page/modal.
