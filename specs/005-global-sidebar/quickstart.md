# Quickstart: Verifying the Global Sidebar

## Prerequisites
- The application must be running (`wails dev`).

## Verification Steps

1.  **Visibility Check**:
    - Launch the app.
    - Verify that a sidebar appears on the left side of the window.

2.  **Resizing**:
    - Hover over the border between the sidebar and the main content.
    - Click and drag to resize the sidebar.
    - Verify the sidebar width persists after reloading the page.

3.  **Connection List**:
    - If you have saved connections, verify they appear in the list.
    - If you have NO connections, verify the "Empty State" message appears in the sidebar.

4.  **Navigation**:
    - Click on a connection in the sidebar (if functionality is linked).
    - Navigate to "Settings" via the app menu (or URL).
    - Verify the sidebar REMAINS visible and unchanged while the main content updates.

5.  **New Connection**:
    - Click the "New Connection" button (icon).
    - Verify it triggers the expected action (console log or dialog opening).
