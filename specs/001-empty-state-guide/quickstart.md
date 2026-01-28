# Quickstart: Empty State Guide

## Prerequisites

- Go 1.23+
- Node.js 18+
- Wails CLI (`go install github.com/wailsapp/wails/v2/cmd/wails@latest`)

## Running the App

1. **Start Dev Mode**:
   ```bash
   wails dev
   ```

2. **Verify Empty State**:
   - Ensure `~/.datra/connections.yaml` does NOT exist (or rename it temporarily).
   - App should launch and show "No Database Connections" with the "Create New Connection" button.

3. **Verify Populated State (Mock)**:
   - Create a dummy `~/.datra/connections.yaml`:
     ```yaml
     - id: "1"
       name: "Test DB"
       type: "mysql"
     ```
   - (Note: Until the backend reader is fully implemented in this feature, you might need to mock the return in `app.go` or rely on the empty state logic being the default).
   - *For this feature scope*, verifying the Empty State appears when no file exists is the primary test.

## Troubleshooting

- **White screen**: Check frontend console for React errors.
- **Backend errors**: Check the terminal running `wails dev`.
