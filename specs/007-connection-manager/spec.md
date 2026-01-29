# Feature Specification: Connection Profiles & Sessions

**Feature Branch**: `007-connection-manager`
**Created**: 2026-01-29
**Status**: Draft
**Input**: User description provided in command arguments.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Manage Connection Profiles (Priority: P1)

Users need to define and persist connection details for various databases so they can easily reconnect later without re-entering credentials.

**Why this priority**: Core prerequisite for connecting to any database.

**Independent Test**: Can be tested by creating a profile, restarting the application, and verifying the profile persists with obscured credentials.

**Acceptance Scenarios**:

1. **Given** the user is on the connections screen, **When** they fill in valid details (Host, User, Password, etc.) and click "Save", **Then** a new profile is created and displayed in the list.
2. **Given** an existing profile, **When** the user edits the "Host" field and saves, **Then** the profile is updated with the new host.
3. **Given** a stored profile, **When** the user clicks "Test Connection", **Then** the system attempts a transient connection and reports success or error without creating a persistent session.
4. **Given** a profile with a password, **When** the profile is displayed in the UI, **Then** the password field is masked or hidden, and the raw password is never exposed to the frontend code.

---

### User Story 2 - Connect and Manage Sessions (Priority: P1)

Users need to establish active connections (sessions) from their profiles to interact with the databases.

**Why this priority**: Essential for performing any operations on the database.

**Independent Test**: Can be tested by connecting to two different databases simultaneously and verifying both connections remain active.

**Acceptance Scenarios**:

1. **Given** a saved profile, **When** the user clicks "Connect", **Then** a new active session is established, indicated by a visual status change (e.g., green indicator).
2. **Given** an active session, **When** the user clicks "Disconnect", **Then** the session is closed, the connection pool is drained, and the status updates to disconnected.
3. **Given** an active session, **When** the user initiates a disconnect, **Then** any running queries or operations for that session are cancelled.
4. **Given** Profile A and Profile B, **When** the user connects to both, **Then** two independent sessions exist simultaneously.

---

### User Story 3 - Explore Database Metadata (Priority: P2)

Users need to see the structure of their database (schemas, tables) to know what to query.

**Why this priority**: Users need context to write SQL queries.

**Independent Test**: Connect to a database with a large number of tables and verify the UI remains responsive while loading.

**Acceptance Scenarios**:

1. **Given** an active session, **When** the user expands the connection node, **Then** the list of schemas/databases is loaded lazily (on demand).
2. **Given** a loaded schema, **When** the user expands it, **Then** the list of tables is loaded lazily and cached.
3. **Given** a changed database schema, **When** the user clicks "Refresh", **Then** the local cache is invalidated and the metadata is re-fetched from the database.
4. **Given** a slow network connection, **When** metadata is loading, **Then** the UI shows a loading state but does not freeze.

---

### User Story 4 - Execute Queries in Session Context (Priority: P2)

Users need to run SQL queries against a specific active session.

**Why this priority**: The primary function of a SQL client.

**Independent Test**: Open tabs for different sessions and run `SELECT current_database()` (or equivalent) to verify context.

**Acceptance Scenarios**:

1. **Given** an active session, **When** the user opens a new SQL tab, **Then** the tab is visually bound to that specific session.
2. **Given** a long-running query, **When** the execution exceeds the timeout or the user clicks "Cancel", **Then** the query is terminated on the server side if supported.
3. **Given** a query returning many rows, **When** results are displayed, **Then** they are paginated or limited to prevent UI performance issues.

### Edge Cases

- **Invalid Credentials**: System must return a clear error message from the driver without crashing.
- **Network Failure**: Active sessions must detect dropped connections and allow manual reconnection.
- **Database Restart**: If the target database restarts, the session should mark itself as disconnected or attempt transparent reconnection if safe.
- **Corrupt Profile Data**: If the local settings file is corrupt, the app should handle it gracefully (e.g., backup and reset, or alert user) rather than crashing on startup.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST allow users to create, read, update, duplicate, and delete connection profiles.
- **FR-002**: Each connection profile MUST support: ID, Name, Driver Type (MySQL, PostgreSQL, SQLite), Host, Port (or file path), Database Name, Username, Password, SSL Mode, and custom parameters.
- **FR-003**: The backend MUST encrypt sensitive profile data (passwords) at rest using a secure encryption method.
- FR-004: The backend MUST NEVER send raw passwords to the frontend; passwords should only be handled within the backend context.
- **FR-005**: The system MUST allow "Testing" a connection profile to verify validity without persisting a session.
- **FR-006**: The system MUST support multiple simultaneous active sessions (connections) to different databases.
- **FR-007**: Each active session MUST maintain its own connection pool (where the driver supports it).
- **FR-008**: The system MUST load database metadata (schemas, tables) lazily (on-demand) and non-blocking to the UI.
- **FR-009**: The system MUST cache loaded metadata to improve performance, with a manual "Refresh" option to clear the cache.
- **FR-010**: Query execution MUST support cancellation (user-initiated or timeout-based).
- **FR-011**: Disconnecting a session MUST cancel all in-flight operations and close the connection pool for that session.
- **FR-012**: SQL execution tabs MUST be strictly bound to a single active session, and the UI MUST indicate this association.
- **FR-013**: Query results MUST be paginated or strictly limited by default to prevent UI rendering freezes.

### Key Entities

- **Connection Profile**: configuration entity containing connectivity details (host, port, credentials).
- **Session**: runtime entity representing an active connection pool to a specific profile.
- **Metadata Cache**: client-side (or backend memory) cache of the database structure (schemas, tables, columns) associated with a session.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can create and save a new valid connection profile in under 30 seconds.
- **SC-002**: Switching between two active session tabs takes less than 200ms (perceived instant).
- **SC-003**: Metadata loading for a schema with 100 tables completes (or shows partial results) without blocking the main UI thread.
- **SC-004**: No sensitive credentials (passwords) are ever visible in plain text in the application logs, frontend state, or configuration files.
- **SC-005**: 100% of "Disconnect" actions successfully terminate the underlying database connection within 5 seconds.