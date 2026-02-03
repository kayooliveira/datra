# Quickstart: Connection Manager

## Prerequisites
- Ensure `zalando/go-keyring` dependencies are met (e.g., `libsecret-1-dev` on Linux).
- Run `go mod tidy` to fetch new backend dependencies.

## Usage

### 1. Adding a Profile
1. Navigate to the **Connections** tab in the sidebar.
2. Click **"+" (New Connection)**.
3. Select Driver (e.g., PostgreSQL).
4. Fill in details:
   - Host: `localhost`
   - Port: `5432`
   - User: `postgres`
   - Password: `secret`
   - Database: `postgres`
5. Click **Test Connection**. Expect "Connection Successful".
6. Click **Save**.

### 2. Connecting
1. Find your new profile in the sidebar list.
2. Double-click or right-click -> **Connect**.
3. A green indicator should appear next to the profile.

### 3. Exploring Metadata
1. Expand the arrow `>` next to the connected profile.
2. You should see a list of schemas (e.g., `public`).
3. Expand `public`.
4. You should see a list of tables.

### 4. Running a Query
1. With the session active, open a new **SQL Tab** (CMD+T).
2. Ensure the "Active Session" dropdown in the toolbar matches your connection.
3. Type `SELECT * FROM some_table LIMIT 10;`.
4. Run (CMD+Enter).
5. See results in the bottom pane.
