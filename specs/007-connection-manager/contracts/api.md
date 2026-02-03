# API Contract (Wails)

These methods are exposed from Go to the Frontend via Wails.

## ConnectionService

### Profile Management

```go
// GetProfiles returns all saved connection profiles (excluding passwords).
func GetProfiles() ([]ConnectionProfile, error)

// SaveProfile creates or updates a profile.
// If password is provided, it is upserted into Keyring.
// If password is empty string, existing password in Keyring is preserved (for updates).
func SaveProfile(profile ConnectionProfile, password string) (ConnectionProfile, error)

// DeleteProfile removes the profile and its associated keyring entry.
func DeleteProfile(id string) error

// GetProfile (Internal use mostly, but exposed if needed)
func GetProfile(id string) (ConnectionProfile, error)
```

### Session Management

```go
// Connect establishes a new session for the given profile.
// Returns the SessionID.
func Connect(profileID string) (string, error)

// Disconnect closes the session and releases resources.
func Disconnect(sessionID string) error

// TestConnection attempts a transient connection without creating a session.
// Returns success message or error details.
func TestConnection(profile ConnectionProfile, password string) (string, error)

// GetActiveSessions returns a list of currently active session summaries.
func GetActiveSessions() ([]SessionSummary, error)
```

### Metadata (Lazy Loading)

```go
// GetSchemas returns the list of database/schema names for a session.
func GetSchemas(sessionID string) ([]string, error)

// GetTables returns the list of tables for a specific schema in a session.
func GetTables(sessionID string, schema string) ([]DatabaseTable, error)

// GetColumns returns column definitions for a specific table.
func GetColumns(sessionID string, schema string, table string) ([]TableColumn, error)
```

### Query Execution (Basic)

```go
// ExecuteQuery runs a SQL query and returns results.
// Limit/Pagination logic should be handled by the caller or enforced defaults here.
func ExecuteQuery(sessionID string, query string) (QueryResult, error)

// CancelQuery attempts to cancel the running query for the given ID (if we track query IDs).
// For now, Disconnect is the primary "Cancel" for the whole session, 
// but fine-grained cancellation requires context management.
func CancelQuery(queryID string) error
```

## Types

```go
type ConnectionProfile struct {
    ID       string            `json:"id"`
    Name     string            `json:"name"`
    Driver   string            `json:"driver"`
    Host     string            `json:"host"`
    Port     int               `json:"port"`
    Database string            `json:"database"`
    Username string            `json:"username"`
    SSLMode  string            `json:"ssl_mode"`
    Params   map[string]string `json:"params"`
    // Password is NEVER in this struct when sent to FE
}

type SessionSummary struct {
    ID          string    `json:"id"`
    ProfileID   string    `json:"profile_id"`
    ProfileName string    `json:"profile_name"`
    Status      string    `json:"status"`
    ConnectedAt time.Time `json:"connected_at"`
}

type QueryResult struct {
    Columns []string         `json:"columns"`
    Rows    [][]interface{}  `json:"rows"` // Or specific JSON map
    Error   string           `json:"error,omitempty"`
    TimeMs  int64            `json:"time_ms"`
}
```
