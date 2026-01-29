# Quickstart: Connection Management

## Development Setup

1. **Prerequisites**:
    - Go 1.23+
    - Node.js 20+
    - Wails v2.11.0+
2. **Installation**:
    ```bash
    wails dev
    ```

## Manual Verification Steps

### 1. Create a Connection
- Open the application.
- Use shortcut `Cmd+N` or click "New Connection" in the sidebar.
- Fill in the details for a local database (e.g., MySQL).
- Click "Test Connection" -> Should show success.
- Click "Save" -> Connection should appear in the sidebar.

### 2. Verify Security
- Check `~/.datra/connections.yaml`.
- Ensure your password is NOT visible in the file.
- (Optional) Use your OS Keychain tool to verify `datra` service entries exist.

### 3. Edit and Delete
- Click the edit icon next to the connection.
- Change the name and save -> Update should be reflected immediately.
- Delete the connection -> Confirm prompt -> Connection should be removed from the sidebar.

## Key Shortcuts

- `Cmd+N`: Open New Connection dialog.
- `Cmd+S`: Save Connection (when in form).
- `Cmd+Backspace`: Delete selected connection.
