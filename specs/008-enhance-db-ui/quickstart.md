# Quickstart: Enhance Database UI/UX

**Branch**: `008-enhance-db-ui`

## Prerequisites

- Node.js 18+
- Go 1.23+
- Wails v2 CLI

## Running the UI Refactor

1. **Install new dependencies**:
   ```bash
   cd frontend
   npm install @tanstack/react-table @tanstack/react-virtual
   ```

2. **Start the development server**:
   ```bash
   wails dev
   ```

3. **Verify Sidebar Context**:
   - Connect to a database (e.g., local Postgres/MySQL).
   - Expand the tree to see tables.
   - Click a table.
   - **Expectation**: The item is highlighted blue/gray.

4. **Verify Tabs**:
   - On the main dashboard, you should see a tab bar with "Query 1".
   - Click "+" to add a tab.
   - Type different SQL in each.
   - **Expectation**: Text persists when switching.

5. **Verify Data Grid**:
   - Run `SELECT * FROM table`.
   - **Expectation**: A dense grid appears (not the old HTML table).
   - Hover headers to see resize handles. Drag to resize.

## Troubleshooting

- **"Module not found"**: Ensure you ran `npm install` in `frontend/`.
- **Wails compilation errors**: If `wailsjs/go/models.ts` is missing/outdated, run `wails generate module`.
