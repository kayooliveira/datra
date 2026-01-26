# Quickstart: Connection Empty State

**Feature**: `001-connection-empty-state`

## Run

- Install frontend deps: `cd frontend && npm install`
- Run in dev mode: `wails dev`

## Manual Verification Checklist

### First-run empty state

1. Start Datra with **zero saved connections**.
2. Verify the main workspace shows an empty state guiding you to create a connection.
3. Verify there is exactly one prominent primary CTA: **Create New Connection**.
4. Verify a secondary hint exists (e.g., menu location / shortcut hint) without competing with the primary CTA.

### Keyboard-only

5. Without using the mouse, press `Tab` until the primary CTA is focused.
6. Press `Enter`/`Space` to open the connection creation flow.

### Small window

7. Resize the window smaller.
8. Verify the empty-state guidance and primary CTA remain visible and usable.

### Create connection (metadata only)

9. Create a connection with valid inputs.
10. Verify the navigation tree now shows the new connection.
11. Verify the empty-state no longer appears.

### Cancel

12. Open the connection creation flow.
13. Cancel/close it.
14. Verify the empty state remains and no connection is added.

## Notes

- This feature does not include real database connectivity.
- This feature does not persist secrets (passwords/tokens) yet.
