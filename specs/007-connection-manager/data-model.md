# Data Model: Connection Profiles & Sessions

## Entities

### 1. ConnectionProfile
Persisted configuration for a database connection.
**Storage**: `~/.datra/connections.yaml` (Metadata only) + OS Keyring (Secrets).

| Field | Type | Description | Visibility |
|-------|------|-------------|------------|
| `id` | `string` (UUID) | Unique identifier | Public |
| `name` | `string` | User-friendly display name | Public |
| `driver` | `string` | `mysql`, `postgres`, `sqlite` | Public |
| `host` | `string` | Hostname or IP (Empty for SQLite) | Public |
| `port` | `int` | Port number | Public |
| `database` | `string` | Database name or File path | Public |
| `username` | `string` | Database user | Public |
| `password` | `string` | **SENSITIVE**. Stored in Keyring. | **Internal Only** (Never sent to FE) |
| `ssl_mode` | `string` | `disable`, `require`, `verify-full`, etc. | Public |
| `params` | `map[string]string` | Additional driver params | Public |
| `created_at` | `time.Time` | Creation timestamp | Public |
| `updated_at` | `time.Time` | Last update timestamp | Public |

### 2. Session
Runtime-only entity representing an active connection pool.
**Storage**: In-Memory (Go Backend `SessionManager`).

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` (UUID) | Unique session ID (generated on connect) |
| `profile_id` | `string` | Reference to source profile |
| `status` | `enum` | `connected`, `connecting`, `failed`, `disconnected` |
| `db_instance` | `*sql.DB` | The actual connection pool (Go internal) |
| `connected_at` | `time.Time` | When the session started |

### 3. DatabaseMetadata
Structure for exchanging schema info with Frontend.

```typescript
// Frontend (TypeScript) Interface
interface DatabaseSchema {
    name: string;
    tables_count?: number; // Optional hint
}

interface DatabaseTable {
    schema: string;
    name: string;
    type: 'table' | 'view';
}

interface TableColumn {
    name: string;
    type: string;
    nullable: boolean;
    primary_key: boolean;
}
```

## State Management

- **Backend**:
  - `ConnectionManager`: Loads/Saves `connections.yaml`. Accesses Keyring.
  - `SessionManager`: Maps `sessionID` -> `*sql.DB`. Handles keepalives, disconnection.
- **Frontend**:
  - `ConnectionList`: React Query over `GetProfiles`.
  - `ActiveSessions`: React Context or Global Store (Zustand) tracking active `sessionID`s.
